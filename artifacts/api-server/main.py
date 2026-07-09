import os
from flask import Flask, jsonify
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

# Register blueprints
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
