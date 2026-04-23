import { useState } from "react";

const REGISTER_SHUTTLE_API = process.env.REACT_APP_REGISTER_SHUTTLE_API;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .card {
    background: #ffffff;
    border-radius: 16px;
    padding: 36px 40px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 2px 16px rgba(61, 45, 181, 0.07);
  }

  .card-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 26px;
    letter-spacing: -0.3px;
  }

  .field-group {
    margin-bottom: 20px;
  }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: #4a4a6a;
    margin-bottom: 8px;
    display: block;
  }

  .text-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e2e4ef;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1a2e;
    background: #fafbff;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }

  .text-input::placeholder {
    color: #b0b3c8;
  }

  .text-input:focus {
    border-color: #3d2db5;
    box-shadow: 0 0 0 3px rgba(61, 45, 181, 0.1);
    background: #ffffff;
  }

  .actions {
    margin-top: 28px;
    display: flex;
    justify-content: center;
  }

  .btn-register {
    padding: 12px 48px;
    background: #3d2db5;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
    box-shadow: 0 4px 14px rgba(61, 45, 181, 0.3);
  }

  .btn-register:hover {
    background: #3226a0;
    box-shadow: 0 6px 20px rgba(61, 45, 181, 0.38);
    transform: translateY(-1px);
  }

  .btn-register:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(61, 45, 181, 0.25);
  }

  .msg-banner {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 13px;
    text-align: center;
  }
`;

export default function AdminRegisterNewShuttle() {
  const [capacity, setCapacity] = useState("");
  const [destination, setDestination] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (!REGISTER_SHUTTLE_API) {
      setMessage({ text: "API URL is missing. Check your .env file.", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(REGISTER_SHUTTLE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity, destination, deviceId, driverId, vehicleNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message || "Shuttle registered successfully!", type: "success" });
        setCapacity("");
        setDestination("");
        setDeviceId("");
        setDriverId("");
        setVehicleNumber("");
      } else {
        setMessage({ text: data.message || "Failed to register shuttle.", type: "error" });
      }
    } catch (error) {
      console.error("Error registering shuttle:", error);
      setMessage({ text: "Failed to connect to the server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card">
        <h2 className="card-title">Register New Shuttle</h2>

            {message.text && (
              <div className="msg-banner" style={{ 
                backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2", 
                color: message.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`
              }}>
                {message.text}
              </div>
            )}

            <div className="field-group">
              <label className="field-label">Capacity</label>
              <input
                className="text-input"
                type="number"
                placeholder="Enter passenger capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Destination</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Device ID</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter tracker device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Driver ID</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter driver ID"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Vehicle Number</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter license plate"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>

            <div className="actions">
              <button className="btn-register" onClick={handleRegister} disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Shuttle"}
              </button>
            </div>
      </div>
    </>
  );
}
