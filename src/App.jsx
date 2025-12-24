import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import CelebritySelect from "./components/CelebritySelect.jsx";
import { getRecommendations } from "./utils/recommend.js";
import Wishlist from "./components/Wishlist.jsx";
import Auth from "./components/Auth.jsx";
import { supabase } from "./lib/supabase.js";
import UserProfile from "./components/UserProfile.jsx";

function App() {
  const [selectedCelebs, setSelectedCelebs] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fade-in animation
  useEffect(() => {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";
    
    const timer = setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load wishlist from database when user logs in
  useEffect(() => {
    if (user) {
      loadWishlistFromDB();
    } else {
      // If no user, load from localStorage as fallback
      const savedWishlist = localStorage.getItem('palette-wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  }, [user]);

  // Save wishlist to database when it changes
  useEffect(() => {
    if (user && wishlist.length > 0) {
      saveWishlistToDB();
    }
    // Always save to localStorage as backup
    localStorage.setItem('palette-wishlist', JSON.stringify(wishlist));
  }, [wishlist, user]);

  // Database functions
  const loadWishlistFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wishlists')
        .select('wishlist_items')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      
      if (data) {
        setWishlist(data.wishlist_items || []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const saveWishlistToDB = async () => {
    try {
      const { error } = await supabase
        .from('user_wishlists')
        .upsert({
          user_id: user.id,
          wishlist_items: wishlist,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

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

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setWishlist([]);
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header with Auth */}
      <div className="app-header">
        <div className="header-left">
          <h1>palette</h1>
          <p className="subtitle">your aesthetic, curated</p>
        </div>
        
        <div className="header-right">
          {user ? (
            <div className="user-section">
              <UserProfile user={user} onSignOut={handleSignOut} />
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
          ) : (
            <div className="auth-section">
              <button 
                className="auth-button"
                onClick={() => setShowAuth(true)}
              >
                Sign In to Save
              </button>
              <button 
                className="wishlist-toggle guest"
                onClick={() => setShowWishlist(!showWishlist)}
              >
                {showWishlist ? "← Back to Products" : "❤️ Wishlist"}
                {wishlist.length > 0 && !showWishlist && (
                  <span className="wishlist-count">{wishlist.length}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {showAuth && (
        <Auth 
          onAuthSuccess={() => setShowAuth(false)}
          onClose={() => setShowAuth(false)}
        />
      )}

      {!user && !showAuth && (
        <div className="auth-banner">
          <p>✨ Sign in to save your wishlist across devices!</p>
          <button 
            className="auth-banner-btn"
            onClick={() => setShowAuth(true)}
          >
            Sign In
          </button>
        </div>
      )}

      {showWishlist ? (
        // Wishlist View
        <Wishlist 
          wishlist={wishlist} 
          setWishlist={setWishlist}
          toggleWishlistItem={toggleWishlistItem}
          user={user}
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