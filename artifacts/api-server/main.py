import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from database import engine, Base
from routers import auth, courses, eval_types, quizzes, questions, stats, suggestions
from seed import seed_default_data

app = Flask(__name__)
app.url_map.strict_slashes = False

CORS(app, supports_credentials=True, origins="*")

# Initialize DB tables and seed on startup
with app.app_context():
    Base.metadata.create_all(bind=engine)
    seed_default_data()

# Register blueprints (API routes — must be registered BEFORE the SPA catch-all)
app.register_blueprint(auth.bp,         url_prefix="/api/auth")
app.register_blueprint(courses.bp,      url_prefix="/api/courses")
app.register_blueprint(eval_types.bp,   url_prefix="/api/eval-types")
app.register_blueprint(quizzes.bp,      url_prefix="/api/quizzes")
app.register_blueprint(questions.bp,    url_prefix="/api/questions")
app.register_blueprint(stats.bp,        url_prefix="/api/stats")
app.register_blueprint(suggestions.bp,  url_prefix="/api/suggestions")


@app.route("/api/healthz")
def health_check():
    return jsonify({"status": "ok"})


# ── Static frontend (production only) ─────────────────────────────────────────
# The built React app lives in artifacts/quiznet/dist/ (run: pnpm build:prod)
_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "quiznet", "dist")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path: str):
    """Serve the built React SPA.

    Flask resolves blueprint routes BEFORE this catch-all, so all /api/* routes
    that actually exist are handled by their blueprints. Only unknown /api/* paths
    reach here — they get a proper JSON 404 instead of index.html.
    """
    # Return a JSON 404 for unknown /api/* paths (never serve the SPA for API calls)
    if path == "api" or path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404

    # If the dist folder doesn't exist, show a helpful message
    if not os.path.isdir(_DIST):
        return (
            "<pre>Frontend not built.\n"
            "Run: pnpm --filter @workspace/quiznet run build:prod\n"
            "Then commit the artifacts/quiznet/dist/ folder.</pre>"
        ), 503

    # Serve a real static file if it exists (JS, CSS, images…)
    candidate = os.path.join(_DIST, path)
    if path and os.path.isfile(candidate):
        return send_from_directory(_DIST, path)

    # SPA fallback — let wouter handle client-side routing
    return send_from_directory(_DIST, "index.html")


# ── Error handlers ─────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(Exception)
def internal_error(e):
    import traceback
    traceback.print_exc()
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
