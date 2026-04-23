import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background-color: #f0f2f7;
    min-height: 100vh;
  }

  .page-wrapper {
    min-height: 100vh;
    background-color: #f0f2f7;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    background: #ffffff;
    padding: 0 32px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e8eaf0;
  }

  .logo {
    font-size: 22px;
    font-weight: 700;
    color: #3d2db5;
    letter-spacing: -0.5px;
  }

  .avatar-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ede9fb;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3d2db5;
  }

  .content-area {
    flex: 1;
    padding: 36px 40px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 28px;
    letter-spacing: -0.3px;
  }

  .card {
    background: #ffffff;
    border-radius: 16px;
    padding: 36px 40px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 2px 16px rgba(61, 45, 181, 0.07);
  }

  .field-group {
    margin-bottom: 22px;
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

  .divider {
    height: 1px;
    background: #eef0f8;
    margin: 24px 0;
  }

  .stops-section-label {
    font-size: 13px;
    font-weight: 600;
    color: #4a4a6a;
    margin-bottom: 14px;
    display: block;
  }

  .stop-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .stop-number {
    font-size: 12px;
    font-weight: 700;
    color: #3d2db5;
    background: #ede9fb;
    border-radius: 6px;
    padding: 4px 8px;
    white-space: nowrap;
    min-width: 52px;
    text-align: center;
  }

  .stop-input {
    flex: 1;
    padding: 10px 14px;
    border: 1.5px solid #e2e4ef;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1a2e;
    background: #fafbff;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }

  .stop-input::placeholder {
    color: #b0b3c8;
  }

  .stop-input:focus {
    border-color: #3d2db5;
    box-shadow: 0 0 0 3px rgba(61, 45, 181, 0.1);
    background: #ffffff;
  }

  .actions {
    margin-top: 28px;
    display: flex;
    justify-content: center;
  }

  .btn-save {
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

  .btn-save:hover {
    background: #3226a0;
    box-shadow: 0 6px 20px rgba(61, 45, 181, 0.38);
    transform: translateY(-1px);
  }

  .btn-save:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(61, 45, 181, 0.25);
  }
`;

export default function AdminSetBusStops() {
  const [shuttleId, setShuttleId] = useState("");
  const [stops, setStops] = useState(["", "", "", "", ""]);

  const handleStopChange = (index, value) => {
    const updated = [...stops];
    updated[index] = value;
    setStops(updated);
  };

  const handleSave = () => {
    console.log("Saving route:", { shuttleId, stops });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-wrapper">
        <header className="topbar">
          <span className="logo">UniRide</span>
          <button className="avatar-btn" aria-label="Account">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </header>

        <div className="content-area">
          <h1 className="page-title">Set Bus Stops</h1>

          <div className="card">
            <div className="field-group">
              <label className="field-label">Shuttle ID (String)</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter Shuttle ID (e.g., UNIBUS-123)"
                value={shuttleId}
                onChange={(e) => setShuttleId(e.target.value)}
              />
            </div>

            <div className="divider" />

            <span className="stops-section-label">Bus Stops</span>

            {stops.map((stop, index) => (
              <div className="stop-row" key={index}>
                <span className="stop-number">Stop {index + 1}</span>
                <input
                  className="stop-input"
                  type="text"
                  placeholder={`Enter Stop ${index + 1} name`}
                  value={stop}
                  onChange={(e) => handleStopChange(index, e.target.value)}
                />
              </div>
            ))}

            <div className="actions">
              <button className="btn-save" onClick={handleSave}>
                Save Route
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
