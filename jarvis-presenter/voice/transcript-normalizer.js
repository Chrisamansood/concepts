function normalizeTranscript(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\([^)]*audio[^)]*\)/g, " ")
    .replace(/\b(blank audio|silence|no speech|music)\b/g, " ")
    .replace(/[’']/g, "")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export { normalizeTranscript };
