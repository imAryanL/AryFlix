// MovieTVCard.jsx - Reusable card component for movies and TV shows
// Can display regular movie cards or theatre movie cards with "Get Tickets" button
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';

function MovieTVCard({ 
  id,                    // Movie/TV ID from TMDB - required for navigation
  title,                 // Movie/TV title to display - required
  year,                  // Release year - required
  rating,                // TMDB rating (vote_average) - required
  posterUrl,             // Full poster image URL from TMDB - required
  showGetTickets = false, // New prop to control whether to show "Get Tickets" button
  mediaType = 'movie',    // NEW: Default to 'movie' for backwards compatibility
  showBookmark = true    
}) {
  const navigate = useNavigate();
  // Use watchlist context instead of individual API calls
  const { user, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Check if this item is in watchlist (instant, no API call needed!)
  const inWatchlist = isInWatchlist(id);

  // Function to handle card click - navigates to correct detail page
  const handleCardClick = () => {
    // Navigate to correct route based on content type with poster data
    // Treat anime as TV shows since they are TV series in TMDB
    const route = (mediaType === 'tv' || mediaType === 'anime') ? `/tv/${id}` : `/movie/${id}`;
    navigate(route, { 
      state: { 
        posterUrl: posterUrl,
        fromHomePage: true 
      } 
    });
  };

  // Function to handle "Get Tickets" button click
  // Opens Fandango search for the movie in a new tab
  const handleGetTickets = (e) => {
    // Prevent the card click event from firing when clicking the tickets button
    e.stopPropagation();
    
    // Create Fandango search URL with the movie title
    // encodeURIComponent ensures special characters in movie titles are properly encoded for URLs
    const fandangoUrl = `https://www.fandango.com/search/?q=${encodeURIComponent(title)}`;
    
    // Open Fandango in a new tab so user doesn't leave AryFlix
    window.open(fandangoUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    // Stop the card click event from happening when clicking bookmark
    e.stopPropagation();
    
    // If user is not logged in, redirect them to login page
    if (!user) {
      navigate('/login');
      return;
    }

    // Show loading spinner on bookmark button
    setBookmarkLoading(true);
    
    try {
      // Check if movie is already in watchlist
      if (inWatchlist) {
        // Remove from watchlist (pink bookmark → gone)
        await removeFromWatchlist(id);
      } else {
        // Add to watchlist (white bookmark → pink bookmark)
        await addToWatchlist(id, mediaType);
      }
    } catch (error) {
      // If something goes wrong, log the error
      console.error('Error toggling watchlist:', error);
    } finally {
      // Always hide loading spinner when done (success or error)
      setBookmarkLoading(false);
    }
  };

  return (
    // Card container - COMPACT like IMDb cards (allows exactly 6 cards to show)
    <div 
      className={`
        w-36 sm:w-40 md:w-44 lg:w-48  
        ${showGetTickets ? 'h-[450px] sm:h-[430px] md:h-[440px] lg:h-[450px]' : 'h-[380px] sm:h-[390px] md:h-[400px] lg:h-[410px]'}
        bg-[#1c1c1f]
        rounded-lg 
        overflow-hidden 
        shadow-md 
        cursor-pointer 
        transition-all 
        hover:shadow-lg 
        flex-shrink-0 
        flex 
        flex-col
        group
      `}
      onClick={handleCardClick}
    >
      {/* Poster Image - TALLER on mobile to fill more card space */}
      <div className="relative h-64 sm:h-52 md:h-56 lg:h-70 flex-shrink-0">
        <img 
          src={posterUrl || '/movie_placeholder.png'} 
          alt={`${title} poster`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = '/movie_placeholder.png'; }}
        />
        
        {/* Dark overlay on hover for visual feedback */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-200"></div>
      </div>

      {/* Movie Information Section - COMPACT like IMDb */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Movie Title - IMPROVED FONT SIZE for better readability */}
          <h3 
            className="font-bold text-white text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem]" 
            title={title}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </h3>
          
          {/* Year and Rating Row */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-xs font-bold">{year}</span>
            
            {/* Rating display with star icon */}
            <div className="flex items-center">
              <img
                src="/star.png"
                alt="Rating Star"
                className="w-3 h-3 mr-1"
              />
              <span className="text-xs font-medium text-yellow-400">{rating}</span>
            </div>
          </div>
        </div>

        {/* Bookmark section - BOTTOM RIGHT, below rating */}
        <div className="flex justify-end mb-3 mt-1">
          {user && showBookmark && (
            <button
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              className="p-1 hover:bg-gray-700 rounded transition-all duration-200"
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {bookmarkLoading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src={inWatchlist ? "/bookmark_pink.png" : "/bookmark_white.png"}
                  alt="Bookmark"
                  className="w-4 h-4 transition-all duration-200 hover:scale-110 cursor-pointer"
                />
              )}
            </button>
          )}
        </div>

        {/* Get Tickets Button - IMPROVED FONT SIZE for better accessibility */}
        {showGetTickets && (
          <button
            onClick={handleGetTickets}
            className="w-full bg-[#E91E63] hover:bg-[#F06292] active:bg-[#C2185B] text-white py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 transform active:scale-95 mt-auto cursor-pointer"
          >
            🎫 Get Tickets
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieTVCard;