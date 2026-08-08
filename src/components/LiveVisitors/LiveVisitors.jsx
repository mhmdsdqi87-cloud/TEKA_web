import { useEffect, useState } from "react";
import "./LiveVisitors.css";

const API_URL = "http://127.0.0.1:5000";

function LiveVisitors() {
  const [visitors, setVisitors] = useState(0);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let visitorId = localStorage.getItem("teka_visitor_id");

    if (!visitorId) {
      visitorId =
        crypto.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      localStorage.setItem("teka_visitor_id", visitorId);
    }

    const sendHeartbeat = async () => {
      try {
        await fetch(`${API_URL}/api/presence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitor_id: visitorId,
          }),
        });

        setOnline(true);
      } catch {
        setOnline(false);
      }
    };

    const getVisitors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/presence`);

        if (!response.ok) {
          throw new Error("Failed to fetch visitors");
        }

        const data = await response.json();

        setVisitors(data.displayed_users);
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };

    const update = async () => {
      await sendHeartbeat();
      await getVisitors();
    };

    update();

    const interval = setInterval(update, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-visitors">
      <div className="live-status">
        <span
          className={`live-dot ${online ? "online" : ""}`}
        ></span>

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