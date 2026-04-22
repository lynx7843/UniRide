import { useState, useEffect } from "react";

const SHUTTLE_API = process.env.REACT_APP_SHUTTLE_API;
const DRIVER_API = process.env.REACT_APP_DRIVER_API;
const CREATE_BOOKING_API = process.env.REACT_APP_Create_Booking_API;

const scheduleStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "680px",
  },
  welcomeCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "36px 28px",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  welcomeTitle: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
  },
  welcomeSub: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  shuttlesCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px 28px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  shuttlesTitle: {
    margin: "0 0 20px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  shuttleList: {
    display: "flex",
    flexDirection: "column",
  },
  shuttleRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f5f6fb",
    borderRadius: "10px",
    padding: "14px 16px",
    gap: "14px",
  },
  busIconWrap: {
    width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#ede9fe",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  shuttleInfo: { display: "flex", flexDirection: "column", flex: 1, gap: "4px" },
  shuttleRoute: { fontSize: "14px", fontWeight: "600", color: "#111827" },
  shuttleMeta: { fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px" },
  divider: { color: "#d1d5db" },
  onTime: { color: "#4f46e5", fontWeight: "500" },
  bookBtn: {
    padding: "7px 18px",
    borderRadius: "7px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    flexShrink: 0,
  },
  bookBtnDisabled: {
    cursor: "not-allowed",
    backgroundColor: "#e5e7eb",
    color: "#6b7280",
    opacity: 0.7,
  },
};

const BusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="13" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="18" r="1.5" />
    <circle cx="17" cy="18" r="1.5" />
    <path d="M6 5V3" />
    <path d="M18 5V3" />
  </svg>
);

export default function Schedule({ user }) {
  const [shuttles, setShuttles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingState, setBookingState] = useState({ loadingId: null });

  useEffect(() => {
    const fetchScheduleData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [shuttlesRes, driversRes] = await Promise.all([
          fetch(SHUTTLE_API),
          fetch(DRIVER_API),
        ]);

        if (!shuttlesRes.ok) throw new Error("Failed to fetch shuttle schedule.");
        if (!driversRes.ok) throw new Error("Failed to fetch driver details.");

        const shuttlesData = await shuttlesRes.json();
        const driversData = await driversRes.json();

        const combinedData = shuttlesData.map((shuttle) => {
          const driver = driversData.find((d) => d.driverId === shuttle.driverId) || {};
          return {
            ...shuttle,
            driverName: driver.driverName || "Unassigned",
            status: "On Route", // Static status as requested
          };
        });

        setShuttles(combinedData);
      } catch (err) {
        console.error(err);
        setError("Could not load the shuttle schedule. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  const handleBook = async (shuttle) => {
    if (!user?.userId) {
      alert("You must be logged in to book a ride.");
      return;
    }

    const seatNumber = window.prompt(`Enter a seat number to book for shuttle to ${shuttle.destination} (1-${shuttle.capacity}):`);
    if (!seatNumber) return; // User cancelled or entered nothing

    setBookingState({ loadingId: shuttle.shuttleId });

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

      alert(`Success! ${data.message} Your booking ID is ${data.bookingId}.`);
    } catch (err) {
      console.error("Booking Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setBookingState({ loadingId: null });
    }
  };

  return (
    <div style={scheduleStyles.container}>
      <div style={scheduleStyles.welcomeCard}>
        <h2 style={scheduleStyles.welcomeTitle}>Welcome back, {user?.name?.split(" ")[0] || "User"}!</h2>
        <p style={scheduleStyles.welcomeSub}>Here's a quick overview of your upcoming shuttle rides.</p>
      </div>

      <div style={scheduleStyles.shuttlesCard}>
        <h3 style={scheduleStyles.shuttlesTitle}>Upcoming Shuttles</h3>
        {isLoading ? (
          <p style={{ fontSize: "14px", color: "#6b7280" }}>Loading schedule...</p>
        ) : error ? (
          <p style={{ fontSize: "14px", color: "#ef4444" }}>{error}</p>
        ) : (
          <div style={scheduleStyles.shuttleList}>
            {shuttles.map((shuttle, i) => (
              <div key={shuttle.shuttleId} style={{ ...scheduleStyles.shuttleRow, marginTop: i === 0 ? 0 : "12px" }}>
                <div style={scheduleStyles.busIconWrap}><BusIcon /></div>
                <div style={scheduleStyles.shuttleInfo}>
                  <span style={scheduleStyles.shuttleRoute}>{shuttle.destination}</span>
                  <span style={scheduleStyles.shuttleMeta}>
                    {shuttle.driverName} ({shuttle.vehicleNumber})
                    <span style={scheduleStyles.divider}> | </span>
                    <span style={scheduleStyles.onTime}>{shuttle.status}</span>
                  </span>
                </div>
                <button
                  style={{
                    ...scheduleStyles.bookBtn,
                    ...(bookingState.loadingId === shuttle.shuttleId ? scheduleStyles.bookBtnDisabled : {}),
                  }}
                  onClick={() => handleBook(shuttle)}
                  disabled={bookingState.loadingId === shuttle.shuttleId}
                >
                  {bookingState.loadingId === shuttle.shuttleId ? "Booking..." : "Book"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
