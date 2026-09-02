(function () {
  const KEY = "bailu_museum_v4";
  const VERSION = 4;
  const defaults = {
    version: VERSION,
    playerName: "",
    staffPassword: "",
    staffReady: false,
    archiveAccess: false,
    childAccess: false,
    testAccess: false,
    visits: [],
    failures: {},
    ending: "",
    sound: true,
  };
  function cloneDefaults() {
    return JSON.parse(JSON.stringify(defaults));
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!saved || saved.version !== VERSION) return cloneDefaults();
      return { ...cloneDefaults(), ...saved };
    } catch {
      return cloneDefaults();
    }
  }
  const state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }
  function visit(id) {
    if (!id || state.visits.includes(id)) return;
    state.visits.push(id);
    save();
  }
  function has(id) { return state.visits.includes(id); }
  function fail(key) {
    state.failures[key] = (state.failures[key] || 0) + 1;
    save();
    return state.failures[key];
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch {}
  }
  async function sha(value) {
    const input = String(value);
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      const bytes = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, "0")).join("");
    }
    return fallbackSha256(input);
  }
  function fallbackSha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    const mathPow = Math.pow, maxWord = mathPow(2, 32), lengthProperty = "length";
    let i, j, result = "", words = [], asciiBitLength = ascii[lengthProperty] * 8;
    let hash = fallbackSha256.h = fallbackSha256.h || [], k = fallbackSha256.k = fallbackSha256.k || [], primeCounter = k[lengthProperty], isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
    ascii += "\x80";
    while (ascii[lengthProperty] % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return "";
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    for (j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, j += 16), oldHash = hash.slice(0);
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        const temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = i < 16 ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
        hash.pop();
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
    return result;
  }
  function archiveReady() {
    return ["resident:C-005", "resident:C-012", "child:K-2016-004", "child:K-2016-008", "child:K-2016-013", "debates"].every(has);
  }
  window.BAILU_STATE = { state, save, visit, has, fail, reset, hash: sha, archiveReady, key: KEY };
})();
