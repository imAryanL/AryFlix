import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import HeaderSection from './HeaderSection';
import MediaSection from './MediaSection';
import OverView from './OverView';
import PeopleSection from './PeopleSection';
import usePageTitle from '../../hooks/usePageTitle';
import { API_URL } from '../../api';

function MovieTvDetail() {
  const { id } = useParams();
  const location = useLocation();
  const isTV = location.pathname.startsWith('/tv/');
  
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set dynamic title based on movie/TV show data
  const title = movieData ? (movieData.title || movieData.name) : (loading ? 'Loading...' : 'Details');
  usePageTitle(title);

  // Fetch data for title
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiEndpoint = isTV 
          ? `${API_URL}/api/tv/${id}/trailer`
          : `${API_URL}/api/movies/${id}/trailer`;
        
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        
        if (data.success) {
          setMovieData(data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, isTV]);

  return (
    <div>
      <HeaderSection />
      <MediaSection />
      <OverView />
      <PeopleSection />
    </div>
  );
}

export default MovieTvDetail;
