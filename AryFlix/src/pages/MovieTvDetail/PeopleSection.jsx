import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import StreamingProviders from './StreamingProviders';
import { API_URL } from '../../api';

const PeopleSection = () => {
    const { id } = useParams();
    const location = useLocation();
    const isTV = location.pathname.startsWith('/tv/');

    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch movie/TV data with cast and crew information
    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                setLoading(true);
                setError(null);

                const apiEndpoint = isTV 
                    ? `${API_URL}/api/tv/${id}/trailer`
                    : `${API_URL}/api/movies/${id}/trailer`;
                
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

    // Get creators/directors - moved from OverView.jsx
    const getCreatorsOrDirectors = () => {
        if (isTV) {
            // For TV shows, get creators
            const creators = movieData?.created_by || [];
            if (creators.length > 0) {
                const creatorNames = creators.map(creator => creator.name).join(', ');
                return {
                    label: creators.length > 1 ? 'Creators' : 'Creator',
                    names: creatorNames
                };
            }
            
            // Fallback: Check if there's creator info in credits crew
            const crew = movieData?.credits?.crew || [];
            const originalCreators = crew.filter(person => 
                person.job === 'Creator' || 
                person.job === 'Original Creator' || 
                person.job === 'Comic Book Creator' ||
                person.job === 'Story' ||
                person.job === 'Novel' ||
                person.job === 'Original Story' ||
                person.job === 'Webtoon Creator' ||
                person.job === 'Manga Creator' ||           
                person.job === 'Author' ||                  
                person.job === 'Original Work' ||           
                person.job === 'Source Material' ||         
                person.job === 'Writer' ||                  
                person.job === 'Original Concept' ||   
                person.job === 'Story' ||
                person.job === 'Series Composition' ||  // Common role in anime
                person.department === 'Writing' ||
                person.job === 'Series Creator'
            );
            
            if (originalCreators.length > 0) {
                const creatorNames = originalCreators.map(creator => creator.name).join(', ');
                return {
                    label: originalCreators.length > 1 ? 'Creators' : 'Creator',
                    names: creatorNames
                };
            }
            return null;
        } else {
            // For movies, get directors from credits
            const crew = movieData?.credits?.crew || [];
            const directors = crew.filter(person => person.job === 'Director');
            if (directors.length > 0) {
                const directorNames = directors.map(director => director.name).join(', ');
                return {
                    label: directors.length > 1 ? 'Directors' : 'Director',
                    names: directorNames
                };
            }
            return null;
        }
    };

    // Get top 3 main characters based on TMDB order
    const getTopCast = () => {
        const cast = movieData?.credits?.cast || [];
        
        // Add debugging to see what we're getting
        console.log('🎭 Total cast members:', cast.length);
        console.log('🎭 First 10 cast members:', cast.slice(0, 10));
        
        return cast
            .filter(person => person.name && person.id) // Remove invalid entries
            .sort((a, b) => {
                // Properly handle order: 0 (main characters often have order: 0)
                const orderA = typeof a.order === 'number' ? a.order : 999;
                const orderB = typeof b.order === 'number' ? b.order : 999;
                return orderA - orderB; // Lower order = more important character
            })
            .slice(0, 3); // Show only top 3 main characters
    };

    // Get production info based on content type - ONLY show the specific info for each type
    const getProductionInfo = () => {
        if (!movieData) return null;

        // Detect if it's anime (TV show with Japanese origin and animation genre)
        const isAnime = isTV && 
            movieData.original_language === 'ja' && 
            movieData.genres?.some(genre => genre.name === 'Animation');

        if (!isTV) {
            // For movies: Show production (shortened from "Production Company")
            if (movieData.production_companies && movieData.production_companies.length > 0) {
                return {
                    label: 'Production',
                    name: movieData.production_companies[0].name
                };
            }
        } else if (isAnime) {
            // For anime: Show studio (from production companies)
            if (movieData.production_companies && movieData.production_companies.length > 0) {
                return {
                    label: 'Studio',
                    name: movieData.production_companies[0].name
                };
            }
        } else {
            // For regular TV shows: Show primary/current network
            if (movieData.networks && movieData.networks.length > 0) {
                // Prioritize major streaming platforms and current networks
                const primaryNetworks = [
                    'Netflix', 'Amazon Prime Video', 'Prime Video', 'Disney+', 'Disney Plus',
                    'HBO', 'HBO Max', 'Max', 'Apple TV+', 'Apple TV Plus',
                    'Hulu', 'Paramount+', 'Paramount Plus', 'Peacock', 'Showtime'
                ];
                
                // Look for a primary streaming platform first
                const primaryNetwork = movieData.networks.find(network => 
                    primaryNetworks.some(primary => 
                        network.name.toLowerCase().includes(primary.toLowerCase()) ||
                        primary.toLowerCase().includes(network.name.toLowerCase())
                    )
                );
                
                if (primaryNetwork) {
                    return {
                        label: 'Network',
                        name: primaryNetwork.name
                    };
                }
                
                // Fallback to first network if no primary platform found
                return {
                    label: 'Network',
                    name: movieData.networks[0].name
                };
            }
        }
        
        return null;
    };

    // Loading state
    if (loading) {
        return (
            <div className="relative -mx-4 md:-mx-8">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center">
                        <div className="text-white text-lg">Loading cast...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Error handling
    if (error || !movieData) {
        return null;
    }

    const creatorsOrDirectors = getCreatorsOrDirectors();
    const topCast = getTopCast();
    const productionInfo = getProductionInfo();

    // Don't render if no people data
    if (!creatorsOrDirectors && (!topCast || topCast.length === 0) && !productionInfo) {
        return null;
    }

    return (
        <div className="relative -mx-4 md:-mx-8">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop Layout - StreamingProviders on the right */}
                <div className="hidden xl:flex xl:items-start xl:gap-17">
                    {/* LEFT SIDE - People Info */}
                    <div className="max-w-4xl flex-1">
                        {/* CREATORS/DIRECTORS SECTION */}
                        {creatorsOrDirectors && (
                            <>
                                <div className="text-white text-base leading-relaxed mb-3">
                                    <span className="text-white font-bold">{creatorsOrDirectors.label}:</span>{' '}
                                    <span className="text-white font-normal text-base">{creatorsOrDirectors.names}</span>
                                </div>
                                <div className="border-t border-gray-600 max-w-4xl mb-3"></div>
                            </>
                        )}
                        {/* CAST SECTION */}
                        {topCast && topCast.length > 0 && (
                            <>
                                <div className="text-white text-base leading-relaxed mb-3">
                                    <span className="text-white font-bold">Cast:</span>{' '}
                                    {topCast.map((person, index) => (
                                        <span key={person.id}>
                                            <span className="text-white font-normal text-base">{person.name}</span>
                                            <span className="text-gray-400 text-base"> ({person.character?.split('(')[0].trim() || 'Unknown Character'})</span>
                                            {index < topCast.length - 1 && <span className="text-white"> • </span>}
                                        </span>
                                    ))}
                                </div>
                                <div className="border-t border-gray-600 max-w-4xl mb-3"></div>
                            </>
                        )}
                        {/* PRODUCTION INFO SECTION */}
                        {productionInfo && (
                            <div className="text-white text-base leading-relaxed mb-3">
                                <span className="text-white font-bold">{productionInfo.label}:</span>{' '}
                                <span className="text-white font-normal text-base">{productionInfo.name}</span>
                            </div>
                        )}
                    </div>
                    {/* RIGHT SIDE - Streaming Providers (Desktop only) */}
                    <div className="flex-shrink-0 w-59">
                        <StreamingProviders movieData={movieData} isTV={isTV} />
                    </div>
                </div>

                {/* iPad Horizontal Layout - StreamingProviders underneath */}
                <div className="hidden lg:block xl:hidden">
                    {/* PEOPLE INFO SECTION */}
                    <div className="max-w-4xl">
                        {/* CREATORS/DIRECTORS SECTION */}
                        {creatorsOrDirectors && (
                            <>
                                <div className="text-white text-base leading-relaxed mb-3">
                                    <span className="text-white font-bold">{creatorsOrDirectors.label}:</span>{' '}
                                    <span className="text-white font-normal text-base">{creatorsOrDirectors.names}</span>
                                </div>
                                <div className="border-t border-gray-600 max-w-4xl mb-3"></div>
                            </>
                        )}
                        {/* CAST SECTION */}
                        {topCast && topCast.length > 0 && (
                            <>
                                <div className="text-white text-base leading-relaxed mb-3">
                                    <span className="text-white font-bold">Cast:</span>{' '}
                                    {topCast.map((person, index) => (
                                        <span key={person.id}>
                                            <span className="text-white font-normal text-base">{person.name}</span>
                                            <span className="text-gray-400 text-base"> ({person.character?.split('(')[0].trim() || 'Unknown Character'})</span>
                                            {index < topCast.length - 1 && <span className="text-white"> • </span>}
                                        </span>
                                    ))}
                                </div>
                                <div className="border-t border-gray-600 max-w-4xl mb-3"></div>
                            </>
                        )}
                        {/* PRODUCTION INFO SECTION */}
                        {productionInfo && (
                            <div className="text-white text-base leading-relaxed mb-3">
                                <span className="text-white font-bold">{productionInfo.label}:</span>{' '}
                                <span className="text-white font-normal text-base">{productionInfo.name}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* STREAMING PROVIDERS SECTION - Underneath people content for iPad horizontal */}
                    <div className="mt-32">
                        <StreamingProviders movieData={movieData} isTV={isTV} />
                    </div>
                </div>

                {/* Mobile/Tablet Layout */}
                <div className="lg:hidden">
                    <div className="max-w-4xl">
                        {/* CREATORS/DIRECTORS SECTION */}
                        {creatorsOrDirectors && (
                            <div className="text-white text-sm leading-relaxed mb-3">
                                <span className="text-white font-bold">{creatorsOrDirectors.label}:</span>{' '}
                                <span className="text-white font-normal text-sm">{creatorsOrDirectors.names}</span>
                            </div>
                        )}
                        {/* CAST SECTION */}
                        {topCast && topCast.length > 0 && (
                            <div className="text-white text-sm leading-relaxed mb-3">
                                <span className="text-white font-bold">Cast:</span>{' '}
                                {topCast.map((person, index) => (
                                    <span key={person.id}>
                                        <span className="text-white font-normal text-sm">{person.name}</span>
                                        <span className="text-gray-400 text-sm"> ({person.character?.split('(')[0].trim() || 'Unknown Character'})</span>
                                        {index < topCast.length - 1 && <span className="text-white"> • </span>}
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* PRODUCTION INFO SECTION */}
                        {productionInfo && (
                            <div className="text-white text-sm leading-relaxed mb-3">
                                <span className="text-white font-bold">{productionInfo.label}:</span>{' '}
                                <span className="text-white font-normal text-sm">{productionInfo.name}</span>
                            </div>
                        )}
                    </div>
                    {/* Streaming Providers (Mobile/Tablet) */}
                    <div className="mt-15">
                        <StreamingProviders movieData={movieData} isTV={isTV} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PeopleSection;