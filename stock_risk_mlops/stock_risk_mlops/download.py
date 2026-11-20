# OPTIONAL: replaces the sample data/prices.csv with real prices from Yahoo Finance
import yfinance as yf

tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "KO", "JNJ", "JPM", "XOM"]
data = yf.download(tickers, period="3y")["Close"]       # closing prices, last 3 years
data.to_csv("data/prices.csv")
print("Saved data/prices.csv with", len(data), "days")
