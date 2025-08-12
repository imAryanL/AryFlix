import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { authFunctions } from '../../supabaseClient';
import usePageTitle from '../../hooks/usePageTitle';

function Login() {
  // Set page title
  usePageTitle('Login');
  
  // Get any messages from other pages (like signup success)
  const location = useLocation();
  const successMessage = location.state?.message;
  
  // Store what user types in the form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
   // Control loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // What happens when user clicks "Sign In" button
  const loginUser = async () => {
    // Clear old errors
    setErrorMessage('');
    // Show "loading" message
    setIsLoading(true);

    // Check if fields are filled
    const errorCheck = 
      !email ? 'Please enter your email' :
      !password ? 'Please enter your password' :
      null;


    // If missing info, show error message
    if (errorCheck) {
      setErrorMessage(errorCheck);
      setIsLoading(false);
      return;
    }

    try {
      // Try to login with supabase
      const result = await authFunctions.signIn(email, password);
      
      if (result.error) {
        // Login failed it will show error message
        setErrorMessage(result.error.message);
      } else {
        console.log('🎉 Login successful! Welcome back to AryFlix!');

        // Using window.location.href to navigate to the home page instead of using navigate() for hard navigation
        window.location.href = '/';
      }
      
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
      console.error('Login error:', error);
    }
    // Stop loading and show the login button
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/popcorn.png" 
              className="h-9 w-9" 
              alt="AryFlix Logo"
            />
            <span className="text-white text-3xl font-[1000] whitespace-nowrap mt-2">AryFlix</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back
          </h2>
          <p className="text-gray-400 text-sm">
            Sign in to continue watching amazing movies and TV shows
          </p>
        </div>

        <div className="bg-[#303035] rounded-2xl shadow-2xl p-8 border border-gray-700">
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-200 rounded-lg text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    let cleanEmail = e.target.value.replace(/ /g, '');
                    setEmail(cleanEmail);
                  }}
                  className="w-full px-4 py-3 bg-white border border- rounded-lg text-black placeholder-gray-500 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20 focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border- rounded-lg text-black placeholder-gray-500 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#E91E63] bg-[#303035] border-gray-600 rounded focus:ring-[#E91E63] focus:ring-2 cursor-pointer"
                />
                <label className="ml-2 text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-[#E91E63] hover:text-[#F06292] font-medium">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              onClick={loginUser}
              disabled={isLoading}
              className="w-full bg-[#E91E63] hover:bg-[#F06292] active:bg-[#C2185B] text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50  cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#E91E63] hover:text-[#F06292] font-semibold transition-colors">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;