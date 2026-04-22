import { useState } from "react";
import RideHistory from "./RideHistory";
import EditBookings from "./EditBookings";
import Schedule from "./Schedule";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary:    #3D2B8E;
    --primary-dk: #2D1F6E;
    --primary-lt: #EEE9FF;
    --accent:     #6C4EE0;
    --bg:         #F0F2F7;
    --surface:    #FFFFFF;
    --border:     #DDE1EC;
    --text:       #1A1A2E;
    --muted:      #8A8FAD;
    --sidebar-w:  200px;
    --radius:     12px;
    --transition: 0.2s ease;
  }

  body { font-family: 'Plus Jakarta Sans', sans-serif; }

  .app {
    display: flex;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* SIDEBAR */
  .sidebar {
    width: var(--sidebar-w);
    min-height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
  }

  .sidebar-logo {
    padding: 20px 20px 28px;
    font-size: 22px;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -0.5px;
  }

  .sidebar-nav { flex: 1; padding: 0 10px; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: background var(--transition), color var(--transition);
    user-select: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .nav-item:hover { background: var(--primary-lt); color: var(--primary); }
  .nav-item.parent { color: var(--text); font-weight: 600; }
  .nav-item.active { background: var(--primary); color: #fff; font-weight: 600; }
  .nav-item.active:hover { background: var(--primary-dk); }
  .nav-item.logout:hover { background: #FEE2E2; color: #DC2626; }

  .nav-chevron { margin-left: auto; transition: transform var(--transition); }
  .nav-chevron.open { transform: rotate(180deg); }

  .nav-child {
    margin: 4px 0 4px 22px;
    border-radius: 8px;
    overflow: hidden;
  }

  .sidebar-footer { padding: 0 10px; }

  /* MAIN */
  .main {
    margin-left: var(--sidebar-w);
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* HEADER */
  .header {
    height: 64px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 32px;
    position: sticky; top: 0;
    z-index: 50;
  }

  .header-title {
    font-size: 18px;
    font-weight: 700;
    flex: 1;
  }

  .avatar-btn {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: var(--bg);
    border: 2px solid var(--border);
    display: grid; place-items: center;
    cursor: pointer;
    transition: border-color var(--transition);
  }
  .avatar-btn:hover { border-color: var(--primary); }

  /* CONTENT */
  .content {
    flex: 1;
    padding: 40px 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* CARD */
  .card {
    background: var(--surface);
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(61,43,142,.07);
    padding: 40px 48px 36px;
    width: 100%;
    max-width: 640px;
    animation: fadeUp .45s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* AVATAR */
  .avatar-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 36px;
  }

  .avatar-circle {
    width: 96px; height: 96px;
    border-radius: 50%;
    background: linear-gradient(135deg, #DDD8F5, #C4BAF0);
    display: grid; place-items: center;
    position: relative;
    box-shadow: 0 6px 20px rgba(61,43,142,.18);
  }

  .avatar-edit {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--primary);
    display: grid; place-items: center;
    cursor: pointer;
    border: 2px solid var(--surface);
    box-shadow: 0 2px 8px rgba(61,43,142,.4);
    transition: background var(--transition), transform var(--transition);
  }
  .avatar-edit:hover { background: var(--accent); transform: scale(1.12); }

  /* FIELDS */
  .field { margin-bottom: 20px; }

  .field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 7px;
    letter-spacing: 0.01em;
  }

  .field input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    background: var(--bg);
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
  }
  .field input::placeholder { color: var(--muted); }
  .field input:focus {
    border-color: var(--primary);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(61,43,142,.12);
  }

  /* ACTIONS */
  .actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
  }

  .btn {
    padding: 13px 32px;
    border-radius: var(--radius);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all var(--transition);
    letter-spacing: 0.01em;
  }

  .btn-outline {
    background: transparent;
    border: 1.5px solid var(--border);
    color: var(--text);
  }
  .btn-outline:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-lt); }

  .btn-primary {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 4px 14px rgba(61,43,142,.35);
  }
  .btn-primary:hover { background: var(--primary-dk); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(61,43,142,.45); }
  .btn-primary:active { transform: translateY(0); }

  .btn-primary:disabled {
    background: var(--muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 28px; right: 28px;
    background: var(--primary);
    color: #fff;
    padding: 14px 22px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,.18);
    opacity: 0;
    transform: translateY(12px);
    pointer-events: none;
    transition: opacity .3s ease, transform .3s ease;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .toast.show { opacity: 1; transform: translateY(0); }
`;

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);

const UserIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg className={`nav-chevron ${open ? "open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const BookingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ScheduleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const UPDATE_PROFILE_API = process.env.REACT_APP_Update_Profile_API || process.env.REACT_APP_UPDATE_PROFILE_API;

export default function EditProfile({ user, onBack, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(true);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [form, setForm] = useState({ 
    name: user?.name || "", 
    email: user?.email || "", 
    phone: user?.phone || "",
    address: user?.address || "",
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.currentPassword) {
      setErrorMsg("Current password is required to save changes.");
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(UPDATE_PROFILE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          currentPassword: form.currentPassword,
          name: form.name,
          address: form.address,
          phone: form.phone,
          password: form.newPassword || form.currentPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToast(true);
        setTimeout(() => setToast(false), 2800);
        // Clear sensitive fields so they aren't left filled
        setForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        setErrorMsg(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">UniRide</div>

          <nav className="sidebar-nav">
            <button className="nav-item" onClick={onBack}><MapIcon /> Map</button>

            <button className="nav-item parent" onClick={() => setProfileOpen(o => !o)}>
              <UserIcon /> Profile <ChevronIcon open={profileOpen} />
            </button>

            {profileOpen && (
              <div className="nav-child">
                <button 
                  className={`nav-item ${activeTab === "profile" ? "active" : ""}`} 
                  onClick={() => setActiveTab("profile")}
                >
                  <UserIcon /> Edit Profile
                </button>
              </div>
            )}

            <button className="nav-item parent" onClick={() => setBookingsOpen(o => !o)}>
              <BookingsIcon /> Bookings <ChevronIcon open={bookingsOpen} />
            </button>

            {bookingsOpen && (
              <div className="nav-child">
                <button 
                  className={`nav-item ${activeTab === "history" ? "active" : ""}`} 
                  onClick={() => setActiveTab("history")}
                >
                  <BookingsIcon /> Ride History
                </button>
                <button 
                  className={`nav-item ${activeTab === "bookings" ? "active" : ""}`} 
                  onClick={() => setActiveTab("bookings")}
                >
                  <BookingsIcon /> Edit bookings
                </button>
              </div>
            )}

            <button 
              className={`nav-item ${activeTab === "schedule" ? "active" : ""}`} 
              onClick={() => setActiveTab("schedule")}
            >
              <ScheduleIcon /> Schedule
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item logout" onClick={onLogout}><LogoutIcon /> Log Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">

          {/* HEADER */}
          <header className="header">
            <span className="header-title">
              {activeTab === "profile" && "Edit Profile"}
              {activeTab === "history" && "Ride History"}
              {activeTab === "bookings" && "Edit Bookings"}
              {activeTab === "schedule" && "Schedule"}
            </span>
            <div className="avatar-btn"><UserIcon size={20} /></div>
          </header>

          {/* CONTENT */}
          <div className="content">
            
            {/* Edit Profile Tab */}
            {activeTab === "profile" && (
              <div className="card">
              {/* Avatar */}
              <div className="avatar-wrap">
                <div className="avatar-circle">
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="#7B68C8" style={{ opacity: 0.6 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <div className="avatar-edit" title="Change photo"><EditIcon /></div>
                </div>
              </div>

              {errorMsg && <div style={{ color: "#DC2626", marginBottom: "16px", fontSize: "14px", fontWeight: "600", textAlign: "center" }}>{errorMsg}</div>}

              {/* Fields */}
              {[
                { label: "Name", name: "name", type: "text", placeholder: "Enter your full name" },
                { label: "Email", name: "email", type: "email", placeholder: "name@example.com", readOnly: true },
                { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter your phone number" },
                { label: "Address", name: "address", type: "text", placeholder: "Enter your address" },
                { label: "Current Password (Required)", name: "currentPassword", type: "password", placeholder: "••••••••••" },
                { label: "New Password (Optional)", name: "newPassword", type: "password", placeholder: "••••••••••" },
                { label: "Confirm New Password", name: "confirmPassword", type: "password", placeholder: "••••••••••" },
              ].map(f => (
                <div className="field" key={f.name}>
                  <label htmlFor={f.name}>{f.label}</label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                    readOnly={f.readOnly}
                    style={f.readOnly ? { backgroundColor: "#E2E8F0", color: "#64748B", cursor: "not-allowed" } : {}}
                  />
                </div>
              ))}

              {/* Actions */}
              <div className="actions">
                <button className="btn btn-outline" onClick={onBack}>Back to Home</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
              </div>
            )}

            {/* Ride History Tab */}
            {activeTab === "history" && <RideHistory user={user} />}

            {/* Edit Bookings Tab */}
            {activeTab === "bookings" && <EditBookings user={user} />}

            {/* Schedule Tab */}
            {activeTab === "schedule" && <Schedule user={user} />}
          </div>
        </div>

        {/* Toast */}
        <div className={`toast ${toast ? "show" : ""}`}>✓ Changes saved successfully!</div>
      </div>
    </>
  );
}
