import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Check for logged in user on component mount, location changes, and auth state changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const patientData = localStorage.getItem('patient');
      if (patientData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(patientData));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    // Check when component mounts
    checkLoginStatus();
    
    // Add auth state change listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If Firebase user exists but no localStorage data, check if localStorage needs updating
        const patientData = localStorage.getItem('patient');
        if (!patientData) {
          // This is a fallback in case localStorage gets cleared but user is still logged in with Firebase
          // In a production app, you might make an API call here to get user data
          setIsLoggedIn(true);
          setUserData({
            name: user.displayName || user.email.split('@')[0],
            email: user.email
          });
        }
      }
    });
    
    // Clean up auth listener
    return () => unsubscribe();
  }, [location.pathname]); // Re-run when path changes, capturing login events
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem('patient');
      
      // Update state
      setIsLoggedIn(false);
      setUserData(null);
      
      navigate('/');
      
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-9 border-b border-gray-200'>
      
      {/* PsycheHub Logo Text */}
      <h1 
        onClick={() => navigate('/')} 
        className='text-2xl md:text-3xl font-bold cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text'
      >
        PsycheHub
      </h1>

      <ul className='hidden md:flex items-center gap-5 font-medium'>
        <NavLink 
          to="/" 
          children={({ isActive }) => (
            <div className="flex flex-col items-center">
              <span className="py-1">HOME</span>
              <hr className={`h-0.5 bg-blue-500 w-3/5 transition-all duration-300 ${isActive ? "block" : "hidden"}`} />
            </div>
          )}
        />
        <NavLink 
          to="/doctors" 
          children={({ isActive }) => (
            <div className="flex flex-col items-center">
              <span className="py-1">ALL DOCTORS</span>
              <hr className={`h-0.5 bg-blue-500 w-3/5 transition-all duration-300 ${isActive ? "block" : "hidden"}`} />
            </div>
          )}
        />
        <NavLink 
          to="/about" 
          children={({ isActive }) => (
            <div className="flex flex-col items-center">
              <span className="py-1">ABOUT</span>
              <hr className={`h-0.5 bg-blue-500 w-3/5 transition-all duration-300 ${isActive ? "block" : "hidden"}`} />
            </div>
          )}
        />
        <NavLink 
          to="/contact" 
          children={({ isActive }) => (
            <div className="flex flex-col items-center">
              <span className="py-1">CONTACT</span>
              <hr className={`h-0.5 bg-blue-500 w-3/5 transition-all duration-300 ${isActive ? "block" : "hidden"}`} />
            </div>
          )}
        />
      </ul>

      <div className='flex items-center gap-4'>
        {isLoggedIn ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 h-8 rounded-full object-cover' src={userData?.photoURL || assets.profile_pic} alt="Profile" />
            <span className="hidden md:inline font-medium text-gray-700">{userData?.name || 'User'}</span>
            <img className='w-2.5' src={assets.dropdown_icon} alt="" />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-white shadow-lg rounded-lg flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-blue-600 cursor-pointer flex items-center gap-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  My Profile
                </p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-blue-600 cursor-pointer flex items-center gap-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Appointments
                </p>
                <hr className="border-gray-200" />
                <p onClick={handleLogout} className='hover:text-red-600 cursor-pointer flex items-center gap-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                    <path d="M5 7a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" />
                  </svg>
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')} 
            className='bg-primary text-white px-8 py-3 rounded-full font-medium hidden md:block hover:bg-blue-600 transition-colors'
          >
            Create Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
 