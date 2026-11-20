# Stock Risk Prediction System

## Project Overview

The Stock Risk Prediction System is a machine learning-based application designed to analyse historical stock market data and predict stock risk levels.

The project uses historical stock prices and calculated financial features to classify stocks into different risk categories using machine learning algorithms.

## Features

- Historical stock market data analysis
- Stock feature extraction
- Risk classification using machine learning
- Comparison of multiple ML models
- Flask-based backend
- Web-based frontend
- Model performance evaluation

## Technologies Used

- Python
- Flask
- Pandas
- NumPy
- Scikit-learn
- HTML
- CSS
- JavaScript
- Joblib

## Machine Learning Models

The project evaluates three machine learning algorithms:

1. Decision Tree Classifier
2. Random Forest Classifier
3. Support Vector Machine (SVM)

The best-performing model is selected using the F1-score.

## Features Used for Prediction

- 20-day volatility
- 20-day average return
- 20-day maximum drawdown

## Model Evaluation

The models are evaluated using:

- Accuracy
- F1-score

The evaluation results are stored in the project for comparison.

## Project Structure

```text
stock_risk_mlops/
│
├── app.py
├── download.py
├── features.py
├── train_model.py
├── requirements.txt
│
├── data/
├── frontend/
├── logs/
└── models/
```

## Installation and Setup

Clone the repository:

```bash
git clone https://github.com/Dipesh01Negi/Stock-risk.git
```

Navigate into the project directory:

```bash
cd Stock-risk/stock_risk_mlops/stock_risk_mlops
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask application:

```bash
python app.py
```

## Author

**Dipesh Negi**

GitHub: Dipesh01Negi

## Disclaimer

This project is developed for educational and research purposes. Its predictions should not be considered financial or investment advice.
