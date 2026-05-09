import { useAuth } from '../context/AuthContext';


export default function ProfileOwner() {
    const { user } = useAuth();

    console.log(user)
    

  return (
    <div className="profile-page">
      <h2>Profile</h2>

      <div className="glass-panel">
        {/* Owner */}
        <div className="profile-section">
          <img src="" alt="" className="profile-avatar" />
          <div className="profile-section-body">
            <p className="profile-label">{user.username}</p>
            <p className="profile-value"></p>
            <p className="profile-label">{user.email}</p>
            <p className="profile-value"></p>
          </div>
        </div>

        {/* Dog */}
        {user?.role === 'OWNER' ? (
        <div className="profile-section">
          <img src="" alt="" className="profile-thumb" />
          <div className="profile-section-body">
            <p className="profile-label">Dog name</p>
            <p className="profile-value"></p>
          </div>
        </div>
        ) : (<></>)}

        {/* Settings */}
        <div className="profile-section profile-settings">
          <div className="profile-section-body">
            <h3>Settings</h3>
            <p className="profile-label">Username: {user.username} </p>
            <p className="profile-value"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
