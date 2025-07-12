import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import ScrollableMovieSection from '../../components/ScrollableMovieSection';
import LoadingSpinner from '../../components/LoadingSpinner';

const ComingSoonTheatre = () => {
    // State to store the list of upcoming movies from TMDB API
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    // State to track if data is still loading from the API
    const [loading, setLoading] = useState(true);
    // State to handle any errors that occur during data fetching
    const [error, setError] = useState(null);

    // Function to fetch upcoming movies from our backend API
    const fetchUpcomingMovies = async () => {
        try {
            console.log('🎬 Frontend: Starting to fetch upcoming movies...');
            setLoading(true);
            setError(null);
            
            // Make API request to our backend endpoint for upcoming movies
            const response = await fetch('http://localhost:5000/api/movies/upcoming');
            
            console.log('🎬 Frontend: Got response:', response.status);
            
            // Check if the HTTP request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Parse the JSON response from our backend
            const data = await response.json();
            
            console.log('🎬 Frontend: Parsed JSON data:', data);
            console.log('🎬 Frontend: Number of movies received:', data.data?.length || 0);
            
            // Check if our backend returned a successful response
            if (!data.success) {
                throw new Error('API returned unsuccessful response');
            }
            
            // Store the movies data in state
            setUpcomingMovies(data.data.slice(0, 20));
            console.log('🎬 Frontend: Movies stored in state:', data.data.slice(0, 20).length);
            setLoading(false);
        } catch (err) {
            // Log error details for debugging
            console.error('🎬 Frontend: Error fetching upcoming movies:', err);
            setError(`Failed to load upcoming movies: ${err.message}`);
            setLoading(false);
        }
    };

    // useEffect hook to fetch data when component mounts
    useEffect(() => {
        fetchUpcomingMovies();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Coming Soon to Theatres</h2>
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
                <h2 className="text-2xl font-bold text-white mb-6">Coming Soon to Theatres</h2>
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={fetchUpcomingMovies}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (upcomingMovies.length === 0) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Coming Soon to Theatres</h2>
                <div className="text-center text-gray-400">
                    No upcoming movies available
                </div>
            </div>
        );
    }

    return (
        <ScrollableMovieSection title="Coming Soon to Theatres">
            {upcomingMovies.map((movie) => {
                // Extract release year from release date
                const releaseYear = movie.release_date 
                    ? new Date(movie.release_date).getFullYear()
                    : '';
                
                // Build full poster URL from TMDB image path - UPGRADED to w780
                const posterUrl = movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
                    : '/placeholder-poster.jpg'; // Fallback if no poster

                return (
                    <MovieTVCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        year={releaseYear}
                        rating={movie.vote_average?.toFixed(1) || 'N/A'}
                        posterUrl={posterUrl}
                        mediaType="movie"
                    />
                );
            })}
        </ScrollableMovieSection>
    );
};

export default ComingSoonTheatre;