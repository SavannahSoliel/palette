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
}


