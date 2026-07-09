# Déploiement QuizNET sur PythonAnywhere

## Architecture de déploiement

```
PythonAnywhere
└── Une seule application Flask qui fait TOUT :
    ├── /api/*          →  routes Flask (backend)
    └── /*              →  fichiers statiques React (frontend buildé)
```

---

## Étape 1 — Cloner le dépôt GitHub

Dans la console Bash de PythonAnywhere :

```bash
cd ~
git clone https://github.com/kayoyokayoyo/Study-Companion.git
cd Study-Companion
```

---

## Étape 2 — Installer les dépendances Python

```bash
cd ~/Study-Companion/artifacts/api-server
pip3 install --user flask flask-cors sqlalchemy
```

> 💡 Sur PythonAnywhere gratuit, utilisez `pip3 install --user` (pas de virtualenv requis).
> Sur les plans payants, vous pouvez utiliser un virtualenv.

---

## Étape 3 — Configurer l'application web

Dans l'onglet **Web** du dashboard PythonAnywhere :

1. Cliquez **Add a new web app**
2. Choisissez **Manual configuration**
3. Choisissez **Python 3.10** (ou 3.11 / 3.12)
4. Remplissez les champs :

| Champ | Valeur |
|-------|--------|
| **Source code** | `/home/<username>/Study-Companion/artifacts/api-server` |
| **Working directory** | `/home/<username>/Study-Companion/artifacts/api-server` |
| **WSGI configuration file** | (voir étape 4) |

---

## Étape 4 — Configurer le fichier WSGI

Cliquez sur le lien du fichier WSGI (ex: `/var/www/username_pythonanywhere_com_wsgi.py`).

Effacez tout le contenu et remplacez par :

```python
import sys, os

# Chemin vers le dossier api-server
project = '/home/<username>/Study-Companion/artifacts/api-server'
if project not in sys.path:
    sys.path.insert(0, project)

# Variables d'environnement
os.environ.setdefault('SESSION_SECRET', 'CHANGEZ-MOI-PAR-UNE-VRAIE-CLE-SECRETE')
os.environ.setdefault('FLASK_ENV', 'production')
# os.environ.setdefault('ADMIN_PASSWORD', 'votre-mot-de-passe')

from main import app as application
```

> ⚠️ **Remplacez `<username>`** par votre nom d'utilisateur PythonAnywhere.
> ⚠️ **Changez `SESSION_SECRET`** par une vraie valeur aléatoire longue.

---

## Étape 5 — Variables d'environnement (alternative au WSGI)

Dans l'onglet **Web** → section **Environment variables** (plans payants uniquement) :

| Variable | Valeur |
|----------|--------|
| `SESSION_SECRET` | (une longue chaîne aléatoire, ex: `openssl rand -hex 32`) |
| `FLASK_ENV` | `production` |
| `ADMIN_PASSWORD` | (optionnel, défaut: `admin123`) |

---

## Étape 6 — Fichiers statiques (optionnel mais recommandé)

Pour améliorer les performances, configurez PythonAnywhere pour servir les assets statiques directement :

Dans **Web** → **Static files** :

| URL | Directory |
|-----|-----------|
| `/assets/` | `/home/<username>/Study-Companion/artifacts/quiznet/dist/assets/` |

---

## Étape 7 — Démarrer l'application

Cliquez sur **Reload** dans l'onglet Web.

Votre site est accessible à : `https://<username>.pythonanywhere.com`

---

## Mettre à jour l'application

Pour déployer une nouvelle version :

```bash
cd ~/Study-Companion
git pull origin main
```

Puis cliquez **Reload** dans l'onglet Web.

---

## Connexion admin

URL : `https://<username>.pythonanywhere.com/admin`  
Mot de passe par défaut : `admin123`

> ⚠️ **Changez le mot de passe** dès la première connexion via **Admin → Paramètres**.

---

## Base de données

La base SQLite est créée automatiquement au premier démarrage :
```
Study-Companion/artifacts/api-server/quiznet.db
```

Les données seed (cours, quizz, questions d'exemple) sont insérées automatiquement si la base est vide.

---

## Dépannage

### Erreur 500 au démarrage
→ Consultez les logs dans l'onglet **Web** → **Error log**

### `ModuleNotFoundError: No module named 'flask'`
```bash
pip3 install --user flask flask-cors sqlalchemy
```

### Les pages React donnent 404
→ Vérifiez que le dossier `artifacts/quiznet/dist/` existe et contient un `index.html`
→ Le dépôt GitHub inclut déjà le build de production

### Changer le mot de passe admin
→ Connectez-vous à `/admin` puis allez dans **Paramètres**
