import { useState } from "react";

const SIGNUP_API = process.env.REACT_APP_SIGNUP_API;

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

export default function AdminCreateStudentAccount() {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleCreate = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    if (!SIGNUP_API) {
      setMessage({ text: "API URL is missing. Check your .env file.", type: "error" });
      setIsLoading(false);
      return;
    }

    // Generate a student ID similar to the registration flow
    const generatedUserId = "STU-" + Math.floor(1000 + Math.random() * 9000);

    try {
      const response = await fetch(SIGNUP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, address, name, password, phone, userId: generatedUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message || "Student created successfully!", type: "success" });
        // Clear the form after successful creation
        setEmail("");
        setAddress("");
        setName("");
        setPassword("");
        setPhone("");
      } else {
        setMessage({ text: data.message || "Failed to create student.", type: "error" });
      }
    } catch (error) {
      console.error("Error creating student:", error);
      setMessage({ text: "Failed to connect to the server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="card">
        <h2 className="card-title">Create User - Student</h2>

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
              <label className="field-label">Email</label>
              <input
                className="text-input"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Address</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Name</label>
              <input
                className="text-input"
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="actions">
              <button className="btn-create" onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            </div>
      </div>
    </>
  );
}
