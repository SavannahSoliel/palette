import { useState, useMemo } from "react";
import { celebrities } from "../data/celebrities";
import "./CelebritySelect.css";

function CelebritySelect({ selected, setSelected }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  function toggleCelebrity(name) {
    if (selected.includes(name)) {
      setSelected(selected.filter(c => c !== name));
    } else {
      setSelected([...selected, name]);
    }
  }

  function clearAll() {
    setSelected([]);
  }

  // Filter celebrities based on search query
  const filteredCelebrities = useMemo(() => {
    if (!searchQuery.trim()) {
      return []; // Empty array when not searching
    }
    const query = searchQuery.toLowerCase();
    return celebrities.filter(celeb => 
      celeb.name.toLowerCase().includes(query) ||
      (celeb.tags && celeb.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div>
      {/* Top Bar with Browse All, Search, and Clear All */}
      <div className="top-controls">
        <div className="left-section">
        <span className="browse-label">browse all</span>
          {selected.length > 0 && (
            <div className="selection-count">
              {selected.length} selected
            </div>
          )}
        </div>
        
        <div className="right-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search celebrities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
          
          {selected.length > 0 && (
            <button 
              className="clear-all-btn"
              onClick={clearAll}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Results Grid (only shows when searching) */}
      {isSearching && (
        <div className="search-results-section">
          <div className="search-info">
            <p>Search results for "{searchQuery}" ({filteredCelebrities.length} found)</p>
          </div>
          
          {filteredCelebrities.length > 0 ? (
            <div className="celebrity-grid">
              {filteredCelebrities.map((celeb) => (
                <div
                  key={celeb.id}
                  className={`celebrity-card ${selected.includes(celeb.name) ? "selected" : ""}`}
                  onClick={() => toggleCelebrity(celeb.name)}
                >
                  {celeb.image && (
                    <img
                      src={celeb.image}
                      alt={celeb.name}
                      className="celebrity-image"
                    />
                  )}
                  <p className="celebrity-name">{celeb.name}</p>
                  <div className="celebrity-tags">
                    {celeb.tags && celeb.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag-bubble">{tag}</span>
                    ))}
                    {celeb.tags && celeb.tags.length > 3 && (
                      <span className="tag-bubble">+{celeb.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No celebrities found. Try a different search term.</p>
          )}
        </div>
      )}

      {/* ALL Celebrities Horizontal Scroll (always shows unless searching) */}
      {!isSearching && (
        <div className="celebrity-scroll-container">
          <div className="celebrity-scroll">
            {celebrities.map((celeb) => (
              <div
                key={celeb.id}
                className={`celebrity-card ${selected.includes(celeb.name) ? "selected" : ""}`}
                onClick={() => toggleCelebrity(celeb.name)}
              >
                {/* Circular image */}
                {celeb.image && (
                  <img
                    src={celeb.image}
                    alt={celeb.name}
                    className="celebrity-image"
                  />
                )}

                {/* Celebrity name */}
                <p className="celebrity-name">{celeb.name}</p>
                
                {/* Selection indicator */}
                {selected.includes(celeb.name) && (
                  <div className="selection-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CelebritySelect;