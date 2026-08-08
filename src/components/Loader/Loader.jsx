import { useEffect, useState } from "react";
import "./Loader.css";
import logo from "../../assets/logo.png";

function Loader() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  if (hide) return null;

  return (
    <div className="teka-loader">
      <div className="teka-loader-content">

        <div className="teka-loader-mark">
          <div className="teka-loader-ring"></div>

          <img
            src={logo}
            alt="TEKA"
            className="teka-loader-logo"
          />

          <div className="teka-loader-scan"></div>
        </div>

        <div className="teka-loader-title">
          TEKA<span>.</span>
        </div>

        <div className="teka-loader-subtitle">
          DIGITAL INNOVATION
        </div>

        <div className="teka-loader-progress">
          <div className="teka-loader-progress-bar"></div>
        </div>

        <div className="teka-loader-status">
          <span></span>
          INITIALIZING
        </div>

      </div>
    </div>
  );
}

export default Loader;