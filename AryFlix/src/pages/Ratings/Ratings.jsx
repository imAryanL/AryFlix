import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRating } from '../../contexts/RatingContext';

function Ratings() {
  const navigate = useNavigate();
  const [detailedItems, setDetailedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Get rating data from context
  const { user, getAllUserRatings, deleteRating } = useRating();  // Add deleteRating import

  // Simple delay to prevent flash on page refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, []);

  // Fetch user's ratings and their detailed movie/TV info
  useEffect(() => {
    const fetchRatingsWithDetails = async () => {
      // Skip if still in initial load phase
      if (initialLoad) return;
      
      if (!user) {
        setDetailedItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get all user ratings
        const userRatings = await getAllUserRatings();
        
        if (userRatings.length === 0) {
          setDetailedItems([]);
          setLoading(false);
          return;
        }

        // Get detailed information for each rated item
        const detailedItems = await Promise.all(
          userRatings.map(async (rating) => {
            try {
              // Use the enhanced endpoints that include proper runtime calculation
              const endpoint = rating.media_type === 'tv' 
                ? `http://localhost:5000/api/tv/${rating.media_id}/trailer`
                : `http://localhost:5000/api/movies/${rating.media_id}/trailer`;
              
              const response = await fetch(endpoint);
              const data = await response.json();
              
              if (data.success) {
                return {
                  ...rating,  // Include rating info (rating, updated_at, etc.)
                  details: data.data  // Include movie/TV details
                };
              } else {
                console.warn(`Failed to fetch details for ${rating.media_type} ${rating.media_id}`);
                return {
                  ...rating,
                  details: null
                };
              }
            } catch (error) {
              console.error(`Error fetching details for ${rating.media_type} ${rating.media_id}:`, error);
              return {
                ...rating,
                details: null
              };
            }
          })
        );

        // Filter out items that failed to load details
        const validItems = detailedItems.filter(item => item.details !== null);
        setDetailedItems(validItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ratings:', error);
        setError('Failed to load your ratings');
        setLoading(false);
      }
    };

    fetchRatingsWithDetails();
  }, [initialLoad, user, getAllUserRatings]);

  // Navigate to detail page
  const goToDetailPage = (item) => {
    const isTV = item.media_type === 'tv';
    const path = isTV ? `/tv/${item.media_id}` : `/movies/${item.media_id}`;
    const posterUrl = item.details?.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.details.poster_path}`
      : null;
    
    navigate(path, { state: { posterUrl } });
  };

  // Remove rating function (delete user's rating) - NO CONFIRMATION POPUP
  const handleRemoveRating = async (mediaId) => {
    try {
      // Show loading state (optional - you could add a loading spinner here)
      console.log('🗑️ Removing rating for media ID:', mediaId);
      
      // Call the real delete function from context
      const success = await deleteRating(mediaId);
      
      if (success) {
        // Success - remove the item from the local state immediately
        setDetailedItems(prevItems => 
          prevItems.filter(item => item.media_id !== mediaId)
        );
        console.log('✅ Rating removed successfully');
      } else {
        // Failed - show error message
        alert('Failed to remove rating. Please try again.');
        console.error('❌ Failed to remove rating');
      }
    } catch (error) {
      // Error occurred - show error message
      console.error('Error removing rating:', error);
      alert('An error occurred while removing the rating. Please try again.');
    }
  };

  // Format rating date
  const formatRatingDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Show loading state during initial load OR while fetching details
  if (initialLoad || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Loading your ratings...</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-4xl p-6">
          <h1 className="text-3xl font-bold mb-6 text-white">My Ratings</h1>
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <img
              src="/star.png"
              alt="Star"
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <h2 className="text-xl font-semibold mb-4 text-white">Sign in to access your ratings</h2>
            <p className="text-gray-400 mb-6">
              Create an account or sign in to rate movies and TV shows and see your rating history.
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-white">My Ratings</h1>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-white">My Ratings</h1>
        
        {detailedItems.length === 0 ? (
          // Empty ratings state
          <div className="text-center py-16">
            <img
              src="/star.png"
              alt="Empty Ratings"
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <h2 className="text-xl font-semibold mb-4 text-white">You haven't rated anything yet</h2>
            <p className="text-gray-400 mb-6">
              Start rating movies and TV shows to see them here in your personal rating history.
            </p>
            <Link
              to="/"
              className="bg-[#E91E63] hover:bg-[#F06292] text-white px-6 py-2 rounded-lg transition-colors inline-block"
            >
              Browse Movies & Shows
            </Link>
          </div>
        ) : (
          // Rating items - horizontal list layout (same as watchlist)
          <div className="space-y-4">
            {detailedItems.map((item) => (
              <div key={`${item.media_type}-${item.media_id}`} 
                   className="py-4 px-4 bg-[#1c1c1f] transition-colors rounded-lg">
                
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
                    
                    {/* Rating and date info */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <img src="/star.png" alt="Rating" className="w-4 h-4" />
                        <span className="text-yellow-400 font-semibold">{item.rating}/10</span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">Rated on {formatRatingDate(item.updated_at)}</span>
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

                    {/* Remove Rating Button */}
                    <button
                      onClick={() => handleRemoveRating(item.media_id)}
                      className="p-2 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="Remove Rating"
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

export default Ratings; 