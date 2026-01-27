import React, { useState } from 'react';
import { assets } from '../assets/assets';

const Contact = () => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) {
      setName(value);
      setNameError('');
    } else {
      setNameError('Only alphabets are allowed');
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      {/* Contact Heading */}
      <div className="text-center text-3xl pt-10 text-gray-500 font-semibold">
        <p>CONTACT <span className="text-gray-700">US</span></p>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-8">
        {/* Contact Image (Larger) */}
        <img 
          src={assets.contact_image} 
          alt="Contact Us" 
          className="w-72 h-72 md:w-96 md:h-96 object-cover rounded-lg shadow-lg" 
        />

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
          <p className="text-lg text-gray-700 font-semibold mb-4">Get in Touch</p>
          <form className="flex flex-col gap-4">
            {/* Name Input with Validation */}
            <input 
              type="text" 
              value={name}
              onChange={handleNameChange}
              placeholder="Your Name" 
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}

            {/* Email Input */}
            <input 
              type="email" 
              placeholder="Your Email" 
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Message Input */}
            <textarea 
              rows="4" 
              placeholder="Your Message" 
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Submit Button */}
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-10 text-center">
        <p className="text-lg font-semibold text-gray-700">Our Contact Details</p>
        <p className="text-gray-600 mt-2">📍 123, Main Street, Pune, India</p>
        <p className="text-gray-600">📧 support@psychehub.com</p>
        <p className="text-gray-600">📞 +91 98765 43210</p>
      </div>
    </div>
  );
};

export default Contact;
