import React from "react";

const Footer = () => {
  return (
    <div className="bg-gray-100 py-12 px-6 md:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-10 text-sm">
        
        {/* --- Left Section --- */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500 text-transparent bg-clip-text drop-shadow-lg">
            PsycheHub
          </h1>
          <p className="text-gray-600 mt-4 leading-6">
            We are honored to be part of your journey, committed to delivering **compassionate, personalized,** and **top-notch** care at every step.
          </p>
          <p className="mt-2">Trust us with your health, and let’s work together for the best outcomes.</p>
        </div>

        {/* --- Center Section --- */}
        <div>
          <p className="text-xl font-semibold mb-4 text-gray-800">Company</p>
          <ul className="text-gray-600 flex flex-col gap-2">
            <li className="hover:text-indigo-600 cursor-pointer">Home</li>
            <li className="hover:text-indigo-600 cursor-pointer">About Us</li>
            <li className="hover:text-indigo-600 cursor-pointer">Contact Us</li>
            <li className="hover:text-indigo-600 cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* --- Right Section --- */}
        <div>
          <p className="text-xl font-semibold mb-4 text-gray-800">Get in Touch</p>
          <ul className="text-gray-600 flex flex-col gap-2">
            <li className="hover:text-indigo-600 cursor-pointer">📞 +91 84688XXXXX</li>
            <li className="hover:text-indigo-600 cursor-pointer">📧 xyz@gmail.com</li>
          </ul>
          {/* Social Icons Placeholder */}
          <div className="flex gap-4 mt-4">
            <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">🔵 FB</span>
            <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">🐦 Twitter</span>
            <span className="text-gray-600 hover:text-indigo-600 cursor-pointer">📸 Instagram</span>
          </div>
        </div>
      </div>

      {/* --- Copyright Text --- */}
      <hr className="my-6 border-gray-300" />
      <p className="text-center text-gray-600 text-sm">
        © 2025 PsycheHub - All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
