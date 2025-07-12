/**
 * RatingModal.jsx - Rating Popup Window
 * 
 * This is a popup that lets users rate movies/TV shows with stars (1-10)
 * 
 * When user clicks "Rate this Movie" button:
 * 1. Popup opens with 10 stars ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
 * 2. User clicks stars to rate
 * 3. User clicks "Submit" 
 * 4. Rating saves to database
 * 5. Popup closes
 * 
 * Can be used anywhere in the app for rating stuff!
 */

import React, { useState, useEffect } from 'react';
import { useRating } from '../contexts/RatingContext';

const RatingModal = ({ isOpen, onClose, mediaId, mediaType, mediaTitle }) => {
  const { user, getUserRating, submitRating } = useRating();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [error, setError] = useState('');

  // Load existing rating when modal opens
  useEffect(() => {
    if (isOpen && user && mediaId) {
      loadExistingRating();
    }
  }, [isOpen, user, mediaId]);

  const loadExistingRating = async () => {
    try {
      const rating = await getUserRating(mediaId);
      if (rating) {
        setExistingRating(rating);
        setSelectedRating(rating.rating);
      } else {
        setExistingRating(null);
        setSelectedRating(0);
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
    }
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('🎯 Submitting rating from modal:', { mediaId, mediaType, selectedRating });
      const success = await submitRating(mediaId, mediaType, selectedRating);
      
      if (success) {
        console.log('✅ Rating submitted successfully!');
        onClose();
        // Reset for next time
        setSelectedRating(0);
        setHoveredRating(0);
      } else {
        console.error('❌ Rating submission failed');
        setError('Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
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

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1f1f22] rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Rate this {mediaType === 'tv' ? 'TV Show' : 'Movie'}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Movie/TV Show Title */}
        <p className="text-gray-300 mb-6 text-center">{mediaTitle}</p>

        {/* Star Rating */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl mx-1 transition-colors duration-200 hover:scale-110"
            >
              <span
                className={
                  star <= (hoveredRating || selectedRating)
                    ? 'text-yellow-400'
                    : 'text-gray-500'
                }
              >
                ⭐
              </span>
            </button>
          ))}
        </div>

        {/* Rating Text */}
        <div className="text-center mb-6">
          <p className="text-white text-lg">
            {selectedRating > 0 ? `${selectedRating}/10` : 'Select a rating'}
          </p>
          {existingRating && (
            <p className="text-gray-400 text-sm mt-1">
              Your previous rating: {existingRating.rating}/10
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              selectedRating === 0 || isSubmitting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#E91E63] hover:bg-[#F06292] text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
