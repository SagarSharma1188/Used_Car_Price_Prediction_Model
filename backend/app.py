from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

model = joblib.load("model/used_car_price_model.joblib")
options = joblib.load("model/model_options.joblib")
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/options")
def get_options():
    return jsonify(options)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}

    km_map = {
        "Under 20,000 km": 15000,
        "20,000 - 50,000 km": 35000,
        "50,000 - 1,00,000 km": 75000,
        "1,00,000 - 2,00,000 km": 150000,
        "Over 2,00,000 km": 220000
    }

    owner_map = {
        "First Owner": "First",
        "Second Owner": "Second",
        "Third Owner": "Third",
        "Fourth+ Owner": "Fourth & Above"
    }
