import pandas as pd

FEATURES = ["vol_20", "vol_5", "ret_20", "ret_5", "drawdown"]

LOW_LIMIT = 0.012
HIGH_LIMIT = 0.022


def make_features(p):
    r = p.pct_change()

    return pd.DataFrame({
        "vol_20": r.rolling(20).std(),
        "vol_5": r.rolling(5).std(),
        "ret_20": p.pct_change(20),
        "ret_5": p.pct_change(5),
        "drawdown": p / p.rolling(60).max() - 1
    })


def make_label(p):
    future_vol = p.pct_change().rolling(10).std().shift(-10)

    return pd.cut(
        future_vol,
        bins=[-1, LOW_LIMIT, HIGH_LIMIT, 1],
        labels=["Low", "Medium", "High"]
    )

