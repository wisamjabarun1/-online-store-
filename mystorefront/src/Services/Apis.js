import axios from "axios";

const BASE_URL = "http://localhost:9000";

const setAuthHeaders = (token) => {
    console.log("token: " + token);
    localStorage.setItem("token", token);
}

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`
    };
}

export const removeAuthHeaders = () => {
    localStorage.removeItem("token");
}

export const register = (user) => {
    return axios.post(`${BASE_URL}/users/register`, user);
}

export const login = async (credentials) => {
    const { data } = await axios.post(`${BASE_URL}/authenticate`, credentials);
    const jwtToken = data.jwt;
    setAuthHeaders(jwtToken);
    return data;
}

export const fetchCurrentUser = () => {
    return axios.get(`${BASE_URL}/users`, { headers: getAuthHeaders() });
}

export const updateCurrentUser = (updatedCurrentUser) => {
    return axios.put(`${BASE_URL}/users`, updatedCurrentUser, { headers: getAuthHeaders() });
}

export const deleteCurrentUser = () => {
    return axios.delete(`${BASE_URL}/users`, { headers: getAuthHeaders() });
}

export const getitemdata=()=>{
    return axios.get(`${BASE_URL}/items/getitems`)
}


export const fetchfavitems =()=>{
    return axios.get(`${BASE_URL}/favorites`,{ headers: getAuthHeaders() })
}
export const addtofavitems = (favoriteItem) => {
  return axios.post(`${BASE_URL}/favorites`, favoriteItem, {
    headers: getAuthHeaders()
  });
};
export const removeFromFavs = (itemId) => {
  return axios.delete(`${BASE_URL}/favorites/${itemId}`, {
    headers: getAuthHeaders() 
  });
}


export const Addorder=(Order)=>{
return axios.post(`${BASE_URL}/Orders`, Order ,{ headers: getAuthHeaders() })
}

export const fetchOrders =()=>{
    return axios.get(`${BASE_URL}/Orders`,{ headers: getAuthHeaders() })
}

export const addOrderItem=(OrderItem)=>{
    return axios.post(`${BASE_URL}/OrderItemController`,OrderItem ,{ headers: getAuthHeaders() })
}

export const fetchorderitemsbyorderid=(OrderId)=>{
    return axios.get(`${BASE_URL}/OrderItemController/${OrderId}`,{ headers: getAuthHeaders() })
}

export const reduceItemStock = (itemId) => {
  return axios.put(`${BASE_URL}/items/${itemId}/reduce`, {}, { headers: getAuthHeaders() });
};


export const removeOrderItem = (orderItemId) => {
  return axios.delete(`http://localhost:9000/OrderItemController/${orderItemId}`, { headers: getAuthHeaders() });
};


export const confirmOrder = (orderId) => {
  return axios.put(`http://localhost:9000/Orders/confirm/${orderId}`, {}, { headers: getAuthHeaders() });
};




export const updateOrderAddress = (orderId, addressValue) => {
  return axios.put( `http://localhost:9000/Orders/update-address/${orderId}`,
    { shipping_address: addressValue },
    { headers: getAuthHeaders() }
  );
};





export const searchItemsByTitle = (keyword) => {
  return axios.get(`${BASE_URL}/items/search`, {
    params: { keyword },
  });
};


export const removeOrder = async (orderId) => {
  return await axios.delete(`${BASE_URL}/Orders/${orderId}`, {
    headers: getAuthHeaders()
  });
};
