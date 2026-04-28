import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <div className="card">
        <h3>Profile</h3>
        <div>Full name: <b>{user.full_name}</b></div>
        <div>Email: <b>{user.email}</b></div>
      </div>
      <div className="card">
        <h3>Login</h3>
        <div>Username: <b>{user.login?.username}</b></div>
        <div>Last login: <b>{user.login?.last_login_at || 'n/a'}</b></div>
      </div>
      <div className="card">
        <h3>Account</h3>
        <div>Status: <b>{user.account?.status}</b></div>
        <div>Role: <b>{user.account?.role}</b></div>
        <div>Plan: <b>{user.account?.plan}</b></div>
      </div>
    </div>
  );
}
