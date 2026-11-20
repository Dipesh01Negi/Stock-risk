import os
import json
import pandas as pd
import joblib

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score, f1_score

from features import make_features, make_label, FEATURES

prices = pd.read_csv("data/prices.csv", index_col=0)
frames = []

for stock in price column:
    p = price[stock]. dropna()
    df= make_features(p)


dates = sorted(data.index.unique())
cut = int(len(dates) * 0.8)

train = data[data.index < dates[cut - 10]]
test = data[data.index >= dates[cut]]

X_train = train[FEATURES]
y_train = train["risk"].astype(str)

X_test = test[FEATURES]
y_test = test["risk"].astype(str)

models = {
    "Decision Tree": DecisionTreeClassifier(max_depth=5),
    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8),
    "SVM": make_pipeline(StandardScaler(), SVC(probability=True))
}

scores = {}
accuracies = {}

for name, model in models.items():
    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    scores[name] = f1_score(y_test, pred, average="macro")
    accuracies[name] = accuracy_score(y_test, pred)

    print(name, "Accuracy:", accuracies[name], "F1:", scores[name])

best = max(scores, key=scores.get)

os.makedirs("models", exist_ok=True)

joblib.dump(models[best], "models/model.pkl")

report = {
    "best_model": best,
    "accuracy": accuracies[best],
    "f1": scores[best],
    "train_rows": len(train),
    "validation_scores": scores,
    "trained_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M")
}

with open("models/metrics.json", "w") as f:
    json.dump(report, f, indent=2)

print("\nBest Model:", best)
print("Accuracy:", accuracies[best])
print("F1 Score:", scores[best])
print("Training Rows:", len(train))
print("Model saved successfully!")