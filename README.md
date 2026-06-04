# 🎬 DadaShow — Guide de déploiement Vercel

## Fichiers du projet

```
dadashow/
├── dadashow-accueil.html          ← Page principale (accueil, lobby, GM)
├── dadashow-quiz.html             ← Jeu Quiz
├── dadashow-blindtest.html        ← Jeu Blindtest
├── dadashow-le-panel.html         ← Jeu Le Panel
├── dadashow-dezoom.html           ← Jeu Dézoom
├── dadashow-hashtag-ad.html       ← Jeu Hashtag #AD
├── dadashow-ratz-de-stars.html    ← Jeu Ratz de Stars
├── dadashow-bonne-ordre.html      ← Jeu Bonne Ordre
├── dadashow-sondage.html          ← Jeu Sondage
├── dadashow-tout-ou-rien.html     ← Jeu Tout ou Rien
├── dadashow-sdk.js                ← SDK Firebase partagé ⚠️ À CONFIGURER
├── dadashow-firebase-integration.js ← Couche d'intégration Firebase
├── dadashow-firebase.md           ← Guide Firebase complet
├── vercel.json                    ← Config Vercel (routes)
└── README.md                      ← Ce fichier
```

---

## Étape 1 — Configurer Firebase

**Avant de déployer**, configure ton projet Firebase dans `dadashow-sdk.js`.

Ouvre le fichier et remplace les valeurs :

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",          // ← Colle ta valeur
  authDomain:        "dadashow.firebaseapp.com",
  databaseURL:       "https://dadashow-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "dadashow",
  storageBucket:     "dadashow.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

> 📖 Voir `dadashow-firebase.md` pour créer le projet Firebase en 7 étapes.

---

## Étape 2 — Déployer sur Vercel (méthode GitHub — recommandée)

### 2a. Créer un dépôt GitHub

1. Va sur **https://github.com/new**
2. Nomme le repo `dadashow`
3. Laisse-le **Public** (gratuit)
4. Clique **Create repository**

### 2b. Uploader les fichiers

**Option A — Interface web (plus simple) :**
1. Dans ton repo GitHub → clique **"uploading an existing file"**
2. Glisse-dépose **tous les fichiers** du dossier DadaShow
3. Clique **"Commit changes"**

**Option B — Terminal :**
```bash
cd ton-dossier-dadashow
git init
git add .
git commit -m "DadaShow initial"
git remote add origin https://github.com/TON-USERNAME/dadashow.git
git push -u origin main
```

### 2c. Connecter à Vercel

1. Va sur **https://vercel.com**
2. Clique **"Sign up"** → connecte avec GitHub
3. Clique **"Add New Project"**
4. Sélectionne ton repo `dadashow`
5. **Framework Preset** → laisse sur "Other"
6. **Root Directory** → laisse vide (racine)
7. Clique **"Deploy"** 🚀

Vercel déploie en ~30 secondes. Tu obtiens une URL comme :
```
https://dadashow.vercel.app
```

---

## Étape 3 — Méthode alternative (sans GitHub)

Si tu ne veux pas utiliser GitHub, Vercel CLI fonctionne aussi :

```bash
# Installer Node.js depuis https://nodejs.org (version LTS)
# Puis dans un terminal :

npm install -g vercel
cd ton-dossier-dadashow
vercel

# Suivre les instructions :
# → Set up and deploy? Y
# → Which scope? (ton compte)
# → Link to existing project? N
# → Project name: dadashow
# → In which directory? ./
# → Deploy? Y
```

---

## Étape 4 — Domaine personnalisé (optionnel)

Si tu veux `dadashow.fr` au lieu de `dadashow.vercel.app` :

1. Achète un domaine sur **OVH / Namecheap / Gandi**
2. Dans Vercel → Settings → Domains → Add
3. Ajoute ton domaine → Vercel te donne les DNS à configurer
4. Configure les DNS chez ton registrar → en ligne en 5 min

---

## Utilisation en soirée

### Lancer une partie

1. Ouvre **`dadashow.vercel.app`** sur la TV (grand écran)
2. Le GM crée une salle → code 4 chiffres s'affiche
3. Chaque joueur ouvre **`dadashow.vercel.app`** sur son téléphone
4. Saisit le code → rejoint la salle
5. GM choisit un jeu → tout le monde est redirigé automatiquement

### URLs directes des jeux (pour le GM)

| Jeu | URL |
|-----|-----|
| Accueil / Lobby | `dadashow.vercel.app` |
| Quiz | `dadashow.vercel.app/quiz` |
| Le Panel | `dadashow.vercel.app/panel` |
| Dézoom | `dadashow.vercel.app/dezoom` |
| Blindtest | `dadashow.vercel.app/blindtest` |
| Hashtag #AD | `dadashow.vercel.app/hashtag` |
| Ratz de Stars | `dadashow.vercel.app/ratz` |
| Bonne Ordre | `dadashow.vercel.app/ordre` |
| Sondage | `dadashow.vercel.app/sondage` |
| Tout ou Rien | `dadashow.vercel.app/touteourien` |

---

## Mises à jour

Pour mettre à jour le site après des modifications :

**Via GitHub :** Upload les nouveaux fichiers → Vercel redéploie automatiquement

**Via CLI :**
```bash
vercel --prod
```

---

## Support

Problème Firebase ? → Consulte `dadashow-firebase.md`  
Problème Vercel ? → https://vercel.com/docs  
