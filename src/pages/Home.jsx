import React, { useEffect, useState } from 'react'
import Header from '../components/Header';
import Services from '../components/service';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by looking for patient data in localStorage
    const patientData = localStorage.getItem('patient');
    if (patientData) {
      const user = JSON.parse(patientData);
      setUserData(user);
      
      // Check if this is a new login by examining state from navigation
      const isDirectLoginRedirect = location.state?.fromLogin;
      
      // Or check with sessionStorage for page refreshes
      const hasWelcomed = sessionStorage.getItem('welcomed');
      
      if (isDirectLoginRedirect || !hasWelcomed) {
        setIsNewLogin(true);
        // Show welcome toast
        toast.success(`Welcome${isDirectLoginRedirect ? '' : ' back'}, ${user.name}!`);
        // Set session flag to prevent showing welcome again on page refresh
        sessionStorage.setItem('welcomed', 'true');
      }
    }
    
    // Clean up location state if needed
    if (location.state?.fromLogin) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div>
      {isNewLogin && userData && (
        <div className="bg-blue-50 p-4 mb-6 rounded-lg shadow-sm text-center">
          <h2 className="text-xl font-semibold">Welcome{location.state?.fromLogin ? '' : ' back'}, {userData.name}!</h2>
          <p className="text-gray-600">Thank you for choosing PsycheHub. You can now book appointments with our specialists.</p>
        </div>
      )}
      <Header/>
      <Services/>
      <TopDoctors/>
      <Banner/>
    </div>
  )
}

export default Home;
