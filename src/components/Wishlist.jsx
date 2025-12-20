import { products } from "../data/products";
import "./Wishlist.css";

function Wishlist({ wishlist, setWishlist, toggleWishlistItem }) {
  // Get wishlist products
  const wishlistProducts = products.filter(product => 
    wishlist.includes(product.id)
  );

  const clearWishlist = () => {
    setWishlist([]);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="empty-heart">🤍</div>
        <h2>Your wishlist is empty</h2>
        <p>Start by clicking the heart icon on products you love!</p>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2 className="section-title">My Wishlist</h2>
        <div className="wishlist-stats">
          <span>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</span>
          <button 
            className="clear-wishlist-btn"
            onClick={clearWishlist}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="wishlist-grid">
        {wishlistProducts.map(product => (
          <div key={product.id} className="wishlist-item">
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="wishlist-product-card"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="wishlist-thumbnail"
                />
              )}
              <p className="wishlist-product-name">{product.name}</p>
            </a>
            <button 
              className="wishlist-remove"
              onClick={() => toggleWishlistItem(product.id)}
              aria-label="Remove from wishlist"
            >
              ❤️ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;