import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

const SearchBar = ({ isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const timeoutRef = useRef(null); // Stores the timeout ID for debouncing


  // Fetch search suggestions from API
  const fetchSuggestions = async (query) => {
    // Don't search if query is too short
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/search/${encodeURIComponent(query)}`);
      const apiResponse = await response.json();
      const data = apiResponse.data || [];
      
      setSuggestions(data.slice(0, 8)); // Show top 8 suggestions
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with simple debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Cancel previous search if user is still typing
    clearTimeout(timeoutRef.current);
    
    // Wait 300ms to see if user types more
    // If they do, this timer gets cancelled and a new one starts
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value); // Only search after user stops typing for 300ms
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    const route = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(route);
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Handle "See all results" click
  const handleSeeAllResults = () => {
    const searchText = searchQuery.trim();
    if (searchText) {
      navigate(`/search/${searchText}`);
      setSearchQuery("");
      setShowDropdown(false);
    }
  };

  // Function that runs when the search form is submitted
  const handleSearch = (event) => {
    event.preventDefault();
    const searchText = searchQuery.trim();
    if (searchText) {
      // IMMEDIATELY clear dropdown and suggestions
      setShowDropdown(false);
      setSuggestions([]);
      
      // Clear any pending timeouts to prevent dropdown from reopening
      clearTimeout(timeoutRef.current);
      
      // Navigate to search results
      navigate(`/search/${searchText}`);
      setSearchQuery("");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="w-full relative">
      <form onSubmit={handleSearch} className="w-full relative">
        <input
          type="text"
          placeholder=""
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setShowDropdown(false);
              setSuggestions([]);
              clearTimeout(timeoutRef.current);
            }
          }}
          className="w-full bg-[#303035] text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F06292] placeholder-gray-400 text-sm placeholder:text-sm md:placeholder:text-sm"
        />
        <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <img src="/searchbar_icon.png" alt="Search" className="h-6 w-6 cursor-pointer"/>
        </button>
      </form>

      {/* Search Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-[#303035] border border-gray-600 rounded-lg shadow-lg z-50 mt-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  onClick={() => handleSuggestionClick(item)}
                  className="flex items-center p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                >
                  {/* Poster thumbnail */}
                  <img
                    src={item.poster_path || '/movie_placeholder.png'}
                    alt={item.title || item.name}
                    className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0"
                    onError={(e) => { e.target.src = '/movie_placeholder.png'; }}
                  />
                  
                  {/* Movie/TV info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate mb-2">
                      {item.title || item.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="text-xs font-medium bg-gray-600 px-2 py-1 rounded">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                      </span>
                      {item.vote_average && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-yellow-400 flex items-center">
                            <img 
                              src="/star.png" 
                              alt="Rating" 
                              className="w-3 h-3 mr-1" 
                            />
                            {item.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* See all results button */}
              <div
                onClick={handleSeeAllResults}
                className="p-3 text-center text-[#F06292] hover:bg-gray-600 cursor-pointer font-medium border-t border-gray-600"
              >
                See all results for "{searchQuery}"
              </div>
            </>
          ) : searchQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-300">
              No results found for "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;