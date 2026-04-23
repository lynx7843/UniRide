import React, { useState } from "react";

const CREATE_BOOKING_API = process.env.REACT_APP_Create_Booking_API;
const OFFLINE_THRESHOLD_MS = 5 * 60 * 1000;

function isOffline(vehicle) {
  if (!vehicle?.timestamp) return true;
  return Date.now() - new Date(vehicle.timestamp).getTime() > OFFLINE_THRESHOLD_MS;
}

function formatTimestamp(ts) {
  if (!ts) return "Unknown";
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');

  .ridecard-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .ridecard-root {
    font-family: 'Figtree', sans-serif;
    background: #ffffff;
    border-radius: 20px;
    width: 320px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    border: 1px solid #e4e8f0;
  }

  .rc-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .rc-avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px; font-weight: 800;
    flex-shrink: 0;
  }
  .rc-avatar.online  { background: linear-gradient(135deg, #4f7ef8, #7b5ef8); }
  .rc-avatar.offline { background: linear-gradient(135deg, #94a3b8, #64748b); }

  .rc-driver-name { font-size: 16px; font-weight: 800; color: #1a1a1a; margin-bottom: 4px; }

  .rc-badge {
    font-size: 12px; font-weight: 700;
    padding: 2px 8px; border-radius: 6px;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .rc-badge.online  { color: #4f7ef8; background: #eef2ff; }
  .rc-badge.offline { color: #64748b; background: #f1f5f9; }

  .rc-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }
  .rc-dot.online  { background: #22c55e; }
  .rc-dot.offline { background: #94a3b8; }

  .rc-div { height: 1px; background: #f0f2f8; margin: 16px 0; }

  .rc-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 12px;
  }

  .rc-detail-item { display: flex; flex-direction: column; }
  .rc-lbl {
    font-size: 10px; font-weight: 700; color: #b0b8cc;
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;
  }
  .rc-val { font-size: 13px; font-weight: 600; color: #1a1f36; }

  .rc-close-btn {
    position: absolute;
    top: 16px; right: 16px;
    background: #f0f2f8; border: none;
    width: 24px; height: 24px; border-radius: 50%;
    cursor: pointer; color: #5a637a; font-weight: bold;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
  }
  .rc-close-btn:hover { background: #e4e8f0; }

  /* ── Status banner ── */
  .rc-status-banner {
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .rc-status-banner.online {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  }
  .rc-status-banner.offline {
    background: #fff7ed;
    border: 1px solid #fed7aa;
  }

  .rc-status-row {
    display: flex; align-items: center; gap: 6px;
  }
  .rc-status-title {
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .rc-status-title.online  { color: #16a34a; }
  .rc-status-title.offline { color: #c2410c; }

  .rc-status-time {
    font-size: 12px; font-weight: 600; margin-top: 2px;
  }
  .rc-status-time.online  { color: #15803d; }
  .rc-status-time.offline { color: #9a3412; }

  .rc-status-ago {
    font-size: 11px; font-weight: 500;
  }
  .rc-status-ago.online  { color: #4ade80; }
  .rc-status-ago.offline { color: #fb923c; }

  .rc-book-btn {
    margin-top: 16px;
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: #4f7ef8;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .rc-book-btn:hover:not(:disabled) {
    background: #3a69e8;
    transform: translateY(-1px);
  }
  .rc-book-btn:disabled {
    background: #b0bde8;
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
`;

export default function RideCard({ user, driver, shuttle, vehicle, onClose }) {
  const offline = isOffline(vehicle);

  const dName    = driver?.driverName    || "Loading...";
  const dPhone   = driver?.phoneNumber   || "—";
  const dNic     = driver?.nic           || "—";
  const dLicense = driver?.licenseNumber || "—";
  const sVehicle = shuttle?.vehicleNumber || "—";
  const sCapacity = shuttle?.capacity    || "—";
  const initials  = dName.substring(0, 2).toUpperCase();

  const lastSeen = formatTimestamp(vehicle?.timestamp);
  const ago      = timeAgo(vehicle?.timestamp);
  
  const isStaffOrDriver = user?.role === "admin" || user?.role === "driver";

  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const handleBook = async () => {
    if (!user?.userId) {
      alert("Please log in to book a seat.");
      return;
    }
    if (!shuttle?.shuttleId) {
      alert("Cannot determine shuttle for booking.");
      return;
    }

    const seatNumber = window.prompt(`Enter a seat number for shuttle to ${shuttle.destination} (1-${shuttle.capacity}):`);
    if (!seatNumber) return;

    setIsBooking(true);
    try {
      const response = await fetch(CREATE_BOOKING_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          shuttleId: shuttle.shuttleId,
          date: new Date().toISOString().split("T")[0],
          seatNumber: seatNumber,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed.");
      alert(`Success! ${data.message}`);
      setIsBooked(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ridecard-root" style={{ position: "relative" }}>
        <button className="rc-close-btn" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="rc-header">
          <div className={`rc-avatar ${offline ? "offline" : "online"}`}>{initials}</div>
          <div>
            <div className="rc-driver-name">{dName}</div>
            <span className={`rc-badge ${offline ? "offline" : "online"}`}>
              <span className={`rc-dot ${offline ? "offline" : "online"}`} />
              {offline ? `Bus ${sVehicle} — Offline` : `Bus ${sVehicle} — Live`}
            </span>
          </div>
        </div>

        <div className="rc-div" />

        {/* Details grid */}
        <div className="rc-details-grid">
          <div className="rc-detail-item">
            <span className="rc-lbl">Phone</span>
            <span className="rc-val">{dPhone}</span>
          </div>
          <div className="rc-detail-item">
            <span className="rc-lbl">Capacity</span>
            <span className="rc-val">{sCapacity} Seats</span>
          </div>
          <div className="rc-detail-item">
            <span className="rc-lbl">License No.</span>
            <span className="rc-val">{dLicense}</span>
          </div>
          <div className="rc-detail-item">
            <span className="rc-lbl">NIC</span>
            <span className="rc-val">{dNic}</span>
          </div>
        </div>

        {/* Status banner */}
        <div className={`rc-status-banner ${offline ? "offline" : "online"}`}>
          <div className="rc-status-row">
            <span className={`rc-dot ${offline ? "offline" : "online"}`} />
            <span className={`rc-status-title ${offline ? "offline" : "online"}`}>
              {offline ? "Tracker Offline — Last Known Location" : "Live Location"}
            </span>
          </div>
          <span className={`rc-status-time ${offline ? "offline" : "online"}`}>
            {lastSeen}
          </span>
          {ago && (
            <span className={`rc-status-ago ${offline ? "offline" : "online"}`}>
              {ago}
            </span>
          )}
        </div>

        {!isStaffOrDriver && (
          <button
            className="rc-book-btn"
            onClick={handleBook}
            disabled={isBooked || isBooking || offline}
          >
            {isBooked ? '✓ Booked' : isBooking ? 'Booking...' : 'Book This Ride'}
          </button>
        )}
      </div>
    </>
  );
}