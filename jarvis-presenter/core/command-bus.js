const DEFAULT_SOURCES = new Set(["gesture", "voice", "keyboard", "cockpit", "ui", "test"]);
const DEFAULT_RISKS = new Set(["normal", "destructive"]);

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function freezeCommand(command) {
  return Object.freeze({ ...command, payload: Object.freeze({ ...command.payload }) });
}

function createCommandBus({ allowedTypes, historyLimit = 200, sources = DEFAULT_SOURCES } = {}) {
  const allowed = new Set(allowedTypes || []);
  const validSources = sources instanceof Set ? sources : new Set(sources || []);
  const handlers = new Map();
  const subscribers = new Set();
  const history = [];
  let commandOrder = 0;
  let eventOrder = 0;
  let dispatching = false;

  function validate(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return "Command must be an object";
    if (!allowed.has(input.type)) return `Command type is not allowed: ${String(input.type || "missing")}`;
    if (!validSources.has(input.source)) return `Command source is not allowed: ${String(input.source || "missing")}`;
    if (input.payload !== undefined && (!input.payload || typeof input.payload !== "object" || Array.isArray(input.payload))) {
      return "Command payload must be an object";
    }
    if (input.risk !== undefined && !DEFAULT_RISKS.has(input.risk)) return "Command risk is invalid";
    return null;
  }

  function makeEvent(command, status, detail = {}) {
    eventOrder += 1;
    return Object.freeze({
      id: `evt_${Date.now()}_${eventOrder}`,
      type: `command.${status}`,
      commandId: command?.id || null,
      commandType: command?.type || null,
      commandSource: command?.source || null,
      correlationId: command?.correlationId || null,
      timestamp: Date.now(),
      order: eventOrder,
      status,
      ...detail
    });
  }

  function publish(event) {
    history.push(event);
    if (history.length > historyLimit) history.splice(0, history.length - historyLimit);
    const subscriberErrors = [];
    for (const subscriber of subscribers) {
      try {
        subscriber(event);
      } catch (error) {
        subscriberErrors.push(String(error?.message || error));
      }
    }
    return subscriberErrors;
  }

  function dispatch(input) {
    if (dispatching) {
      const event = makeEvent(input, "rejected", { reason: "Nested dispatch is not allowed" });
      publish(event);
      return { status: "rejected", event };
    }

    const validationError = validate(input);
    if (validationError) {
      const event = makeEvent(input, "rejected", { reason: validationError });
      publish(event);
      return { status: "rejected", event };
    }

    commandOrder += 1;
    const command = freezeCommand({
      id: input.id || `cmd_${Date.now()}_${commandOrder}`,
      type: input.type,
      source: input.source,
      timestamp: Number.isFinite(input.timestamp) ? input.timestamp : Date.now(),
      payload: input.payload || {},
      risk: input.risk || "normal",
      confirmed: input.confirmed === true,
      correlationId: input.correlationId || null,
      status: "requested",
      order: commandOrder
    });

    if (command.risk === "destructive" && !command.confirmed) {
      const event = makeEvent(command, "needs-confirmation", { reason: "Destructive command requires confirmation" });
      const subscriberErrors = publish(event);
      return { status: "needs-confirmation", command, event, subscriberErrors };
    }

    const handler = handlers.get(command.type);
    if (!handler) {
      const event = makeEvent(command, "failed", { reason: "No command handler registered" });
      publish(event);
      return { status: "failed", command, event };
    }

    dispatching = true;
    try {
      const value = handler(command);
      const event = makeEvent(command, "accepted", { value });
      const subscriberErrors = publish(event);
      return { status: "accepted", command, event, subscriberErrors };
    } catch (error) {
      const event = makeEvent(command, "failed", { reason: String(error?.message || error) });
      const subscriberErrors = publish(event);
      return { status: "failed", command, event, subscriberErrors };
    } finally {
      dispatching = false;
    }
  }

  function register(type, handler) {
    if (!allowed.has(type)) throw new Error(`Cannot register unknown command type: ${type}`);
    if (typeof handler !== "function") throw new TypeError("Command handler must be a function");
    if (handlers.has(type)) throw new Error(`Command handler already registered: ${type}`);
    handlers.set(type, handler);
    return () => handlers.delete(type);
  }

  function subscribe(handler) {
    if (typeof handler !== "function") throw new TypeError("Subscriber must be a function");
    subscribers.add(handler);
    return () => subscribers.delete(handler);
  }

  return Object.freeze({
    dispatch,
    register,
    subscribe,
    unsubscribe: (handler) => subscribers.delete(handler),
    getHistory: () => clone(history),
    getOrder: () => commandOrder
  });
}

export { createCommandBus };
