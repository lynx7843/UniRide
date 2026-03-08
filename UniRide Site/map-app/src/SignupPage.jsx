import { useState } from "react";

// Update with your actual API Gateway URL if different
const REGISTER_API = "";

export default function SignupPage({ onClose, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // New state variables for API handling
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Automatically generate a student ID for this example
    const generatedUserId = "STU-" + Math.floor(1000 + Math.random() * 9000);
    const role = "student";

    try {
      const response = await fetch(REGISTER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
          userId: generatedUserId,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! You can now sign in.");
        // Automatically switch back to the login page
        if (onShowLogin) onShowLogin();
      } else {
        setErrorMsg(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-card {
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
          background: #b0bde8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 28px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e8ecf8;
        }

        .divider-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #c0c8e8;
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        .social-btn {
          width: 100%;
          padding: 13px;
          background: #f8f9ff;
          border: 1.8px solid #e0e5f7;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1a1a2e;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s;
        }

        .social-btn:hover {
          background: #eef1fc;
          border-color: #bfceff;
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

        .terms-wrap {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 4px;
          margin-bottom: 6px;
        }

        .terms-checkbox {
          width: 17px;
          height: 17px;
          min-width: 17px;
          accent-color: #5a6fd6;
          cursor: pointer;
          margin-top: 1px;
        }

        .terms-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 300;
          color: #aab0d0;
          line-height: 1.5;
          cursor: pointer;
        }

        .terms-label a {
          color: #5a6fd6;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .terms-label a:hover { opacity: 0.75; }

        .strength-bar-wrap {
          margin-top: 8px;
          display: flex;
          gap: 5px;
        }

        .strength-segment {
          height: 3px;
          flex: 1;
          border-radius: 99px;
          background: #e0e5f7;
          transition: background 0.3s;
        }

        .strength-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 400;
          margin-top: 5px;
          transition: color 0.3s;
        }
      `}</style>

      {/* Background blobs */}
      <div className="blob" style={{ width: 420, height: 420, top: -80, left: -100 }} />
      <div className="blob" style={{ width: 320, height: 320, bottom: -60, right: -80, opacity: 0.35 }} />
      <div className="blob" style={{ width: 200, height: 200, top: "40%", right: "10%", opacity: 0.25 }} />

      <div className="signup-card">
        <div className="logo-mark">
          {/* Logo icon — graduation cap SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5a6fd6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/>
          </svg>
        </div>

        <h1 style={styles.heading}>Welcome to UniRide</h1>
        <p style={styles.subheading}>Create your UniRide account to get started</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 36 }}>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          {/* Full Name */}
          <div className="input-wrap">
            <label className={`input-label${focused === "name" ? " focused" : ""}`}>Full Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. Dilan Edirisingha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          {/* Student Email */}
          <div className="input-wrap">
            <label className={`input-label${focused === "email" ? " focused" : ""}`}>Student Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@students.nsbm.ac.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          {/* Password */}
          <div className="input-wrap">
            <label className={`input-label${focused === "password" ? " focused" : ""}`}>Create Password</label>
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
              aria-label="Toggle password visibility"
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

            {/* Password strength indicator */}
            {password.length > 0 && <PasswordStrength password={password} />}
          </div>

          {/* Terms checkbox */}
          <div className="terms-wrap">
            <input
              className="terms-checkbox"
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
            />
            <label className="terms-label" htmlFor="terms">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button className="submit-btn" type="submit" disabled={!agreed || isLoading}>
            {isLoading ? "Creating Account..." : "Create My Account"}
          </button>
        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <a className="footer-link" onClick={() => onShowLogin && onShowLogin()} style={{ cursor: "pointer" }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#e0e5f7", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

  return (
    <>
      <div className="strength-bar-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-segment"
            style={{ background: i <= strength ? colors[strength] : "#e0e5f7" }}
          />
        ))}
      </div>
      <p className="strength-label" style={{ color: colors[strength] }}>
        {strength > 0 ? `${labels[strength]} password` : ""}
      </p>
    </>
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