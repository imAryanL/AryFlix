import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Function that runs when the search form is submitted
  const handleSearch = (event) => {
    // Prevent the default form submission behavior (page reload)
    event.preventDefault();
    
    // Check if search has content after removing whitespace
    const searchText = searchQuery.trim();
    
    // Only navigate if user typed something
    if (searchText) {
      // Navigate to search results page with the search text
      navigate(`/search/${searchText}`);
      
      // Clear the search input after submission
      setSearchQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <input
        type="text"
        placeholder={isMobile ? "Search..." : "Search movies and TV shows..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-white text-gray-900 px-4 py-2 rounded-full focus:outline-none focus:ring-2 placeholder-gray-500 text-sm placeholder:text-sm"
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
      >
        <img 
          src="/searchbarIcon.png" 
          alt="Search" 
          className="h-7 w-7" 
        />
      </button>
    </form>
  );
};

export default SearchBar;