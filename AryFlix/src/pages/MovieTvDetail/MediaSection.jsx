import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { useRating } from '../../contexts/RatingContext';
import RatingModal from '../../components/RatingModal';

const TrailerSection = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get watchlist functionality from context
    const { user, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
    
    // Get rating functionality from context
    const { user: ratingUser } = useRating();
    
    // Get poster from navigation state if available
    const homePagePoster = location.state?.posterUrl;

    // Determine if this is a TV show or movie based on the current route
    const isTV = location.pathname.startsWith('/tv/');
    
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchlistLoading, setWatchlistLoading] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    // Check if current item is in watchlist
    const inWatchlist = isInWatchlist(id);

    // ==========================================
    // DATA FETCHING
    // ==========================================
    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use the enhanced trailer endpoint that includes YouTube fallback
                const apiEndpoint = isTV 
                    ? `http://localhost:5000/api/tv/${id}/trailer`
                    : `http://localhost:5000/api/movies/${id}/trailer`;
                
                const response = await fetch(apiEndpoint);
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    throw new Error('Failed to fetch movie/TV details');
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
    // WATCHLIST FUNCTIONALITY
    // ==========================================
    const handleWatchlistToggle = async () => {
        // If user is not logged in, redirect to login
        if (!user) {
            navigate('/login');
            return;
        }

        setWatchlistLoading(true);
        
        try {
            if (inWatchlist) {
                // Remove from watchlist
                await removeFromWatchlist(id);
            } else {
                // Add to watchlist
                const mediaType = isTV ? 'tv' : 'movie';
                await addToWatchlist(id, mediaType);
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        } finally {
            setWatchlistLoading(false);
        }
    };

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    
    // Get high-quality poster URL
    const getPosterUrl = () => {
        // Use home page poster if available (for consistency)
        if (homePagePoster) {
            return homePagePoster;
        }
        
        // Fallback to API poster
        if (!movieData?.poster_path) return '/placeholder-poster.jpg';
        return `https://image.tmdb.org/t/p/w780${movieData.poster_path}`;
    };







    // Get movie/TV title
    const getTitle = () => movieData?.title || movieData?.name || '';




    
    // Smart trailer selection - prioritizes latest season trailers for TV shows
    const getMainTrailer = () => {
        if (!movieData?.videos?.results?.length) return null;
        
        const videos = movieData.videos.results;
        
        if (isTV) {
            // For TV shows: prioritize latest season trailers
            return getLatestSeasonTrailer(videos);
        } else {
            // For movies: use existing logic
            return getMovieTrailer(videos);
        }
    };






    
    // Get latest season trailer for TV shows
    const getLatestSeasonTrailer = (videos) => {
        // Filter for trailers and teasers only
        const relevantVideos = videos.filter(video => 
            video.site === 'YouTube' && 
            (video.type === 'Trailer' || video.type === 'Teaser')
        );

        if (!relevantVideos.length) return null;

        // Try to find current/latest season trailers
        const currentYear = new Date().getFullYear();
        const recentYears = [currentYear, currentYear - 1, currentYear - 2];

        // Look for trailers with recent season numbers or recent years
        const latestSeasonTrailers = relevantVideos.filter(video => {
            const name = video.name.toLowerCase();
            const publishedYear = new Date(video.published_at).getFullYear();
            
            // Check for recent season numbers (Season 5, Season 6, etc.)
            const hasRecentSeasonNumber = /season\s*([5-9]|\d{2})/.test(name);
            
            // Check for recent years in video title or published date
            const isRecentYear = recentYears.includes(publishedYear) || 
                               recentYears.some(year => name.includes(year.toString()));
            
            // Check for keywords indicating newer content
            const hasRecentKeywords = /latest|new|current|recent|2024|2025/.test(name);
            
            return hasRecentSeasonNumber || isRecentYear || hasRecentKeywords;
        });

        // If we found recent season trailers, pick the best one
        if (latestSeasonTrailers.length > 0) {
            // Sort by published date (newest first)
            latestSeasonTrailers.sort((a, b) => 
                new Date(b.published_at) - new Date(a.published_at)
            );
            
            // Prefer official trailers over teasers
            const officialTrailer = latestSeasonTrailers.find(video => 
                video.type === 'Trailer' && 
                video.name.toLowerCase().includes('official')
            );
            
            return officialTrailer || latestSeasonTrailers[0];
        }

        // Fallback: get the most recent trailer/teaser by publish date
        const sortedByDate = relevantVideos.sort((a, b) => 
            new Date(b.published_at) - new Date(a.published_at)
        );

        // Prefer trailers over teasers
        const recentTrailer = sortedByDate.find(video => video.type === 'Trailer');
        return recentTrailer || sortedByDate[0];
    };

    // Get movie trailer (existing logic)
    const getMovieTrailer = (videos) => {
        // Priority: Official Trailer > Trailer > Teaser > Clip
        const trailer = videos.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' && 
            video.name.toLowerCase().includes('official')
        ) || videos.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        ) || videos.find(video => 
            video.type === 'Teaser' && video.site === 'YouTube'
        ) || videos.find(video => 
            video.site === 'YouTube'
        );
        
        return trailer;
    };

    // Get YouTube embed URL - now handles both enhanced trailer format and legacy format
    const getYouTubeEmbedUrl = (trailer) => {
        let videoKey;
        
        // Handle enhanced trailer format from your backend
        if (trailer.key) {
            videoKey = trailer.key;
        } else {
            // Legacy format fallback
            videoKey = trailer;
        }
        
        return `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=1&playsinline=1`;
    };

    // Get the enhanced trailer from your backend (TMDB + YouTube fallback)
    const getEnhancedTrailer = () => {
        // Check if we have the enhanced trailer object from your backend
        if (movieData?.trailer && movieData.trailer.key) {
            return movieData.trailer;
        }
        
        // Fallback to old method for backward compatibility (if needed)
        if (movieData?.videos?.results?.length) {
            const videos = movieData.videos.results;
            
            if (isTV) {
                return getLatestSeasonTrailer(videos);
            } else {
                return getMovieTrailer(videos);
            }
        }
        
        return null;
    };

    // Get trailer source info for display
    const getTrailerSourceInfo = (trailer) => {
        if (!trailer) return null;
        
        // Enhanced trailer format from your backend
        if (trailer.source) {
            return {
                source: trailer.source,
                name: trailer.name || 'Trailer',
                isFromYouTube: trailer.source === 'youtube'
            };
        }
        
        // Legacy format fallback
        return {
            source: 'tmdb',
            name: trailer.name || 'Trailer',
            isFromYouTube: false
        };
    };

    // ==========================================
    // LOADING & ERROR STATES
    // ==========================================

    if (loading) {
        return (
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center">
                    <div className="animate-pulse">
                        <div className="bg-gray-700 rounded-lg h-96 w-64"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !movieData) {
        return (
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-red-500">
                    {error || 'Content not available'}
                </div>
            </div>
        );
    }

    const mainTrailer = getMainTrailer();
    const enhancedTrailer = getEnhancedTrailer();
    const trailerSourceInfo = getTrailerSourceInfo(enhancedTrailer);

    // ==========================================
    // MAIN COMPONENT RENDER
    // ==========================================
    return (
        <div className="relative -mx-4 md:-mx-8">
            <div className="-mt-4 pb-8">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* LEFT SIDE - POSTER AND VIDEO TOGETHER */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:gap-1 lg:-ml-9">
                        
                        {/* POSTER */}
                        <div className="flex justify-center lg:justify-start mb-8 lg:mb-0 flex-shrink-0">
                            <div className="relative group cursor-pointer">
                                <img 
                                    src={getPosterUrl()}
                                    alt={`${getTitle()} poster`}
                                    className="w-70 h-auto rounded-lg shadow-2xl transform transition-transform duration-100 ease-out group-hover:scale-[1.02]"
                                    loading="lazy"
                                />
                                
                                {/* Simple hover overlay */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out rounded-lg"></div>
                            </div>
                        </div>

                        {/* VIDEO - ENHANCED WITH YOUTUBE FALLBACK */}
                        <div className="flex-shrink-0">
                            {enhancedTrailer ? (
                                <div className="w-full mr-2">
                                    {/* Video container with proper 16:9 aspect ratio */}
                                    <div 
                                        className="relative w-[746px] aspect-video bg-black rounded-lg overflow-hidden shadow-2xl select-none"
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        <iframe
                                            src={getYouTubeEmbedUrl(enhancedTrailer)}
                                            title={trailerSourceInfo?.name || 'Trailer'}
                                            className="w-full h-full select-none"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                
                                                
                                            }}
                                            onError={() => {
                                                console.log('🚫 Trailer failed to load - possibly geo-blocked');
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* No Trailer Available - Enhanced message */
                                <div className="w-[745px] aspect-video flex items-center justify-center">
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <h3 className="text-white text-xl font-bold mb-4">No Trailer Available</h3>
                                        <p className="text-gray-400 mb-2">
                                            No trailer found on TMDB or YouTube for this {isTV ? 'TV show' : 'movie'}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Our system searched both TMDB and YouTube databases
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDEBAR - WATCHLIST AND RATE SECTION */}
                        <div className="flex-shrink-0 w-64 -ml-2">
                            <div className="h-[420px] flex flex-col justify-between">
                                {/* Watchlist Button - Enhanced with actual functionality */}
                                <button 
                                    onClick={handleWatchlistToggle}
                                    disabled={watchlistLoading}
                                    className="w-full bg-[#393841] hover:bg-[#4a4a52] text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 group cursor-pointer"
                                >
                                    {watchlistLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <img 
                                            src={inWatchlist ? "/bookmark_pink.png" : "/bookmark.png"} 
                                            alt="Watchlist" 
                                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                                        />
                                    )}
                                    <span className="text-sm">
                                        {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                                    </span>
                                </button>

                                {/* Rate Button - Updated with modal functionality */}
                                <button 
                                    className="w-full bg-[#393841] hover:bg-[#4a4a52] text-white 
                                    font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 group cursor-pointer"
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            return;
                                        }
                                        setIsRatingModalOpen(true);
                                    }}
                                >
                                    <span className="text-red-500 group-hover:scale-110 transition-transform">
                                        <img src="/star.png" alt="star" className="w-5 h-5" />
                                    </span>
                                    <span className="text-sm">Rate this {isTV ? 'show' : 'movie'}</span>
                                </button>

                                {/* Rating Modal */}
                                <RatingModal
                                    isOpen={isRatingModalOpen}
                                    onClose={() => setIsRatingModalOpen(false)}
                                    mediaId={id}
                                    mediaType={isTV ? 'tv' : 'movie'}
                                    mediaTitle={getTitle()}
                                />

                                {/* Vote Count */}
                                <div className="bg-[#393841] hover:bg-[#4a4a52] rounded-lg py-2 px-3 text-center transition-all duration-200">
                                    <div className="text-sm text-white font-bold tracking-wide mb-1">Vote Count</div>
                                    <div className="text-[#ff75a3] font-medium">
                                        {movieData?.vote_count && movieData.vote_count > 0
                                            ? `${movieData.vote_count.toLocaleString()} votes`
                                            : 'No votes yet'
                                        }
                                    </div>
                                </div>

                                {/* Popularity */}
                                <div className="bg-[#393841] hover:bg-[#4a4a52] rounded-lg py-2 px-3 text-center transition-all duration-200">
                                    <div className="text-sm text-white font-bold tracking-wide mb-1">Popularity</div>
                                    <div className="text-[#ff75a3] font-semibold">
                                        {Math.round(movieData?.popularity || 0)}
                                    </div>
                                </div>

                                {/* Release Date / Air Dates */}
                                {isTV ? (
                                    movieData?.first_air_date && (
                                        <div className="bg-[#393841] hover:bg-[#4a4a52] rounded-lg py-2 px-3 text-center transition-all duration-200">
                                            <div className="text-sm text-white font-bold tracking-wide mb-1">
                                                {movieData?.last_air_date && movieData.status === 'Ended' ? 'Aired' : 'First Aired'}
                                            </div>
                                            <div className="text-white font-semibold text-xs">
                                                {new Date(movieData.first_air_date).toLocaleDateString('en-US', { 
                                                    month: 'long', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                                {movieData?.last_air_date && movieData.status === 'Ended' && (
                                                    <>
                                                        <br />
                                                        <span className="text-gray-300">to</span>
                                                        <br />
                                                        {new Date(movieData.last_air_date).toLocaleDateString('en-US', { 
                                                            month: 'long', 
                                                            day: 'numeric', 
                                                            year: 'numeric' 
                                                        })}
                                                    </>
                                                )}
                                                {(!movieData?.last_air_date || movieData.status !== 'Ended') && (
                                                    <>
                                                        <br />
                                                        <span className="text-green-400">Present</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    movieData?.release_date && (
                                        <div className="bg-[#393841] hover:bg-[#4a4a52] rounded-lg py-5 px-3 text-center transition-all duration-200">
                                            <div className="text-sm text-white font-bold tracking-wide mb-1">Released</div>
                                            <div className="text-white font-semibold text-xs">
                                                {new Date(movieData.release_date).toLocaleDateString('en-US', { 
                                                    month: 'long', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Box Office (Movies) */}
                                {!isTV && (
                                    <div className="bg-[#393841] hover:bg-[#4a4a52] rounded-lg py-2 px-3 text-center transition-all duration-200">
                                        <div className="text-sm text-white font-bold tracking-wide mb-1">Box Office</div>
                                        <div className="text-green-400 font-semibold">
                                            {movieData?.revenue && movieData.revenue > 0 
                                                ? movieData.revenue >= 1000000000 
                                                    ? `$${(movieData.revenue / 1000000000).toFixed(1)}B`
                                                    : `$${(movieData.revenue / 1000000).toFixed(0)}M`
                                                : 'TBD'
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Seasons (TV) */}
                                {isTV && (
                                    <div className="bg-[#393841] hover:bg-[#4a4a52] rounded-lg py-2 px-3 text-center transition-all duration-200">
                                        <div className="text-sm text-white font-bold tracking-wide mb-1">Seasons</div>
                                        <div className="text-[#ff75a3] font-medium">
                                            {movieData?.number_of_seasons 
                                                ? `${movieData.number_of_seasons} ${movieData.number_of_seasons === 1 ? 'season' : 'seasons'}`
                                                : 'TBD'
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrailerSection;