import { useState } from "react";
import CelebritySelect from "./components/CelebritySelect";
import { getRecommendations } from "./utils/recommend";

function App() {
  const [selectedCelebs, setSelectedCelebs] = useState([]);

  const recommendations = getRecommendations(selectedCelebs);

  return (
    <div className="min-h-screen p-8 bg-neutral-50">
      <h1 className="text-3xl font-serif">palette</h1>
      <p className="mb-6">your aesthetic, curated</p>

      <CelebritySelect
        selected={selectedCelebs}
        setSelected={setSelectedCelebs}
      />

      <p className="mt-4 text-sm">
        selected: {selectedCelebs.join(", ") || "none"}
      </p>

      <div className="mt-10">
        <h2 className="text-xl mb-4">recommended products</h2>

        {recommendations.length === 0 ? (
          <p className="text-neutral-500">
            select a celebrity to see recommendations
          </p>
        ) : (
          <div className="space-y-4">
            {recommendations.map(product => (
              <a
                key={product.id}
                href={product.link}
                target="_blank"
                rel="noreferrer"
                className="block p-4 bg-white rounded-xl border hover:shadow"
              >
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-neutral-600">
                  {product.brand}
                </p>
                <p className="text-xs text-neutral-400">
                  matched: {product.matchedTags.join(", ")}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
