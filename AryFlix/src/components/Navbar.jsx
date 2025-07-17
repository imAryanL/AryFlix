import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { authFunctions } from "../supabaseClient";

const Navbar = () => {
  const navigate = useNavigate();
  
  // State to track if user is logged in and their info
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if user is logged in when component loads
  useEffect(() => {
    checkUserStatus();
  }, []);

  // Function to check if user is currently logged in
  const checkUserStatus = async () => {
    try {
      const { user, error } = await authFunctions.getCurrentUser();
      
      if (!error && user) {
        setUser(user);
        console.log('✅ User is logged in:', user.user_metadata?.username || user.email);
      } else {
        setUser(null);
        console.log('❌ No user logged in');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const { error } = await authFunctions.signOut();
      
      if (!error) {
        setUser(null);
        setShowDropdown(false);
        navigate('/');
        console.log('✅ User logged out successfully');
      } else {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get username or fallback to email
  const getDisplayName = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    // Fallback to email (first part before @)
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <nav className="bg-black shadow-lg fixed top-0 left-0 right-0 z-50 w-full h-16">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 w-full h-full">
        <div className="flex justify-between items-center h-full w-full">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/popcorn.png" 
                className="h-9 w-9 " 
                alt="AryFlix Logo"
              />
              <span className="text-white text-3xl font-[1000] whitespace-nowrap mt-2">AryFlix</span>
            </Link>
          </div>

          {/* Search Bar - hidden on mobile, visible on larger screens */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xl mx-6">
            <SearchBar />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Watchlist - only show if user is logged in */}
            {user && (
              <Link 
                to="/watchlist" 
                className="text-white flex items-center px-2.5 py-2.5 rounded hover:bg-gray-700"
              >
                <img
                  src="/bookmark.png"
                  className="h-4 w-4 mr-1.5"
                  alt="Watchlist"
                />
                <span className="hidden sm:inline text-sm font-bold">Watchlist</span>
              </Link>
            )}

            {/* Ratings - only show if user is logged in */}
            {user && (
              <Link 
                to="/ratings" 
                className="text-white flex items-center px-2.5 py-2.5 rounded hover:bg-gray-700"
              >
                <img
                  src="/star.png"
                  className="h-4 w-4 mr-1.5"
                  alt="Ratings"
                />
                <span className="hidden sm:inline text-sm font-bold">Ratings</span>
              </Link>
            )}
            
            {/* Show different content based on login status */}
            {isLoading ? (
              // Loading state
              <div className="bg-gray-700 text-white font-bold text-[15px] px-5 py-2 rounded-full whitespace-nowrap">
                ...
              </div>
            ) : user ? (
              // User is logged in - show avatar with username and dropdown
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-[#E91E63] hover:bg-[#F06292] active:bg-[#C2185B] text-white font-bold px-4 py-2 rounded-full flex items-center gap-1 cursor-pointer"
                >
                  {/* Avatar image */}
                  <img 
                    src="/user_avatar.jpg" 
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                  />
                  
                  {/* Username - SMALLER font to match watchlist */}
                  <span className="text-sm">{getDisplayName()}</span>
                  
                  {/* Custom arrow images */}
                  <img 
                    src={showDropdown ? "/up_arrow.png" : "/down_arrow.png"}
                    alt={showDropdown ? "Close menu" : "Open menu"}
                    className="ml-2 w-3 h-3"
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#303035] rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 text-sm text-gray-300 border-b border-gray-700 flex items-center space-x-3">
                      <img 
                        src="/user_avatar.jpg" 
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs text-gray-400">Signed in as</div>
                        <div className="font-semibold text-white">{getDisplayName()}</div>
                      </div>
                    </div>
                    
                    <Link
                      to="/watchlist"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-bold"
                    >
                      <img
                        src="/bookmark.png"
                        className="h-4 w-4 mr-3"
                        alt="Watchlist"
                      />
                      My Watchlist
                    </Link>

                    {/* Add Ratings link to dropdown */}
                    <Link
                      to="/ratings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-bold"
                    >
                      <img
                        src="/star.png"
                        className="h-4 w-4 mr-3"
                        alt="Ratings"
                      />
                      My Ratings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer font-bold"
                    >
                      <img
                        src="/signout.png"
                        className="h-4 w-4 mr-3"
                        alt="Sign Out"
                      />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - show login button
              <Link 
                to="/login" 
                className="bg-[#E91E63] hover:bg-[#F06292] active:bg-[#C2185B] text-white font-bold text-[15px] px-5 py-2 rounded-full whitespace-nowrap transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;