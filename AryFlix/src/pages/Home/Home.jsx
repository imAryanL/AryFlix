import HeroSection from "./HeroSection";
import NowPlayingTheatre from "./NowPlayingTheatre";
import WatchAtHome from "./WatchAtHome";
import ComingSoonTheatre from "./ComingSoonTheatre";
import UpcomingShows from "./UpcoimingShows";
import TrendingAnime from "./TrendingAnime";
import StreamingPlatforms from "./StreamingPlatforms";
import usePageTitle from "../../hooks/usePageTitle";

function Home() {
  usePageTitle("Home");

  return (
    <div>
      {/* Hero Section - Trending movies and TV shows carousel */}
      <HeroSection />
      
      {/* Now Playing in Theatres Section - Movies currently in cinemas with ticket booking */}
      <NowPlayingTheatre />

      {/* Watch At Home Section - Popular TV shows for home viewing */}
      <WatchAtHome />

      {/* Coming Soon to Theatres Section - Movies coming soon to cinemas */}
      <ComingSoonTheatre />

      {/* New & Upcoming Shows Section - Upcoming TV shows */}
      <UpcomingShows />

      {/* Trending Anime Section - Popular anime series */}
      <TrendingAnime />

      {/* Streaming Platforms Section - Streaming platforms content */}
      <StreamingPlatforms />
    </div>
  );
}

export default Home;

