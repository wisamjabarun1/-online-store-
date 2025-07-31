import '../CssFiles/navbar.css';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import React, { useContext } from 'react';
import { removeAuthHeaders } from '../Services/Apis';
import { FaShoppingCart } from 'react-icons/fa';








function Navbar() {
;

  const navigate = useNavigate();
  const { currentUser, updateCurrentUserContext, isRequestToGetCurrentUserDone } = useContext(UserContext);

  const handleLogout = () => {
    removeAuthHeaders()
    navigate('/login');
    updateCurrentUserContext(null);

  };




  return (
    <>
      <nav className="navbar">
        <div className="topnav">
          <button onClick={() => navigate("/")}>Home</button>

          {isRequestToGetCurrentUserDone ? (
            currentUser ? (
              <>
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={() => navigate("/orders")}>My Orders</button>
                <button onClick={() => navigate("/favorites")}> Favorites </button>
                <button style={{ backgroundColor: 'red' }} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/login")}>Login</button>
                <button onClick={() => navigate("/register")}>Register</button>
              </>
            )
          ) : null}

          <div className="logo">Wissam<FaShoppingCart size={24} style={{ marginLeft: 'auto', cursor: 'pointer' }} /><span>Store</span></div>
          
        </div>
      </nav>
    </>
  );
}

export default Navbar;
