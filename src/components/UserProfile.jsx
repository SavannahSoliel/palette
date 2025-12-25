import './UserProfile.css';

function UserProfile({ user, onSignOut }) {
  return (
    <div className="user-pill">
  <div className="user-avatar">
    {user.email[0].toUpperCase()}
  </div>

  <div className="user-meta">
    <span className="user-name">
      {user.user_metadata?.full_name || 'you'}
    </span>
    <button className="sign-out" onClick={onSignOut}>
      sign out
    </button>
  </div>
</div>

  );
}

export default UserProfile;