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
    year_value = data["Year"]
    if year_value == "2010 or older":
        year_value = 2010

    kilometers_value = data["Kilometers_Driven"]
    kilometers_driven = km_map.get(kilometers_value)
    if kilometers_driven is None:
        kilometers_driven = float(str(kilometers_value).replace(",", ""))

    input_data = pd.DataFrame([{
        "Brand": data["Brand"],
        "Year": int(year_value),
        "Kilometers_Driven": kilometers_driven,
        "Fuel_Type": data["Fuel_Type"],
        "Transmission": data["Transmission"],
        "Seats": int(data["Seats"]),
        "Owner_Type": owner_map.get(data["Owner_Type"], data["Owner_Type"]),
        "Mileage": float(data["Mileage"]),
        "Engine": float(data["Engine"]),
        "Power": float(data["Power"]),
        "Location": data["Location"]
    }])

    prediction = float(model.predict(input_data)[0])

    low = prediction * 0.91
    high = prediction * 1.09

    return jsonify({
        "predicted_price_lakh": round(prediction, 2),
        "formatted_price": f"Rs. {prediction:.2f} Lakh",
        "range": f"Rs. {low:.2f} L - Rs. {high:.2f} L",
        "confidence": "75%",
        "model_name": options.get("best_model_name", "XGBoost")
    })


if __name__ == "__main__":
    app.run(debug=True)

