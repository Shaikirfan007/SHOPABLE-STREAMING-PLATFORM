import { useState } from 'react'
import axios from 'axios'
import ProductPanel from './components/ProductPanel'
import ShoppableVideoPlayer from './components/ShoppableVideoPlayer'

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0])
      setMetadata(null)
      setSelectedProduct(null)
    }
  }

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo) return;
    
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', selectedVideo)

    try {
      const response = await axios.post('http://localhost:8080/api/video-metadata/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.data && response.data.timeline) {
        setMetadata(response.data)
      } else {
        alert("Failed to analyze video properly.");
      }
    } catch (err) {
      console.error("Error analyzing video:", err)
      alert("Failed to analyze video. Ensure Spring Boot and Docker are running.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBoxClick = async (label, videoElement) => {
    // Optionally pause the video when clicking an item
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
    }

    setIsLoadingProduct(true)
    try {
      const response = await axios.get(`http://localhost:8080/api/products/search?query=${label}`)
      setSelectedProduct(response.data)
    } catch (err) {
      console.error("Error fetching product:", err)
      alert(`Could not find a product matching '${label}'`)
    } finally {
      setIsLoadingProduct(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-12 relative overflow-hidden">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Shoppable Video Platform</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl flex flex-col items-center">
        <div className="w-full mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button 
            onClick={handleAnalyzeVideo} 
            disabled={!selectedVideo || isProcessing}
            className={`px-6 py-2 rounded-full font-bold text-white whitespace-nowrap transition-colors ${!selectedVideo || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isProcessing ? 'Analyzing Video...' : 'Analyze Video'}
          </button>
        </div>

        {selectedVideo && (
          <ShoppableVideoPlayer 
            videoFile={selectedVideo} 
            metadata={metadata} 
            onBoxClick={handleBoxClick} 
          />
        )}
      </div>

      {/* Loading overlay for product */}
      {isLoadingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl font-medium text-gray-800">
            Finding matching product in store...
          </div>
        </div>
      )}

      {/* Product Panel side drawer */}
      <ProductPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}

export default App
