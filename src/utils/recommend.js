import { celebrities } from "../data/celebrities";
import { products } from "../data/products";

export function getRecommendations(selectedCelebs) {
  if (!Array.isArray(selectedCelebs)) return [];

  let allTags = [];

  selectedCelebs.forEach(name => {
    const celeb = celebrities.find(c => c.name === name);

    if (celeb && Array.isArray(celeb.tags)) {
      allTags.push(...celeb.tags);
    }
  });

  return products
    .map(product => {
      const matchedTags = product.tags.filter(tag =>
        allTags.includes(tag)
      );

      return {
        ...product,
        score: matchedTags.length,
        matchedTags
      };
    })
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score);
    
    const sortedProducts = scoredProducts
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  
  // Shuffle the results
  return shuffleArray(sortedProducts);
}

// Add this function to the same file
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


