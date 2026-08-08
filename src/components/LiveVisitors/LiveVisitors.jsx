import { useEffect, useState } from "react";
import "./LiveVisitors.css";

const API_URL = "https://teka-web-beta.vercel.app/api";

function LiveVisitors() {
  const [visitors, setVisitors] = useState(0);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let visitorId = localStorage.getItem("teka_visitor_id");

    if (!visitorId) {
      visitorId =
        crypto.randomUUID?.() ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      localStorage.setItem(
        "teka_visitor_id",
        visitorId
      );
    }

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(
          `${API_URL}/presence`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              visitor_id: visitorId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Heartbeat failed");
        }

        setOnline(true);
      } catch (error) {
        console.error(
          "TEKA Presence:",
          error
        );

        setOnline(false);
      }
    };

    const getVisitors = async () => {
      try {
        const response = await fetch(
          `${API_URL}/presence`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch visitors"
          );
        }

        const data =
          await response.json();

        setVisitors(
          Number(data.displayed_users) || 0
        );

        setOnline(true);
      } catch (error) {
        console.error(
          "TEKA Visitors:",
          error
        );

        setOnline(false);
      }
    };

    const updatePresence = async () => {
      await sendHeartbeat();
      await getVisitors();
    };

    updatePresence();

    const interval = setInterval(
      updatePresence,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="live-visitors">

      <div className="live-status">

        <span
          className={`live-dot ${
            online ? "online" : ""
          }`}
        />

        <span>
          {online ? "LIVE" : "OFFLINE"}
        </span>

      </div>

      <div className="live-number">
        {visitors}
      </div>

      <div className="live-label">
        People exploring TEKA
      </div>

    </div>
  );
}

export default LiveVisitors;