import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import MovieTvDetail from './pages/MovieTvDetail/MovieTvDetail';
import SearchResults from './pages/SearchResults/SearchResults';
import Filter from './pages/Filter/Filter';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Watchlist from './pages/Watchlist/Watchlist';
import Ratings from './pages/Ratings/Ratings';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Watchlist Context - shares watchlist data across all components
import { WatchlistProvider } from './contexts/WatchlistContext';
import { RatingProvider } from './contexts/RatingContext';

function App() {
  const location = useLocation();
  
  // Check if we're on a detail page
  const isDetailPage = location.pathname.includes('/movie/') || location.pathname.includes('/tv/');
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  
  return (
    // Wrap with both providers
    <WatchlistProvider>
      <RatingProvider>
        <div className={`${isDetailPage ? 'bg-[#1f1f22]' : 'bg-black'} min-h-screen text-white flex flex-col`}>
          <ScrollToTop />
          <Navbar />
              
          {/* Conditional container based on page type */}
          {isHomePage ? (
            // Home page: Use navbar-aligned container
            <div className="flex-1 max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 mt-0">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </div>
          ) : (
            // Other pages: Use navbar-aligned container
            <div className="flex-1 max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 mt-0">
              <Routes>
                <Route path="/movie/:id" element={<MovieTvDetail />} />
                <Route path="/tv/:id" element={<MovieTvDetail />} />
                <Route path="/search/:query" element={<SearchResults />} />
                <Route path="/filter" element={<Filter />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/ratings" element={<Ratings />} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </div>
          )}
          
          <Footer />
        </div>
      </RatingProvider>
    </WatchlistProvider>
  );
}

export default App;
