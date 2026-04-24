import { useState, useEffect } from "react";

const UserIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <circle cx="24" cy="18" r="10" fill="rgba(255,255,255,0.25)" />
    <ellipse cx="24" cy="38" rx="16" ry="10" fill="rgba(255,255,255,0.25)" />
  </svg>
);

export default function DriverList() {
  const [selected, setSelected] = useState(null);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversRes, shuttlesRes] = await Promise.all([
          fetch(process.env.REACT_APP_DRIVER_API),
          fetch(process.env.REACT_APP_SHUTTLE_API)
        ]);

        const driversData = await driversRes.json();
        const shuttlesData = await shuttlesRes.json();

        // Fetch verification logs (Assuming this endpoint returns the full scan history)
        let logsData = [];
        if (process.env.REACT_APP_LOG_FINGERPRINT_API) {
          try {
            const logsRes = await fetch(process.env.REACT_APP_LOG_FINGERPRINT_API);
            if (logsRes.ok) {
              const parsedLogs = await logsRes.json();
              // DynamoDB Scans return { Items: [...] } so we defensively grab the array
              logsData = Array.isArray(parsedLogs) ? parsedLogs : (parsedLogs.Items || parsedLogs.logs || []);
            }
          } catch (e) {
            console.warn("Failed to fetch verification logs:", e);
          }
        }

        const staticDistances = ["3.2 km", "1.5 km", "5.8 km"];

        const formattedDrivers = await Promise.all(driversData.map(async (driver, index) => {
          const assignedShuttle = shuttlesData.find(s => s.driverId === driver.driverId) || {};

          let isVerified = false;
          if (process.env.REACT_APP_GetFingerprint_API) {
            try {
              const fpRes = await fetch(`${process.env.REACT_APP_GetFingerprint_API}?driverId=${driver.driverId}`);
              if (fpRes.ok) {
                const fpData = await fpRes.json();
                // If fingerprint templateData matches ANY logged scan's fingerprintId, mark as Verified
                if (fpData?.templateData && Array.isArray(logsData)) {
                  isVerified = logsData.some(log => String(log.fingerprintId) === String(fpData.templateData));
                }
              }
            } catch (e) {
              console.warn(`Failed to fetch fingerprint for ${driver.driverId}`, e);
            }
          }

          let shuttleStatus = "Stopped";
          if (process.env.REACT_APP_GetShuttleStatus_API && assignedShuttle.shuttleId) {
            try {
              const statusRes = await fetch(`${process.env.REACT_APP_GetShuttleStatus_API}?shuttleId=${assignedShuttle.shuttleId}`);
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (statusData?.status) {
                  shuttleStatus = statusData.status;
                }
              }
            } catch (e) {
              console.warn(`Failed to fetch status for ${assignedShuttle.shuttleId}`, e);
            }
          }

          return {
            id: driver.driverId,
            name: driver.driverName || "Unknown Driver",
            licensePlate: assignedShuttle.vehicleNumber || "Unassigned",
            busCapacity: assignedShuttle.capacity || "--",
            arrivalTime: assignedShuttle.arrivalTime || "07:00 AM",
            departureTime: assignedShuttle.departureTime || "05:00 PM",
            distance: staticDistances[index % staticDistances.length],
            status: shuttleStatus,
            verificationStatus: isVerified ? "Verified" : "Unverified",
          };
        }));

        setDrivers(formattedDrivers);
      } catch (error) {
        console.error("Error fetching data from AWS:", error);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { label: "Distance",      key: "distance" },
    { label: "Capacity",      key: "busCapacity",       suffix: " seats" },
    { label: "Arrival",       key: "arrivalTime" },
    { label: "Departure",     key: "departureTime" },
    { label: "License Plate", key: "licensePlate" },
    { label: "Status",        key: "status" },
    { label: "Verification",  key: "verificationStatus" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .app {
          position: absolute;
          right: 10px;
          top: 10px;
          bottom: 10px;
          z-index: 1000;
          width: 100%;
          max-width: 480px;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          background: transparent;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          pointer-events: none;
        }

        .panel {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          background: #000000;
          border-radius: 14px;
          overflow-y: auto;
          max-height: 100%;
          pointer-events: auto;
        }

        .panel::-webkit-scrollbar { width: 4px; }
        .panel::-webkit-scrollbar-track { background: transparent; }
        .panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }

        .card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 18px;
          cursor: pointer;
          transition: background 0.18s ease;
          background: #000000;
        }

        .card:hover {
          background: #0d0d0d;
        }

        .card.selected {
          background: #111111;
        }

        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.18);
          margin: 0 18px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-top: 2px;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .driver-name {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px 8px;
        }

        .meta-item {}

        .meta-label {
          color: rgba(255,255,255,0.4);
          font-size: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 3px;
        }

        .meta-val {
          color: #ffffff;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .badge-unverified {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #f87171;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-unverified::before {
          content: '';
          display: block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f87171;
          flex-shrink: 0;
        }

        .badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #60a5fa;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-verified::before {
          content: '';
          display: block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #60a5fa;
          flex-shrink: 0;
        }

        .badge-stopped {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #94a3b8;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-stopped::before {
          content: '';
          display: block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #94a3b8;
          flex-shrink: 0;
        }

        .badge-onroute {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #4ade80;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-onroute::before {
          content: '';
          display: block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }
      `}</style>

      <div className="app">
        <div className="panel">
          {drivers.map((d, idx) => {
            const isSelected = selected === d.id;
            return (
              <div key={d.id}>
                <div
                  className={`card${isSelected ? " selected" : ""}`}
                  onClick={() => setSelected(isSelected ? null : d.id)}
                >
                  <div className="avatar">
                    <UserIcon />
                  </div>

                  <div className="info">
                    <div className="driver-name">{d.name}</div>

                    <div className="meta-grid">
                      {categories.map((cat) => {
                        const rawVal = d[cat.key];
                        const val = rawVal + (cat.suffix || "");

                        let displayVal;
                        if (cat.key === "verificationStatus") {
                          const badgeClass = rawVal === "Verified" ? "badge-verified" : "badge-unverified";
                          displayVal = (
                            <div className={badgeClass}>{rawVal}</div>
                          );
                        } else if (cat.key === "status") {
                          const badgeClass = (rawVal === "Stopped" || rawVal === "Offline") ? "badge-stopped" : "badge-onroute";
                          displayVal = (
                            <div className={badgeClass}>{rawVal}</div>
                          );
                        } else {
                          displayVal = (
                            <div className="meta-val">{val}</div>
                          );
                        }

                        return (
                          <div className="meta-item" key={cat.key}>
                            <div className="meta-label">{cat.label}</div>
                            {displayVal}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {idx < drivers.length - 1 && (
                  <div className="divider" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}