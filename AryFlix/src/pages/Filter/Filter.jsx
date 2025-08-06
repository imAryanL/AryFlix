import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import usePageTitle from '../../hooks/usePageTitle';
import { API_URL } from '../../api';

function Filter() {
  // State management
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [mediaType, setMediaType] = useState('all');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [ratingMin, setRatingMin] = useState('');
  const [ratingMax, setRatingMax] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Set dynamic page title
  usePageTitle('Filter & Sort');

  // Genre options
  const genres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 'anime', name: 'Anime' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' }
  ];

  // Function to fetch filtered results
  const fetchFilteredResults = async (page = 1, append = false) => {
    try {
      setLoading(!append);
      setLoadingMore(append);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add filters only if they have values
      if (selectedGenres.length > 0) params.append('genres', selectedGenres.join(','));
      if (mediaType !== 'all') params.append('type', mediaType);
      if (yearMin) params.append('yearMin', yearMin);
      if (yearMax) params.append('yearMax', yearMax);
      if (ratingMin) params.append('ratingMin', ratingMin);
      if (ratingMax) params.append('ratingMax', ratingMax);
      if (sortBy !== 'popularity') params.append('sortBy', sortBy);
      
      // Add pagination
      params.append('page', page.toString());
      params.append('limit', '50');
      
      const response = await fetch(`${API_URL}/api/filter?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Filter failed');
      }
      
      if (append) {
        setResults(prev => [...prev, ...data.data]);
      } else {
        setResults(data.data);
        setCurrentPage(1);
      }
      
      setHasMore(data.hasMore);
      
    } catch (err) {
      console.error('Error fetching filtered results:', err);
      setError(`Failed to filter: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle genre toggle
  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  // Load more results
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchFilteredResults(nextPage, true);
  };

  // Auto-search when filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchFilteredResults(1, false);
  }, [selectedGenres, mediaType, yearMin, yearMax, ratingMin, ratingMax, sortBy]);

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-8">Filter & Sort</h1>
        
        {/* Filter Controls */}
        <div className="bg-[#252529] rounded-lg p-6 mb-8 border-3 border-gray-400">
          
          {/* Media Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <div className="flex gap-4">
              {['all', 'movie', 'tv'].map(type => (
                <button
                  key={type}
                  onClick={() => setMediaType(type)}
                  className={`px-4 py-2 rounded-lg transition-colors  ${
                    mediaType === type 
                      ? 'bg-[#E91E63] active:bg-[#C2185B] text-white cursor-pointer' 
                      : 'bg-[#54525f] hover:bg-[#4a4a52] text-white cursor-pointer'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors border-1 border-gray-400
                    ${selectedGenres.includes(genre.id)
                      ? 'bg-[#E91E63] active:bg-[#C2185B] text-white cursor-pointer'
                      : 'bg-[#54525f] hover:bg-[#4a4a52] text-white cursor-pointer'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Year Range</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                placeholder="2010"
                className="w-32 px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
              />
              <span className="text-gray-400 font-medium">to</span>
              <input
                type="number"
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
                placeholder="2025"
                className="w-32 px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Rating Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Rating Range</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={ratingMin}
                onChange={(e) => setRatingMin(e.target.value)}
                placeholder="e.g. 1.0"
                className="w-32 px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
              />
              <span className="text-gray-400 font-medium">to</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={ratingMax}
                onChange={(e) => setRatingMax(e.target.value)}
                placeholder="e.g. 10.0"
                className="w-32 px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-[#54525f] border border-gray-600 rounded-lg text-white"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="date">Release Date</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSelectedGenres([]);
              setMediaType('all');
              setYearMin('');
              setYearMax('');
              setRatingMin('');
              setRatingMax('');
              setSortBy('popularity');
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={() => fetchFilteredResults(1, false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {results.length > 0 ? `Found ${results.length} results` : 'No results found'}
              </h2>
            </div>

            {/* Results Grid */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((item) => {
                  const isMovie = item.media_type === 'movie';
                  const title = isMovie ? item.title : item.name;
                  const releaseDate = isMovie ? item.release_date : item.first_air_date;
                  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
                  const posterUrl = item.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : '/movie_placeholder.png';

                  return (
                    <MovieTVCard
                      key={`${item.media_type}-${item.id}`}
                      id={item.id}
                      title={title}
                      year={year}
                      rating={item.vote_average?.toFixed(1) || 'N/A'}
                      posterUrl={posterUrl}
                      showGetTickets={false}
                      mediaType={item.media_type}
                    />
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && results.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    loadingMore 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#E91E63] active:bg-[#C2185B] text-white'
                  }`}
                >
                  {loadingMore ? 'Loading...' : 'Load 50 More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Filter;