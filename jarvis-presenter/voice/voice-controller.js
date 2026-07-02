function createVoiceController({ adapter, onFinal, onInterim, onState, maxRestarts = 3, dedupeMs = 2500 }) {
  let armed = false;
  let restarts = 0;
  let lastFinal = { text: "", at: 0 };
  let restartTimer = null;

  adapter.onInterim((text) => onInterim?.(text));
  adapter.onFinal((text) => {
    const now = Date.now();
    if (text === lastFinal.text && now - lastFinal.at < dedupeMs) return;
    lastFinal = { text, at: now };
    restarts = 0;
    onFinal?.(text);
  });
  adapter.onStart(() => { onState?.("LISTENING"); });
  adapter.onError((error) => {
    const terminal = ["not-allowed", "service-not-allowed", "audio-capture"].includes(error);
    if (terminal) armed = false;
    onState?.("ERROR", error);
  });
  adapter.onEnd(() => {
    if (!armed) return onState?.("OFF");
    if (restarts >= maxRestarts) { armed = false; return onState?.("ERROR", "restart-limit"); }
    restarts += 1;
    restartTimer = setTimeout(() => {
      if (!armed) return;
      try { adapter.start(); }
      catch (error) { onState?.("ERROR", String(error?.message || error)); }
    }, Math.min(1600, 250 * (2 ** (restarts - 1))));
  });

  return Object.freeze({
    start() {
      if (!adapter.isSupported()) { onState?.("ERROR", "unsupported"); return false; }
      armed = true; restarts = 0; onState?.("STARTING");
      try { adapter.start(); return true; }
      catch (error) { armed = false; onState?.("ERROR", String(error?.message || error)); return false; }
    },
    stop() { armed = false; clearTimeout(restartTimer); adapter.stop(); onState?.("OFF"); },
    isArmed: () => armed
  });
}

export { createVoiceController };
