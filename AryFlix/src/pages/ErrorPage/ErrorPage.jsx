// src/pages/ErrorPage/ErrorPage.jsx
import usePageTitle from '../../hooks/usePageTitle';

function ErrorPage() {
    // Set page title
    usePageTitle('Error');

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-2">Page Not Found</p>
        <p className="mb-6 text-gray-400">
          Oops! The page you are looking for doesn't exist.
        </p>
        <a
          href="/"
          className="px-6 py-2 bg-[#E91E63] hover:bg-[#F06292] rounded-lg text-white font-semibold transition"
        >
          Go Home
        </a>
      </div>
    );
  }
  
  export default ErrorPage;
  