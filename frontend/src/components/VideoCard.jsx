import React, { useState } from 'react';

const VideoCard = ({ title, category, tags, bgGradient, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-64 h-36 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-transform duration-300 ease-out z-10 hover:z-20 hover:scale-110 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      {/* Background Image / Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
      
      {/* Default State (Not Hovered) */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <h4 className="text-white font-bold text-sm truncate">{title}</h4>
      </div>

      {/* Hover State Details */}
      <div className={`absolute inset-0 bg-[#141414] p-3 flex flex-col justify-end transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex gap-2 mb-2">
          <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 text-black">
            ▶
          </button>
          <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white text-white">
            +
          </button>
        </div>
        <div className="text-white font-bold text-sm mb-1">{title}</div>
        <div className="flex items-center gap-2 text-[10px] font-semibold">
          <span className="text-green-500">98% Match</span>
          <span className="border border-gray-500 px-1 text-gray-300">{category}</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1 flex gap-2">
          {tags.map((tag, i) => <span key={i}>• {tag}</span>)}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
