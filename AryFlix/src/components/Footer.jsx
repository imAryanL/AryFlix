import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#252529] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: App Branding */}
          <div className="space-y-4">
            <div className="flex items-center ">
              <img 
                src="/popcorn.png" 
                alt="AryFlix Logo" 
                className="w-9 h-9"
              />
              <h3 className="text-white text-3xl font-[1000] whitespace-nowrap mt-2 ">AryFlix</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover and track your favorite movies & TV shows with personalized features!
            </p>
          </div>

          {/* Column 2: Creator Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Created by</h4>
            <div className="space-y-3">
              <p className="text-white font-medium">Aryan Lakhani</p>
              
              {/* Email */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">📧</span>
                <a 
                  href="mailto:aryanlakhani2001@gmail.com" 
                  className="text-gray-400 hover:text-pink-400 transition-colors text-sm"
                >
                  aryanlakhani2001@gmail.com
                </a>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a 
                  href="https://www.linkedin.com/in/aryan-lakhani/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/linkedin_icon.png" 
                    alt="LinkedIn" 
                    className="w-6 h-6"
                  />
                </a>
                <a 
                  href="https://github.com/aryfye" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/github_icon.png" 
                    alt="GitHub" 
                    className="w-6 h-6"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Legal & Credits */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Credits</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                Movie/TV Show Data from{' '}
                <a 
                  href="https://www.themoviedb.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  TMDB
                </a>
              </p>
              <p className="text-gray-400">
                Rating data from{' '}
                <a 
                  href="http://www.omdbapi.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  OMDB API
                </a>
              </p>
              <p className="text-gray-400 text-xs">
                This website uses the YouTube API but is not endorsed, certified, or otherwise approved by YouTube.
              </p>
              <p className="text-gray-500 text-xs mt-3">
                Educational portfolio project
              </p>
            </div>
          </div>

          {/* Column 4: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/" className="text-gray-400 hover:text-pink-400 transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-gray-400 hover:text-pink-400 transition-colors">
                Search
              </Link>
              <Link to="/watchlist" className="text-gray-400 hover:text-pink-400 transition-colors">
                Watchlist
              </Link>
              <Link to="/ratings" className="text-gray-400 hover:text-pink-400 transition-colors">
                Ratings
              </Link>
              <Link to="/login" className="text-gray-400 hover:text-pink-400 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="text-gray-400 hover:text-pink-400 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-700 bg-[#252529]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Aryan Lakhani | AryFlix</p>
            <p className="mt-2 md:mt-0">Enjoy discovering great content!</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
