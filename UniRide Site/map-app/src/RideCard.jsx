import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Figtree', sans-serif;
    background: #f2f3f7;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .card {
    background: #ffffff;
    border-radius: 20px;
    width: 100%;
    max-width: 360px;
    padding: 24px 20px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .card__arrived-label {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .card__timer {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.5px;
  }

  .card__driver {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 18px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 20px;
  }

  .card__driver-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .card__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    background: #ddd;
    flex-shrink: 0;
  }

  .card__avatar-fallback {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .card__driver-name {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 2px;
  }

  .card__driver-meta {
    font-size: 12.5px;
    color: #888;
    font-weight: 500;
  }

  .card__driver-actions {
    display: flex;
    gap: 10px;
  }

  .card__icon-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid #e8e8e8;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.16s, border-color 0.16s, transform 0.12s;
    color: #444;
  }

  .card__icon-btn:hover {
    background: #f0f0f0;
    border-color: #d0d0d0;
    transform: scale(1.06);
  }

  .card__route {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
  }

  .card__stop {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .card__stop-icon-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3px;
    flex-shrink: 0;
  }

  .card__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .card__dot--pickup {
    background: #4f7ef8;
    box-shadow: 0 0 0 3px rgba(79,126,248,0.18);
  }

  .card__dot--dest {
    background: #1a1a1a;
    box-shadow: 0 0 0 3px rgba(0,0,0,0.10);
  }

  .card__connector {
    width: 1.5px;
    height: 32px;
    background: linear-gradient(to bottom, #4f7ef8, #1a1a1a);
    margin: 4px 0;
    opacity: 0.2;
  }

  .card__stop-text {
    padding-bottom: 18px;
  }

  .card__stop:last-child .card__stop-text {
    padding-bottom: 0;
  }

  .card__stop-address {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 2px;
    line-height: 1.3;
  }

  .card__stop-label {
    font-size: 12px;
    color: #aaa;
    font-weight: 500;
  }

  .card__payment {
    background: #1a1a1a;
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .card__card-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #2e2e2e;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card__card-number {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .card__card-type {
    font-size: 12px;
    color: #888;
    font-weight: 500;
  }

  .card__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card__total-label {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .card__total-amount {
    font-size: 18px;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.3px;
  }
`;

function Avatar({ src, alt, fallback }) {
  const [errored, setErrored] = useState(false);
  if (errored) return <div className="card__avatar-fallback">{fallback}</div>;
  return <img className="card__avatar" src={src} alt={alt} onError={() => setErrored(true)} />;
}

function useTimer(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function RideCard() {
  const timer = useTimer(320);

  return (
    <>
      <style>{styles}</style>
      <div className="card">

        <div className="card__header">
          <span className="card__arrived-label">Arrived in</span>
          <span className="card__timer">{timer}</span>
        </div>

        <div className="card__driver">
          <div className="card__driver-info">
            <Avatar src="src/prof.png" alt="Jacob Jones" fallback="JJ" />
            <div>
              <div className="card__driver-name">Jacob Jones</div>
              <div className="card__driver-meta">Omnitrans · SPX-832B</div>
            </div>
          </div>
          <div className="card__driver-actions">
            <button className="card__icon-btn" title="Call">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
            <button className="card__icon-btn" title="Message">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="card__route">
          <div className="card__stop">
            <div className="card__stop-icon-col">
              <span className="card__dot card__dot--pickup" />
              <div className="card__connector" />
            </div>
            <div className="card__stop-text">
              <div className="card__stop-address">456 Elm Street, Springfield</div>
              <div className="card__stop-label">Pickup point</div>
            </div>
          </div>
          <div className="card__stop">
            <div className="card__stop-icon-col">
              <span className="card__dot card__dot--dest" />
            </div>
            <div className="card__stop-text">
              <div className="card__stop-address">739 Main Street, Springfield</div>
              <div className="card__stop-label">Destination</div>
            </div>
          </div>
        </div>

        <div className="card__payment">
          <div className="card__card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <div className="card__card-number">**** 7493</div>
            <div className="card__card-type">Credit card</div>
          </div>
        </div>

        <div className="card__total">
          <span className="card__total-label">Total orders</span>
          <span className="card__total-amount">$5.75</span>
        </div>

      </div>
    </>
  );
}
