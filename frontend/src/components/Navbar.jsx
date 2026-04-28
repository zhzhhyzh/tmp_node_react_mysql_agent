import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <Link to="/">Dashboard</Link>
      <Link to="/items">Items</Link>
      <Link to="/agent">Agent</Link>
      <div className="spacer" />
      {user && <span className="user">{user.full_name} ({user.login?.username})</span>}
      <button className="btn secondary" onClick={onLogout}>Logout</button>
    </div>
  );
}
