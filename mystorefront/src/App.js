import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from "./Components/Navbar"
import Mainpage from './Components/Mainpage';
import RegisterForm from "./Components/RegisterForm"
import LoginForm from "./Components/LoginForm"
import UserContext from './contexts/UserContext';
import { useEffect, useState } from 'react';
import { fetchCurrentUser } from './Services/Apis';
import Profile from "./Components/Profie"
import Orders from "./Components/Orders"
import Favorites from "./Components/Favorites"
import OrderContext from './contexts/OrdersContext'







function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRequestToGetCurrentUserDone, setIsRequestToGetCurrentUserDone] = useState(false);

  const updateCurrentUserContext = (user) => {
    // console.log("current user: ", user);
   

    setCurrentUser(user);
  }

  const getCurrentUserForContext = async () => {
    try {
      if (localStorage.getItem("token")) {
        const { data } = await fetchCurrentUser();
        updateCurrentUserContext(data);
      }
    } catch (err) {
      console.error("Error fetching current user: ", err);
    }
    setIsRequestToGetCurrentUserDone(true);
  }

  useEffect(() => {
    getCurrentUserForContext();
  }, []);


  
  const [ orders, setOrders] = useState([]);
    

 return (
  <UserContext.Provider value={{ currentUser, updateCurrentUserContext, isRequestToGetCurrentUserDone }}>
      <Router>
        <Navbar />
        <OrderContext.Provider value={{  orders, setOrders }}>
        <Routes>
          <Route path='/' element={<Mainpage />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/login' element={<LoginForm />} />
          <Route path='/Profile' element={<Profile />} />
          <Route path='/Orders' element={<Orders />} />
          <Route path='/favorites' element={<Favorites />} />
        </Routes>
        </OrderContext.Provider>
      </Router>
  </UserContext.Provider>
);

}

export default App;
