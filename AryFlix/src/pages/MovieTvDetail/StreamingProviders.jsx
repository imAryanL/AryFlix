import React from 'react';

const StreamingProviders = ({ movieData, isTV, mobile = false }) => {
    // Get streaming providers for US region
    const getStreamingProviders = () => {
        if (!movieData?.['watch/providers']?.results?.US) return null;
        
        const usProviders = movieData['watch/providers'].results.US;
        
        const streamingProviders = usProviders.flatrate || [];
        const rentProviders = usProviders.rent || [];
        const buyProviders = usProviders.buy || [];
        
        // Simple function to clean up provider names and remove duplicates
        const cleanProviders = (providers) => {
            const seen = new Set();
            const unique = [];
            
            for (const provider of providers) {
                const cleanName = provider.provider_name
                    .toLowerCase()
                    .replace(/amazon channel.*$/i, '')
                    .replace(/with ads.*$/i, '')
                    .replace(/standard.*$/i, '')
                    .replace(/premium.*$/i, '')
                    .replace(/roku.*$/i, '')
                    .trim();
                
                if (!seen.has(cleanName)) {
                    seen.add(cleanName);
                    unique.push({
                        ...provider,
                        provider_name: provider.provider_name
                            .replace(/Amazon Channel.*$/i, '')
                            .replace(/Standard with Ads/i, '')
                            .replace(/with Ads/i, '')
                            .replace(/Premium/i, '')
                            .replace(/Roku.*$/i, '')
                            .trim()
                    });
                }
            }
            
            return unique;
        };
        
        return {
            streaming: cleanProviders(streamingProviders),
            rent: cleanProviders(rentProviders),
            buy: cleanProviders(buyProviders)
        };
    };

    // Check if movie is currently in theaters OR coming to theaters soon
    const getTheaterStatus = () => {
        if (isTV) return null;
        
        if (!movieData?.release_date) return null;
        
        const releaseDate = new Date(movieData.release_date);
        const now = new Date();
        const daysSinceRelease = (now - releaseDate) / (1000 * 60 * 60 * 24);
        
        // Movie is currently in theaters (released 0-90 days ago)
        if (daysSinceRelease >= 0 && daysSinceRelease <= 90) {
            return {
                type: 'in_theaters',
                message: 'Currently In Theaters'
            };
        }
        
        // Movie is coming to theaters (releasing within next 180 days)
        if (daysSinceRelease < 0 && daysSinceRelease >= -180) {
            return {
                type: 'coming_soon',
                message: 'Coming to Theaters',
                releaseDate: releaseDate
            };
        }
        
        return null;
    };

    // Single provider component with reduced padding
    const SingleProvider = ({ provider, title, bgColor, totalCount, textColor = "text-white" }) => {
        if (!provider) return null;
        
        // Determine font size based on name length
        const getNameFontSize = (name) => {
            if (name.length > 15) return "text-xs";
            if (name.length > 12) return "text-sm";
            return "text-sm";
        };
        
        return (
            <div className={`${bgColor} rounded-xl py-3 px-4 text-center transition-all duration-300 shadow-xl border border-gray-700/50`}>
                <div className={`text-base ${textColor} font-bold tracking-wide mb-3`}>
                    {title}
                </div>
                
                <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <div className="flex-shrink-0">
                        <img 
                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                            alt={provider.provider_name}
                            className="w-10 h-10 rounded-lg shadow-md"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                    <span className={`${textColor} ${getNameFontSize(provider.provider_name)} font-bold leading-tight break-words`}>
                        {provider.provider_name}
                    </span>
                </div>
            </div>
        );
    };

    // Don't render if no movie data
    if (!movieData) {
        return null;
    }

    const providers = getStreamingProviders();
    const theaterStatus = getTheaterStatus();

    // Don't render if no providers and not in/coming to theaters
    if (!providers && !theaterStatus) {
        return null;
    }

    // Combine rent and buy providers for display
    const rentBuyProviders = providers ? [...(providers.rent || []), ...(providers.buy || [])] : [];
    
    // Remove duplicates from rent/buy
    const uniqueRentBuy = rentBuyProviders.filter((provider, index, self) => 
        index === self.findIndex(p => p.provider_id === provider.provider_id)
    );

    // MOBILE LAYOUT
    if (mobile) {
        return (
            <div className="space-y-3 mb-6 mt-6"> {/* Added mt-6 for more spacing from previous section */}
                {/* Theater Status - Mobile */}
                {theaterStatus && (
                    <div className="bg-[#393841] rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-sm mb-2">
                            {theaterStatus.message}
                        </div>
                        {theaterStatus.type === 'in_theaters' ? (
                            <button
                                onClick={() => {
                                    const fandangoUrl = `https://www.fandango.com/search/?q=${encodeURIComponent(movieData.title || movieData.name)}`;
                                    window.open(fandangoUrl, '_blank', 'noopener,noreferrer');
                                }}
                                className="bg-[#E91E63] hover:bg-[#F06292] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                🎫 Get Tickets
                            </button>
                        ) : (
                            <div className="text-gray-300 text-sm">
                                {theaterStatus.releaseDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Streaming Providers - Mobile */}
                {providers && (
                    <>
                        {providers.streaming && providers.streaming.length > 0 && (
                            <div className="bg-[#393841] rounded-lg p-3 text-center">
                                <div className="text-white font-bold text-sm mb-2">Streaming On</div>
                                <div className="flex items-center justify-center gap-2">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/original${providers.streaming[0].logo_path}`}
                                        alt={providers.streaming[0].provider_name}
                                        className="w-8 h-8 rounded-lg"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span className="text-white text-sm font-bold">
                                        {providers.streaming[0].provider_name}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {uniqueRentBuy.length > 0 && (
                            <div className="bg-[#393841] rounded-lg p-3 text-center">
                                <div className="text-white font-bold text-sm mb-2">Rent or Buy</div>
                                <div className="flex items-center justify-center gap-2">
                                    <img 
                                        src={`https://image.tmdb.org/t/p/original${uniqueRentBuy[0].logo_path}`}
                                        alt={uniqueRentBuy[0].provider_name}
                                        className="w-8 h-8 rounded-lg"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span className="text-white text-sm font-bold">
                                        {uniqueRentBuy[0].provider_name}
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    // DESKTOP LAYOUT (keep existing)
    return (
        <div className="w-70 lg:w-70 -mt-8 lg:-mt-22">
            <div className="space-y-3">
                {/* Theater Section - Current or Coming Soon */}
                {theaterStatus && (
                    <div className="bg-[#393841] rounded-xl py-2 px-4 text-center transition-all duration-300 shadow-xl border border-gray-700/50">
                        <div className="text-base text-white font-bold tracking-wide mb-2">
                            {theaterStatus.message}
                        </div>
                        
                        {theaterStatus.type === 'in_theaters' ? (
                            // Currently in theaters - Compact with "Find Showtimes"
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="text-white text-sm font-semibold">
                                    Find Showtimes
                                </div>
                                
                                <div className="w-full">
                                    <a 
                                        href={`https://www.fandango.com/search/?q=${encodeURIComponent(movieData.title || movieData.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-lg py-2 px-3 transition-all duration-300 w-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                    >
                                        <img 
                                            src="/fandango-icon.jpeg"
                                            alt="Fandango"
                                            className="w-6 h-6 object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <span className="text-white text-sm font-bold">
                                            Get Tickets
                                        </span>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            // Coming to theaters - Compact version
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="text-white text-sm font-semibold">
                                    {theaterStatus.releaseDate.toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                                
                                <div className="w-full">
                                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg py-2 px-3 w-full shadow-lg">
                                        <span className="text-white text-xs font-bold">
                                            Tickets Not Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Streaming Section - Show only first provider */}
                <SingleProvider 
                    provider={providers?.streaming?.[0]}
                    title="Streaming On"
                    bgColor="bg-[#393841]"
                    totalCount={providers?.streaming?.length || 0}
                />

                {/* Rent/Buy Section - Show only first provider */}
                <SingleProvider 
                    provider={uniqueRentBuy[0]}
                    title="Rent or Buy"
                    bgColor="bg-[#393841]"
                    totalCount={uniqueRentBuy.length}
                />
            </div>
        </div>
    );
};

export default StreamingProviders;