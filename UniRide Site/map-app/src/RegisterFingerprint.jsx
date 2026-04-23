import { useState } from "react";

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

  .textarea-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e2e4ef;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1a2e;
    background: #fafbff;
    outline: none;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.18s, box-shadow 0.18s;
  }

  .textarea-input::placeholder {
    color: #b0b3c8;
  }

  .textarea-input:focus {
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
`;

export default function AdminRegisterFingerprint() {
  const [driverId, setDriverId] = useState("");
  const [metadata, setMetadata] = useState("");

  const handleRegister = () => {
    console.log("Registering fingerprint:", { driverId, metadata });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card">
        <h2 className="card-title">Register Driver Fingerprint</h2>
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
              <label className="field-label">Metadata</label>
              <textarea
                className="textarea-input"
                placeholder="Enter additional details or notes"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
              />
            </div>

            <div className="actions">
              <button className="btn-register" onClick={handleRegister}>
                Register Fingerprint
              </button>
            </div>
      </div>
    </>
  );
}
