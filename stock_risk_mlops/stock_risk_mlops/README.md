# Stock Market Risk Classification & Portfolio Alert System (mini MLOps project)

## Run it
    pip install -r requirements.txt
    python train_model.py     # trains + compares models, saves the best one
    python app.py             # starts the website
    open http://127.0.0.1:5000

Optional: `python download.py` replaces the sample data/prices.csv with real prices, then train again.

## Folders
    data/      CSV files (prices, stock names, sample portfolio) - already included
    models/    saved model.pkl, metrics.json, experiment_log.csv
    logs/      predictions.csv (every prediction the app makes)
    frontend/  index.html, style.css, script.js
