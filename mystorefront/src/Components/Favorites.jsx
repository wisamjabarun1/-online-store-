import React, { useEffect, useState, useContext } from 'react';
import UserContext from '../contexts/UserContext';
import { fetchfavitems, removeFromFavs } from '../Services/Apis';
import { handleAddToCart } from '../HelperFiles/Carthelper.js';
import OrderContext from '../contexts/OrdersContext';

const Favorites = () => {
  const { currentUser, updateCurrentUserContext, isRequestToGetCurrentUserDone } = useContext(UserContext);
  const [favitems, setfavitems] = useState([]);
  const { orders, setOrders } = useContext(OrderContext);
  const [_, setItems] = useState([]);


  useEffect(() => {
    if (currentUser) {
      fetchfavitems()
        .then(response => {
          setfavitems(response.data);
        })
        .catch(error => {
          console.error('Error fetching favorite items:', error);
        });
    }
  }, [currentUser]);

  if (!isRequestToGetCurrentUserDone) {
    return <h3>Loading...</h3>;
  }

  if (!currentUser) {
    return <h3>Unauthorized access to the page.</h3>;
  }
  console.log(favitems)


  const handleRemove = async (itemId) => {
    try {
      await removeFromFavs(itemId);
      // After successful removal, update state:
      setfavitems(prev => prev.filter(item => item.item_id !== itemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };


  return (
    <div>
      <h2>Your Favorite Items</h2>
      {favitems.length > 0 ? (
        favitems.map(item => (
          <div key={item.item_id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <h4>{item.title}</h4>
            <img src={item.img} alt={item.title} style={{ width: "100px" }} />
            <p><strong>Title:</strong>{item.titlem}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <button className="remove-from-favorites-btn" onClick={() => handleRemove(item.item_id)}> remove from  Favorites</button>
            <button
              className="add-to-cart-btn"
              onClick={() =>
                handleAddToCart({
                  item,
                  orders,
                  setOrders,
                  currentUser,
                  setItems: setfavitems
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


          </div>
        ))
      ) : (
        <p>You have no favorite items.</p>
      )}
    </div>
  );
};

export default Favorites;
