function createSpeechAdapter(scope = globalThis) {
  const Recognition = scope.SpeechRecognition || scope.webkitSpeechRecognition;
  let recognition = null;
  let callbacks = {};

  function start(options = {}) {
    if (!Recognition) throw new Error("speech-unsupported");
    recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.lang || "en-US";
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript.trim();
        (event.results[index].isFinal ? callbacks.final : callbacks.interim)?.(text);
      }
    };
    recognition.onerror = (event) => callbacks.error?.(event.error);
    recognition.onend = () => callbacks.end?.();
    recognition.onstart = () => callbacks.start?.();
    recognition.start();
  }

  return Object.freeze({
    isSupported: () => Boolean(Recognition), start, stop: () => recognition?.stop(),
    onInterim: (fn) => { callbacks.interim = fn; }, onFinal: (fn) => { callbacks.final = fn; },
    onError: (fn) => { callbacks.error = fn; }, onEnd: (fn) => { callbacks.end = fn; }, onStart: (fn) => { callbacks.start = fn; },
    getCapabilities: () => ({ continuous: Boolean(Recognition), finalResults: Boolean(Recognition) })
  });
}

export { createSpeechAdapter };
