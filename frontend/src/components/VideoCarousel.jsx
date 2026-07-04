import React, { useRef } from 'react';
import VideoCard from './VideoCard';

const VideoCarousel = ({ title, videos, onPlay }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full mb-8 relative group">
      <h3 className="text-xl font-bold text-white mb-4 px-12">{title}</h3>
      
      {/* Scroll Left Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-12 bottom-0 w-12 bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center"
      >
        ❮
      </button>

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-12 pb-8 pt-4 custom-scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video, index) => (
          <div key={index} className="snap-start">
            <VideoCard {...video} onPlay={() => onPlay(video)} />
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-12 bottom-0 w-12 bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center"
      >
        ❯
      </button>
    </div>
  );
};

export default VideoCarousel;
