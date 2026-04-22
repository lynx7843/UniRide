import { useState, useEffect } from "react";

const GET_USER_BOOKINGS_API = process.env.REACT_APP_GET_USER_BOOKINGS_API || process.env.REACT_APP_GetUserBookings_API;
const SHUTTLE_API = process.env.REACT_APP_SHUTTLE_API;

const ROWS_PER_PAGE = 5;

const historyStyles = {
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#374151",
  },
  pagination: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "6px",
    marginTop: "20px",
  },
  pageBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  pageBtnActive: {
    backgroundColor: "#1e3a5f",
    color: "#ffffff",
    borderColor: "#1e3a5f",
  },
};

export default function RideHistory({ user }) {
  const [page, setPage] = useState(1);
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.userId) {
      setError("User ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
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

        // Debugging: Check your browser console (F12) to see exactly what AWS returns!
        console.log("Raw Bookings Data from AWS:", bookingsData);

        const combinedRides = bookingsData.map(booking => {
          // Match the shuttle details to the booking using the shuttleId
          const shuttle = shuttlesData.find(s => s.shuttleId === booking.shuttleId) || {};
          return {
            id: booking.bookingId,
            date: booking.date || "Unknown Date",
            destination: shuttle.destination || "Unknown Destination",
            shuttleId: booking.shuttleId || "—",
            timestamp: booking.timestamp || 0,
            // Using ?? instead of || so that "0" doesn't get replaced by "—"
            seatNumber: booking.seatNumber ?? booking.SeatNumber ?? "—"
          };
        });

        // Sort rides so the newest ones appear at the top
        combinedRides.sort((a, b) => b.timestamp - a.timestamp);
        setRides(combinedRides);
      } catch (err) {
        console.error(err);
        setError("Failed to load ride history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(rides.length / ROWS_PER_PAGE));
  const pageRides = rides.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div style={historyStyles.card}>
      <h2 style={historyStyles.cardTitle}>Past Travels</h2>

      {isLoading ? (
        <p style={{ padding: "20px 0", color: "#6b7280", fontSize: "14px" }}>Loading your rides...</p>
      ) : error ? (
        <p style={{ padding: "20px 0", color: "#ef4444", fontSize: "14px" }}>{error}</p>
      ) : rides.length === 0 ? (
        <p style={{ padding: "20px 0", color: "#6b7280", fontSize: "14px" }}>No past travels found.</p>
      ) : (
        <>
          {/* Table */}
          <table style={historyStyles.table}>
            <thead>
              <tr>
                {["Date", "Destination", "Shuttle ID", "Seat Number"].map((col) => (
                  <th key={col} style={historyStyles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRides.map((ride, i) => (
                <tr
                  key={ride.id}
                  style={{
                    ...historyStyles.tr,
                    borderTop: i === 0 ? "1px solid #e5e7eb" : undefined,
                  }}
                >
                  <td style={historyStyles.td}>{ride.date}</td>
                  <td style={historyStyles.td}>{ride.destination}</td>
                  <td style={historyStyles.td}>{ride.shuttleId}</td>
                  <td style={historyStyles.td}>{ride.seatNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={historyStyles.pagination}>
            <button
              style={historyStyles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                style={{
                  ...historyStyles.pageBtn,
                  ...(p === page ? historyStyles.pageBtnActive : {}),
                }}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              style={historyStyles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}
