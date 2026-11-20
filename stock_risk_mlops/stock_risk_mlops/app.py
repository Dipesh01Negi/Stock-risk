import os
import pandas as pd
import joblib
from flask import Flask, request, jsonify, send_from_directory
from features import make_features, FEATURES

app = Flask(__name__, static_folder="frontend", static_url_path="")

model = joblib.load("models/model.pkl")
prices = pd.read_csv("data/prices.csv", index_col=0)
info = pd.read_csv("data/stocks_info.csv").set_index("ticker")

score = {"Low": 1, "Medium": 2, "High": 3}
log_file = "logs/predictions.csv"


@app.route("/")
def home():
    return send_from_directory("frontend", "index.html")


@app.route("/api/stocks")
def stocks():
    result = []
    for t in prices.columns:
        result.append({
            "ticker": t, "name": info.loc[t, "name"],
            "sector": info.loc[t, "sector"],
            "price": round(float(prices[t].dropna().iloc[-1]), 2)
        })
    return jsonify(result)


@app.route("/api/history/<ticker>")
def history(ticker):
    p = prices[ticker].dropna().tail(120)
    return jsonify({"dates": list(p.index), "prices": [round(float(x), 2) for x in p]})


@app.route("/api/sample-portfolio")
def sample_portfolio():
    return jsonify(pd.read_csv("data/portfolio.csv").to_dict("records"))


@app.route("/api/model")
def model_info():
    return send_from_directory("models", "metrics.json")


@app.route("/api/logs")
def logs():
    if not os.path.exists(log_file):
        return jsonify([])
    return jsonify(pd.read_csv(log_file).tail(8).iloc[::-1].to_dict("records"))


@app.route("/api/analyze", methods=["POST"])
def analyze():
    results = []
    for h in request.json["portfolio"]:
        p = prices[h["stock"]].dropna()
        x = make_features(p).iloc[[-1]][FEATURES]
        probs = model.predict_proba(x)[0]
        risk = str(model.classes_[probs.argmax()])

        results.append({
            "stock": h["stock"], "risk": risk,
            "confidence": round(float(probs.max()) * 100),
            "probs": {str(c): round(float(q) * 100) for c, q in zip(model.classes_, probs)},
            "value": round(float(p.iloc[-1]) * h["shares"], 2)
        })

    total = sum(r["value"] for r in results) or 1
    alerts = []
    score_value = 0

    for r in results:
        r["weight"] = round(r["value"] / total * 100, 1)
        score_value += r["weight"] / 100 * score[r["risk"]]

        if r["risk"] == "High":
            alerts.append(f"{r['stock']} is HIGH risk")
        if r["weight"] > 40:
            alerts.append(f"{r['stock']} has over 40% portfolio weight")

    level = "Low" if score_value < 1.67 else "Medium" if score_value < 2.33 else "High"

    os.makedirs("logs", exist_ok=True)
    log = pd.DataFrame([{
        "time": pd.Timestamp.now().strftime("%H:%M:%S"),
        "stock": r["stock"], "risk": r["risk"],
        "confidence": r["confidence"]
    } for r in results])

    log.to_csv(log_file, mode="a", header=not os.path.exists(log_file), index=False)

    return jsonify({
        "results": results, "alerts": alerts,
        "summary": {"total": round(total, 2), "risk": level, "score": round(score_value, 2)}
    })


if __name__ == "__main__":
    app.run(debug=True)