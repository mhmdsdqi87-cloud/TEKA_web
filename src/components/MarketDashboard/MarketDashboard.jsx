import { useEffect, useState } from "react";
import "./MarketDashboard.css";


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

  {
    symbol: "TEKA",
    name: "TEKA",
    icon: "T",
    comingSoon: true,
  },

];


function MiniChart({
  history,
  positive,
}) {

  if (
    !history ||
    history.length < 2
  ) {

    return (

      <div className="mini-chart empty-chart">

        <span>
          Collecting market data...
        </span>

      </div>

    );

  }


  const prices = history.map(
    (item) =>
      Number(item.price)
  );


  const min = Math.min(
    ...prices
  );

  const max = Math.max(
    ...prices
  );

  const range =
    max - min || 1;


  const width = 100;

  const height = 45;


  const points = prices
    .map(
      (price, index) => {

        const x =
          (
            index /
            (prices.length - 1)
          ) *
          width;


        const y =
          height -
          (
            (
              price - min
            ) /
            range
          ) *
          (height - 8) -
          4;


        return `${x},${y}`;

      }
    )
    .join(" ");


  const color = positive
    ? "#35ff8a"
    : "#ff5264";


  const gradientId =
    positive
      ? "chartGreen"
      : "chartRed";


  return (

    <div className="mini-chart">

      <svg
        viewBox="0 0 100 45"
        preserveAspectRatio="none"
        className="chart-svg"
      >

        <defs>

          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="0%"
              stopColor={color}
              stopOpacity="0.25"
            />

            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />

          </linearGradient>

        </defs>


        <polyline
          points={`0,45 ${points} 100,45`}
          fill={`url(#${gradientId})`}
          stroke="none"
        />


        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />

      </svg>

    </div>

  );

}


function MarketDashboard() {

  const [
    marketData,
    setMarketData,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {

    let mounted = true;


    const fetchMarket = async () => {

      try {

        const response =
          await fetch(
            "http://127.0.0.1:5000/api/market"
          );


        if (!response.ok) {

          throw new Error(
            "Market request failed"
          );

        }


        const data =
          await response.json();


        if (mounted) {

          setMarketData(data);

        }


      } catch (error) {

        console.error(
          "Market API error:",
          error
        );

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    };


    fetchMarket();


    const interval =
      setInterval(
        fetchMarket,
        15000
      );


    return () => {

      mounted = false;

      clearInterval(interval);

    };

  }, []);


  return (

    <section
      className="market-dashboard"
    >

      <div className="market-background-glow" />


      <div className="market-header">

        <div
          className="market-header-content"
        >

          <div className="market-badge">

            <span className="live-dot" />

            LIVE MARKET

          </div>


          <h2>

            Market{" "}

            <span>
              Intelligence
            </span>

          </h2>


          <p>

            Real-time market data
            for leading digital assets.

          </p>

        </div>


        <div className="market-status">

          <span className="live-dot" />

          LIVE

        </div>

      </div>


      <div className="market-grid">

        {coins.map(
          (coin, index) => {

            const data =
              marketData.find(
                (item) =>
                  item.symbol ===
                  coin.symbol
              );


            const positive =
              data
                ? Number(
                    data.change
                  ) >= 0
                : true;


            return (

              <div
                key={coin.symbol}
                className={`market-card ${
                  coin.comingSoon
                    ? "teka-coming-soon"
                    : ""
                }`}
                style={{
                  "--delay":
                    `${index * 0.08}s`,
                }}
              >

                <div className="market-card-top">

                  <div className="coin-info">

                    <div
                      className={`coin-icon ${
                        coin.comingSoon
                          ? "teka-icon"
                          : ""
                      }`}
                    >

                      {coin.icon}

                    </div>


                    <div>

                      <h3>
                        {coin.symbol}
                      </h3>

                      <p>
                        {coin.name}
                      </p>

                    </div>

                  </div>


                  {coin.comingSoon ? (

                    <div
                      className="coming-badge"
                    >
                      SOON
                    </div>

                  ) : data ? (

                    <div
                      className={
                        positive
                          ? "coin-change positive"
                          : "coin-change negative"
                      }
                    >

                      {positive
                        ? "+"
                        : ""}

                      {Number(
                        data.change
                      ).toFixed(2)}

                      %

                    </div>

                  ) : null}

                </div>


                {coin.comingSoon ? (

                  <div
                    className=
                      "teka-soon-content"
                  >

                    <div
                      className=
                        "teka-soon-title"
                    >
                      TEKA
                    </div>


                    <div
                      className=
                        "teka-soon-text"
                    >
                      به زودی
                    </div>


                    <div
                      className=
                        "teka-soon-line"
                    />


                    <p>
                      The future is loading.
                    </p>

                  </div>

                ) : (

                  <>

                    <div
                      className="coin-price"
                    >

                      {loading

                        ? "Loading..."

                        : data

                        ? `$${Number(
                            data.price
                          ).toLocaleString(
                            "en-US",
                            {
                              maximumFractionDigits:
                                2,
                            }
                          )}`

                        : "—"}

                    </div>


                    <MiniChart
                      history={
                        data?.history
                      }
                      positive={
                        positive
                      }
                    />


                    <div
                      className=
                        "coin-footer"
                    >

                      <span>
                        24H VOLUME
                      </span>


                      <span>

                        {data

                          ? `$${Number(
                              data.volume
                            ).toLocaleString(
                              "en-US",
                              {
                                maximumFractionDigits:
                                  0,
                              }
                            )}`

                          : "—"}

                      </span>

                    </div>

                  </>

                )}

              </div>

            );

          }
        )}

      </div>

    </section>

  );

}


export default MarketDashboard;