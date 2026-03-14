import { useState } from "react";
import { useSearch } from "./SearchContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #f0f2f8;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 64px;
    background: #ffffff;
    border-bottom: 1px solid #e4e8f0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    position: fixed;
    top: 0; left: 0; right: 0;
    width: 100%;
    z-index: 1000;
  }

  .navbar__logo {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #1a1f36;
    letter-spacing: -0.3px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .navbar__logo span { color: #4f7ef8; }

  .navbar__search {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    max-width: 480px;
    margin: 0 40px;
    position: relative;
  }

  .navbar__search-wrapper {
    position: relative;
    flex: 1;
  }

  .navbar__search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ba3b8;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .navbar__search-input {
    width: 100%;
    height: 40px;
    padding: 0 36px 0 42px;
    border: 1.5px solid #e4e8f0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a1f36;
    background: #f7f9fc;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .navbar__search-input::placeholder { color: #b0b8cc; }
  .navbar__search-input:focus {
    border-color: #4f7ef8;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(79,126,248,0.12);
  }
  .navbar__search-input--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
  }

  /* Clear (×) button inside input */
  .navbar__search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: #d1d5e0;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    transition: background 0.15s;
  }
  .navbar__search-clear:hover { background: #9ba3b8; }

  .navbar__search-btn {
    height: 40px;
    padding: 0 22px;
    background: #4f7ef8;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
    white-space: nowrap;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(79,126,248,0.28);
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .navbar__search-btn:hover {
    background: #3a69e8;
    box-shadow: 0 4px 14px rgba(79,126,248,0.38);
    transform: translateY(-1px);
  }
  .navbar__search-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(79,126,248,0.22);
  }
  .navbar__search-btn:disabled {
    background: #a0b4f8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Spinner inside button */
  .navbar__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: nb-spin 0.7s linear infinite;
  }
  @keyframes nb-spin { to { transform: rotate(360deg); } }

  /* Error tooltip */
  .navbar__search-error {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #b91c1c;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 8px;
    white-space: nowrap;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    pointer-events: none;
  }

  /* Active destination pill below input */
  .navbar__dest-pill {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #eff3ff;
    border: 1px solid #c0cefb;
    color: #1a1f36;
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: 8px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 440px;
    overflow: hidden;
    pointer-events: none;
  }
  .navbar__dest-pill-icon { color: #ef4444; flex-shrink: 0; }
  .navbar__dest-pill-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .navbar__actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .navbar__bell {
    position: relative;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px;
    background: #f7f9fc;
    border: 1.5px solid #e4e8f0;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s;
    color: #5a637a;
  }
  .navbar__bell:hover { background: #eef2ff; border-color: #c0cefb; color: #4f7ef8; }
  .navbar__bell-dot {
    position: absolute;
    top: 8px; right: 9px;
    width: 8px; height: 8px;
    background: #f04f4f;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  .navbar__profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 14px 5px 6px;
    border: 1.5px solid #e4e8f0;
    border-radius: 50px;
    background: #f7f9fc;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
  }
  .navbar__profile:hover {
    background: #eef2ff;
    border-color: #c0cefb;
    box-shadow: 0 2px 10px rgba(79,126,248,0.1);
  }

  .navbar__avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    background: #d0d8f0;
  }
  .navbar__avatar-fallback {
    width: 35px; height: 35px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f7ef8, #7b5ef8);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 11px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    flex-shrink: 0;
  }
  .navbar__name { font-size: 14px; font-weight: 600; color: #1a1f36; }
  .navbar__chevron {
    color: #9ba3b8;
    display: flex; align-items: center;
    transition: transform 0.2s;
  }
  .navbar__profile:hover .navbar__chevron { transform: translateY(1px); }
`;

function Avatar({ src, alt }) {
  const [errored, setErrored] = useState(false);
  if (errored) return <div className="navbar__avatar-fallback">Guest</div>;
  return <img className="navbar__avatar" src={src} alt={alt} onError={() => setErrored(true)} />;
}

export default function Navbar({ user, onProfileClick }) {
  const [query, setQuery] = useState("");
  const { destination, searching, searchError, search, clearDestination } = useSearch();

  const handleSearch = () => {
    if (query.trim()) search(query.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    clearDestination();
  };

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        {/* ── Logo ── */}
        <div className="navbar__logo">Uni<span>Ride</span></div>

        {/* ── Search ── */}
        <div className="navbar__search">
          <div className="navbar__search-wrapper">
            <span className="navbar__search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className={`navbar__search-input${searchError ? ' navbar__search-input--error' : ''}`}
              type="text"
              placeholder="Search your destination…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {(query || destination) && (
              <button className="navbar__search-clear" onClick={handleClear} title="Clear">✕</button>
            )}
          </div>

          <button
            className="navbar__search-btn"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching
              ? <><span className="navbar__spinner" /> Searching…</>
              : "Search"
            }
          </button>

          {/* Error tooltip */}
          {searchError && (
            <div className="navbar__search-error">⚠ {searchError} — try a more specific address</div>
          )}

          {/* Active destination pill */}
          {destination && !searchError && (
            <div className="navbar__dest-pill">
              <span className="navbar__dest-pill-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </span>
              <span className="navbar__dest-pill-text">Destination: {destination.displayName}</span>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="navbar__actions">
          <div className="navbar__bell">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="navbar__bell-dot"/>
          </div>

          <div className="navbar__profile" onClick={onProfileClick}>
            <Avatar src={user?.avatar || "src/prof.png"} alt={user?.name || "User"} />
            <span className="navbar__name">{user?.name || "John Doe"}</span>
            <span className="navbar__chevron">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}