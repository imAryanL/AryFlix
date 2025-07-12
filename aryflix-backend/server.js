// Load environment variables from .env file into process.env
// This must be at the top before any other imports that might use env variables
require('dotenv').config();

// Import Express framework - the main web server library
const express = require('express');
// Import CORS middleware - allows cross-origin requests (React app to backend)
const cors = require('cors');

// Import TMDB API functions for trending Movie/TV Data
const { getTrendingMovies, getTrendingTVShows, getNowPlayingMovies, getPopularTVShows, getUpcomingMovies, 
    getUpcomingTVShows, getTrendingAnime, getNetflixContent, getPrimeVideoContent, getDisneyPlusContent, 
    getMaxContent, getAppleTVContent, getStreamingProviderLogos, getMovieDetails, getTVDetails,
    getMovieDetailsWithTrailer, getTVDetailsWithTrailer, getWatchAtHomeContent } = require('./tmdbAPI');

// Import OMDb API functions for ratings
const { getRatingsByImdbId, getRatingsByTitle } = require('./omdbApi');

// Import auth security middleware
const { requireAuth } = require('./authSecurity');

// Import supabase client
const { supabase, supabaseAdmin, verifyUser } = require('./supabaseClient');

// Create an Express application instance - this is your web server
const app = express();
// Set the port number - use PORT from .env file, or default to 5000
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes - allows your React app (localhost:5173) to make requests to this backend (localhost:5000)
app.use(cors());
// Enable JSON parsing middleware - allows the server to understand JSON data in request bodies
app.use(express.json());

// Define a GET route at '/api' endpoint
// When someone visits http://localhost:5000/api, this function runs
app.get('/api', (req, res) => {
  // Send back a JSON response with a success message
  res.json({ message: 'AryFlix API is working!' });
});


// Route to get trending movies for Hero Section
// Get request to http://localhost:5000/api/movies/trending
app.get('/api/movies/trending', async(req, res) => {
    try {
        // Call TMDB function to get trending movies
        const movies = await getTrendingMovies();
        // Send the movies data back to the client
        res.json({success: true, data: movies});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for trending movies', error.message);
        res.status(500).json({success: false, error: 'Failed to fetch trending movies'});
    }
});

//  Route to get trending TV shows for Hero Section
// Get request to http://localhost:5000/api/tv/trending
app.get('/api/tv/trending', async (req, res) => {
    try {
        // Call our TMDB function to get trending TV shows
        const tvShows = await getTrendingTVShows();
        // Send TV shows data back to the client
        res.json({ success: true, data: tvShows});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for trending TV shows', error.message);
        res.status(500).json({success: false, error: 'Failed to fetch trending TV shows'});
    }
});



// Route to get movies playing in theatres
// Get request to http://localhost:5000/api/movies/now-playing
app.get('/api/movies/now-playing', async (req, res) => {
    try {
        // Call our TMDB function to get now playing movies in theatres
        const nowPlayingMovies = await getNowPlayingMovies();
        // Send the movies data back to the client
        res.json({success: true, data: nowPlayingMovies});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for now playing movies', error.message);

        // Send a 500 status code and error message
        res.status(500).json({
            success: false,
            error: 'Failed to fetch now playing movies'
        })
    }
})


// Route to get popular TV shows for "Watch At Home" section
// Get request to http://localhost:5000/api/tv/popular
app.get('/api/tv/popular', async (req, res) => {
    try {
        // Call our TMDB function to get popular TV shows
        const popularTVShows = await getPopularTVShows();
        // Send TV shows data back to the client
        res.json({ success: true, data: popularTVShows});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for popular TV shows', error.message);
        res.status(500).json({success: false, error: 'Failed to fetch popular TV shows'});
    }
});



// Route to get upcoming movies for "Coming Soon to Theatres" section
// Get request to http://localhost:5000/api/movies/upcoming
app.get('/api/movies/upcoming', async (req, res) => {
    try {
        // Call our TMDB function to get upcoming movies
        const upcomingMovies = await getUpcomingMovies();
        // Send the movies data back to the client
        res.json({success: true, data: upcomingMovies});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for upcoming movies', error.message);

        // Send a 500 status code and error message
        res.status(500).json({
            success: false,
            error: 'Failed to fetch upcoming movies'
        });
    }
});

// Route to get upcoming TV shows for "New & Upcoming Shows" section
// Get request to http://localhost:5000/api/tv/upcoming
app.get('/api/tv/upcoming', async (req, res) => {
    try {
        // Call our TMDB function to get upcoming TV shows
        const upcomingTVShows = await getUpcomingTVShows();
        // Send TV shows data back to the client
        res.json({success: true, data: upcomingTVShows});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for upcoming TV shows', error.message);
        res.status(500).json({success: false, error: 'Failed to fetch upcoming TV shows'});
    }
});

// Route to get trending anime for "Trending Anime" section  
// Get request to http://localhost:5000/api/anime/trending
app.get('/api/anime/trending', async (req, res) => {
    try {
        // Call our TMDB function to get trending anime
        const trendingAnime = await getTrendingAnime();
        // Send anime data back to the client
        res.json({success: true, data: trendingAnime});
    } catch (error) {
        // If something goes wrong, send an error response
        console.error('Error for trending anime', error.message);
        res.status(500).json({success: false, error: 'Failed to fetch trending anime'});
    }
});





// Route to get streaming provider logos
// GET request to http://localhost:5000/api/streaming/logos
app.get('/api/streaming/logos', async (req, res) => {
    try {
        // Call our TMDB function to get provider logos
        const logos = await getStreamingProviderLogos();
        // Send logos data back to client
        res.json({success: true, data: logos});
    } catch (error) {
        console.error('Error for streaming provider logos:', error.message);
        res.status(500).json({
            success: false, 
            error: 'Failed to fetch streaming provider logos'
        });
    }
});



// Single route to handle ALL streaming platforms
// Get request to http://localhost:5000/api/streaming/:platform
// Examples: /api/streaming/netflix, /api/streaming/prime, etc.
app.get('/api/streaming/:platform', async (req, res) => {
    try {
        const { platform } = req.params; // Extract platform from URL
        
        // Map platform names to functions
        const platformFunctions = {
            'netflix': getNetflixContent,
            'prime': getPrimeVideoContent,
            'disney': getDisneyPlusContent,
            'max': getMaxContent,
            'appletv': getAppleTVContent
        };
        
        // Check if platform is valid
        if (!platformFunctions[platform]) {
            return res.status(400).json({
                success: false, 
                error: `Invalid platform: ${platform}. Valid options: netflix, prime, disney, max, appletv`
            });
        }
        
        // Call the appropriate function
        const content = await platformFunctions[platform]();
        
        // Send data back to client
        res.json({success: true, data: content});
    } catch (error) {
        console.error(`Error for ${req.params.platform} content:`, error.message);
        res.status(500).json({
            success: false, 
            error: `Failed to fetch ${req.params.platform} content`
        });
    }
});



// Route to get detailed information for a specific movie (with OMDb ratings)
// GET request to http://localhost:5000/api/movies/:id
app.get('/api/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate movie ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid movie ID provided'
            });
        }
        
        // Call our TMDB function to get movie details
        const movieDetails = await getMovieDetails(id);
        
        // Try to get OMDb ratings using IMDb ID if available
        let omdbRatings = { imdb: null, rottenTomatoes: null };
        
        if (movieDetails.imdb_id) {
            console.log(`🎬 Fetching OMDb ratings for movie: ${movieDetails.title}`);
            omdbRatings = await getRatingsByImdbId(movieDetails.imdb_id);
        } else if (movieDetails.title && movieDetails.release_date) {
            // Fallback to title + year search if no IMDb ID
            const year = new Date(movieDetails.release_date).getFullYear();
            console.log(`🎬 Fetching OMDb ratings by title: ${movieDetails.title} (${year})`);
            omdbRatings = await getRatingsByTitle(movieDetails.title, year);
        }
        
        // Combine TMDB data with OMDb ratings
        const responseData = {
            ...movieDetails,
            omdb_ratings: omdbRatings
        };
        
        // Send movie details with ratings back to client
        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error for movie details:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch movie details'
        });
    }
});



// Route to get detailed information for a specific TV show (with OMDb ratings)
// GET request to http://localhost:5000/api/tv/:id
app.get('/api/tv/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate TV show ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid TV show ID provided'
            });
        }
        
        // Call our TMDB function to get TV show details
        const tvDetails = await getTVDetails(id);
        
        // Try to get OMDb ratings using title + first air date year
        let omdbRatings = { imdb: null, rottenTomatoes: null };
        
        if (tvDetails.name && tvDetails.first_air_date) {
            const year = new Date(tvDetails.first_air_date).getFullYear();
            console.log(`📺 Fetching OMDb ratings for TV show: ${tvDetails.name} (${year})`);
            omdbRatings = await getRatingsByTitle(tvDetails.name, year);
        }
        
        // Combine TMDB data with OMDb ratings
        const responseData = {
            ...tvDetails,
            omdb_ratings: omdbRatings
        };
        
        // Send TV show details with ratings back to client
        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error for TV show details:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch TV show details'
        });
    }
});



// Route to get detailed movie information WITH enhanced trailer
// GET request to http://localhost:5000/api/movies/:id/trailer
app.get('/api/movies/:id/trailer', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate movie ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid movie ID provided'
            });
        }
        
        // Call our enhanced TMDB function to get movie details with trailer
        const movieDetails = await getMovieDetailsWithTrailer(id);
        
        // Try to get OMDb ratings using IMDb ID if available
        let omdbRatings = { imdb: null, rottenTomatoes: null };
        
        if (movieDetails.imdb_id) {
            console.log(`🎬 Fetching OMDb ratings for movie: ${movieDetails.title}`);
            omdbRatings = await getRatingsByImdbId(movieDetails.imdb_id);
        } else if (movieDetails.title && movieDetails.release_date) {
            // Fallback to title + year search if no IMDb ID
            const year = new Date(movieDetails.release_date).getFullYear();
            console.log(`🎬 Fetching OMDb ratings by title: ${movieDetails.title} (${year})`);
            omdbRatings = await getRatingsByTitle(movieDetails.title, year);
        }
        
        // Combine TMDB data with OMDb ratings
        const responseData = {
            ...movieDetails,
            omdb_ratings: omdbRatings
        };
        
        // Send movie details with enhanced trailer back to client
        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error for movie details with trailer:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch movie details with trailer'
        });
    }
});


// Route to get detailed TV show information WITH enhanced trailer
// GET request to http://localhost:5000/api/tv/:id/trailer
app.get('/api/tv/:id/trailer', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate TV show ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid TV show ID provided'
            });
        }
        
        // Call our enhanced TMDB function to get TV show details with trailer
        const tvDetails = await getTVDetailsWithTrailer(id);
        
        // Try to get OMDb ratings using title + first air date year
        let omdbRatings = { imdb: null, rottenTomatoes: null };
        
        if (tvDetails.name && tvDetails.first_air_date) {
            const year = new Date(tvDetails.first_air_date).getFullYear();
            console.log(`📺 Fetching OMDb ratings for TV show: ${tvDetails.name} (${year})`);
            omdbRatings = await getRatingsByTitle(tvDetails.name, year);
        }
        
        // Combine TMDB data with OMDb ratings
        const responseData = {
            ...tvDetails,
            omdb_ratings: omdbRatings
        };
        
        // Send TV show details with enhanced trailer back to client
        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error for TV show details with trailer:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch TV show details with trailer'
        });
    }
});

// Add this route:
app.get('/api/watch-at-home', async (req, res) => {
    try {
        const content = await getWatchAtHomeContent();
        res.json({ success: true, data: content });
    } catch (error) {
        console.error('Error for Watch At Home content', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch Watch At Home content' });
    }
});







// ===============================================
// USER AUTHENTICATION ROUTES - Protected Routes
// ===============================================

// Get user's watchlist (protected route)
app.get('/api/watchlist', requireAuth, async (req, res) => {
    try {
        console.log(`📋 Getting watchlist for user: ${req.user.id}`);
        
        // Get watchlist from Supabase for this specific user
        const { data, error } = await supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', req.user.id);
        
        if (error) {
            throw error;
        }
        
        res.json({ success: true, data: data });
    } catch (error) {
        console.error('Error getting watchlist:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get watchlist' 
        });
    }
});

// Add item to watchlist (protected route)
app.post('/api/watchlist', requireAuth, async (req, res) => {
    try {
        const { media_id, media_type } = req.body;
        console.log(`➕ Adding to watchlist: ${media_type} ${media_id} for user ${req.user.id}`);
        
        // Add to Supabase watchlist table
        const { data, error } = await supabase
            .from('watchlist')
            .insert([{
                user_id: req.user.id,
                media_id: media_id,
                media_type: media_type
            }]);
        
        if (error) {
            throw error;
        }
        
        res.json({ success: true, message: 'Added to watchlist!' });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to add to watchlist' 
        });
    }
});

// Remove item from watchlist (protected route)
app.delete('/api/watchlist/:media_id', requireAuth, async (req, res) => {
    try {
        const { media_id } = req.params;
        console.log(`➖ Removing from watchlist: ${media_id} for user ${req.user.id}`);
        
        // Remove from Supabase watchlist table
        const { error } = await supabase
            .from('watchlist')
            .delete()
            .eq('user_id', req.user.id)
            .eq('media_id', media_id);
        
        if (error) {
            throw error;
        }
        
        res.json({ success: true, message: 'Removed from watchlist!' });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to remove from watchlist' 
        });
    }
});

// ===============================================
// RATING ROUTES - Protected Routes
// ===============================================

// Get user's rating for a specific movie/TV show (protected route)
app.get('/api/ratings/:media_id', requireAuth, async (req, res) => {
    try {
        const { media_id } = req.params;
        console.log(`⭐ Getting rating for media ${media_id} by user: ${req.user.id}`);
        
        // Use supabaseAdmin to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('media_id', media_id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        res.json({ 
            success: true, 
            data: data || null,
            hasRating: !!data 
        });
    } catch (error) {
        console.error('Error getting user rating:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get user rating' 
        });
    }
});

app.post('/api/ratings', requireAuth, async (req, res) => {
    try {
        const { media_id, media_type, rating } = req.body;
        
        if (!media_id || !media_type || !rating) {
            return res.status(400).json({
                success: false,
                error: 'media_id, media_type, and rating are required'
            });
        }
        
        if (rating < 1 || rating > 10) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 10'
            });
        }
        
        console.log(`⭐ Submitting rating: ${rating}/10 for ${media_type} ${media_id} by user ${req.user.id}`);
        
        // Use supabaseAdmin to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .upsert([{
                user_id: req.user.id,
                media_id: media_id,
                media_type: media_type,
                rating: rating,
                updated_at: new Date().toISOString()
            }], {
                onConflict: 'user_id,media_id'
            });
        
        if (error) {
            throw error;
        }
        
        res.json({ 
            success: true, 
            message: 'Rating submitted successfully!',
            data: data
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to submit rating' 
        });
    }
});

app.get('/api/ratings/:media_id/average', async (req, res) => {
    try {
        const { media_id } = req.params;
        console.log(`📊 Getting average rating for media ${media_id}`);
        
        // Use supabaseAdmin for consistency
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .select('rating')
            .eq('media_id', media_id);
        
        if (error) {
            throw error;
        }
        
        if (data && data.length > 0) {
            const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
            const averageRating = totalRating / data.length;
            
            res.json({
                success: true,
                data: {
                    average: Math.round(averageRating * 10) / 10,
                    count: data.length
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    average: null,
                    count: 0
                }
            });
        }
    } catch (error) {
        console.error('Error getting average rating:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get average rating' 
        });
    }
});

// Route to check if username is available
// POST request to http://localhost:5000/api/auth/check-username
app.post('/api/auth/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Basic validation
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }
    
    // Use RPC (Remote Procedure Call) to check username in auth.users table
    const { data, error } = await supabase.rpc('check_username_exists', {
      username_to_check: username
    });
    
    if (error) {
      console.error('Username check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check username availability'
      });
    }
    
    // Return whether username is available
    res.json({
      success: true,
      available: !data, // If data is null/false, username is available
      message: data ? 'Username is already taken' : 'Username is available'
    });
    
  } catch (error) {
    console.error('Username validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking username'
    });
  }
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message to console when server successfully starts
  console.log(`Server running on port ${PORT}`);
  console.log(`📍 Test API: http://localhost:${PORT}/api`);
  console.log(`🎬 Trending Movies: http://localhost:${PORT}/api/movies/trending`);
  console.log(`📺 Trending TV: http://localhost:${PORT}/api/tv/trending`);
  console.log(`🎥 Now Playing Movies: http://localhost:${PORT}/api/movies/now-playing`);
  console.log(`📺 Popular TV Shows: http://localhost:${PORT}/api/tv/popular`);
  console.log(`🎬 Upcoming Movies: http://localhost:${PORT}/api/movies/upcoming`);
  console.log(`📺 Upcoming TV Shows: http://localhost:${PORT}/api/tv/upcoming`);
  console.log(`🎌 Trending Anime: http://localhost:${PORT}/api/anime/trending`);
  console.log(`🎬 Movie Details: http://localhost:${PORT}/api/movies/:id`);
  console.log(`📺 TV Details: http://localhost:${PORT}/api/tv/:id`);
  console.log(`🎬 Movie Details + Enhanced Trailer: http://localhost:${PORT}/api/movies/:id/trailer`);
  console.log(`📺 TV + Enhanced Trailer: http://localhost:${PORT}/api/tv/:id/trailer`);
  console.log(`📺 Streaming Platforms: http://localhost:${PORT}/api/streaming/:platform`);
  console.log(`🎯 Streaming Logos: http://localhost:${PORT}/api/streaming/logos`);
  console.log(`   🔴 Netflix: http://localhost:${PORT}/api/streaming/netflix`);
  console.log(`   📦 Prime Video: http://localhost:${PORT}/api/streaming/prime`);
  console.log(`   🏰 Disney+: http://localhost:${PORT}/api/streaming/disney`);
  console.log(`   🎭 Max: http://localhost:${PORT}/api/streaming/max`);
  console.log(`   🍎 Apple TV+: http://localhost:${PORT}/api/streaming/appletv`);
  console.log(`⭐ User Ratings: http://localhost:${PORT}/api/ratings/:media_id`);
  console.log(`⭐ Submit Rating: POST http://localhost:${PORT}/api/ratings`);
  console.log(`📊 Average Rating: http://localhost:${PORT}/api/ratings/:media_id/average`);
});


