import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  
  // Track shuffle seed that changes when celebrity selection changes
  const shuffleSeedRef = useRef(0);
  
  // Use refs to track state without causing re-renders
  const wishlistRef = useRef([]);
  const saveTimeoutRef = useRef(null);

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sync ref with wishlist state
  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  // Load wishlist from database when user logs in
  useEffect(() => {
    if (user) {
      console.log('👤 User logged in, loading wishlist...');
      loadWishlistFromDB();
    } else {
      const savedWishlist = localStorage.getItem('palette-wishlist');
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          setWishlist([]);
        }
      }
    }
  }, [user]);

  // Auto-save when wishlist changes
  useEffect(() => {
    const saveToDB = async () => {
      if (!user) {
        localStorage.setItem('palette-wishlist', JSON.stringify(wishlist));
        return;
      }

      console.log('💾 Auto-saving wishlist...', wishlist);
      setIsSaving(true);
      setSaveStatus("Saving...");
      
      try {
        const { error } = await supabase
          .from('user_wishlists')
          .upsert({
            user_id: user.id,
            wishlist_items: wishlist,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('❌ Save error:', error);
          setSaveStatus("Save failed");
          // Fallback: try insert instead of upsert
          await supabase
            .from('user_wishlists')
            .insert({
              user_id: user.id,
              wishlist_items: wishlist,
              updated_at: new Date().toISOString()
            });
        } else {
          console.log('✅ Save successful!');
          setLastSaveTime(new Date());
          setSaveStatus("Saved!");
          
          // Clear success message after 2 seconds
          setTimeout(() => {
            setSaveStatus("");
          }, 2000);
        }
      } catch (error) {
        console.error('🔥 Critical save error:', error);
        setSaveStatus("Error saving");
      } finally {
        setIsSaving(false);
      }
    };

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Always save to localStorage immediately
    localStorage.setItem('palette-wishlist', JSON.stringify(wishlist));
    
    // Debounced auto-save (800ms delay)
    saveTimeoutRef.current = setTimeout(() => {
      if (user && wishlist.length >= 0) {
        saveToDB();
      }
    }, 800);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [wishlist, user]);

  // Database functions
  const loadWishlistFromDB = async () => {
    if (!user) return;
    
    try {
      console.log('📥 Loading wishlist from DB for:', user.email);
      
      const { data, error } = await supabase
        .from('user_wishlists')
        .select('wishlist_items, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ DB Load Error:', error);
        throw error;
      }
      
      if (data && data.wishlist_items) {
        console.log('✅ Loaded from DB:', data.wishlist_items.length, 'items');
        setWishlist(data.wishlist_items);
        setLastSaveTime(new Date(data.updated_at));
      } else {
        console.log('📭 No wishlist found in DB, checking localStorage');
        const saved = localStorage.getItem('palette-wishlist');
        if (saved) {
          try {
            setWishlist(JSON.parse(saved));
          } catch (e) {
            setWishlist([]);
          }
        }
      }
    } catch (error) {
      console.error('🔥 Error loading wishlist:', error);
      const saved = localStorage.getItem('palette-wishlist');
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          setWishlist([]);
        }
      }
    }
  };

  // Manual save function
  const saveWishlistToDB = async () => {
    if (!user) return;
    
    console.log('💾 Manual save triggered');
    setIsSaving(true);
    setSaveStatus("Saving manually...");
    
    try {
      const { error } = await supabase
        .from('user_wishlists')
        .upsert({
          user_id: user.id,
          wishlist_items: wishlist,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Manual save error:', error);
        setSaveStatus("Manual save failed");
        throw error;
      }
      
      console.log('✅ Manual save successful!');
      setLastSaveTime(new Date());
      setSaveStatus("Manually saved!");
      
      setTimeout(() => {
        setSaveStatus("");
      }, 2000);
      
    } catch (error) {
      console.error('🔥 Manual save failed:', error);
      setSaveStatus("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  // Get recommendations
  const recommendations = useMemo(() => {
    return getRecommendations(selectedCelebs);
  }, [selectedCelebs]);

  // FIXED: Shuffle with random seed that changes on celebrity selection
  const shuffledRecommendations = useMemo(() => {
    if (recommendations.length === 0) return [];
    
    console.log('🔀 Shuffling with new seed');
    
    // Create a timestamp-based seed for randomness
    const shuffleSeed = Date.now() + Math.random();
    
    return shuffleArray([...recommendations], shuffleSeed);
  }, [recommendations, selectedCelebs]); // Add selectedCelebs as dependency

  // Toggle wishlist item
  const toggleWishlistItem = useCallback((productId) => {
    console.log('❤️ Toggling product:', productId);
    
    setWishlist(prev => {
      const newWishlist = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      console.log('📝 New wishlist:', newWishlist);
      return newWishlist;
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
    wishlistRef.current = [];
    setLastSaveTime(null);
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
      {/* Saving indicator */}
      <div className={`save-status-indicator ${isSaving ? 'saving' : saveStatus ? 'saved' : ''}`}>
        {isSaving ? (
          <>
            <div className="save-spinner"></div>
            <span>Saving...</span>
          </>
        ) : saveStatus ? (
          <span>{saveStatus}</span>
        ) : lastSaveTime ? (
          <span>Saved {formatTimeAgo(lastSaveTime)}</span>
        ) : null}
      </div>

      {/* Debug panel (remove in production) */}
      {process.env.NODE_ENV === 'development' && user && (
        <div className="debug-panel">
          <div>Items: {wishlist.length}</div>
          <button onClick={saveWishlistToDB} className="debug-btn">
            💾 Test Save
          </button>
          <button onClick={() => console.log('Wishlist:', wishlist)} className="debug-btn">
            📋 Log State
          </button>
        </div>
      )}

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
              
              {/* Manual save button */}
              <button 
                className="save-btn"
                onClick={saveWishlistToDB}
                title="Manually save wishlist"
                disabled={isSaving}
              >
                {isSaving ? '⏳' : '💾'}
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
        <Wishlist 
          wishlist={wishlist} 
          setWishlist={setWishlist}
          toggleWishlistItem={toggleWishlistItem}
          user={user}
        />
      ) : (
        <>
          <h2 className="section-title">celebrity select</h2>
          <CelebritySelect
            selected={selectedCelebs}
            setSelected={setSelectedCelebs}
          />

          <p className="selected-text">
            selected: {selectedCelebs.length > 0 ? selectedCelebs.join(", ") : "none"}
          </p>

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
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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

// FIXED: Random shuffle function that gives different results each time
function shuffleArray(array, seed) {
  if (array.length === 0) return [];
  
  // Create a copy to avoid mutating the original
  const shuffled = [...array];
  
  // Use the provided seed for randomness
  let currentSeed = seed || Date.now() + Math.random();
  
  // Fisher-Yates shuffle with random seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate random index using the seed
    const random = Math.sin(currentSeed++) * 10000;
    const j = Math.floor((random - Math.floor(random)) * (i + 1));
    
    // Swap elements
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default App;