const DEFAULT_STATE = Object.freeze({
  revision: 0,
  activeTool: "pen",
  activeColor: "#00e5ff",
  slideIndex: 0,
  slideCount: 0,
  canUndo: false,
  canRedo: false
});

function createAppState(initialState = {}) {
  let state = { ...DEFAULT_STATE, ...initialState, revision: 0 };
  const subscribers = new Set();

  function getSnapshot() {
    return Object.freeze({ ...state });
  }

  function update(patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new TypeError("State patch must be an object");
    }

    const entries = Object.entries(patch).filter(([key]) => key !== "revision");
    const changed = entries.some(([key, value]) => !Object.is(state[key], value));
    if (!changed) return getSnapshot();

    state = { ...state, ...Object.fromEntries(entries), revision: state.revision + 1 };
    const snapshot = getSnapshot();
    for (const subscriber of subscribers) {
      try {
        subscriber(snapshot);
      } catch (error) {
        console.warn("App state subscriber failed", error);
      }
    }
    return snapshot;
  }

  function subscribe(handler) {
    if (typeof handler !== "function") throw new TypeError("Subscriber must be a function");
    subscribers.add(handler);
    return () => subscribers.delete(handler);
  }

  return Object.freeze({ getSnapshot, update, subscribe });
}

export { createAppState };
