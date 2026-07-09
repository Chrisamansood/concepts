function createSpeechAdapter(scope = globalThis) {
  const Recognition = scope.SpeechRecognition || scope.webkitSpeechRecognition;
  let recognition = null;
  let callbacks = {};
  let generation = 0;

  function release(instance, { abort = false } = {}) {
    if (!instance) return;
    instance.onresult = null;
    instance.onerror = null;
    instance.onend = null;
    instance.onstart = null;
    if (abort) {
      try { instance.abort(); }
      catch { /* Chrome may already have ended the session. */ }
    }
    if (recognition === instance) recognition = null;
  }

  function start(options = {}) {
    if (!Recognition) throw new Error("speech-unsupported");
    if (recognition) return false;
    const instance = new Recognition();
    const session = ++generation;
    recognition = instance;
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = options.lang || "en-US";
    instance.onresult = (event) => {
      if (session !== generation || recognition !== instance) return;
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript.trim();
        (event.results[index].isFinal ? callbacks.final : callbacks.interim)?.(text);
      }
    };
    instance.onerror = (event) => {
      if (session === generation && recognition === instance) callbacks.error?.(event.error);
    };
    instance.onend = () => {
      if (session !== generation || recognition !== instance) return;
      release(instance);
      callbacks.end?.();
    };
    instance.onstart = () => {
      if (session === generation && recognition === instance) callbacks.start?.();
    };
    try {
      instance.start();
      return true;
    } catch (error) {
      release(instance, { abort: true });
      throw error;
    }
  }

  function stop() {
    generation += 1;
    const instance = recognition;
    release(instance, { abort: true });
  }

  return Object.freeze({
    isSupported: () => Boolean(Recognition), start, stop,
    onInterim: (fn) => { callbacks.interim = fn; }, onFinal: (fn) => { callbacks.final = fn; },
    onError: (fn) => { callbacks.error = fn; }, onEnd: (fn) => { callbacks.end = fn; }, onStart: (fn) => { callbacks.start = fn; },
    getCapabilities: () => ({ continuous: Boolean(Recognition), finalResults: Boolean(Recognition) })
  });
}

export { createSpeechAdapter };
