import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import {
  fetchOrders,
  fetchorderitemsbyorderid,
  confirmOrder,
  updateOrderAddress,
  removeOrderItem,
  removeOrder
} from '../Services/Apis';
import UserContext from '../contexts/UserContext';
import OrderContext from '../contexts/OrdersContext';
import { handleAddToCart } from '../HelperFiles/Carthelper.js';

const groupOrderItems = (items) => {
  const grouped = {};
  items.forEach(item => {
    if (grouped[item.itemId]) {
      grouped[item.itemId].quantity += 1;
      grouped[item.itemId].orderItemIds.push(item.orderItemId);
    } else {
      grouped[item.itemId] = {
        ...item,
        quantity: 1,
        orderItemIds: [item.orderItemId],
      };
    }
  });
  return Object.values(grouped);
};

const Orders = () => {
  const { currentUser, isRequestToGetCurrentUserDone } = useContext(UserContext);
  const { orders, setOrders } = useContext(OrderContext);

  const [orderItems, setOrderItems] = useState([]);
  const [openDialogId, setOpenDialogId] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [addressValue, setAddressValue] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  // Fetch orders on mount
  useEffect(() => {
    const getOrders = async () => {
      try {
        const response = await fetchOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    getOrders();
  }, [setOrders]);

  const handleOpenDialog = async (orderId) => {
    setOpenDialogId(orderId);
    setLoadingItems(true);
    setConfirmMessage("");
    try {
      const response = await fetchorderitemsbyorderid(orderId);
      setOrderItems(response.data);
      const thisOrder = orders.find(o => o.order_id === orderId);
      setAddressValue(thisOrder?.shipping_address || currentUser.address);
    } catch (err) {
      console.error("Failed to fetch order items:", err);
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialogId(null);
    setOrderItems([]);
    setConfirmMessage("");
  };

  // Double-check before deleting an empty order
  const checkAndDeleteEmptyOrder = (orderId) => {
    console.log(`First check: Order ${orderId} is empty, re-checking in 1 second...`);
    setTimeout(async () => {
      try {
        const refreshed = await fetchorderitemsbyorderid(orderId);
        if (refreshed.data.length === 0) {
          await removeOrder(orderId);
          console.log(`Order ${orderId} deleted because it was still empty after re-check.`);
          fetchOrders().then(res => setOrders(res.data));
          if (openDialogId === orderId) handleCloseDialog();
        } else {
          console.log(`Order ${orderId} is no longer empty. Skip delete.`);
        }
      } catch (err) {
        console.error("Failed to re-check order before deleting:", err);
      }
    }, 1000); // wait 1 sec before re-check
  };

  const handleAddMoreToOrderDialog = async (item) => {
    setOrderItems((prevOrderItems) => {
      const updated = prevOrderItems.map(oi =>
        oi.itemId === item.itemId
          ? { ...oi, quantity: oi.quantity + 1 }
          : oi
      );
      return updated;
    });
    await handleAddToCart({
      item: {
        ...item,
        item_id: item.itemId || item.item_id,
        price: item.priceAtPurchase || item.price,
      },
      orders,
      setOrders,
      currentUser,
      setItems: setOrders
    });
    if (openDialogId) {
      const response = await fetchorderitemsbyorderid(openDialogId);
      setOrderItems(response.data);
    }
  };

  const handleRemoveOrderItemOptimistic = async (orderItemId, itemId) => {
    if (!orderItemId) return;
    setOrderItems((prevOrderItems) => {
      const idx = prevOrderItems.findIndex(i => i.itemId === itemId);
      if (idx > -1) {
        const updated = [...prevOrderItems];
        if (updated[idx].quantity > 1) {
          updated[idx].quantity -= 1;
          updated[idx].orderItemIds = updated[idx].orderItemIds.filter(id => id !== orderItemId);
          return updated;
        } else {
          return updated.filter(i => i.itemId !== itemId);
        }
      }
      return prevOrderItems;
    });
    try {
      await removeOrderItem(orderItemId);
      if (openDialogId) {
        const response = await fetchorderitemsbyorderid(openDialogId);
        setOrderItems(response.data);
        if (response.data.length === 0) {
          checkAndDeleteEmptyOrder(openDialogId);
        }
      }
    } catch (err) {
      console.error("Failed to remove order item:", err);
      if (openDialogId) {
        const response = await fetchorderitemsbyorderid(openDialogId);
        setOrderItems(response.data);
      }
    }
  };

  const handleAddressChange = async (orderId, value) => {
    setAddressValue(value);
    try {
      await updateOrderAddress(orderId, value);
    } catch (err) {
      console.error("Failed to update address:", err);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId);
      setConfirmMessage("");
      const response = await fetchOrders();
      setOrders(response.data);
    } catch (err) {
      setConfirmMessage("Failed to confirm order. Try again!");
    }
  };

  if (!isRequestToGetCurrentUserDone) return <h3>Loading...</h3>;
  if (!currentUser) return <h3>Unauthorized access to the page.</h3>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Orders</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {orders.map(order => (
          <div
            key={order.order_id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '16px',
              width: '300px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
              opacity: order.status === "CLOSED" ? 0.6 : 1,
            }}
          >
            <h3>Order #{order.order_id}</h3>
            <p><strong>Date:</strong> {order.order_date}</p>
            <p><strong>Address:</strong> {order.shipping_address}</p>
            <p><strong>Total:</strong> ${order.total_price}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <Button
              variant="outlined"
              onClick={() => handleOpenDialog(order.order_id)}
            >
              Show Items in Order
            </Button>

            {/* Dialog */}
            <Dialog
              open={openDialogId === order.order_id}
              onClose={handleCloseDialog}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Order #{order.order_id}</DialogTitle>
              <DialogContent dividers>
                {order.status === "CLOSED" ? (
                  <Typography style={{ color: "#008000", fontWeight: 600, marginBottom: 16 }}>
                    Order was sent to <span style={{ fontWeight: 700 }}>{order.shipping_address}</span>
                  </Typography>
                ) : (
                  confirmMessage && (
                    <Typography style={{ color: "#008000", fontWeight: 600, marginBottom: 16 }}>
                      {confirmMessage}
                    </Typography>
                  )
                )}

                {order.status !== "CLOSED" && (
                  <input
                    type="text"
                    placeholder={currentUser.address}
                    value={addressValue}
                    onChange={e => handleAddressChange(order.order_id, e.target.value)}
                    style={{ width: "100%", marginBottom: "10px", padding: "6px" }}
                  />
                )}

                {loadingItems ? (
                  <Typography>Loading items...</Typography>
                ) : orderItems.length > 0 ? (
                  groupOrderItems(orderItems).map(item => (
                    <div key={item.itemId} style={{ display: 'flex', marginBottom: '12px', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={item.img}
                        alt={item.title}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <div>
                        <Typography variant="subtitle1"><strong>{item.title}</strong></Typography>
                        <Typography variant="body2">Price: ${item.priceAtPurchase}</Typography>
                        <Typography variant="body2">Ordered: {item.quantity}</Typography>
                        <Typography variant="body2">In Stock: {item.stockQuantity ?? 'N/A'}</Typography>
                        <div style={{ marginTop: 8, display: "flex", gap: "10px" }}>
                          <button
                            className="add-to-cart-btn"
                            onClick={() => handleAddMoreToOrderDialog(item)}
                            disabled={item.stockQuantity === 0 || order.status === "CLOSED"}
                          >
                            {item.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          <button
                            className="remove-from-favorites-btn"
                            onClick={() => {
                              if (item.quantity > 0 && item.orderItemIds.length > 0) {
                                handleRemoveOrderItemOptimistic(item.orderItemIds[0], item.itemId);
                              }
                            }}
                            disabled={item.quantity <= 0 || item.orderItemIds.length === 0 || order.status === "CLOSED"}
                          >
                            Remove from Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <Typography>No items found for this order.</Typography>
                    {checkAndDeleteEmptyOrder(order.order_id)}
                  </>
                )}
              </DialogContent>
              <DialogActions>
                {order.status !== "CLOSED" && (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => handleConfirmOrder(order.order_id)}
                  >
                    Confirm Order
                  </Button>
                )}
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
