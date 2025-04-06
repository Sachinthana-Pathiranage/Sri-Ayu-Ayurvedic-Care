import os
from flask_cors import CORS
from routes.main import tourism_bp
from routes.dosha_api import dosha_bp
from routes.outcome import outcome_bp
from routes.Disease_Prediction import disease_bp
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder= "none")
CORS(app)

app.register_blueprint(tourism_bp, url_prefix='/tourism')
app.register_blueprint(dosha_bp, url_prefix='/dosha')
app.register_blueprint(disease_bp, url_prefix='/disease')
app.register_blueprint(outcome_bp, url_prefix='/outcome')

#-----------------------------------------------------------Dosha_Page-------------------------------------------------------------------------------------------------------
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

#------------------------------------------------------------Treatment_Recommendation_Page---------------------------------------------------------------------------------
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

#-------------------------------------------------------Outcome_Prediction_Page---------------------------------------------------------------------------------------------
@app.route("/outcome_frontend")
def serve_outcome_index():
    outcome_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "outcome_page",
        "build"
    )
    return send_from_directory(outcome_build_dir, "index.html")

@app.route("/outcome_frontend/<path:path>")
def serve_outcome_static(path):
    outcome_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "outcome_page",
        "build"
    )
    return send_from_directory(outcome_build_dir, path)

#----------------------------------------------------------Tourism_Page----------------------------------------------------------------------------------------------------
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

#------------------------------------------------------------Signin_Page----------------------------------------------------------------------------------------------------
@app.route("/signinpage")
def serve_signin_index():
    signin_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "signin_page",
        "build"
    )
    return send_from_directory(signin_build_dir, "index.html")

@app.route("/signinpage/<path:path>")
def serve_signin_static(path):
    signin_build_dir = os.path.join(
        os.path.dirname(__file__),
        "..",
        "frontend-final",
        "signin_page",
        "build"
    )
    return send_from_directory(signin_build_dir, path)

#------------------------------------------------------------Landing_Page---------------------------------------------------------------------------------------------------
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_landing(path):

    landing_build_dir = r"C:\Users\prabh\Documents\GitHub\Sri-Ayu-Ayurvedic-Care-final-4\backend-new\backend-final\frontend-final\landing_page\build"
    abs_build_dir = os.path.abspath(landing_build_dir)
    full_path = os.path.join(abs_build_dir, path)

    if path and os.path.exists(full_path):
        return send_from_directory(abs_build_dir, path)
    return send_from_directory(abs_build_dir,"index.html")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)