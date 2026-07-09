"""
PythonAnywhere WSGI entry point pour QuizNET
=============================================

Configuration dans PythonAnywhere (onglet Web) :
  Source code     :  /home/<username>/Study-Companion/artifacts/api-server
  Working dir     :  /home/<username>/Study-Companion/artifacts/api-server
  WSGI file       :  ce fichier (ou son chemin absolu)

Variables d'environnement à définir dans l'onglet Web → "Environment variables" :
  SESSION_SECRET  →  une longue chaîne aléatoire secrète
  FLASK_ENV       →  production
  ADMIN_PASSWORD  →  (optionnel) mot de passe admin initial (sinon : admin123)

Python version recommandée : 3.10, 3.11 ou 3.12
"""

import sys
import os

# ── Ajouter le dossier du projet au PYTHONPATH ──────────────────────────────
_here = os.path.dirname(os.path.abspath(__file__))
if _here not in sys.path:
    sys.path.insert(0, _here)

# ── Variables d'environnement (si non définies dans le dashboard) ────────────
# Décommentez et modifiez ces lignes uniquement si vous ne pouvez pas les
# définir dans l'interface PythonAnywhere :
#
# os.environ.setdefault("SESSION_SECRET", "CHANGEZ-MOI-EN-PRODUCTION")
# os.environ.setdefault("FLASK_ENV", "production")
# os.environ.setdefault("ADMIN_PASSWORD", "admin123")

# ── Import de l'application Flask ───────────────────────────────────────────
from main import app as application  # noqa: E402, F401

# PythonAnywhere attend un callable nommé "application"
