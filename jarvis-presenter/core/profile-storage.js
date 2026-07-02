import { DEFAULT_PROFILE, PROFILE_VERSION, createProfile, validateProfile } from "../gestures/calibration.js";

const STORAGE_KEY = "jarvisPresenterProfilesV1";

function createProfileStorage(storage = globalThis.localStorage) {
  let memory = { version: PROFILE_VERSION, activeId: DEFAULT_PROFILE.id, profiles: [createProfile()] };
  let persistent = true;

  function read() {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(memory);
      const parsed = JSON.parse(raw);
      if (parsed.version !== PROFILE_VERSION || !Array.isArray(parsed.profiles)) throw new Error("Unsupported stored profile version");
      parsed.profiles = parsed.profiles.map(validateProfile);
      if (!parsed.profiles.some((profile) => profile.id === parsed.activeId)) parsed.activeId = parsed.profiles[0]?.id || DEFAULT_PROFILE.id;
      memory = parsed;
    } catch (error) {
      persistent = false;
      return { ...structuredClone(memory), warning: String(error.message || error) };
    }
    return structuredClone(memory);
  }

  function write(next) {
    memory = structuredClone(next);
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (error) {
      persistent = false;
    }
    return { ...structuredClone(memory), persistent };
  }

  function save(profile, { select = true } = {}) {
    const valid = validateProfile(profile);
    const next = read();
    const index = next.profiles.findIndex((item) => item.id === valid.id);
    if (index >= 0) next.profiles[index] = valid;
    else next.profiles.push(valid);
    if (select) next.activeId = valid.id;
    delete next.warning;
    return write(next);
  }

  function remove(id) {
    const next = read();
    next.profiles = next.profiles.filter((profile) => profile.id !== id);
    if (!next.profiles.length) next.profiles = [createProfile()];
    if (!next.profiles.some((profile) => profile.id === next.activeId)) next.activeId = next.profiles[0].id;
    delete next.warning;
    return write(next);
  }

  function select(id) {
    const next = read();
    if (!next.profiles.some((profile) => profile.id === id)) throw new Error("Profile not found");
    next.activeId = id;
    delete next.warning;
    return write(next);
  }

  function reset() {
    memory = { version: PROFILE_VERSION, activeId: DEFAULT_PROFILE.id, profiles: [createProfile()] };
    try { storage?.removeItem(STORAGE_KEY); } catch (error) { persistent = false; }
    return write(memory);
  }

  function exportJson() {
    return JSON.stringify(read(), null, 2);
  }

  function importJson(json) {
    const parsed = JSON.parse(json);
    if (parsed.version !== PROFILE_VERSION || !Array.isArray(parsed.profiles)) throw new Error("Unsupported profile file version");
    const profiles = parsed.profiles.map(validateProfile);
    if (!profiles.length) throw new Error("Profile file is empty");
    return write({ version: PROFILE_VERSION, activeId: profiles.some((p) => p.id === parsed.activeId) ? parsed.activeId : profiles[0].id, profiles });
  }

  return Object.freeze({ read, save, remove, select, reset, exportJson, importJson, get persistent() { return persistent; } });
}

export { STORAGE_KEY, createProfileStorage };
