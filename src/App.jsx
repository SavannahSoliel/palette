import { useState } from "react";
import "./App.css";
import CelebritySelect from "./components/CelebritySelect";
import { getRecommendations } from "./utils/recommend";

function App() {
  const [selectedCelebs, setSelectedCelebs] = useState([]);

  const recommendations = getRecommendations(selectedCelebs);
  
  // Shuffle the recommendations array
  const shuffledRecommendations = shuffleArray([...recommendations]);

  return (
    <div className="app">
      {/* Header */}
      <h1>palette</h1>
      <p className="subtitle">your aesthetic, curated</p>

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
          {/* Use shuffledRecommendations instead of recommendations */}
          {shuffledRecommendations.map(product => (
            <a
              key={product.id}
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="product-card"
            >
              {/* Thumbnail Image */}
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-thumbnail"
                />
              )}

              {/* Product Name */}
              <p className="product-name">{product.name}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Fisher-Yates shuffle algorithm - efficient and random
function shuffleArray(array) {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

export default App;