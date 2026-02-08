import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, User, LogOut, LogIn, Utensils } from "lucide-react";
import { authService } from "@/services/authService";

export const Navbar = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {/* Replace ChefHat icon with favicon */}
              <img 
                src="/favicon.ico" 
                alt="Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900">TasteBud AI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant={isActive('/dashboard') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                
                <Link to="/generator">
                  <Button 
                    variant={isActive('/generator') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Generator
                  </Button>
                </Link>
                
                <Link to="/meal-planner">
                  <Button 
                    variant={isActive('/meal-planner') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Utensils className="h-4 w-4" />
                    Meal Planner
                  </Button>
                </Link>
                
                <Link to="/profile">
                  <Button 
                    variant={isActive('/profile') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button 
                    variant={isActive('/') ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button 
                    variant={isActive('/login') ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
