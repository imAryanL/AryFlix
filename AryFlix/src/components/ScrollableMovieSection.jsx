import React, { useRef, useState, useEffect } from 'react';

const ScrollableMovieSection = ({ 
  title, 
  children, 
  className = "",
  showArrows = true 
}) => {
  // Reference to the scrollable container for smooth scrolling functionality
  const scrollContainerRef = useRef(null);
  
  // State to track arrow visibility
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Function to check scroll position and update arrow visibility
  const updateArrowVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      // Show left arrow if not at the beginning
      setShowLeftArrow(scrollLeft > 0);
      
      // Show right arrow if not at the end (with small buffer for precision)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Set up scroll listener and initial check
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Check initial state
      updateArrowVisibility();
      
      // Add scroll listener
      container.addEventListener('scroll', updateArrowVisibility);
      
      // Cleanup listener on unmount
      return () => {
        container.removeEventListener('scroll', updateArrowVisibility);
      };
    }
  }, [children]); // Re-run when children change

  // Function to scroll the movie container left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -630,
        behavior: 'smooth'
      });
    }
  };

  // Function to scroll the movie container right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 630,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`py-8 ${className}`}>
      {/* Use App.jsx container - no extra containers */}
      {/* Title */}
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
      )}
      
      {/* Scrollable container with arrows */}
      <div className="relative">
        {/* Left Arrow - HIDDEN ON MOBILE, visible on larger screens */}
        {showArrows && showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#C2185B] text-white p-3 rounded-full z-10 transition-all duration-200 cursor-pointer border-1 border-white hidden sm:flex"
            aria-label="Scroll left"
          >
            <img 
              src="/left-arrow.png" 
              alt="Scroll left"
              className="w-6 h-6"
            />
          </button>
        )}

        {/* Right Arrow - HIDDEN ON MOBILE, visible on larger screens */}
        {showArrows && showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#C2185B] text-white p-3 rounded-full z-10 transition-all duration-200 cursor-pointer border-1 border-white hidden sm:flex"
            aria-label="Scroll right"
          >
            <img 
              src="/right-arrow.png" 
              alt="Scroll right"
              className="w-6 h-6"
            />
          </button>
        )}

        {/* Scrollable Cards Container - TOUCH FRIENDLY */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: 'none',
            // Better touch scrolling on mobile
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScrollableMovieSection; 