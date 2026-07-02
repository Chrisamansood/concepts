import test from "node:test";
import assert from "node:assert/strict";

import { createAppState } from "../../core/app-state.js";
import { createCommandBus } from "../../core/command-bus.js";

function createBus(options = {}) {
  const bus = createCommandBus({ allowedTypes: ["tool.select", "overlay.undo"], ...options });
  bus.register("tool.select", (command) => command.payload.tool);
  bus.register("overlay.undo", () => true);
  return bus;
}

test("accepts a valid command and records a separate outcome event", () => {
  const bus = createBus();
  const result = bus.dispatch({ type: "tool.select", source: "test", payload: { tool: "pen" } });

  assert.equal(result.status, "accepted");
  assert.equal(result.command.status, "requested");
  assert.equal(result.event.type, "command.accepted");
  assert.equal(result.event.commandId, result.command.id);
});

test("rejects invalid command types", () => {
  const bus = createBus();
  const result = bus.dispatch({ type: "system.explode", source: "test", payload: {} });

  assert.equal(result.status, "rejected");
  assert.match(result.event.reason, /not allowed/);
});

test("subscribers receive events in command order", () => {
  const bus = createBus();
  const events = [];
  bus.subscribe((event) => events.push(event));

  bus.dispatch({ type: "tool.select", source: "test", payload: { tool: "pen" } });
  bus.dispatch({ type: "overlay.undo", source: "test", payload: {} });

  assert.deepEqual(events.map((event) => event.commandType), ["tool.select", "overlay.undo"]);
  assert.ok(events[1].order > events[0].order);
});

test("one throwing subscriber does not block another", () => {
  const bus = createBus();
  let received = false;
  bus.subscribe(() => {
    throw new Error("subscriber failed");
  });
  bus.subscribe(() => {
    received = true;
  });

  const result = bus.dispatch({ type: "overlay.undo", source: "test", payload: {} });

  assert.equal(result.status, "accepted");
  assert.equal(received, true);
  assert.deepEqual(result.subscriberErrors, ["subscriber failed"]);
});

test("bounded history drops its oldest event", () => {
  const bus = createBus({ historyLimit: 2 });
  bus.dispatch({ type: "overlay.undo", source: "test", payload: {} });
  bus.dispatch({ type: "tool.select", source: "test", payload: { tool: "arrow" } });
  bus.dispatch({ type: "overlay.undo", source: "test", payload: {} });

  const history = bus.getHistory();
  assert.equal(history.length, 2);
  assert.deepEqual(history.map((event) => event.commandType), ["tool.select", "overlay.undo"]);
});

test("nested dispatch is rejected without executing twice", () => {
  const bus = createCommandBus({ allowedTypes: ["outer", "inner"] });
  let innerExecutions = 0;
  let nestedResult;
  bus.register("inner", () => {
    innerExecutions += 1;
  });
  bus.register("outer", () => {
    nestedResult = bus.dispatch({ type: "inner", source: "test", payload: {} });
  });

  const outerResult = bus.dispatch({ type: "outer", source: "test", payload: {} });

  assert.equal(outerResult.status, "accepted");
  assert.equal(nestedResult.status, "rejected");
  assert.equal(innerExecutions, 0);
});

test("destructive commands require explicit confirmation", () => {
  const bus = createCommandBus({ allowedTypes: ["overlay.clear"] });
  let executions = 0;
  bus.register("overlay.clear", () => {
    executions += 1;
  });

  const pending = bus.dispatch({ type: "overlay.clear", source: "test", payload: {}, risk: "destructive" });
  const confirmed = bus.dispatch({
    type: "overlay.clear",
    source: "test",
    payload: {},
    risk: "destructive",
    confirmed: true
  });

  assert.equal(pending.status, "needs-confirmation");
  assert.equal(confirmed.status, "accepted");
  assert.equal(executions, 1);
});

test("state revision changes only when state changes", () => {
  const state = createAppState();
  const initial = state.getSnapshot();
  const unchanged = state.update({ activeTool: "pen" });
  const changed = state.update({ activeTool: "arrow" });

  assert.equal(initial.revision, 0);
  assert.equal(unchanged.revision, 0);
  assert.equal(changed.revision, 1);
  assert.equal(changed.activeTool, "arrow");
});

test("state snapshots are safe copies and subscriber failures are isolated", () => {
  const state = createAppState();
  let received = null;
  const originalWarn = console.warn;
  console.warn = () => {};
  state.subscribe(() => {
    throw new Error("ignore me");
  });
  state.subscribe((snapshot) => {
    received = snapshot;
  });

  let snapshot;
  try {
    snapshot = state.update({ activeColor: "#ffffff" });
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(received.activeColor, "#ffffff");
  assert.equal(Object.isFrozen(snapshot), true);
  assert.throws(() => {
    snapshot.activeTool = "laser";
  }, TypeError);
});
