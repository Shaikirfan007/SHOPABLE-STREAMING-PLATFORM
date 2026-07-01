import React, { useState, useRef, useEffect, useCallback } from 'react';

const ShoppableVideoPlayer = ({ videoFile, metadata, onBoxClick }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [renderRect, setRenderRect] = useState(null);
  const videoRef = useRef(null);

  // Robustly compute the actual rendered video content area inside the element
  // Uses requestAnimationFrame to wait until browser has painted the element
  const computeRenderRect = useCallback(() => {
    requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) return;

      const displayW = video.clientWidth;
      const displayH = video.clientHeight;
      const nativeW = video.videoWidth;
      const nativeH = video.videoHeight;

      if (!displayW || !displayH) return;

      // Match what object-contain does: scale uniformly to fit, centered
      const scale = Math.min(displayW / nativeW, displayH / nativeH);
      const renderedW = nativeW * scale;
      const renderedH = nativeH * scale;
      const offsetX = (displayW - renderedW) / 2;
      const offsetY = (displayH - renderedH) / 2;

      setRenderRect({ offsetX, offsetY, renderedW, renderedH, nativeW, nativeH });
    });
  }, []);

  // Use ResizeObserver for reliable re-computation on any size change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new ResizeObserver(computeRenderRect);
    observer.observe(video);
    return () => observer.disconnect();
  }, [computeRenderRect]);

  // Sync bounding boxes with video playback time
  useEffect(() => {
    if (metadata?.timeline) {
      const second = Math.floor(currentTime).toString();
      setCurrentDetections(metadata.timeline[second] || []);
    }
  }, [currentTime, metadata]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    computeRenderRect();
  };

  const videoUrl = React.useMemo(() => {
    return videoFile ? URL.createObjectURL(videoFile) : null;
  }, [videoFile]);

  if (!videoUrl) return null;

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-black" style={{ display: 'inline-block' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="block max-w-full"
        style={{ maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
        controls
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Bounding Boxes — pixel-accurate using computed render rect */}
      {renderRect && currentDetections.map((det, index) => {
        const { x1, y1, x2, y2 } = det.box;
        const { offsetX, offsetY, renderedW, renderedH, nativeW, nativeH } = renderRect;

        const left   = offsetX + (x1 / nativeW) * renderedW;
        const top    = offsetY + (y1 / nativeH) * renderedH;
        const width  = ((x2 - x1) / nativeW) * renderedW;
        const height = ((y2 - y1) / nativeH) * renderedH;

        return (
          <div
            key={index}
            onClick={() => onBoxClick(det.label, videoRef.current)}
            title={`Click to shop: ${det.label}`}
            style={{
              position: 'absolute',
              left:   `${left}px`,
              top:    `${top}px`,
              width:  `${width}px`,
              height: `${height}px`,
              border: '2px solid #22c55e',
              boxSizing: 'border-box',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              zIndex: 10,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.18)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{
              position: 'absolute',
              top: '-26px',
              left: '0',
              backgroundColor: '#16a34a',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}>
              {det.label} · {Math.round(det.confidence * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ShoppableVideoPlayer;
