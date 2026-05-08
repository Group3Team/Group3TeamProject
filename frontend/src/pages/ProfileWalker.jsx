export default function ProfileWalker() {
  return (
    <div className="profile-page">
      <h2>Profile</h2>

      <div className="glass-panel">
        {/* Walker */}
        <div className="profile-section">
          <img src="" alt="" className="profile-avatar" />
          <div className="profile-section-body">
            <p className="profile-label">Name</p>
            <p className="profile-value">—</p>
            <p className="profile-label">Service Area</p>
            <p className="profile-value">—</p>
          </div>
        </div>

        {/* Settings */}
        <div className="profile-section profile-settings">
          <div className="profile-section-body">
            <h3>Settings</h3>
            <p className="profile-label">Username</p>
            <p className="profile-value">—</p>
          </div>
        </div>
      </div>
    </div>
  );
}
