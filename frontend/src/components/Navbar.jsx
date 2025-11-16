import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, BarChart3, PieChart, Search } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">BrandGPT</h1>
            </Link>
            
            {authUser && (
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className={`btn btn-sm btn-ghost gap-2 ${
                    location.pathname === "/" || location.pathname === "/dashboard" ? "btn-active" : ""
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/sentiment"
                  className={`btn btn-sm btn-ghost gap-2 ${
                    location.pathname === "/sentiment" ? "btn-active" : ""
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  Sentiment
                </Link>
                <Link
                  to="/search"
                  className={`btn btn-sm btn-ghost gap-2 ${
                    location.pathname === "/search" ? "btn-active" : ""
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Search
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
