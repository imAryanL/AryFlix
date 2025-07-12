import React, { useState, useEffect } from 'react';
import MovieTVCard from '../../components/MovieTVCard';
import ScrollableMovieSection from '../../components/ScrollableMovieSection';
import LoadingSpinner from '../../components/LoadingSpinner';

const StreamingPlatforms = () => {
    // State for the currently active platform tab
    const [activeTab, setActiveTab] = useState('netflix');
    // State to store content for each platform
    const [platformContent, setPlatformContent] = useState({});
    // State to track loading status for each platform
    const [loading, setLoading] = useState({});
    // State to handle any errors that occur during data fetching
    const [errors, setErrors] = useState({});
    // State to store streaming provider logos from TMDB
    const [platformLogos, setPlatformLogos] = useState({});

    // Platform configuration - UNIFORM COLORS
    const platforms = {
        netflix: { name: 'Netflix' },
        prime: { name: 'Prime Video' },
        disney: { name: 'Disney+' },
        max: { name: 'Max' },
        appletv: { name: 'Apple TV+' }
    };

    // Single color scheme for all platforms
    const getButtonStyles = (isActive) => {
        if (isActive) {
            return 'bg-[#E91E63] hover:bg-[#F06292] shadow-lg ring-1 ring-white/25 transform translate-y-[-1px]';
        }
        return 'bg-gray-700 hover:bg-gray-600';
    };

    // Function to fetch streaming provider logos from TMDB
    const fetchProviderLogos = async () => {
        try {
            console.log('🎯 Fetching provider logos...');
            const response = await fetch('http://localhost:5000/api/streaming/logos');
            
            console.log('🔍 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Raw response:', data);
            
            if (data.success) {
                setPlatformLogos(data.data);
                console.log('✅ Provider logos loaded:', data.data);
            } else {
                console.error('❌ API returned success: false', data);
            }
        } catch (err) {
            console.error('💥 Error fetching provider logos:', err);
            // Continue without logos if fetch fails
        }
    };

    // Fetch logos when component mounts
    useEffect(() => {
        fetchProviderLogos();
    }, []);

    // Function to fetch content for a specific platform
    const fetchPlatformContent = async (platform) => {
        // Skip if we already have content for this platform
        if (platformContent[platform]) return;

        try {
            setLoading(prev => ({ ...prev, [platform]: true }));
            setErrors(prev => ({ ...prev, [platform]: null }));

            console.log(`🎬 Fetching ${platforms[platform].name} content...`);

            // Make API request to our backend endpoint
            const response = await fetch(`http://localhost:5000/api/streaming/${platform}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('API returned unsuccessful response');
            }
            
            // Store content in state
            setPlatformContent(prev => ({
                ...prev,
                [platform]: data.data.slice(0, 20) // Limit to 20 items
            }));

            console.log(`✅ ${platforms[platform].name}: ${data.data.length} items loaded`);
            
        } catch (err) {
            console.error(`Error fetching ${platform} content:`, err);
            setErrors(prev => ({
                ...prev,
                [platform]: `Failed to load ${platforms[platform].name} content: ${err.message}`
            }));
        } finally {
            setLoading(prev => ({ ...prev, [platform]: false }));
        }
    };

    // Fetch content for ALL platforms when component mounts
    useEffect(() => {
        // Pre-load all platform content to avoid loading states
        Object.keys(platforms).forEach(platform => {
            fetchPlatformContent(platform);
        });
    }, []);

    // Function to handle tab switching
    const handleTabChange = (platform) => {
        setActiveTab(platform);
    };

    // Function to retry loading content for a platform
    const retryLoad = (platform) => {
        // Clear existing content and error, then fetch again
        setPlatformContent(prev => {
            const newContent = { ...prev };
            delete newContent[platform];
            return newContent;
        });
        setErrors(prev => ({ ...prev, [platform]: null }));
        fetchPlatformContent(platform);
    };

    // Get current platform's content
    const currentContent = platformContent[activeTab] || [];
    const isLoading = loading[activeTab];
    const error = errors[activeTab];

    // Loading state
    if (isLoading) {
        return (
            <div className="py-6">
                <h2 className="text-2xl font-bold text-white mb-4">Explore What's Streaming</h2>
                <div className="flex justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="py-6">
                <h2 className="text-2xl font-bold text-white mb-4">Explore What's Streaming</h2>
                <div className="text-center bg-gray-800 rounded-lg p-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                        onClick={() => retryLoad(activeTab)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            {/* Section Title */}
            <h2 className="text-2xl font-bold text-white mb-4">Explore What's Streaming</h2>
            
            {/* Platform Tabs */}
            <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(platforms).map(([key, platform]) => {
                    const logoData = platformLogos[key];
                    
                    return (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key)}
                            className={`
                                px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 cursor-pointer
                                flex items-center gap-2 
                                ${getButtonStyles(activeTab === key)}
                            `}
                        >
                            {logoData && logoData.logo_url ? (
                                <img 
                                    src={logoData.logo_url} 
                                    alt={`${platform.name} logo`}
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : null}
                            {platform.name}
                        </button>
                    );
                })}
            </div>

            {/* Platform Content using ScrollableMovieSection */}
            <ScrollableMovieSection title={platforms[activeTab].name}>
                {currentContent.map((item) => {
                    // Handle both movies and TV shows
                    const isMovie = item.media_type === 'movie';
                    const title = isMovie ? item.title : item.name;
                    const releaseDate = isMovie ? item.release_date : item.first_air_date;
                    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
                    
                    // Build poster URL
                    const posterUrl = item.poster_path 
                        ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
                        : '/placeholder-poster.jpg';

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
            </ScrollableMovieSection>
        </div>
    );
};

export default StreamingPlatforms; 