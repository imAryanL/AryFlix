// Import the tools we need
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { authFunctions } from '../../supabaseClient';
import usePageTitle from '../../hooks/usePageTitle';

function Signup() {
  // Set page title
  usePageTitle('Signup');
  
  // Tool to redirect user to different pages
  const navigate = useNavigate();
  
  // SIMPLE STATE - Just store what user types
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Show loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // SIMPLE FUNCTION - What happens when user clicks "Create Account"
  const createAccount = async () => {
    // Clear any old error messages
    setErrorMessage('');
    
    // Show loading
    setIsLoading(true);

    // SIMPLE CHECKS - INCLUDING USERNAME LENGTH LIMIT
    const errorCheck = 
      !username ? 'Please enter a username' :
      username.length > 20 ? 'Username must be 20 characters or less' :
      username.length < 3 ? 'Username must be at least 3 characters' :
      !email ? 'Please enter your email' :
      !password ? 'Please enter a password' :
      password !== confirmPassword ? 'Your passwords do not match' :
      !agreeToTerms ? 'Please accept the terms and conditions' :
      null;

    // If there's an error, show it and stop
    if (errorCheck) {
      setErrorMessage(errorCheck);
      setIsLoading(false);
      return;
    }

    // TRY TO CREATE ACCOUNT
    try {
      // Step 1: Ask Supabase to create the account
      const signupResult = await authFunctions.signUp(email, password, username);
      
      // Did signup work?
      if (signupResult.error) {
        // Signup failed
        setErrorMessage(signupResult.error.message);
      } else {
        // Step 2: Account created successfully! Now auto-login
        console.log('✅ Account created! Auto-logging in...');
        
        try {
          // Automatically log the user in with their new credentials
          const loginResult = await authFunctions.signIn(email, password);
          
          if (loginResult.error) {
            // Auto-login failed, send to login page with message
            console.log('❌ Auto-login failed, redirecting to login page');
            navigate('/login', { 
              state: { message: 'Account created successfully! Please log in.' }
            });
          } else {
            // Perfect! Both signup and login worked - go to home page
            console.log('🎉 Auto-login successful! Welcome to AryFlix!');
            window.location.href = '/';
          }
        } catch (loginError) {
          // Auto-login had an error, fallback to login page
          console.log('❌ Auto-login error:', loginError);
          navigate('/login', { 
            state: { message: 'Account created! Please log in to continue.' }
          });
        }
      }
        
    } catch (error) {
      // Something really went wrong with signup
      setErrorMessage('Something went wrong. Please try again.');
      console.error('Signup error:', error);
    }
    
    // Stop loading
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Section with Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/popcorn.png" 
              className="h-9 w-9 " 
              alt="AryFlix Logo"
            />
            <span className="text-white text-3xl font-[1000] whitespace-nowrap mt-2">AryFlix</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Create your account
          </h2>
          <p className="text-gray-400 text-sm">
            Join AryFlix and discover amazing movies and TV shows
          </p>
        </div>

        {/* Main Form Card - UPDATED to bg-gray-800 to match your other components */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          
          {/* Show error message if there is one */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}
          
          {/* FORM FIELDS */}
          <div className="space-y-6">
            
            {/* Username input - WITH CHARACTER LIMIT AND COUNTER */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  maxLength={20} // Prevent typing more than 20 characters
                  onChange={(e) => {
                    // Only allow letters, numbers, and underscores
                    let cleanValue = e.target.value
                      .replace(/[^a-zA-Z0-9_]/g, '') // Remove anything that's NOT letters, numbers, or underscore
                      .toLowerCase(); // Make lowercase
                    
                    // Only update if 20 characters or less
                    if (cleanValue.length <= 20) {
                      setUsername(cleanValue);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20 focus:outline-none transition-all duration-200"
                  placeholder="superman_fan_123"
                />
                {/* Character counter */}
                <div className="absolute right-3 top-3 text-xs text-gray-400">
                  {username.length}/20
                </div>
              </div>
              
            </div>
            
            {/* Email input - REMOVE SPACES */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    // Remove spaces from email
                    let cleanEmail = e.target.value.replace(/ /g, '');
                    setEmail(cleanEmail);
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20 focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20 focus:outline-none transition-all duration-200"
                  placeholder=""
                />
              </div>
            </div>
            
            {/* Confirm password input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20 focus:outline-none transition-all duration-200"
                  placeholder=""
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 text-[#E91E63] bg-gray-700 border-gray-600 rounded focus:ring-[#E91E63] focus:ring-2 cursor-pointer"
                />
              </div>
              <label className="text-sm text-gray-300 leading-5">
                I agree to AryFlix's{" "}
                <a href="#" className="text-[#E91E63] hover:text-[#F06292] font-medium">
                  Terms of Service
                </a>
                {" "}and{" "}
                <a href="#" className="text-[#E91E63] hover:text-[#F06292] font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Create account button */}
            <button
              onClick={createAccount}
              disabled={isLoading}
              className="w-full bg-[#E91E63] hover:bg-[#F06292] active:bg-[#C2185B] text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </div>
        
        {/* Link to login */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#E91E63] hover:text-[#F06292] font-semibold transition-colors">
              Login here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;