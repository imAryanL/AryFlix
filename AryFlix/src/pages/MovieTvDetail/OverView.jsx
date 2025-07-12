import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const OverView = () => {
    const { id } = useParams();
    const location = useLocation();
    const isTV = location.pathname.startsWith('/tv/');

    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==========================================
    // DATA FETCHING
    // ==========================================
    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                setLoading(true);
                setError(null);

                const apiEndpoint = isTV 
                    ? `http://localhost:5000/api/tv/${id}/trailer`
                    : `http://localhost:5000/api/movies/${id}/trailer`;
                
                const response = await fetch(apiEndpoint);
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    throw new Error('Failed to fetch details');
                }

                setMovieData(data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching movie data:', err);
                setError('Failed to load content');
                setLoading(false);
            }
        };

        if (id) {
            fetchMovieData();
        }
    }, [id, isTV]);

    // ==========================================
    // HELPER FUNCTIONS FOR GENRES & KEYWORDS
    // ==========================================
    
    const getGenresAndKeywords = () => {
        const genres = movieData?.genres || [];
        const keywords = movieData?.keywords?.keywords || movieData?.keywords?.results || [];
        
        // Combine genres and keywords, limit total to ~8-10 items
        const combined = [
            ...genres.map(genre => ({ name: genre.name, type: 'genre' })),
            ...keywords.slice(0, 4).map(keyword => ({ name: keyword.name, type: 'keyword' }))
        ];
        
        return combined.slice(0, 8); // Limit to 8 total items
    };

    // ==========================================
    // HELPER FUNCTION FOR DESCRIPTION
    // ==========================================
    
    const getFormattedDescription = () => {
        const overview = movieData?.overview || '';
        if (!overview || overview.length < 30) return null;

        // Simple approach: just show the first 200-250 characters and add ellipsis if needed
        if (overview.length <= 250) {
            return overview;
        }
        
        // Find a good breaking point (end of sentence or word) within first 250 chars
        const shortened = overview.substring(0, 250);
        const lastPeriod = shortened.lastIndexOf('.');
        const lastSpace = shortened.lastIndexOf(' ');
        
        // If we find a period within reasonable range, break there
        if (lastPeriod > 150) {
            return overview.substring(0, lastPeriod + 1);
        }
        
        // Otherwise break at last word
        if (lastSpace > 150) {
            return overview.substring(0, lastSpace) + '...';
        }
        
        // Fallback: just show first 200 chars with ellipsis
        return overview.substring(0, 200) + '...';
    };

    // ==========================================
    // RENDER
    // ==========================================

    if (loading) {
        return (
            <div className="relative -mx-4 md:-mx-8">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                    <div className="flex items-center justify-center h-20">
                        <div className="text-white text-lg">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative -mx-4 md:-mx-8">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                    <div className="text-center bg-gray-800 rounded-lg p-6">
                        <div className="text-red-500 text-lg">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    const genresAndKeywords = getGenresAndKeywords();
    const formattedDescription = getFormattedDescription();

    return (
        <div className="relative -mx-4 md:-mx-8">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
                
                {/* GENRES & KEYWORDS SECTION */}
                <div className="lg:-ml-9">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {genresAndKeywords.map((item, index) => (
                            <span
                                key={index}
                                className="bg-[#393841] hover:bg-[#4a4a52] text-white px-3 py-1 rounded-full border border-gray-200 text-sm font-medium cursor-pointer"
                            >
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* DESCRIPTION/OVERVIEW SECTION */}
                {formattedDescription && (
                    <div className="lg:-ml-8">
                        <div className="mb-2 max-w-4xl">
                            <p className="text-gray-200 leading-relaxed text-base">
                                {formattedDescription}
                            </p>
                        </div>
                        <div className="border-t border-gray-600 max-w-4xl mb-3"></div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OverView;