# 🔥 DadaShow — Guide Firebase Realtime Database

## Étape 1 — Créer le projet Firebase

1. Va sur **https://console.firebase.google.com**
2. Clique **"Créer un projet"**
3. Nomme-le `dadashow`
4. Désactive Google Analytics (pas nécessaire)
5. Clique **"Créer le projet"**

---

## Étape 2 — Créer la Realtime Database

1. Dans le menu gauche → **"Build" → "Realtime Database"**
2. Clique **"Créer une base de données"**
3. Choisis la région **`europe-west1`** (serveurs EU)
4. Mode de démarrage → **"Mode test"** (lecture/écriture libre pendant 30 jours)
5. Clique **"Activer"**

> ⚠️ Avant de mettre en production, change les règles de sécurité (voir Étape 6)

---

## Étape 3 — Récupérer la configuration

1. Clique l'icône ⚙️ → **"Paramètres du projet"**
2. Descends jusqu'à **"Vos applications"**
3. Clique l'icône **`</>`** (Web)
4. Nomme l'app `dadashow-web`
5. **Ne coche pas** Firebase Hosting pour l'instant
6. Tu obtiens un objet de config comme celui-ci :

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "dadashow.firebaseapp.com",
  databaseURL: "https://dadashow-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dadashow",
  storageBucket: "dadashow.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

7. **Copie ces valeurs** — tu en as besoin dans le fichier `dadashow-sdk.js`

---

## Étape 4 — Configurer le SDK

Ouvre le fichier **`dadashow-sdk.js`** et remplace les valeurs :

```js
const FIREBASE_CONFIG = {
  apiKey:            "COLLE_TON_API_KEY_ICI",
  authDomain:        "COLLE_TON_AUTH_DOMAIN_ICI",
  databaseURL:       "COLLE_TON_DATABASE_URL_ICI",   // ← IMPORTANT
  projectId:         "COLLE_TON_PROJECT_ID_ICI",
  storageBucket:     "COLLE_TON_STORAGE_BUCKET_ICI",
  messagingSenderId: "COLLE_TON_MESSAGING_SENDER_ID_ICI",
  appId:             "COLLE_TON_APP_ID_ICI"
};
```

---

## Étape 5 — Structure de la base de données

```
dadashow/
├── rooms/
│   └── {CODE_4_CHIFFRES}/        ← ex: "4269"
│       ├── meta/
│       │   ├── code: "4269"
│       │   ├── host: "DadaKing"
│       │   ├── mode: "gorgees"   ← "gorgees" | "classic"
│       │   ├── state: "lobby"    ← "lobby" | "playing" | "ended"
│       │   ├── currentGame: "quiz"
│       │   └── createdAt: 1234567890
│       ├── players/
│       │   └── {PLAYER_ID}/
│       │       ├── name: "TotoGamer"
│       │       ├── teamId: "t0"
│       │       ├── score: 150
│       │       └── online: true
│       ├── teams/
│       │   ├── t0/ { name: "Les Flamants", color: "#FF2D9B", score: 0 }
│       │   ├── t1/ { name: "Les Zappeurs", color: "#A020F0", score: 0 }
│       │   └── t2/ { name: "Les Vagues",   color: "#00D4FF", score: 0 }
│       └── game/
│           ├── type: "quiz"
│           ├── questionIdx: 0
│           ├── state: "running"  ← "idle" | "running" | "revealed"
│           ├── buzz: null        ← { playerId, teamId, timestamp }
│           └── votes/
│               └── {PLAYER_ID}: { choice: 2, timestamp: 1234567890 }
```

---

## Étape 6 — Règles de sécurité (production)

Dans Firebase Console → Realtime Database → **Règles** :

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth == null || auth != null",
        ".write": "auth == null || auth != null",
        "players": {
          "$playerId": {
            ".write": "auth == null || auth.uid === $playerId"
          }
        }
      }
    }
  }
}
```

> Pour la démo / soirée → garder le **mode test** (tout ouvert) est suffisant.

---

## Étape 7 — Déployer sur Vercel

1. Crée un compte sur **https://vercel.com**
2. Installe Vercel CLI : `npm i -g vercel`
3. Dans ton dossier DadaShow : `vercel`
4. Suis les instructions → ton site sera en ligne sur `https://dadashow.vercel.app`

> Les fichiers HTML sont statiques → Vercel les héberge gratuitement sans configuration.

---

## Résumé des fichiers

| Fichier | Rôle |
|---|---|
| `dadashow-sdk.js` | SDK partagé — connexion Firebase, fonctions communes |
| `dadashow-accueil.html` | Lobby, création/join de salle |
| `dadashow-quiz.html` | Jeu Quiz |
| `dadashow-blindtest.html` | Jeu Blindtest |
| `dadashow-le-panel.html` | Jeu Le Panel |
| `dadashow-dezoom.html` | Jeu Dézoom |
| `dadashow-hashtag-ad.html` | Jeu Hashtag #AD |
| `dadashow-ratz-de-stars.html` | Jeu Ratz de Stars |
| `dadashow-bonne-ordre.html` | Jeu Bonne Ordre |
| `dadashow-sondage.html` | Jeu Sondage |
| `dadashow-tout-ou-rien.html` | Jeu Tout ou Rien |
| `dadashow-blindtest.html` | Jeu Blindtest |

