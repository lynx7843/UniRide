import { useState } from "react";

const REGISTER_DRIVER_API = process.env.REACT_APP_REGISTER_DRIVER_API;

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

  .avatar-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 28px;
  }

  .avatar-circle {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #ede9fb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9b8fd4;
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

  .btn-create {
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

  .btn-create:hover {
    background: #3226a0;
    box-shadow: 0 6px 20px rgba(61, 45, 181, 0.38);
    transform: translateY(-1px);
  }

  .btn-create:active {
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

export default function AdminCreateDriverAccount() {
  const [driverName, setDriverName] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleCreate = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (!REGISTER_DRIVER_API) {
      setMessage({ text: "API URL is missing. Check your .env file.", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(REGISTER_DRIVER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverName, email, licenseNumber, nic, password, phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message || "Driver created successfully!", type: "success" });
        // Clear the form after successful creation
        setDriverName("");
        setEmail("");
        setLicenseNumber("");
        setNic("");
        setPassword("");
        setPhoneNumber("");
      } else {
        setMessage({ text: data.message || "Failed to create driver.", type: "error" });
      }
    } catch (error) {
      console.error("Error creating driver:", error);
      setMessage({ text: "Failed to connect to the server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
          <div className="card">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            </div>

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
              <label className="field-label">Driver Name</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter full name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                className="text-input"
                type="email"
                placeholder="driver@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">License Number</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter license number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">NIC</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter national identity card number"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="text-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number</label>
              <input
                className="text-input"
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="actions">
              <button className="btn-create" onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Driver"}
              </button>
            </div>
          </div>
    </>
  );
}
