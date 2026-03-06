import { Link, useLocation, useNavigate } from 'react-router';
import { Activity, LayoutDashboard, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">CareCompass AI</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 transition-colors px-4 py-2 ${
                    pathname === '/dashboard' ? 'text-[#2563EB] font-medium' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-gray-600 px-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#2563EB] text-white px-6 py-2 rounded-xl hover:bg-[#1d4ed8] transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
