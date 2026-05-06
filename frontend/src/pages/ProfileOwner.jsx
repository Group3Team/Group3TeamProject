export default function ProfileOwner() {
  return (
    <div className="profile-page">
      <h2>Profile</h2>

      <div className="glass-panel">
        {/* Owner */}
        <div className="profile-section">
          <img src="" alt="" className="profile-avatar" />
          <div className="profile-section-body">
            <p className="profile-label">Name</p>
            <p className="profile-value"></p>
            <p className="profile-label">Address</p>
            <p className="profile-value"></p>
          </div>
        </div>

        {/* Dog */}
        <div className="profile-section">
          <img src="" alt="" className="profile-thumb" />
          <div className="profile-section-body">
            <p className="profile-label">Dog name</p>
            <p className="profile-value"></p>
          </div>
        </div>

        {/* Settings */}
        <div className="profile-section profile-settings">
          <div className="profile-section-body">
            <h3>Settings</h3>
            <p className="profile-label">Username</p>
            <p className="profile-value"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
