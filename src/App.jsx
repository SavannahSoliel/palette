import { useState } from "react";
import "./App.css";
import CelebritySelect from "./components/CelebritySelect";
import { getRecommendations } from "./utils/recommend";

function App() {
  const [selectedCelebs, setSelectedCelebs] = useState([]);

  const recommendations = getRecommendations(selectedCelebs);

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
          {recommendations.map(product => (
            <div className="product-card" key={product.id}>
              <p className="product-name">{product.name}</p>
              {product.matchedTags && (
                <p className="product-tags">
                  {product.matchedTags.join(" • ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
