from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

model = joblib.load("model/used_car_price_model.joblib")
options = joblib.load("model/model_options.joblib")
