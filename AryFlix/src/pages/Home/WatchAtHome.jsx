import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import ScrollableMovieSection from '../../components/ScrollableMovieSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../api';

const PopTVShows = () => {
    const [watchAtHome, setWatchAtHome] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch combined movies and TV shows for Watch At Home
    const fetchWatchAtHome = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/watch-at-home`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data.success) throw new Error('API returned unsuccessful response');
            setWatchAtHome(data.data.slice(0, 40));
            setLoading(false);
        } catch (err) {
            setError(`Failed to load Watch At Home content: ${err.message}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchAtHome();
    }, []);

    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Watch At Home</h2>
                <div className="flex justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Watch At Home</h2>
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={fetchWatchAtHome}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (watchAtHome.length === 0) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Watch At Home</h2>
                <div className="text-center text-gray-400">
                    No content available
                </div>
            </div>
        );
    }

    return (
        <ScrollableMovieSection title="Watch At Home">
            {watchAtHome.map(item => (
                <MovieTVCard
                    key={item.media_type + '-' + item.id}
                    id={item.id}
                    title={item.title || item.name}
                    year={item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : '')}
                    rating={item.vote_average?.toFixed(1) || 'N/A'}
                    posterUrl={item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : '/placeholder-poster.jpg'}
                    showGetTickets={false}
                    mediaType={item.media_type}
                />
            ))}
        </ScrollableMovieSection>
    );
};

export default PopTVShows;
