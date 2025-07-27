import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import ScrollableMovieSection from '../../components/ScrollableMovieSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../api';

const NowPlayingTheatre = () => {
    // State to store the list of now playing movies from TMDB API
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    // State to track if data is still loading from the API
    const [loading, setLoading] = useState(true);
    // State to handle any errors that occur during data fetching
    const [error, setError] = useState(null);

    // Function to fetch now playing movies from our backend API
    const fetchNowPlayingMovies = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Make API request to our backend endpoint for now playing movies
            const response = await fetch(`${API_URL}/api/movies/now-playing`);
            
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
            
            // Store the movies data in state
            // Take only first 20 movies for better performance and UI
            setNowPlayingMovies(data.data.slice(0, 20));
            setLoading(false);
        } catch (err) {
            // Log error details for debugging
            console.error('Error fetching now playing movies:', err);
            setError(`Failed to load theatre movies: ${err.message}`);
            setLoading(false);
        }
    };

    // useEffect hook to fetch data when component mounts
    useEffect(() => {
        fetchNowPlayingMovies();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Movies in Theatres</h2>
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
                <h2 className="text-2xl font-bold text-white mb-6">Movies in Theatres</h2>
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={fetchNowPlayingMovies}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (nowPlayingMovies.length === 0) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Movies in Theatres</h2>
                <div className="text-center text-gray-400">
                    No movies currently playing in theatres
                </div>
            </div>
        );
    }

    return (
        <ScrollableMovieSection title="Movies in Theatres">
            {nowPlayingMovies.map((movie) => {
                // Extract release year from release date
                const releaseYear = movie.release_date 
                    ? new Date(movie.release_date).getFullYear()
                    : '';
                
                // Build full poster URL from TMDB image path
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
                        showGetTickets={true}
                        mediaType="movie"
                    />
                );
            })}
        </ScrollableMovieSection>
    );
};

export default NowPlayingTheatre;



        
