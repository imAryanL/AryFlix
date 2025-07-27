import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MovieTVCard from '../../components/MovieTVCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchBar from '../../components/SearchBar';
import usePageTitle from '../../hooks/usePageTitle';
import { API_URL } from '../../api';

function SearchResults() {
  const { query } = useParams(); // Get search query from URL
  const navigate = useNavigate();
  
  // State management
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set dynamic title with search query
  usePageTitle('Find');

  // Function to fetch search results from backend
  const fetchSearchResults = async (searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Frontend: Searching for "${searchQuery}"`);
      
      // Make API request to our backend search endpoint
      const response = await fetch(`${API_URL}/api/search/${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }
      
      console.log(`🔍 Frontend: Found ${data.count} results`);
      setSearchResults(data.data);
      
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(`Failed to search: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when component mounts or query changes
  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Searching for "{query}"...</h1>
            <div className="md:hidden mb-6">
              <SearchBar isMobile={true} />
            </div>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Search Results</h1>
            <div className="md:hidden mb-6">
              <SearchBar isMobile={true} />
            </div>
          </div>
          <div className="text-center">
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-black text-white pt-10">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-400 mb-4">
            {searchResults.length === 0 
              ? 'No results found' 
              : `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
            }
          </p>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden mb-6">
            <SearchBar isMobile={true} />
          </div>
        </div>

        {/* Results Section */}
        {searchResults.length === 0 ? (
          // No results found
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-400 mb-6">
              Try searching for a different movie or TV show
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Popular Content
            </button>
          </div>
        ) : (
          // Results grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((item) => (
              <MovieTVCard
                key={`${item.media_type}-${item.id}`}
                id={item.id}
                title={item.title || item.name}
                year={item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                rating={item.vote_average?.toFixed(1) || 'N/A'}
                posterUrl={item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : '/movie_placeholders.png'}
                mediaType={item.media_type}
                showBookmark={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;