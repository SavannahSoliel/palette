import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import CelebritySelect from "./components/CelebritySelect";
import { getRecommendations } from "./utils/recommend";
import Wishlist from "./components/Wishlist";

function App() {
  const [selectedCelebs, setSelectedCelebs] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0); // Key to control when to reshuffle

  // Fade-in animation
  useEffect(() => {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";
    
    const timer = setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Get recommendations - memoized to prevent unnecessary recalculations
  const recommendations = useMemo(() => {
    return getRecommendations(selectedCelebs);
  }, [selectedCelebs]);

  // Memoize shuffled recommendations - only reshuffle when shuffleKey changes
  const shuffledRecommendations = useMemo(() => {
    if (recommendations.length === 0) return [];
    return shuffleArray([...recommendations]);
  }, [recommendations, shuffleKey]); // Add shuffleKey as a dependency

  // Update shuffle key when celebrity selection changes
  useEffect(() => {
    setShuffleKey(prev => prev + 1);
  }, [selectedCelebs]);

  // Toggle wishlist item - memoized to prevent unnecessary re-renders
  const toggleWishlistItem = useCallback((productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  return (
    <div className="app">
      {/* Header with Wishlist Icon */}
      <div className="app-header">
        <div className="header-left">
          <h1>palette</h1>
          <p className="subtitle">your aesthetic, curated</p>
        </div>
        <button 
          className="wishlist-toggle"
          onClick={() => setShowWishlist(!showWishlist)}
        >
          {showWishlist ? "← Back to Products" : "❤️ Wishlist"}
          {wishlist.length > 0 && !showWishlist && (
            <span className="wishlist-count">{wishlist.length}</span>
          )}
        </button>
      </div>

      {showWishlist ? (
        // Wishlist View
        <Wishlist 
          wishlist={wishlist} 
          setWishlist={setWishlist}
          toggleWishlistItem={toggleWishlistItem}
        />
      ) : (
        // Main Product View
        <>
          {/* Celebrity Select */}
          <h2 className="section-title">celebrity select</h2>
          <CelebritySelect
            selected={selectedCelebs}
            setSelected={setSelectedCelebs}
          />

          <p className="selected-text">
            selected: {selectedCelebs.length > 0 ? selectedCelebs.join(", ") : "none"}
          </p>

          {/* Recommendations */}
          <h2 className="section-title">recommended products</h2>

          {recommendations.length === 0 ? (
            <p className="empty-state">
              select a celebrity to see recommendations
            </p>
          ) : (
            <div className="product-grid">
              {shuffledRecommendations.map(product => (
                <div key={product.id} className="product-card-container">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-card"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    )}
                    <p className="product-name">{product.name}</p>
                  </a>
                  <button 
                    className={`wishlist-heart ${isInWishlist(product.id) ? 'in-wishlist' : ''}`}
                    onClick={() => toggleWishlistItem(product.id)}
                    aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isInWishlist(product.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Stable shuffle function using a seed
function shuffleArray(array) {
  const shuffled = [...array];
  
  // Use a seed for consistent shuffling
  let seed = 0;
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) + 1) * 1000) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    seed++;
  }
  
  return shuffled;
}

export default App;