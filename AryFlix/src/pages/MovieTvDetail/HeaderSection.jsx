import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const HeaderSection = () => {
  // ==========================================
  // STATE MANAGEMENT - Store our data
  // ==========================================
  const { id } = useParams();
  const location = useLocation();
  
  // Determine if this is a TV show or movie based on the current route
  const isTV = location.pathname.startsWith('/tv/');
  
  const [movieData, setMovieData] = useState(null);  
  const [ratings, setRatings] = useState(null);      
  const [loading, setLoading] = useState(true);      
  const [error, setError] = useState(null);         

  // ==========================================
  // DATA FETCHING - Get data from APIs
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);  // Show loading spinner
        setError(null);    // Clear any previous errors

        // Use the enhanced trailer endpoint to get both data and trailer info
        const apiEndpoint = isTV 
          ? `http://localhost:5000/api/tv/${id}/trailer`
          : `http://localhost:5000/api/movies/${id}/trailer`;
        
        const tmdbResponse = await fetch(apiEndpoint);
        const tmdbData = await tmdbResponse.json();
        
        if (!tmdbResponse.ok || !tmdbData.success) {
          throw new Error('Failed to fetch details');
        }

        // Save the TMDB data we got
        setMovieData(tmdbData.data);
      

        // Extract OMDb ratings from the response 
        const omdbRatings = tmdbData.data.omdb_ratings || {};
        
        setRatings({
          imdb: omdbRatings.imdb,           // Only real data, no fallback
          rottenTomatoes: omdbRatings.rottenTomatoes  // Only real data, no fallback
        });

        console.log('🔍 Final Ratings State:', {
          imdb: omdbRatings.imdb,
          rottenTomatoes: omdbRatings.rottenTomatoes
        });

        setLoading(false); // Hide loading spinner
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load details');
        setLoading(false); // Hide loading spinner even on error
      }
    };

    // Only fetch data if we have an ID
    if (id) {
      fetchData();
    }
  }, [id, isTV]); // Re-run this effect if the ID changes

  // ==========================================
  // HELPER FUNCTIONS - Process raw data for display
  // ==========================================
  
  // Get the correct title (movies use 'title', TV shows use 'name')
  const getTitle = () => movieData?.title || movieData?.name || '';
  
  // Determine if this is a movie or TV series
  const getContentType = () => {
    return movieData?.name ? 'TV Series' : 'Movie';
  };

  // Format the year display (handles ongoing TV shows)
  const getYearDisplay = () => {
    if (!movieData) return '';
    
    if (movieData.name) { // This is a TV show
      const startYear = movieData.first_air_date ? new Date(movieData.first_air_date).getFullYear() : '';
      const endDate = movieData.last_air_date;
      
      // Check if show is still ongoing (no end date or still in production)
      if (!endDate || movieData.status === 'Returning Series' || movieData.in_production) {
        return (
          <span className="flex items-center gap-2">
            <span>{startYear} -</span>
            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
              OnGoing
            </span>
          </span>
        );
      } else {
        const endYear = new Date(endDate).getFullYear();
        return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;
      }
    } else { // This is a movie
      const year = movieData.release_date ? new Date(movieData.release_date).getFullYear() : '';
      return year;
    }
  };

  // Get actual content rating from TMDB data
  const getContentRating = () => {
    if (!movieData) return '';
    
    // For TV Shows - check content_ratings
    if (movieData.name && movieData.content_ratings?.results) {
        const usRating = movieData.content_ratings.results.find(rating => rating.iso_3166_1 === 'US');
        if (usRating?.rating) return usRating.rating;
    }
    
    // For Movies - check release_dates  
    if (movieData.title && movieData.release_dates?.results) {
        const usRelease = movieData.release_dates.results.find(release => release.iso_3166_1 === 'US');
        if (usRelease?.release_dates?.[0]?.certification) {
            return usRelease.release_dates[0].certification;
        }
    }
    
    // Fallback logic
    if (movieData.adult) return movieData.name ? 'TV-MA' : 'R';
    return movieData.name ? 'TV-14' : 'PG-13';
  };

  // Format duration/runtime
  const getDuration = () => {
    if (!movieData) return '';
    


    if (movieData.runtime) { // Movies
        const hours = Math.floor(movieData.runtime / 60);
        const minutes = movieData.runtime % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } else if (Array.isArray(movieData.episode_run_time) && movieData.episode_run_time.length > 0) { // TV shows
        const avgRuntime = movieData.episode_run_time[0];
        if (avgRuntime > 0) {
            return `${avgRuntime}m / ep`;
        }
    }
    

  };

  // ==========================================
  // LOADING & ERROR STATES - Handle different UI states
  // ==========================================
  
  // Show loading spinner while data is being fetched
  if (loading) return <LoadingSpinner />;

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#E91E63] hover:bg-[#F06292] text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render anything if we don't have movie data
  if (!movieData) return null;

  // ==========================================
  // MAIN COMPONENT RENDER - The actual UI
  // ==========================================
  return (
    <div className="relative -mx-4 md:-mx-8">
      <div className="text-white py-8 mt-6">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            
            {/* LEFT SIDE - Title aligned with popcorn image on large screens */}
            <div className="lg:-ml-9">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal mb-3 leading-tight">
                {movieData ? (movieData.title || movieData.name) : 'Loading...'}
              </h1>
              
              {/* METADATA ROW - Perfectly aligned with title start */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-gray-300 text-sm ml-1">
                <span className="text-white">{movieData?.name ? 'TV Series' : 'Movie'}</span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span>{getYearDisplay()}</span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="bg-gray-700 px-2 py-0.5 rounded text-xs font-semibold">
                  {getContentRating()}
                </span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span>{getDuration()}</span>
              </div>
            </div>

            {/* RIGHT SIDE - Rating Sources (IMDb, Rotten Tomatoes, TMDB) */}
            {(ratings || movieData) && (
              <div className="flex flex-wrap lg:flex-nowrap items-start gap-4 lg:gap-6 lg:-mr-9 lg:mt-3">
                
                {/* 1. IMDb Rating */}
                {ratings?.imdb && (
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-300 font-bold tracking-wide">IMDb RATING</div>
                    <div className="flex items-center justify-center mt-1">
                      <img 
                        src="/imdb.png" 
                        alt="IMDb" 
                        className="w-7 h-7 mr-1"
                      />
                      <span className="text-lg font-bold">{ratings.imdb}</span>
                    </div>
                  </div>
                )}

                {/* 2. Rotten Tomatoes Rating */}
                {ratings?.rottenTomatoes && (
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-300 tracking-wide font-bold">ROTTEN TOMATOES</div>
                    <div className="flex items-center justify-center mt-1">
                      <img 
                        src="/rottentomato.png" 
                        alt="Rotten Tomatoes" 
                        className="w-7 h-7 mr-1"
                      />
                      <span className="text-lg font-bold">{ratings.rottenTomatoes}</span>
                      <span className="text-white">%</span>
                    </div>
                  </div>
                )}

                {/* 3. TMDB Rating */}
                {movieData?.vote_average && (
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-300 font-bold tracking-wide">TMDB SCORE</div>
                    <div className="flex items-center justify-center mt-1">
                      <img 
                        src="/tmdb.png" 
                        alt="TMDB" 
                        className="w-8 h-8 mr-1"
                      />
                      <span className="text-lg font-bold">{movieData.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;