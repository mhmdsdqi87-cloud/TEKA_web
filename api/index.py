from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from collections import defaultdict
import requests
import time


app = Flask(__name__)
CORS(app)


# =========================================================
# LIVE VISITORS
# =========================================================

active_visitors = {}

TIMEOUT_SECONDS = 30
DISPLAY_MULTIPLIER = 6


# =========================================================
# MARKET
# =========================================================

COINS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "BNB": "binancecoin",
    "XRP": "ripple",
    "DOGE": "dogecoin",
}


market_cache = {
    "data": None,
    "timestamp": 0,
}

MARKET_CACHE_SECONDS = 15

price_history = defaultdict(list)

MAX_HISTORY_POINTS = 40


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def home():
    return jsonify({
        "service": "TEKA Backend",
        "status": "online",
        "platform": "Vercel",
    })


# =========================================================
# HEALTH
# =========================================================

@app.get("/api/health")
def health():
    return jsonify({
        "service": "TEKA Backend",
        "status": "online",
        "features": [
            "live_visitors",
            "market_data",
            "price_history",
        ],
    })


# =========================================================
# LIVE VISITORS - HEARTBEAT
# =========================================================

@app.post("/api/presence")
def heartbeat():

    data = request.get_json(silent=True) or {}

    visitor_id = data.get("visitor_id")

    if not visitor_id:
        return jsonify({
            "success": False,
            "error": "visitor_id is required",
        }), 400

    active_visitors[visitor_id] = datetime.utcnow()

    return jsonify({
        "success": True,
        "status": "live",
    })


# =========================================================
# LIVE VISITORS
# =========================================================

@app.get("/api/presence")
def get_presence():

    now = datetime.utcnow()

    expired = [
        visitor_id
        for visitor_id, last_seen
        in active_visitors.items()
        if now - last_seen
        > timedelta(seconds=TIMEOUT_SECONDS)
    ]

    for visitor_id in expired:
        del active_visitors[visitor_id]

    real_users = len(active_visitors)

    displayed_users = (
        real_users * DISPLAY_MULTIPLIER
    )

    return jsonify({
        "real_users": real_users,
        "displayed_users": displayed_users,
        "status": "live",
        "updated_at": datetime.utcnow().isoformat(),
    })


# =========================================================
# MARKET
# =========================================================

@app.get("/api/market")
def market():

    now = time.time()

    # -----------------------------------------------------
    # CACHE
    # -----------------------------------------------------

    if (
        market_cache["data"] is not None
        and
        now - market_cache["timestamp"]
        < MARKET_CACHE_SECONDS
    ):
        return jsonify(
            market_cache["data"]
        )

    try:

        coin_ids = ",".join(
            COINS.values()
        )

        url = (
            "https://api.coingecko.com/api/v3/simple/price"
            f"?ids={coin_ids}"
            "&vs_currencies=usd"
            "&include_24hr_change=true"
            "&include_24hr_vol=true"
        )

        response = requests.get(
            url,
            timeout=10,
            headers={
                "Accept": "application/json",
                "User-Agent": "TEKA-Backend/1.0",
            },
        )

        response.raise_for_status()

        raw_data = response.json()

        result = []

        # -------------------------------------------------
        # BUILD MARKET DATA
        # -------------------------------------------------

        for symbol, coin_id in COINS.items():

            coin = raw_data.get(coin_id)

            if not coin:
                continue

            price = coin.get(
                "usd",
                0
            )

            change = coin.get(
                "usd_24h_change",
                0
            )

            volume = coin.get(
                "usd_24h_vol",
                0
            )

            # ---------------------------------------------
            # PRICE HISTORY
            # ---------------------------------------------

            price_history[symbol].append({
                "time": int(time.time()),
                "price": price,
            })

            if (
                len(price_history[symbol])
                > MAX_HISTORY_POINTS
            ):
                price_history[symbol] = (
                    price_history[symbol]
                    [-MAX_HISTORY_POINTS:]
                )

            result.append({
                "symbol": symbol,
                "price": price,
                "change": change,
                "volume": volume,
                "history": price_history[symbol],
            })

        # -------------------------------------------------
        # CACHE
        # -------------------------------------------------

        market_cache["data"] = result
        market_cache["timestamp"] = now

        return jsonify(result)

    except Exception as error:

        print(
            "Market API error:",
            error
        )

        # -------------------------------------------------
        # FALLBACK
        # -------------------------------------------------

        if market_cache["data"] is not None:

            return jsonify(
                market_cache["data"]
            )

        return jsonify({
            "error":
                "Market data temporarily unavailable",
        }), 503


# =========================================================
# VERCEL / LOCAL ENTRY
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )