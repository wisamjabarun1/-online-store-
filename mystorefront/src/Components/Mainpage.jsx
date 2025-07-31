import React, { useEffect, useState, useContext } from 'react';
import '../CssFiles/cardstyles.css';
import '../CssFiles/cssforbtn.css';
import { getitemdata, addtofavitems, searchItemsByTitle } from '../Services/Apis';
import UserContext from '../contexts/UserContext';
import OrderContext from '../contexts/OrdersContext';
import { handleAddToCart } from '../HelperFiles/Carthelper.js';
import { useLocation } from 'react-router-dom';

const Mainpage = () => {
  const location = useLocation();
  const hideInputOn = ['/profile', '/orders', '/favorites'];
  const shouldShowInput = !hideInputOn.includes(location.pathname);

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { currentUser, isRequestToGetCurrentUserDone } = useContext(UserContext);
  const { orders, setOrders } = useContext(OrderContext);

  // Fetch all items
  const fetchItemsFromBackend = async () => {
    try {
      const response = await getitemdata();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Initial fetch
 // Handles both normal refresh and search
useEffect(() => {
  let interval;
  if (searchTerm.trim() === '') {
    // Show all items + refresh every second
    fetchItemsFromBackend();
    interval = setInterval(fetchItemsFromBackend, 1000);
  } else {
    // Show only search results (no refresh)
    searchItemsByTitle(searchTerm)
      .then(res => setItems(res.data))
      .catch(err => console.error('Search failed:', err));
  }
  return () => clearInterval(interval);
}, [searchTerm]);

  // Live search from backend
  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchItemsFromBackend();
    } else {
      searchItemsByTitle(searchTerm)
        .then(res => setItems(res.data))
        .catch(err => console.error('Search failed:', err));
    }
  }, [searchTerm]);

  const handleAddToFavorites = async (item) => {
    try {
      const response = await addtofavitems({
        item_id: item.item_id,
        username: ""
      });
      console.log("Item added to favorites:", response.data);
    } catch (err) {
      console.error("Failed to add to favorites:", err);
    }
  };

  return (
    <>
      {/* Search bar */}
      <div className="SearchInputCon">
        {shouldShowInput && (
          <input
            type="text"
            placeholder="Search item.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* Items */}
      <div className="card-container">
        {items.map(item => (
          <div className="card" key={item.item_id}>
            <img src={item.img} alt={item.title} />
            <div className="card-content">
              <h3>{item.title}</h3>
              <p><strong>Price:</strong> ${item.price}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>

              {isRequestToGetCurrentUserDone ? (
                currentUser ? (
                  <>
                    <button
                      className="add-to-cart-btn"
                      onClick={() =>
                        handleAddToCart({
                          item,
                          orders,
                          setOrders,
                          currentUser,
                          setItems
                        })
                      }
                      disabled={item.quantity === 0}
                      style={{
                        opacity: item.quantity === 0 ? 0.5 : 1,
                        cursor: item.quantity === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <button
                      className="add-to-favorites-btn"
                      onClick={() => handleAddToFavorites(item)}
                    >
                      Add to Favorites
                    </button>
                  </>
                ) : (
                  <h3 style={{ backgroundColor: 'Yellow' }}>
                    Login to buy or to add to favorites
                  </h3>
                )
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Mainpage;
