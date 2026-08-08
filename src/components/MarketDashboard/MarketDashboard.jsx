import { useEffect, useMemo, useState } from "react";
import "./MarketDashboard.css";

const API_URL = "https://teka-web-beta.vercel.app/api";

// نرخ موقت دلار به تومان
// بعداً می‌توانیم این را هم از API آنلاین TEKA بگیریم.
const USD_TO_TOMAN = 100000;

const coins = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "₿",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "S",
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "◆",
  },
  {
    symbol: "XRP",
    name: "XRP",
    icon: "X",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    icon: "Ð",
  },
];

function formatUSD(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (value >= 1000) {
    return `$${Number(value).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  })}`;
}

function formatToman(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toLocaleString("fa-IR", {
    maximumFractionDigits: 0,
  })} تومان`;
}

function buildChartPath(history) {
  if (!history || history.length < 2) {
    return null;
  }

  const width = 300;
  const height = 55;
  const padding = 3;

  const prices = history.map((item) => Number(item.price));

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const range = max - min || 1;

  const points = prices.map((price, index) => {
    const x =
      padding +
      (index / (prices.length - 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      ((price - min) / range) *
        (height - padding * 2);

    return `${x},${y}`;
  });

  return points.join(" ");
}

function MarketDashboard() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [error, setError] = useState("");

  const fetchMarket = async () => {
    try {
      const response = await fetch(`${API_URL}/market`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Market API request failed");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid market data");
      }

      setMarketData(data);
      setOnline(true);
      setError("");
    } catch (err) {
      console.error("TEKA Market API:", err);

      setOnline(false);
      setError("Market data unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();

    const interval = setInterval(() => {
      fetchMarket();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const mergedCoins = useMemo(() => {
    return coins.map((coin) => {
      const data = marketData.find(
        (item) => item.symbol === coin.symbol
      );

      return {
        ...coin,
        ...data,
      };
    });
  }, [marketData]);

  return (
    <section className="market-dashboard">
      <div className="market-background-glow" />

      <div className="market-header">
        <div className="market-header-content">
          <div className="market-badge">
            <span className="live-dot" />
            TEKA MARKET
          </div>

          <h2>
            Global <span>Market</span>
          </h2>

          <p>
            Live market data powered by the TEKA ecosystem.
            Prices are displayed in USD and Iranian Toman.
          </p>
        </div>

        <div className="market-status">
          <span className="live-dot" />
          {online ? "LIVE DATA" : "OFFLINE"}
        </div>
      </div>

      {error && (
        <div
          style={{
            textAlign: "center",
            color: "#ff5264",
            marginBottom: "25px",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      <div className="market-grid">
        {mergedCoins.map((coin, index) => {
          const price =
            coin.price !== undefined
              ? Number(coin.price)
              : null;

          const tomanPrice =
            price !== null
              ? price * USD_TO_TOMAN
              : null;

          const change =
            coin.change !== undefined
              ? Number(coin.change)
              : 0;

          const chartPath = buildChartPath(
            coin.history
          );

          return (
            <article
              className="market-card"
              key={coin.symbol}
              style={{
                "--delay": `${index * 0.08}s`,
              }}
            >
              <div className="market-card-top">
                <div className="coin-info">
                  <div className="coin-icon">
                    {coin.icon}
                  </div>

                  <div>
                    <h3>{coin.name}</h3>
                    <p>{coin.symbol}</p>
                  </div>
                </div>

                <div
                  className={
                    change >= 0
                      ? "coin-change positive"
                      : "coin-change negative"
                  }
                >
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </div>
              </div>

              <div className="coin-price">
                {loading && price === null
                  ? "Loading..."
                  : formatUSD(price)}
              </div>

              <div
                style={{
                  marginTop: "7px",
                  color: "#777",
                  fontSize: "12px",
                }}
              >
                {formatToman(tomanPrice)}
              </div>

              <div className="mini-chart">
                {chartPath ? (
                  <svg
                    className="chart-svg"
                    viewBox="0 0 300 55"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points={chartPath}
                      fill="none"
                      stroke={
                        change >= 0
                          ? "#35ff8a"
                          : "#ff5264"
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <div className="empty-chart">
                    WAITING FOR MARKET DATA
                  </div>
                )}
              </div>

              <div className="coin-footer">
                <span>24H</span>

                <span>
                  {coin.volume
                    ? `Vol $${Number(
                        coin.volume
                      ).toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}`
                    : "Volume —"}
                </span>
              </div>
            </article>
          );
        })}

        <article className="market-card teka-coming-soon">
          <div className="market-card-top">
            <div className="coin-info">
              <div className="coin-icon teka-icon">
                T
              </div>

              <div>
                <h3>TEKA</h3>
                <p>TEKA Token</p>
              </div>
            </div>

            <div className="coming-badge">
              SOON
            </div>
          </div>

          <div className="teka-soon-content">
            <div className="teka-soon-title">
              TEKA
            </div>

            <div className="teka-soon-text">
              Coming Soon
            </div>

            <div className="teka-soon-line" />

            <p>
              The TEKA ecosystem token
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default MarketDashboard;