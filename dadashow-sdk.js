// ═══════════════════════════════════════════════════════════════
//  DadaShow SDK — Firebase Realtime Database
//  Remplace les valeurs FIREBASE_CONFIG avec les tiennes
//  (voir dadashow-firebase.md pour les instructions)
// ═══════════════════════════════════════════════════════════════

// ── 1. CONFIGURATION — REMPLACE ICI ─────────────────────────────
const FIREBASE_CONFIG = {
 apiKey: "AIzaSyB1gvIK9g-hKNkPeM1mE0Rj80u8o_SIZWY",
  authDomain: "dadashow-a9042.firebaseapp.com",
  projectId: "dadashow-a9042",
  storageBucket: "dadashow-a9042.firebasestorage.app",
  messagingSenderId: "86530867080",
  appId: "1:86530867080:web:2d81392b351f74e8c7c43d"
};

// ── 2. IMPORT FIREBASE (CDN) ─────────────────────────────────────
// À coller dans le <head> de chaque page HTML :
/*
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getDatabase, ref, set, get, push, onValue, update, remove }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
  window._fb = { initializeApp, getDatabase, ref, set, get, push, onValue, update, remove };
</script>
<script src="dadashow-sdk.js"></script>
*/

// ── 3. INITIALISATION ─────────────────────────────────────────────
let _app = null;
let _db  = null;

function fbInit() {
  if (_db) return _db;
  const { initializeApp, getDatabase } = window._fb;
  _app = initializeApp(FIREBASE_CONFIG);
  _db  = getDatabase(_app);
  return _db;
}

// ── 4. HELPERS DE BASE ────────────────────────────────────────────

/** Lire une valeur une fois */
async function fbGet(path) {
  const { ref, get } = window._fb;
  const snap = await get(ref(fbInit(), path));
  return snap.exists() ? snap.val() : null;
}

/** Écrire / remplacer une valeur */
async function fbSet(path, value) {
  const { ref, set } = window._fb;
  return set(ref(fbInit(), path), value);
}

/** Mettre à jour des champs partiels */
async function fbUpdate(path, updates) {
  const { ref, update } = window._fb;
  return update(ref(fbInit(), path), updates);
}

/** Supprimer une valeur */
async function fbDelete(path) {
  const { ref, remove } = window._fb;
  return remove(ref(fbInit(), path));
}

/** Écouter les changements en temps réel */
function fbListen(path, callback) {
  const { ref, onValue } = window._fb;
  return onValue(ref(fbInit(), path), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
}

/** Push une nouvelle entrée avec clé auto */
async function fbPush(path, value) {
  const { ref, push, set } = window._fb;
  const newRef = push(ref(fbInit(), path));
  await set(newRef, value);
  return newRef.key;
}

// ── 5. FONCTIONS SALLE ────────────────────────────────────────────

/**
 * Créer une nouvelle salle
 * @param {string} hostName  - Nom du GM
 * @param {string} mode      - "gorgees" | "classic"
 * @returns {string} code    - Code 4 chiffres de la salle
 */
async function createRoom(hostName, mode = 'gorgees') {
  const code = String(Math.floor(1000 + Math.random() * 9000));

  // Vérifier que la salle n'existe pas déjà
  const existing = await fbGet(`rooms/${code}`);
  if (existing) return createRoom(hostName, mode); // retry

  const teams = {
    t0: { name: 'Les Flamants', color: '#FF2D9B', score: 0 },
    t1: { name: 'Les Zappeurs', color: '#A020F0', score: 0 },
    t2: { name: 'Les Vagues',   color: '#00D4FF', score: 0 },
  };

  await fbSet(`rooms/${code}`, {
    meta: {
      code,
      host: hostName,
      mode,
      state: 'lobby',
      currentGame: null,
      createdAt: Date.now(),
    },
    teams,
    players: {},
    game: { type: null, state: 'idle', questionIdx: 0, buzz: null, votes: {} },
  });

  console.log(`[DadaShow] Salle créée : ${code}`);
  return code;
}

/**
 * Rejoindre une salle existante
 * @param {string} code      - Code 4 chiffres
 * @param {string} playerName
 * @returns {string|null} playerId ou null si salle inexistante
 */
async function joinRoom(code, playerName) {
  const room = await fbGet(`rooms/${code}/meta`);
  if (!room) {
    console.error(`[DadaShow] Salle ${code} introuvable`);
    return null;
  }

  // Attribuer une équipe automatiquement (la moins peuplée)
  const players = await fbGet(`rooms/${code}/players`) || {};
  const teamCounts = { t0: 0, t1: 0, t2: 0 };
  Object.values(players).forEach(p => { if (teamCounts[p.teamId] !== undefined) teamCounts[p.teamId]++; });
  const teamId = Object.entries(teamCounts).sort((a,b) => a[1]-b[1])[0][0];

  const playerId = `p_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  await fbSet(`rooms/${code}/players/${playerId}`, {
    name: playerName,
    teamId,
    score: 0,
    online: true,
    joinedAt: Date.now(),
  });

  console.log(`[DadaShow] ${playerName} a rejoint la salle ${code} (équipe ${teamId})`);
  return playerId;
}

/**
 * Quitter / déconnecter un joueur
 */
async function leaveRoom(code, playerId) {
  await fbUpdate(`rooms/${code}/players/${playerId}`, { online: false });
}

/**
 * Lancer un jeu depuis le GM
 */
async function startGame(code, gameType) {
  await fbUpdate(`rooms/${code}`, {
    'meta/state': 'playing',
    'meta/currentGame': gameType,
    'game/type': gameType,
    'game/state': 'idle',
    'game/questionIdx': 0,
    'game/buzz': null,
    'game/votes': {},
  });
}

// ── 6. FONCTIONS JEU — QUIZ ────────────────────────────────────────

async function quizLaunch(code, questionIdx) {
  await fbUpdate(`rooms/${code}/game`, {
    state: 'running',
    questionIdx,
    votes: {},
    buzz: null,
    revealedAt: null,
  });
}

async function quizVote(code, playerId, choice) {
  await fbSet(`rooms/${code}/game/votes/${playerId}`, {
    choice,
    timestamp: Date.now(),
  });
}

async function quizReveal(code) {
  await fbUpdate(`rooms/${code}/game`, {
    state: 'revealed',
    revealedAt: Date.now(),
  });
}

async function quizAddScore(code, teamId, pts) {
  const current = await fbGet(`rooms/${code}/teams/${teamId}/score`) || 0;
  await fbSet(`rooms/${code}/teams/${teamId}/score`, current + pts);
}

// ── 7. FONCTIONS JEU — BUZZ ────────────────────────────────────────

/**
 * Buzzer — transaction atomique pour éviter les conflits
 * Si un autre joueur a déjà buzzé, retourne false
 */
async function buzz(code, playerId, teamId, playerName) {
  const existing = await fbGet(`rooms/${code}/game/buzz`);
  if (existing) return false; // Déjà buzzé

  await fbSet(`rooms/${code}/game/buzz`, {
    playerId,
    teamId,
    playerName,
    timestamp: Date.now(),
  });
  return true;
}

async function clearBuzz(code) {
  await fbSet(`rooms/${code}/game/buzz`, null);
}

// ── 8. FONCTIONS JEU — VOTE SONDAGE / TOUT OU RIEN ────────────────

async function submitVote(code, playerId, choice) {
  await fbSet(`rooms/${code}/game/votes/${playerId}`, {
    choice,
    timestamp: Date.now(),
  });
}

async function revealVotes(code) {
  await fbUpdate(`rooms/${code}/game`, { state: 'revealed' });
}

// ── 9. LISTENERS PRÊTS À L'EMPLOI ─────────────────────────────────

/**
 * Écouter tous les joueurs de la salle (pour le lobby)
 * callback(players) → objet { playerId: { name, teamId, score, online } }
 */
function listenPlayers(code, callback) {
  return fbListen(`rooms/${code}/players`, callback);
}

/**
 * Écouter l'état du jeu (pour TV + joueurs)
 * callback(game) → objet { type, state, questionIdx, buzz, votes }
 */
function listenGame(code, callback) {
  return fbListen(`rooms/${code}/game`, callback);
}

/**
 * Écouter les scores des équipes
 */
function listenTeams(code, callback) {
  return fbListen(`rooms/${code}/teams`, callback);
}

/**
 * Écouter l'état général de la salle
 */
function listenRoom(code, callback) {
  return fbListen(`rooms/${code}`, callback);
}

// ── 10. INTÉGRATION DANS UN JEU — EXEMPLE QUIZ ────────────────────
/*

// Dans dadashow-quiz.html, ajouter en haut du script :

const ROOM_CODE = new URLSearchParams(location.search).get('room');
const PLAYER_ID = localStorage.getItem('dadashow_player_id');
const IS_GM     = new URLSearchParams(location.search).get('gm') === '1';

// Écouter les changements en temps réel
listenGame(ROOM_CODE, (game) => {
  if (!game) return;

  // Mettre à jour l'état local
  S.qIdx        = game.questionIdx || 0;
  S.state       = game.state || 'idle';
  S.answers     = game.votes || {};
  S.pendingBuzz = game.buzz || null;

  renderAll();
});

listenTeams(ROOM_CODE, (teams) => {
  if (!teams) return;
  S.teams = Object.entries(teams).map(([id, t]) => ({ id, ...t }));
  renderAll();
});

// Remplacer gmLaunch() par :
async function gmLaunch() {
  await quizLaunch(ROOM_CODE, S.qIdx);
}

// Remplacer gmReveal() par :
async function gmReveal() {
  await quizReveal(ROOM_CODE);
  // Calculer et sauvegarder les scores
  const pts = calculerPoints(); // ta logique existante
  for (const [teamId, p] of Object.entries(pts)) {
    await quizAddScore(ROOM_CODE, teamId, p);
  }
}

// Remplacer playerVote() par :
async function playerVote(choice) {
  await quizVote(ROOM_CODE, PLAYER_ID, choice);
}

// URL de la vue TV  : dadashow-quiz.html?room=4269
// URL de la vue GM  : dadashow-quiz.html?room=4269&gm=1
// URL d'un joueur   : dadashow-quiz.html?room=4269&player=TotoGamer

*/

// ── 11. UTILITAIRES ─────────────────────────────────────────────────

/** Nettoyer les salles trop vieilles (> 6h) */
async function cleanOldRooms() {
  const rooms = await fbGet('rooms');
  if (!rooms) return;
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [code, room] of Object.entries(rooms)) {
    if (room.meta?.createdAt < cutoff) {
      await fbDelete(`rooms/${code}`);
      console.log(`[DadaShow] Salle ${code} supprimée (trop vieille)`);
    }
  }
}

/** Générer un ID joueur unique et le stocker en localStorage */
function getOrCreatePlayerId() {
  let id = localStorage.getItem('dadashow_player_id');
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    localStorage.setItem('dadashow_player_id', id);
  }
  return id;
}

/** Lire les paramètres URL */
function getUrlParams() {
  const p = new URLSearchParams(location.search);
  return {
    room:   p.get('room'),
    gm:     p.get('gm') === '1',
    player: p.get('player'),
  };
}

console.log('[DadaShow SDK] Chargé — configure FIREBASE_CONFIG pour activer Firebase');
