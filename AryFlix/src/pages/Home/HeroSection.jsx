// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hero Section Component
const HeroSection = () => {
  // State to store the list of trending content (movies + TV shows)
  const [heroItems, setHeroItems] = useState([]);
  // State to track which item is currently being displayed (index)
  const [currentIndex, setCurrentIndex] = useState(0);
  // State to track if data is still loading
  const [loading, setLoading] = useState(true);
  // State to handle any errors that occur during data fetching
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Function to fetch trending content from our backend API
  const fetchHeroContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch trending movies and TV shows simultaneously
      const [moviesResponse, tvResponse] = await Promise.all([
        fetch('http://localhost:5000/api/movies/trending'),
        fetch('http://localhost:5000/api/tv/trending')
      ]);

      if (!moviesResponse.ok || !tvResponse.ok) {
        throw new Error('API failed');
      }

      const moviesData = await moviesResponse.json();
      const tvData = await tvResponse.json();

      if (!moviesData.success || !tvData.success) {
        throw new Error('API returned unsuccessful response');
      }

      // Combine movies and TV shows, take first 5 of each
      const combinedContent = [
        ...moviesData.data.slice(0, 5),
        ...tvData.data.slice(0, 5)
      ];

      setHeroItems(combinedContent);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hero content:', err);
      setError(`Failed to load content: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? heroItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleMoreInfo = () => {
    const currentItem = heroItems[currentIndex];
    // Determine media type - TV shows have 'name' property, movies have 'title'
    const mediaType = currentItem.name ? 'tv' : 'movie';
    const route = mediaType === 'tv' ? `/tv/${currentItem.id}` : `/movie/${currentItem.id}`;
    navigate(route);
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchHeroContent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (heroItems.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">No content available</div>
      </div>
    );
  }

  // Get the current item to display
  const currentItem = heroItems[currentIndex];
  
  // Build the full image URL for the backdrop
  const backdropUrl = currentItem.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : null;

  // Get release year
  const releaseYear = currentItem.release_date 
    ? new Date(currentItem.release_date).getFullYear()
    : currentItem.first_air_date 
    ? new Date(currentItem.first_air_date).getFullYear()
    : '';

  return (
    // Use App.jsx container - no extra containers
    <div className="mb-3">
      <div className="relative h-[70vh] overflow-hidden bg-gray-900 rounded-lg">
        {/* Background Image */}
        {backdropUrl && (
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

        {/* Content Container */}
        <div className="relative z-20 h-full flex items-center">
          <div className="px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl ml-13">
              {/* Movie Title */}
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                {(currentItem.title || currentItem.name)?.toUpperCase()}
              </h1>
              
              {/* Release Year */}
              {releaseYear && (
                <div className="text-base text-gray-300 mb-3 font-light">
                  {releaseYear}
                </div>
              )}
              
              {/* Overview/Description */}
              <p className="text-sm md:text-base text-gray-200 mb-4 leading-relaxed line-clamp-3">
                {currentItem.overview}
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-5">
                <img 
                  src="/star.png" 
                  alt="Rating" 
                  className="w-5 h-5 mr-2" 
                />
                <span className="text-yellow-400 text-lg font-bold">
                  {currentItem.vote_average?.toFixed(1)}
                </span>
              </div>

              {/* More Info Button */}
              <button 
                onClick={handleMoreInfo}
                className="bg-[#E91E63] hover:bg-[#F06292] active:bg-[#C2185B] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer transform active:scale-95"
              >
                More Info
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {/* Left Arrow - SMALLER ON MOBILE */}
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-[#C2185B] active:bg-[#C2185B] text-white p-3 rounded-full transition-all active:scale-90 duration-200 z-30 cursor-pointer border-1 border-white"
          >
            <img 
              src="/left-arrow.png" 
              alt="Scroll left"
              className="w-3 h-3 sm:w-6 sm:h-6"
            />
          </button>

          {/* Right Arrow - SMALLER ON MOBILE */}
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-[#C2185B] active:bg-[#C2185B] text-white p-3 rounded-full transition-all active:scale-90 duration-200 z-30 cursor-pointer border-1 border-white"
          >
            <img
              src="/right-arrow.png"
              alt="Scroll right"
              className="w-3 h-3 sm:w-6 sm:h-6"
            />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {heroItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;