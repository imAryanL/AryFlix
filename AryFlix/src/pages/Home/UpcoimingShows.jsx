import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import ScrollableMovieSection from '../../components/ScrollableMovieSection';
import LoadingSpinner from '../../components/LoadingSpinner';

const UpcomingShows = () => {
    // State to store the list of upcoming TV shows from TMDB API
    const [upcomingShows, setUpcomingShows] = useState([]);
    // State to track if data is still loading from the API
    const [loading, setLoading] = useState(true);
    // State to handle any errors that occur during data fetching
    const [error, setError] = useState(null);

    // Function to fetch upcoming TV shows from our backend API
    const fetchUpcomingShows = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Make API request to our backend endpoint for upcoming TV shows
            const response = await fetch('http://localhost:5000/api/tv/upcoming');
            
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
            
            // Store the TV shows data in state
            // Take only first 20 shows for better performance and UI
            setUpcomingShows(data.data.slice(0, 20));
            setLoading(false);
        } catch (err) {
            // Log error details for debugging
            console.error('Error fetching upcoming TV shows:', err);
            setError(`Failed to load upcoming TV shows: ${err.message}`);
            setLoading(false);
        }
    };

    // useEffect hook to fetch data when component mounts
    useEffect(() => {
        fetchUpcomingShows();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">New & Upcoming Shows</h2>
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
                <h2 className="text-2xl font-bold text-white mb-6">New & Upcoming Shows</h2>
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={fetchUpcomingShows}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (upcomingShows.length === 0) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">New & Upcoming Shows</h2>
                <div className="text-center text-gray-400">
                    No upcoming TV shows available
                </div>
            </div>
        );
    }

    return (
        <ScrollableMovieSection title="New & Upcoming Shows">
            {upcomingShows.map((show) => {
                // Extract first air year from first_air_date (TV shows use different date field)
                const firstAirYear = show.first_air_date 
                    ? new Date(show.first_air_date).getFullYear()
                    : '';
                
                // Build full poster URL from TMDB image path
                const posterUrl = show.poster_path 
                    ? `https://image.tmdb.org/t/p/w780${show.poster_path}`
                    : '/placeholder-poster.jpg'; // Fallback if no poster

                return (
                    <MovieTVCard
                        key={show.id}
                        id={show.id}
                        title={show.name}
                        year={firstAirYear}
                        rating={show.vote_average?.toFixed(1) || 'N/A'}
                        posterUrl={posterUrl}
                        showGetTickets={false}
                        mediaType="tv"
                    />
                );
            })}
        </ScrollableMovieSection>
    );
};

export default UpcomingShows;
