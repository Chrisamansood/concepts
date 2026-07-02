function normalizeTranscript(input) {
  return String(input || "").toLowerCase().replace(/[.,!?;:]/g, " ").replace(/\s+/g, " ").trim();
}

export { normalizeTranscript };
