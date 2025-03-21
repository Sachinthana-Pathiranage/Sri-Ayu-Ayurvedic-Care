import os
from flask_cors import CORS
from routes.main import tourism_bp
from routes.dosha_api import dosha_bp
from routes.Disease_Prediction import disease_bp
from flask import Flask, send_from_directory

app = Flask(__name__)
CORS(app)

# Register Blueprints with URL prefixes
app.register_blueprint(tourism_bp, url_prefix='/tourism')
app.register_blueprint(dosha_bp, url_prefix='/dosha')
app.register_blueprint(disease_bp, url_prefix='/disease')

@app.route("/dosha_frontend")
def serve_dosha_index():
    dosha_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "dosha_page",
        "build"
    )
    return send_from_directory(dosha_build_dir, "index.html")

@app.route("/dosha_frontend/<path:path>")
def serve_dosha_static(path):
    dosha_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "dosha_page",
        "build"
    )
    return send_from_directory(dosha_build_dir, path)


@app.route("/tourism_frontend")
def serve_tourism_index():
    tourism_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "tourism_page",
        "build"
    )
    return send_from_directory(tourism_build_dir, "index.html")

@app.route("/tourism_frontend/<path:path>")
def serve_tourism_static(path):
    tourism_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "tourism_page",
        "build"
    )
    return send_from_directory(tourism_build_dir, path)

@app.route("/recommendation_frontend")
def serve_disease_index():
    disease_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "disease_page",
        "build"
    )
    return send_from_directory(disease_build_dir, "index.html")

@app.route("/recommendation_frontend/<path:path>")
def serve_disease_static(path):
    disease_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "disease_page",
        "build"
    )
    return send_from_directory(disease_build_dir, path)

@app.route('/')
def home():
    return """
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ayurvedic App Landing</title>
      </head>
      <body>
        <h1>Welcome to the Ayurvedic App</h1>
        <ul>
          <li><a href="/dosha_frontend">Dosha Classification</a></li>
          <li><a href="/recommendation_frontend">Treatment Recommendation</a></li>
          <li><a href="/outcome_frontend">Outcome Prediction</a></li>
          <li><a href="/tourism_frontend">Tourism Forecasting</a></li>
        </ul>
      </body>
    </html>
    """

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)