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
        // Fetch both tables at the exact same time
        const [driversRes, shuttlesRes] = await Promise.all([
          fetch(process.env.REACT_APP_DRIVER_API),
          fetch(process.env.REACT_APP_SHUTTLE_API)
        ]);

        const driversData = await driversRes.json();
        const shuttlesData = await shuttlesRes.json();

        const staticDistances = ["3.2 km", "1.5 km", "5.8 km"];

        // Combine the data by matching the driverId
        const formattedDrivers = driversData.map((driver, index) => {
          // Find the shuttle that belongs to this specific driver
          const assignedShuttle = shuttlesData.find(s => s.driverId === driver.driverId) || {};

          return {
            id: driver.driverId,
            name: driver.driverName || "Unknown Driver",
            
            // Pulling these directly from the ShuttleDetails table now!
            licensePlate: assignedShuttle.vehicleNumber || "Unassigned",
            busCapacity: assignedShuttle.capacity || "--",
            arrivalTime: assignedShuttle.arrivalTime || "07:00 AM",
            departureTime: assignedShuttle.departureTime || "05:00 PM",
            
            // Static and fallback values
            distance: staticDistances[index % staticDistances.length],
            status: "Verified",
          };
        });

        setDrivers(formattedDrivers);
      } catch (error) {
        console.error("Error fetching data from AWS:", error);
      }
    };

    fetchData();
  }, []);

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
          gap: 10px;
          background: #1a2830;
          border-radius: 20px;
          padding: 14px;
          max-height: 100%;
          overflow-y: auto;
          pointer-events: auto;
        }

        /* Custom dark scrollbar for the panel */
        .panel::-webkit-scrollbar {
          width: 6px;
        }
        .panel::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .card {
          position: relative;
          background: #263842;
          border-radius: 14px;
          padding: 18px 18px 18px 16px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          overflow: hidden;
          border: 1.5px solid transparent;
        }

        .card:hover {
          background: #2e4452;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.07);
        }

        .card.selected {
          background: #2e4a5c;
          border-color: rgba(96, 190, 220, 0.35);
          box-shadow: 0 0 0 3px rgba(96, 190, 220, 0.08), 0 8px 24px rgba(0,0,0,0.3);
        }

        .card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(96,190,220,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .avatar {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
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
          gap: 5px;
        }

        .name {
          font-size: 18px;
          font-weight: 700;
          color: #e8f4f8;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 12px;
          margin-top: 4px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: rgba(200, 225, 235, 0.7);
          font-family: 'DM Mono', monospace;
          font-weight: 400;
        }

        .meta-label {
          color: rgba(200, 225, 235, 0.4);
          font-size: 11px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .meta-val {
          color: rgba(220, 240, 248, 0.88);
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4ade80; 
          font-weight: 600;
          background: rgba(74, 222, 128, 0.1);
          padding: 2px 8px;
          border-radius: 6px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background-color: #4ade80;
          border-radius: 50%;
        }

      `}</style>

      <div className="app">
        <div className="panel">
          {drivers.map((d) => {
            const isSelected = selected === d.id;
            return (
              <div
                key={d.id}
                className={`card${isSelected ? " selected" : ""}`}
                onClick={() => setSelected(isSelected ? null : d.id)}
              >
                <div className="card-glow" />

                <div className="avatar">
                  <UserIcon />
                </div>

                <div className="info">
                  <div className="name">{d.name}</div>

                  <div className="meta-grid">
                    <div>
                      <div className="meta-label">Distance</div>
                      <div className="meta-val" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{d.distance}</div>
                    </div>
                    <div>
                      <div className="meta-label">Capacity</div>
                      <div className="meta-val" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{d.busCapacity} seats</div>
                    </div>
                    
                    <div>
                      <div className="meta-label">Arrival</div>
                      <div className="meta-val" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{d.arrivalTime}</div>
                    </div>
                    <div>
                      <div className="meta-label">Departure</div>
                      <div className="meta-val" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{d.departureTime}</div>
                    </div>

                    <div>
                      <div className="meta-label">License Plate</div>
                      <div className="meta-val" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{d.licensePlate}</div>
                    </div>
                    <div>
                      <div className="meta-label">Status</div>
                      <div className="meta-val status-badge" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                        <span className="status-dot"></span>
                        {d.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}