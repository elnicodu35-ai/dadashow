// ═══════════════════════════════════════════════════════════════════════
//  DadaShow — Couche d'intégration Firebase pour tous les jeux
//  À inclure dans chaque page APRÈS dadashow-sdk.js
//
//  Utilisation dans chaque jeu :
//    1. Lire les params URL : const { room, gm, pid } = DS.params()
//    2. Initialiser : await DS.init(room, pid, isGM)
//    3. Écouter le state : DS.onState(cb)  → cb({ state, qIdx, buzz, votes, scores })
//    4. Actions GM : DS.launch(), DS.reveal(), DS.next(), DS.validate(correct, pts)
//    5. Actions joueur : DS.vote(choice), DS.buzz(), DS.submitAnswer(text)
// ═══════════════════════════════════════════════════════════════════════

const DS = (() => {
  let _room = null;
  let _pid   = null;
  let _isGM  = false;
  let _game  = null;
  let _unsubs = [];

  // ── Params URL ──────────────────────────────────────────────────────
  function params() {
    const p = new URLSearchParams(location.search);
    return {
      room: p.get('room'),
      pid:  p.get('pid') || localStorage.getItem('ds_pid'),
      gm:   p.get('gm') === '1',
      name: p.get('name') || localStorage.getItem('ds_name') || 'Joueur',
    };
  }

  // ── Init ────────────────────────────────────────────────────────────
  async function init(room, pid, isGM) {
    _room = room;
    _pid  = pid;
    _isGM = isGM;
    _game = await fbGet(`rooms/${room}/meta/currentGame`);
    console.log(`[DS] Init room=${room} pid=${pid} gm=${isGM} game=${_game}`);
  }

  // ── Écouter tout l'état du jeu ─────────────────────────────────────
  function onState(cb) {
    const u = fbListen(`rooms/${_room}/game`, (game) => {
      if (!game) return;
      cb(game);
    });
    _unsubs.push(u);
    return u;
  }

  function onTeams(cb) {
    const u = fbListen(`rooms/${_room}/teams`, cb);
    _unsubs.push(u);
    return u;
  }

  function onPlayers(cb) {
    const u = fbListen(`rooms/${_room}/players`, cb);
    _unsubs.push(u);
    return u;
  }

  // ── Actions GM ──────────────────────────────────────────────────────
  async function launch(qIdx = 0, extra = {}) {
    await fbUpdate(`rooms/${_room}/game`, {
      state: 'running',
      questionIdx: qIdx,
      buzz: null,
      votes: {},
      answers: {},
      ...extra,
    });
  }

  async function reveal() {
    await fbUpdate(`rooms/${_room}/game`, {
      state: 'revealed',
      revealedAt: Date.now(),
    });
  }

  async function next(qIdx) {
    await fbUpdate(`rooms/${_room}/game`, {
      state: 'idle',
      questionIdx: qIdx,
      buzz: null,
      votes: {},
      answers: {},
      blockedTeams: {},
    });
  }

  async function setGameState(state) {
    await fbUpdate(`rooms/${_room}/game`, { state });
  }

  // Valider une réponse et ajouter les points à une équipe
  async function validate(teamId, pts, extra = {}) {
    if (pts !== 0) {
      const current = await fbGet(`rooms/${_room}/teams/${teamId}/score`) || 0;
      await fbSet(`rooms/${_room}/teams/${teamId}/score`, current + pts);
    }
    await fbUpdate(`rooms/${_room}/game`, {
      buzz: null,
      ...extra,
    });
  }

  // Bloquer une équipe sur la question courante
  async function blockTeam(teamId) {
    await fbSet(`rooms/${_room}/game/blockedTeams/${teamId}`, true);
    await fbSet(`rooms/${_room}/game/buzz`, null);
  }

  // Révéler une réponse du panel (jeu Le Panel)
  async function revealPanelAnswer(idx) {
    await fbSet(`rooms/${_room}/game/revealed/${idx}`, true);
  }

  // ── Actions Joueur ──────────────────────────────────────────────────

  // Vote QCM
  async function vote(choice) {
    await fbSet(`rooms/${_room}/game/votes/${_pid}`, {
      choice,
      teamId: await fbGet(`rooms/${_room}/players/${_pid}/teamId`),
      timestamp: Date.now(),
    });
  }

  // Buzz
  async function doBuzz() {
    const existing = await fbGet(`rooms/${_room}/game/buzz`);
    if (existing) return false;
    const playerData = await fbGet(`rooms/${_room}/players/${_pid}`);
    await fbSet(`rooms/${_room}/game/buzz`, {
      playerId: _pid,
      teamId: playerData?.teamId,
      playerName: playerData?.name,
      timestamp: Date.now(),
    });
    return true;
  }

  // Réponse écrite
  async function submitAnswer(text) {
    const playerData = await fbGet(`rooms/${_room}/players/${_pid}`);
    await fbSet(`rooms/${_room}/game/answers/${_pid}`, {
      text,
      teamId: playerData?.teamId,
      playerName: playerData?.name,
      timestamp: Date.now(),
    });
  }

  // Vote Bonne Ordre (tableau trié)
  async function submitOrder(order) {
    const playerData = await fbGet(`rooms/${_room}/players/${_pid}`);
    await fbSet(`rooms/${_room}/game/votes/${_pid}`, {
      order,
      teamId: playerData?.teamId,
      playerName: playerData?.name,
      timestamp: Date.now(),
    });
  }

  // ── Nettoyage ────────────────────────────────────────────────────────
  function destroy() {
    _unsubs.forEach(u => { try { u(); } catch(e) {} });
    _unsubs = [];
  }

  // ── Getters ──────────────────────────────────────────────────────────
  function isGM()   { return _isGM; }
  function room()   { return _room; }
  function myPid()  { return _pid; }

  return {
    params, init, onState, onTeams, onPlayers,
    launch, reveal, next, setGameState,
    validate, blockTeam, revealPanelAnswer,
    vote, doBuzz, submitAnswer, submitOrder,
    destroy, isGM, room, myPid,
  };
})();

console.log('[DS Integration] Chargé');
