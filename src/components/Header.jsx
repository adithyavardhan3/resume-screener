export default function Header({ activeTab, onTabChange }) {
  return (
    <header>
      <div className="wordmark">
        <span className="dot"></span>RESUMESCORE
      </div>
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "seeker" ? "active" : ""}`}
          onClick={() => onTabChange("seeker")}
        >
          Seeker
        </button>
        <button
          className={`tab-btn ${activeTab === "recruiter" ? "active" : ""}`}
          onClick={() => onTabChange("recruiter")}
        >
          Recruiter
        </button>
      </div>
    </header>
  );
}
