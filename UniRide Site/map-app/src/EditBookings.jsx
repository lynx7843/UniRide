import { useState, useEffect } from "react";

const GET_USER_BOOKINGS_API = process.env.REACT_APP_GET_USER_BOOKINGS_API || process.env.REACT_APP_GetUserBookings_API;
const SHUTTLE_API = process.env.REACT_APP_SHUTTLE_API;
const CANCEL_BOOKING_API = process.env.REACT_APP_CANCEL_BOOKING_API || process.env.REACT_APP_CancelBooking_API;

const bookingStyles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    width: "100%",
    maxWidth: "680px",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },
  bookingCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "16px",
  },
  row: {
    display: "flex",
    marginBottom: "10px",
    fontSize: "14px",
  },
  label: {
    fontWeight: "600",
    color: "#111827",
    width: "130px",
    flexShrink: 0,
  },
  value: {
    color: "#374151",
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "16px",
  },
  cancelBtn: {
    padding: "9px 20px",
    borderRadius: "6px",
    border: "1px solid #fca5a5",
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default function EditBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user?.userId) {
      setError("User ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchBookings = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [bookingsRes, shuttlesRes] = await Promise.all([
          fetch(`${GET_USER_BOOKINGS_API}?userId=${user.userId}`),
          fetch(SHUTTLE_API)
        ]);

        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings.");
        if (!shuttlesRes.ok) throw new Error("Failed to fetch shuttles.");

        const bookingsData = await bookingsRes.json();
        const shuttlesData = await shuttlesRes.json();

        const combined = bookingsData.map(booking => {
          const shuttle = shuttlesData.find(s => s.shuttleId === booking.shuttleId) || {};
          return {
            id: booking.bookingId,
            date: booking.date || "Unknown Date",
            destination: shuttle.destination || "Unknown Destination",
            shuttleId: booking.shuttleId || "—",
            timestamp: booking.timestamp || 0,
            seatNumber: booking.seatNumber ?? booking.SeatNumber ?? "—"
          };
        });

        // Sort newest first
        combined.sort((a, b) => b.timestamp - a.timestamp);
        setBookings(combined);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(CANCEL_BOOKING_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, userId: user.userId })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel booking.");
      }

      // Remove the cancelled booking from the UI immediately
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error("Cancel Error:", err);
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={bookingStyles.card}>
      <h2 style={bookingStyles.cardTitle}>Edit Bookings</h2>

      {isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading your bookings...</p>
      ) : error ? (
        <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: "14px" }}>No active bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} style={bookingStyles.bookingCard}>
            <div style={bookingStyles.row}>
              <span style={bookingStyles.label}>Destination:</span>
              <span style={bookingStyles.value}>{booking.destination}</span>
            </div>
            <div style={bookingStyles.row}>
              <span style={bookingStyles.label}>Date:</span>
              <span style={bookingStyles.value}>{booking.date}</span>
            </div>
            <div style={bookingStyles.row}>
              <span style={bookingStyles.label}>Shuttle:</span>
              <span style={bookingStyles.value}>{booking.shuttleId}</span>
            </div>
            <div style={bookingStyles.row}>
              <span style={bookingStyles.label}>Seat Number:</span>
              <span style={bookingStyles.value}>{booking.seatNumber}</span>
            </div>

            <div style={bookingStyles.cardActions}>
              <button 
                style={{
                  ...bookingStyles.cancelBtn,
                  opacity: cancellingId === booking.id ? 0.6 : 1,
                  cursor: cancellingId === booking.id ? "not-allowed" : "pointer"
                }}
                onClick={() => handleCancel(booking.id)}
                disabled={cancellingId === booking.id}
              >
                {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
