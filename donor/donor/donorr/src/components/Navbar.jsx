import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Debugging: Log auth state to console to verify context updates
  useEffect(() => {
    console.log("Navbar Auth State:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsOpen(false);
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Donations", path: "/donations" },
    { name: "Requests", path: "/requests" },
    { name: "Drives", path: "/drives" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-slate-800 tracking-tight hover:text-rose-500 transition-colors">
              ShareBloom
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-slate-600 hover:text-indigo-500 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side (Auth Logic) */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              // Logged In State
              <div className="flex items-center space-x-6 animate-fade-in">
                <span className="text-slate-500 text-sm">
                  Hello, <span className="font-semibold text-slate-800">{user?.name || 'User'}</span>
                </span>
                
                <Link 
                  to="/dashboard" 
                  className="text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Dashboard
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Logged Out State
              <div className="flex items-center space-x-4 animate-fade-in">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-indigo-500 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-400 text-white px-6 py-2.5 rounded-xl hover:bg-rose-500 transition-all shadow-lg shadow-rose-100 font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block py-3 text-base font-medium text-slate-600 hover:text-indigo-500 border-b border-slate-50 last:border-0"
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 mt-2">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="text-sm text-slate-400 text-center">
                    Signed in as <span className="font-semibold text-slate-700">{user?.name || 'User'}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-xl font-medium"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center py-3 bg-rose-400 text-white rounded-xl font-medium hover:bg-rose-500 shadow-md shadow-rose-100"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;