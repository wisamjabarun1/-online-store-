import React, { useEffect, useState } from 'react'
import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import '../CssFiles/cssforprofile.css';
import { useNavigate } from 'react-router-dom';
import { deleteCurrentUser, removeAuthHeaders, updateCurrentUser } from '../Services/Apis';




const Profie = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    updateCurrentUserContext,
    isRequestToGetCurrentUserDone
  } = useContext(UserContext);

  const [isDeletedAccount, setIsDeletedAccount] = useState(false);
  const [errorFromServer, setErrorFromServer] = useState("");

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      try {
        await deleteCurrentUser();
        setIsDeletedAccount(true);
        setTimeout(() => {
          removeAuthHeaders();
          updateCurrentUserContext(null);
          navigate("/");
        }, 3000);
      } catch (err) {
        console.log(err);
        if (err.status === 400 || err.status === 500) {
          setErrorFromServer(err.response?.data || "Server error");
        }
        if (err.code === "ERR_NETWORK") {
          setErrorFromServer("Network error. Please try again later.");
        }
        setTimeout(() => {
          setErrorFromServer("");
        }, 3000);
      }
    }
  };

  return (
    <div className="profile-page">
      {currentUser ? (
        <div className="profile-card">
          <h2>Welcome, {currentUser.first_name} {currentUser.last_name}!</h2>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Role:</strong> {currentUser.role}</p>
          <p><strong>Username:</strong> {currentUser.username}</p>
          <p><strong>Address:</strong>{currentUser.address}</p>
          <button
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Remove Account
          </button>
        </div>
      ) : (
        isRequestToGetCurrentUserDone && !isDeletedAccount && (
          <div className="unauthorized">
            <h2>Unauthorized Access</h2>
            <h3>You need to login to access this page.</h3>
            <button className='login-btn' onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default Profie;