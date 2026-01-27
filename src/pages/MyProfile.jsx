import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { auth } from '../config/firebase';
import axios from 'axios';

const MyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    contactNumber: '',
    address: '',
    photoURL: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    const patientData = localStorage.getItem('patient');
    if (!patientData) {
      navigate('/login');
      return;
    }

    const parsedData = JSON.parse(patientData);
    setUserData({
      name: parsedData.name || '',
      email: parsedData.email || '',
      age: parsedData.age || '',
      contactNumber: parsedData.contactNumber || '',
      address: parsedData.address || '',
      photoURL: parsedData.photoURL || ''
    });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    // Reset to original data from localStorage
    const patientData = JSON.parse(localStorage.getItem('patient'));
    setUserData({
      name: patientData.name || '',
      email: patientData.email || '',
      age: patientData.age || '',
      contactNumber: patientData.contactNumber || '',
      address: patientData.address || '',
      photoURL: patientData.photoURL || ''
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!userData.name.trim()) {
        toast.error('Name is required');
        setLoading(false);
        return;
      }

      if (userData.age && (isNaN(userData.age) || userData.age < 1 || userData.age > 120)) {
        toast.error('Please enter a valid age (1-120)');
        setLoading(false);
        return;
      }

      if (userData.contactNumber && !/^\d{10}$/.test(userData.contactNumber)) {
        toast.error('Please enter a valid 10-digit contact number');
        setLoading(false);
        return;
      }
      
      const apiUrl = 'http://localhost:8080/api';
      const currentUser = auth.currentUser;
      
      // Handle case where Firebase user is not available
      if (!currentUser) {
        console.error('Firebase user not found');
        
        // Get user id from localStorage instead
        const patientData = JSON.parse(localStorage.getItem('patient'));
        if (!patientData || !patientData.id) {
          toast.error('User session expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        // Use id from localStorage
        const response = await axios.put(`${apiUrl}/update-profile`, {
          userId: patientData.id,
          email: userData.email,
          name: userData.name,
          age: userData.age,
          contactNumber: userData.contactNumber,
          address: userData.address
        });
        
        // Update localStorage with new data
        localStorage.setItem('patient', JSON.stringify({
          ...patientData,
          name: userData.name,
          age: userData.age,
          contactNumber: userData.contactNumber,
          address: userData.address
        }));
      } else {
        // Normal flow with Firebase user
        const response = await axios.put(`${apiUrl}/update-profile`, {
          userId: currentUser.uid,
          email: userData.email,
          name: userData.name,
          age: userData.age,
          contactNumber: userData.contactNumber,
          address: userData.address
        });
        
        // Update localStorage with new data
        localStorage.setItem('patient', JSON.stringify({
          ...JSON.parse(localStorage.getItem('patient')),
          name: userData.name,
          age: userData.age,
          contactNumber: userData.contactNumber,
          address: userData.address
        }));
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Extract more detailed error message if available
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          {/* Profile Sidebar */}
          <div className="md:w-1/3 bg-blue-50 p-8 flex flex-col items-center">
            <div className="relative">
              <img 
                src={userData.photoURL || assets.profile_pic} 
                alt="Profile" 
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">{userData.name}</h2>
            <p className="text-gray-600">{userData.email}</p>
          </div>
          
          {/* Profile Content */}
          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-800">{userData.name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  {/* Email - Read only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-800">{userData.email}</p>
                  </div>
                  
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={userData.age}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    ) : (
                      <p className="text-gray-800">{userData.age || 'Not provided'}</p>
                    )}
                  </div>
                  
                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="contactNumber"
                        value={userData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your contact number"
                      />
                    ) : (
                      <p className="text-gray-800">{userData.contactNumber || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Address</h3>
                <div>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your address"
                    ></textarea>
                  ) : (
                    <p className="text-gray-800">{userData.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
