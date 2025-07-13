/**
 * RatingModal.jsx - Rating Popup Window
 * 
 * This is a popup that lets users rate movies/TV shows with stars (1-10)
 * 
 * When user clicks "Rate this Movie" button:
 * 1. Popup opens with 10 stars ⭐
 * 2. User clicks stars to rate
 * 3. User clicks "Submit" 
 * 4. Rating saves to database
 * 5. Popup closes
 * 
 * Can be used anywhere in the app for rating stuff!
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRating } from '../contexts/RatingContext';

const RatingModal = ({ isOpen, onClose, mediaId, mediaType, mediaTitle }) => {
  const { user, getUserRating, submitRating } = useRating();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load existing rating when modal opens
  useEffect(() => {
    if (!isOpen || !user || !mediaId) return;
    
    // Preload images
    new Image().src = '/white_star.png';
    new Image().src = '/star.png';
    
    // Get existing rating
    getUserRating(mediaId)
      .then(rating => setSelectedRating(rating?.rating || 0))
      .catch(err => console.error('Error loading rating:', err));
  }, [isOpen, user, mediaId]);

  const handleSubmit = async () => {
    if (selectedRating === 0 || isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await submitRating(mediaId, mediaType, selectedRating);
      if (success) {
        onClose();
        setSelectedRating(0);
        setHoveredRating(0);
      } else {
        setError('Failed to submit rating. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedRating(0);
    setHoveredRating(0);
    setError('');
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#1f1f22] rounded-lg p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-600">
        
        {/* Header - Centered with X button */}
        <div className="flex justify-between items-center mb-6">
          <div></div> {/* Empty div for spacing */}
          <div className="text-sm font-bold text-white ml-4">
            Rate this {mediaType === 'tv' ? 'show' : 'movie'}
          </div>
          <button onClick={handleClose} className="cursor-pointer hover:scale-130 transition-all duration-200 ">
            <img src="/redX_icon.png" alt="Close" className="w-4 h-4" />
          </button>
        </div>

        {/* Title - Bigger Font */}
        <p className="text-white mb-6 text-center text-xl font-semibold">{mediaTitle}</p>

        {/* Stars */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
            <button
              key={star}
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="mx-1 transition-transform duration-200 hover:scale-110 relative cursor-pointer"
            >
              <img src="/white_star.png" alt="star" className="w-8 h-8" />
              <img
                src="/star.png"
                alt="star"
                className={`w-8 h-8 absolute top-0 left-0 transition-opacity duration-150 ${
                  star <= (hoveredRating || selectedRating) ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating Display */}
        <p className="text-center text-white text-sm mb-6">
          {selectedRating > 0 ? `${selectedRating}/10` : 'Select a rating'}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">{error}</div>
        )}

        {/* Single Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className={`px-37 py-3 rounded-lg transition-colors cursor-pointer font-bold text-sm ${
              selectedRating === 0 || isSubmitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#E91E63] hover:bg-[#F06292] text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RatingModal;
