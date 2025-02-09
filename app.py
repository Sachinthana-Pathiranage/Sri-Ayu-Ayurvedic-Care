from flask import Flask, request, jsonify, render_template
from config import Config
from utils.data_loader import load_dataset
from utils.data_preprocessor import preprocess_data
from utils.feature_selector import select_features
from models.model_loader import load_model
from models.model_predictor import predict
import os

app = Flask(__name__)
app.config.from_object(Config)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        df = load_dataset(file_path)
        df, label_encoders, scaler = preprocess_data(df)

        target_columns = request.form.get('target_columns', 'Outcome_Score,Predicted_Recovery_Time')
        target_columns = target_columns.split(',')
        k_features = int(request.form.get('k_features', 5))

        X = df.drop(columns=target_columns)
        y = df[target_columns]

        X_selected, selected_features = select_features(X, y, k_features)

        model = load_model(app.config['MODEL_PATH'])
        predictions = predict(model, X_selected)

        return jsonify(predictions.tolist())
    return jsonify({"error": "File type not allowed"}), 400

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)
