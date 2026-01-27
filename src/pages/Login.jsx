import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state for password visibility
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle Google login directly with Firebase popup
  const handleDirectGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Create Google provider
      const googleProvider = new GoogleAuthProvider();
      
      // Sign in with popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get user details
      const user = result.user;
      console.log("Firebase Google auth successful:", user);
      
      // Extract user data
      const { displayName, email, uid, photoURL } = user;
      
      // Send data to backend
      const apiUrl = 'http://localhost:8080/api';
      
      const response = await axios.post(`${apiUrl}/google-auth`, {
        name: displayName || email.split('@')[0],
        email,
        googleId: uid,
        photoURL
      });
      
      console.log("Backend response:", response.data);
      
      // Add photoURL to the stored patient data if available
      const patientData = {
        ...response.data.patient,
        photoURL: photoURL || null,
        age: response.data.patient.age || '',
        contactNumber: response.data.patient.contactNumber || '',
        address: response.data.patient.address || ''
      };
      
      toast.success('Login successful!');
      localStorage.setItem('patient', JSON.stringify(patientData));
      navigate('/', { state: { fromLogin: true } }); // Pass state information
    } catch (error) {
      console.error("Google Auth Error:", error);
      
      let errorMessage = 'Google authentication failed';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-blocked':
            errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'Authentication popup was closed before completing the sign in process.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Multiple popup requests were triggered. Only the latest will be processed.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
            break;
          default:
            errorMessage = error.message || 'Authentication failed';
        }
      } else if (error.response) {
        errorMessage = error.response.data?.message || 'Server error during authentication';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Google login success (from @react-oauth/google)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      
      // Instead of using the token, just trigger the direct Google login
      handleDirectGoogleLogin();
      
    } catch (error) {
      console.error("Full Google Auth Error:", error);
      toast.error('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Google login failure
  const handleGoogleError = (error) => {
    console.error("Google sign in error:", error);
    toast.error('Google sign in was unsuccessful');
  };
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) { // Ensure only letters & spaces
      setName(value);
      setNameError('');
    } else {
      setNameError('Only alphabets are allowed');
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    if (state === 'Sign Up' && name.trim() === '') {
      setNameError('Name is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = 'http://localhost:8080/api';
      if (state === 'Sign Up') {
        // First register with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Firebase signup successful:", userCredential.user);
        
        // Then register with backend
        const response = await axios.post(`${apiUrl}/signup`, {
          name,
          email,
          password
        });
        toast.success('Account created successfully!');
        setState('Login');
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
      } else {
        // First login with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Firebase login successful:", userCredential.user);
        
        // Then login with backend
        const response = await axios.post(`${apiUrl}/login`, {
          email,
          password
        });
        
        // Save all patient data including profile fields if available
        const patientData = {
          ...response.data.patient,
          age: response.data.patient.age || '',
          contactNumber: response.data.patient.contactNumber || '',
          address: response.data.patient.address || ''
        };
        
        toast.success('Login successful!');
        localStorage.setItem('patient', JSON.stringify(patientData));
        navigate('/', { state: { fromLogin: true } }); // Pass state information
      }
    } catch (error) {
      console.error("Login/Signup Error:", error);
      let errorMessage = 'Authentication failed';
      
      // Handle Firebase authentication errors
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password';
            break;
          default:
            errorMessage = error.message || 'Authentication failed';
        }
      } else if (error.response) {
        errorMessage = error.response.data?.message || 'Server error during authentication';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center justify-center">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96">
        <p className="text-2xl font-semibold text-center">{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p className="text-center text-gray-500 mt-2">
          Please {state === 'Sign Up' ? "Sign Up" : "Login"} to book an appointment.
        </p>

        {state === 'Sign Up' && (
          <div className="mt-4">
            <p className="text-gray-700">Full Name</p>
            <input 
              type="text" 
              value={name} 
              onChange={handleNameChange} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required 
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>
        )}

        {/* Email Field */}
        <div className="mt-4">
          <p className="text-gray-700">Email</p>
          <input 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        {/* Password Field with Show/Hide Option */}
        <div className="mt-4 relative">
          <p className="text-gray-700">Password</p>
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={handlePasswordChange} 
              className="w-full outline-none" 
              required 
            />
            {/* Toggle Password Visibility */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 mt-6 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : state}
        </button>

        {/* Google Login Button */}
        <div className="mt-4">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-300 absolute w-full"></div>
            <div className="bg-white px-4 relative text-gray-500 text-sm">OR</div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              {state === 'Login' ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
          </div>
        </div>

        {/* Toggle Sign Up / Login */}
        <p className="text-center text-gray-600 mt-4">
          {state === 'Sign Up' ? "Already have an account?" : "Don't have an account?"}  
          <span 
            className="text-blue-500 cursor-pointer hover:underline ml-1"
            onClick={() => {
              setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
              // Clear errors when switching modes
              setNameError('');
              setEmailError('');
              setPasswordError('');
            }}
          >
            {state === 'Sign Up' ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </form>
  );
};

export default Login;
