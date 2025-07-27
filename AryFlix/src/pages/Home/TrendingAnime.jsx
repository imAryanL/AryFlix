import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import ScrollableMovieSection from '../../components/ScrollableMovieSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../api';

const TrendingAnime = () => {
    // State to store the list of trending anime from TMDB API
    const [trendingAnime, setTrendingAnime] = useState([]);
    // State to track if data is still loading from the API
    const [loading, setLoading] = useState(true);
    // State to handle any errors that occur during data fetching
    const [error, setError] = useState(null);

    // Function to fetch trending anime from our backend API
    const fetchTrendingAnime = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Make API request to our backend endpoint for trending anime
            const response = await fetch(`${API_URL}/api/anime/trending`);
            
            // Check if the HTTP request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse the JSON response from our backend
            const data = await response.json();
            
            // Check if our backend returned a successful response
            if (!data.success) {
                throw new Error('API returned unsuccessful response');
            }
            
            // Store the anime data in state
            // Take only first 20 anime for better performance and UI
            setTrendingAnime(data.data.slice(0, 20));
            setLoading(false);
        } catch (err) {
            // Log error details for debugging
            console.error('Error fetching trending anime:', err);
            setError(`Failed to load trending anime: ${err.message}`);
            setLoading(false);
        }
    };

    // useEffect hook to fetch data when component mounts
    useEffect(() => {
        fetchTrendingAnime();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Trending Anime</h2>
                <div className="flex justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Trending Anime</h2>
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={fetchTrendingAnime}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (trendingAnime.length === 0) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Trending Anime</h2>
                <div className="text-center text-gray-400">
                    No trending anime found
                </div>
            </div>
        );
    }

    return (
        <ScrollableMovieSection title="Trending Anime">
            {trendingAnime.map((anime) => {
                // Extract first air year from first_air_date (anime shows use TV format)
                const firstAirYear = anime.first_air_date 
                    ? new Date(anime.first_air_date).getFullYear()
                    : '';
                
                // Build full poster URL from TMDB image path
                const posterUrl = anime.poster_path 
                    ? `https://image.tmdb.org/t/p/w780${anime.poster_path}`
                    : '/placeholder-poster.jpg'; // Fallback if no poster

                return (
                    <MovieTVCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.name} // Anime shows use 'name' instead of 'title'
                        year={firstAirYear}
                        rating={anime.vote_average?.toFixed(1) || 'N/A'}
                        posterUrl={posterUrl}
                        showGetTickets={false} // No tickets button for anime - they're for streaming
                        mediaType="tv"
                    />
                );
            })}
        </ScrollableMovieSection>
    );
};

export default TrendingAnime;