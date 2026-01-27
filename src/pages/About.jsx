import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="p-6 bg-gray-100">
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-gray-800">
          ABOUT <span className="text-blue-500">US</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <img 
          src={assets.about_image} 
          alt="About Us" 
          className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-lg shadow-lg" 
        />

        <div className="md:w-1/2 text-gray-700">
          <p className="text-lg">
            At <b>PsycheHub</b>, we are dedicated to connecting individuals with trusted psychologists and mental 
            health professionals. Our mission is to provide a seamless, secure, and accessible platform for online 
            consultations, ensuring that mental well-being is just a click away.
          </p>
          <p className="mt-4">
            With a team of experienced professionals, we strive to create a supportive environment where users 
            can find expert guidance, book appointments effortlessly, and access resources tailored to their needs. 
            Whether you're seeking therapy, counseling, or mental health insights, <b>PsycheHub</b> is here to 
            empower you on your journey to wellness.
          </p>
        </div>
      </div>

      <div className="text-xl my-6 text-center font-semibold text-gray-800">
        <p>WHY <span className="text-blue-500">CHOOSE US?</span></p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow-md rounded-lg text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
          <b className="text-lg text-blue-600 hover:text-blue-700">Expert Psychologists</b>
          <p className="text-gray-600 mt-2">
            Connect with certified and experienced professionals specializing in various mental health concerns.
          </p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-lg text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
          <b className="text-lg text-blue-600 hover:text-blue-700">Confidential & Secure</b>
          <p className="text-gray-600 mt-2">
            We ensure that your consultations remain completely private and your data stays protected.
          </p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-lg text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
          <b className="text-lg text-blue-600 hover:text-blue-700">Easy & Accessible</b>
          <p className="text-gray-600 mt-2">
            Book appointments, access resources, and receive support from the comfort of your home.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
