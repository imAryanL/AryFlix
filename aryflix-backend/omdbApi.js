// Import axios for making HTTP requests to OMDb API
const axios = require('axios');

// Get OMDb API key from .env file
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Base URL for OMDb API requests
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Create axios instance with default configuration for OMDb
const omdbApi = axios.create({
    baseURL: OMDB_BASE_URL,
    timeout: 8000, // 8 second timeout
});

/**
 * Get ratings from OMDb with smart fallback
 */
const getOMDbRatings = async (title, year, imdbId = null) => {
    try {
        // Strategy 1: Try IMDb ID first (most accurate)
        if (imdbId) {
            const idResult = await searchByImdbId(imdbId);
            if (idResult.imdb || idResult.rottenTomatoes) {
                return idResult;
            }
        }
        
        // Strategy 2: Try title + year
        if (title && year) {
            const titleResult = await searchByTitleYear(title, year);
            if (titleResult.imdb || titleResult.rottenTomatoes) {
                return titleResult;
            }
        }
        
        // No results found
        return { imdb: null, rottenTomatoes: null };
        
    } catch (error) {
        console.error('OMDb API Error:', error.message);
        return { imdb: null, rottenTomatoes: null };
    }
};

// Helper function to search by IMDb ID
const searchByImdbId = async (imdbId) => {
    try {
        const response = await omdbApi.get('/', {
            params: { apikey: OMDB_API_KEY, i: imdbId }
        });
        
        if (response.data.Response === 'False') {
            return { imdb: null, rottenTomatoes: null };
        }
        
        return extractRatingsSimple(response.data.Ratings || []);
    } catch (error) {
        return { imdb: null, rottenTomatoes: null };
    }
};

// Helper function to search by title and year
const searchByTitleYear = async (title, year) => {
    try {
        const response = await omdbApi.get('/', {
            params: { apikey: OMDB_API_KEY, t: title, y: year }
        });
        
        if (response.data.Response === 'False') {
            return { imdb: null, rottenTomatoes: null };
        }
        
        return extractRatingsSimple(response.data.Ratings || []);
    } catch (error) {
        return { imdb: null, rottenTomatoes: null };
    }
};

// Extract ratings - Only IMDb and Rotten Tomatoes 
const extractRatingsSimple = (ratingsArray) => {
    let imdb = null;
    let rottenTomatoes = null;
    
    for (const rating of ratingsArray) {
        const source = rating.Source;
        const value = rating.Value;
        
        if (source === 'Internet Movie Database') {
            imdb = parseFloat(value.split('/')[0]);
        }
        
        if (source === 'Rotten Tomatoes') {
            rottenTomatoes = parseInt(value.replace('%', ''));
        }
    }
    
    return { imdb, rottenTomatoes };
};

// Helper functions for easy use
const getRatingsByImdbId = async (imdbId) => {
    return await getOMDbRatings(null, null, imdbId);
};

const getRatingsByTitle = async (title, year) => {
    return await getOMDbRatings(title, year);
};

module.exports = {
    getOMDbRatings,
    getRatingsByImdbId,
    getRatingsByTitle
};