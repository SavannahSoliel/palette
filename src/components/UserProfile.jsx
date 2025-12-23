import './UserProfile.css';

function UserProfile({ user, onSignOut }) {
  return (
    <div className="user-profile">
      {user.user_metadata?.avatar_url ? (
        <img 
          src={user.user_metadata.avatar_url} 
          alt={user.email}
          className="user-avatar"
        />
      ) : (
        <div className="user-avatar-placeholder">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
      <div className="user-info">
        <span className="user-name">
          {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
        </span>
        <span className="user-email">{user.email}</span>
      </div>
      <button 
        className="sign-out-btn"
        onClick={onSignOut}
      >
        Sign Out
      </button>
    </div>
  );
}

export default UserProfile;