import './UserProfile.css';

function UserProfile({ user, onSignOut }) {
  return (
    <button className="user-avatar-btn" onClick={onSignOut} aria-label="Sign out">
      <div className="user-avatar">
        {user.email[0].toUpperCase()}
      </div>
    </button>
  );
}

export default UserProfile;
