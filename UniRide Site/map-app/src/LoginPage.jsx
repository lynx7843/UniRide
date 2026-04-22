import { useState } from "react";

// Make sure to match the stage ('/dev') used in your API Gateway
const LOGIN_API = process.env.REACT_APP_LOGIN_API;

export default function LoginPage({ onLoginSuccess, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [showPass, setShowPass] = useState(false);
  
  // New state variables for API handling
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Safety check: ensure the environment variable is actually loaded
      if (!LOGIN_API) {
        setErrorMsg("API URL is missing. Check your .env file and restart the server.");
        return;
      }

      const response = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Pass the user data back to App.js so it can show the map
        if (onLoginSuccess) {
          onLoginSuccess(data.userData); 
        }
      } else {
        // Display the 401 Unauthorized message from your Lambda
        setErrorMsg(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMsg(
        error.message === "Failed to fetch" 
          ? "Network error or CORS issue. Check the browser console." 
          : "Failed to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-card {
          background: #fff;
          border-radius: 28px;
          padding: 52px 48px;
          width: 440px;
          box-shadow: 0 8px 60px rgba(100, 120, 220, 0.13);
          position: relative;
          z-index: 2;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          background: #bfceff;
          filter: blur(60px);
          opacity: 0.55;
          pointer-events: none;
        }

        .input-wrap {
          position: relative;
          margin-bottom: 18px;
        }

        .input-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 8px;
          display: block;
          transition: color 0.2s;
        }

        .input-label.focused {
          color: #5a6fd6;
        }

        .input-field {
          width: 100%;
          border: 1.8px solid #e0e5f7;
          border-radius: 14px;
          padding: 14px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #1a1a2e;
          background: #f8f9ff;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          appearance: none;
        }

        .input-field:focus {
          border-color: #5a6fd6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(90, 111, 214, 0.10);
        }

        .input-field::placeholder {
          color: #c0c8e8;
        }

        .pass-toggle {
          position: absolute;
          right: 16px;
          bottom: 15px;
          background: none;
          border: none;
          cursor: pointer;
          color: #aab0d0;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }

        .pass-toggle:hover { color: #5a6fd6; }

        .error-message {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #ef4444;
          background: #fef2f2;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 16px;
          text-align: center;
          border: 1px solid #fecaca;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: #5a6fd6;
          border: none;
          border-radius: 14px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 0.12em;
          color: #fff;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(90, 111, 214, 0.25);
        }

        .submit-btn:hover:not(:disabled) {
          background: #4a5dc4;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(90, 111, 214, 0.32);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #aab0d0;
          cursor: not-allowed;
          box-shadow: none;
        }

        .footer-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #aab0d0;
          text-align: center;
          margin-top: 28px;
        }

        .footer-link {
          color: #5a6fd6;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-link:hover { opacity: 0.75; }

        .forgot-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: #5a6fd6;
          text-align: right;
          display: block;
          margin-top: -10px;
          margin-bottom: 24px;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .forgot-link:hover { opacity: 0.7; }

        .logo-mark {
          width: 40px;
          height: 40px;
          background: #bfceff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
        }
      `}</style>

      {/* Background blobs */}
      <div className="blob" style={{ width: 420, height: 420, top: -80, right: -100 }} />
      <div className="blob" style={{ width: 320, height: 320, bottom: -60, left: -80, opacity: 0.35 }} />
      <div className="blob" style={{ width: 200, height: 200, top: "40%", left: "10%", opacity: 0.25 }} />

      <div className="login-card">
        <div className="logo-mark"></div>

        <h1 style={styles.heading}>Welcome Back</h1>
        <p style={styles.subheading}>Sign in to continue to your workspace</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 36 }}>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          {/* Email */}
          <div className="input-wrap">
            <label className={`input-label${focused === "email" ? " focused" : ""}`}>Email Address</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          {/* Password */}
          <div className="input-wrap">
            <label className={`input-label${focused === "password" ? " focused" : ""}`}>Password</label>
            <input
              className="input-field"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              style={{ paddingRight: 44 }}
              required
            />
            <button
              type="button"
              className="pass-toggle"
              onClick={() => setShowPass((p) => !p)}
            >
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <a className="forgot-link">Forgot password?</a>

          <button className="submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <a className="footer-link" onClick={() => onShowRegister && onShowRegister()} style={{ cursor: 'pointer' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f9ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  heading: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "38px",
    letterSpacing: "0.04em",
    color: "#1a1a2e",
    lineHeight: 1,
  },
  subheading: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 300,
    color: "#aab0d0",
    marginTop: "8px",
  },
};