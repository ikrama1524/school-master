
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">School Management System</h1>
          <div className="flex items-center gap-4">
            <span>{user?.fullName} ({user?.role})</span>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p>Welcome to the school management system!</p>
      </div>
    </div>
  );
}
