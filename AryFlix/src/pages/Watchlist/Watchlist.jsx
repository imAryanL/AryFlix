import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
// Use watchlist context instead of making API calls
import { useWatchlist } from '../../contexts/WatchlistContext';

function Watchlist() {
  const navigate = useNavigate();
  const [detailedItems, setDetailedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true); // Add this new state
  
  // Get watchlist data from context
  const { watchlistItems, user, removeFromWatchlist } = useWatchlist();

  // Simple delay to prevent flash on page refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, []);

  // Fetch detailed movie/TV info for each watchlist item
  useEffect(() => {
    const fetchDetailedItems = async () => {
      // Skip if still in initial load phase
      if (initialLoad) return;
      
      if (!user || watchlistItems.length === 0) {
        setDetailedItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get detailed information for each watchlist item
        const detailedItems = await Promise.all(
          watchlistItems.map(async (item) => {
            try {
              // Use the enhanced endpoints that include proper runtime calculation
              const endpoint = item.media_type === 'tv' || item.media_type === 'anime' 
                ? `http://localhost:5000/api/tv/${item.media_id}/trailer`
                : `http://localhost:5000/api/movies/${item.media_id}/trailer`;
              
              const detailResponse = await fetch(endpoint);
              const detailData = await detailResponse.json();
              
              if (detailData.success) {
                return {
                  ...item,
                  details: detailData.data
                };
              }
              return null;
            } catch (error) {
              console.error(`Error fetching details for ${item.media_type} ${item.media_id}:`, error);
              return null;
            }
          })
        );

        // Filter out failed requests
        const validItems = detailedItems.filter(item => item !== null);
        setDetailedItems(validItems);
        
      } catch (err) {
        console.error('Error fetching detailed items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedItems();
  }, [watchlistItems, user, initialLoad]); // Add initialLoad to dependencies

  // Handle remove from watchlist
  const handleRemove = async (mediaId) => {
    await removeFromWatchlist(mediaId);
    // No need to manually update state - context will handle it!
  };

  // Navigate to detail page
  const goToDetailPage = (item) => {
    const route = (item.media_type === 'tv' || item.media_type === 'anime') 
      ? `/tv/${item.media_id}` 
      : `/movie/${item.media_id}`;
    navigate(route);
  };

  // Format year display for TV shows
  const formatYearDisplay = (item) => {
    if (item.media_type === 'movie') {
      return item.details?.release_date ? new Date(item.details.release_date).getFullYear() : 'N/A';
    } else {
      // TV Show or Anime
      const firstAirDate = item.details?.first_air_date;
      const lastAirDate = item.details?.last_air_date;
      const status = item.details?.status;
      
      if (!firstAirDate) return 'N/A';
      
      const startYear = new Date(firstAirDate).getFullYear();
      
      if (status === 'Ended' && lastAirDate) {
        const endYear = new Date(lastAirDate).getFullYear();
        return startYear === endYear ? startYear : `${startYear}-${endYear}`;
      } else {
        return `${startYear}-Ongoing`;
      }
    }
  };

  // Format duration - EXACT same logic as HeaderSection
  const formatDuration = (item) => {
    if (!item.details) return '';

    if (item.details.runtime) { // Movies
        const hours = Math.floor(item.details.runtime / 60);
        const minutes = item.details.runtime % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } else if (Array.isArray(item.details.episode_run_time) && item.details.episode_run_time.length > 0) { // TV shows
        const avgRuntime = item.details.episode_run_time[0];
        if (avgRuntime > 0) {
            return `${avgRuntime}m / ep`;
        }
    }
    
    return 'N/A';
  };

  // Get content rating - Enhanced version with better error handling
  const getContentRating = (item) => {
    if (!item.details) return 'NR';
    
    // For TV Shows - check content_ratings
    if (item.details.name && item.details.content_ratings?.results) {
        const usRating = item.details.content_ratings.results.find(rating => rating.iso_3166_1 === 'US');
        if (usRating?.rating) return usRating.rating;
    }
    
    // For Movies - check release_dates with enhanced logic
    if (item.details.title && item.details.release_dates?.results) {
        const usRelease = item.details.release_dates.results.find(release => release.iso_3166_1 === 'US');
        if (usRelease?.release_dates) {
            // Look through all release dates for the US, not just the first one
            for (const releaseDate of usRelease.release_dates) {
                if (releaseDate.certification && releaseDate.certification.trim() !== '') {
                    return releaseDate.certification;
                }
            }
        }
    }
    
    // Enhanced fallback logic - check for adult content more thoroughly
    if (item.details.adult === true) {
        return (item.details.name) ? 'TV-MA' : 'R';
    }
    
    // Default fallback
    return (item.details.name) ? 'TV-14' : 'PG-13';
  };

  // Show loading state during initial load OR while fetching details
  if (initialLoad || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Loading your watchlist...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-4xl p-6">
          <h1 className="text-3xl font-bold mb-6 text-white">Your Watchlist</h1>
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <div className="text-red-500 text-lg mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#E91E63] hover:bg-[#F06292] text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-4xl p-6">
          <h1 className="text-3xl font-bold mb-6 text-white">Your Watchlist</h1>
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <img
              src="/bookmark.png"
              alt="Bookmark"
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <h2 className="text-xl font-semibold mb-4 text-white">Sign in to access your watchlist</h2>
            <p className="text-gray-400 mb-6">
              Create an account or sign in to save movies and TV shows to your personal watchlist.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-[#E91E63] hover:bg-[#F06292] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="border border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white px-6 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-white">Your Watchlist</h1>
        
        {detailedItems.length === 0 ? (
          // Empty watchlist state
          <div className="text-center py-16">
            <img
              src="/bookmark.png"
              alt="Empty Watchlist"
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <h2 className="text-xl font-semibold mb-4 text-white">Your watchlist is empty</h2>
            <p className="text-gray-400 mb-6">
              Start adding movies and TV shows to your watchlist by clicking the bookmark icon.
            </p>
            <Link
              to="/"
              className="bg-[#E91E63] hover:bg-[#F06292] text-white px-6 py-2 rounded-lg transition-colors inline-block"
            >
              Browse Movies & Shows
            </Link>
          </div>
        ) : (
          // Watchlist items - horizontal list layout
          <div className="space-y-4">
            {detailedItems.map((item) => (
              <div key={`${item.media_type}-${item.media_id}`} 
                   className="py-4 px-4 bg-[#1c1c1f]  transition-colors rounded-lg">
                
                {/* Main content row */}
                <div className="flex items-center gap-4">
                  {/* Poster Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${item.details?.poster_path}`}
                      alt={`${item.details?.title || item.details?.name} poster`}
                      className="w-16 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Movie/Show Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {item.details?.title || item.details?.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{formatYearDisplay(item)}</span>
                      <span>•</span>
                      <span>{formatDuration(item)}</span>
                      <span>•</span>
                      <span>{getContentRating(item)}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <img src="/star.png" alt="Rating" className="w-3 h-3 mr-1" />
                        <span className="text-yellow-400">{item.details?.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                    {/* Genre Tags - moved inside movie info */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.details?.genres?.slice(0, 4).map(genre => (
                        <span 
                          key={genre.id} 
                          className="bg-[#393841] hover:bg-[#4a4a52] text-white px-2 py-0.5 rounded-full border border-gray-200 text-xs font-medium cursor-default"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Info Button */}
                    <button
                      onClick={() => goToDetailPage(item)}
                      className="p-2 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="View Details"
                    >
                      <img 
                        src="/info_icon.png" 
                        alt="Info" 
                        className="w-10 h-10 transition-all duration-200 hover:brightness-75 hover:saturate-150" 
                      />
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(item.media_id)}
                      className="p-2 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <img 
                        src="/redX_icon.png" 
                        alt="Remove" 
                        className="w-10 h-10 transition-all duration-200 hover:brightness-75 hover:saturate-150" 
                      />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;