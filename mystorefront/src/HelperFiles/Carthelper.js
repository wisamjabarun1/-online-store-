import { addOrderItem, Addorder, fetchOrders } from '../Services/Apis';

// The function takes everything it needs from parameters
export const handleAddToCart = async ({ item, orders, setOrders, currentUser, setItems }) => {
  let tempOrder = orders.find(o => o.status === 'TEMP');

  if (!tempOrder) {
    await Addorder({
      username: "",
      order_date: new Date().toISOString().slice(0, 10),
      shipping_address: currentUser.address,
      total_price: item.price,
      status: "TEMP"
    });

    const response = await fetchOrders();
    const updatedOrders = response.data;
    setOrders(updatedOrders);
    tempOrder = updatedOrders.find(o => o.status === "TEMP");

    if (!tempOrder) {
      console.error("❌ Failed to find TEMP order");
      return;
    }
  }

  await addOrderItem({
    order_id: tempOrder.order_id,
    item_id: item.item_id,
    price_at_purchase: item.price,
    username: ""
  });

  // Reduce quantity in local UI
  setItems(prev =>
    prev.map(i =>
      i.item_id === item.item_id ? { ...i, quantity: i.quantity - 1 } : i
    )
  );
};
