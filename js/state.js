(function () {
  const KEY = "bailu_museum_v4";
  const VERSION = 6;
  const TICKET_ORDER = ["BL-WEB-01", "BL-WEB-02", "BL-WEB-03", "BL-WEB-04", "BL-WEB-05"];
  const defaults = {
    version: VERSION,
    playerName: "",
    staffReady: false,
    visits: [],
    completedSteps: {},
    completedTickets: [],
    transitionSeen: [],
    supportAutoSeen: false,
    shiftBriefingSeen: false,
    endingComplete: false,
    sound: true,
  };
  function cloneDefaults() { return JSON.parse(JSON.stringify(defaults)); }
  function normalize(saved) {
    const clean = { ...cloneDefaults(), ...saved, version: VERSION };
    clean.playerName = typeof saved.playerName === "string" ? saved.playerName.slice(0, 24) : "";
    clean.staffReady = !!saved.staffReady;
    clean.visits = Array.isArray(saved.visits) ? [...new Set(saved.visits.filter((x) => typeof x === "string"))] : [];
    clean.completedSteps = {};
    if (saved.completedSteps && typeof saved.completedSteps === "object") {
      TICKET_ORDER.forEach((id) => {
        const steps = saved.completedSteps[id];
        if (Array.isArray(steps)) clean.completedSteps[id] = [...new Set(steps.filter((x) => typeof x === "string"))];
      });
    }
    const submitted = new Set(Array.isArray(saved.completedTickets) ? saved.completedTickets : []);
    clean.completedTickets = [];
    for (const id of TICKET_ORDER) {
      if (!submitted.has(id)) break;
      clean.completedTickets.push(id);
    }
    clean.transitionSeen = Array.isArray(saved.transitionSeen)
      ? [...new Set(saved.transitionSeen.filter((x) => /^record-0[1-4]$/.test(x)))] : [];
    clean.supportAutoSeen = !!saved.supportAutoSeen;
    clean.shiftBriefingSeen = !!saved.shiftBriefingSeen;
    clean.endingComplete = !!saved.endingComplete && clean.completedTickets.includes("BL-WEB-05");
    clean.sound = saved.sound !== false;
    return clean;
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!saved) return cloneDefaults();
      if (saved.version === VERSION) return normalize(saved);
      if (saved.version === 4 || saved.version === 5) {
        return {
          ...cloneDefaults(),
          playerName: saved.playerName || "",
          staffReady: !!saved.staffReady,
          visits: Array.isArray(saved.visits) ? saved.visits : [],
          supportAutoSeen: !!saved.supportAutoSeen,
          sound: saved.sound !== false,
        };
      }
      return cloneDefaults();
    } catch { return cloneDefaults(); }
  }
  const state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
  function visit(id) {
    if (!id || state.visits.includes(id)) return;
    state.visits.push(id);
    save();
  }
  function has(id) { return state.visits.includes(id); }
  function count(prefix) { return state.visits.filter((id) => id.startsWith(prefix)).length; }
  function stepDone(ticketId, stepId) { return (state.completedSteps[ticketId] || []).includes(stepId); }
  function completeStep(ticketId, stepId) {
    if (!TICKET_ORDER.includes(ticketId) || !stepId) return;
    if (!state.completedSteps[ticketId]) state.completedSteps[ticketId] = [];
    if (!state.completedSteps[ticketId].includes(stepId)) state.completedSteps[ticketId].push(stepId);
    save();
  }
  function ticketDone(ticketId) { return state.completedTickets.includes(ticketId); }
  function completeTicket(ticketId) {
    if (!TICKET_ORDER.includes(ticketId)) return;
    if (!state.completedTickets.includes(ticketId)) state.completedTickets.push(ticketId);
    save();
  }
  function ticketAvailable(ticketId) {
    const index = TICKET_ORDER.indexOf(ticketId);
    if (index < 0 || !state.staffReady) return false;
    return index === 0 || ticketDone(TICKET_ORDER[index - 1]);
  }
  function currentTicket() {
    if (!state.staffReady) return "";
    return TICKET_ORDER.find((id) => !ticketDone(id)) || "BL-WEB-05";
  }
  function archiveAllowed() { return ticketAvailable("BL-WEB-03"); }
  function childAllowed() { return ticketAvailable("BL-WEB-02"); }
  function specialAllowed() { return ticketAvailable("BL-WEB-05") && ticketDone("BL-WEB-04"); }
  function markTransition(id) {
    if (!state.transitionSeen.includes(id)) state.transitionSeen.push(id);
    save();
  }
  function transitionDone(id) { return state.transitionSeen.includes(id); }
  function nextTransition() {
    const map = [["record-01", "BL-WEB-01"], ["record-02", "BL-WEB-02"], ["record-03", "BL-WEB-03"], ["record-04", "BL-WEB-04"]];
    const found = map.find(([record, ticket]) => ticketDone(ticket) && !transitionDone(record));
    return found ? found[0] : "";
  }
  function reset() { try { localStorage.removeItem(KEY); } catch {} }
  window.BAILU_STATE = {
    state, save, visit, has, count, stepDone, completeStep, ticketDone, completeTicket,
    ticketAvailable, currentTicket, archiveAllowed, childAllowed, specialAllowed,
    nextTransition, markTransition, transitionDone, reset, ticketOrder: TICKET_ORDER, key: KEY,
  };
})();
