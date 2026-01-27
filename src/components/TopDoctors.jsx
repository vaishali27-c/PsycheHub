import React from 'react';
import { doctors } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const TopDoctors = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-start gap-6 my-16 text-gray-900 md:mx-10'>
      {/* Heading */}
      <h1 className='text-4xl font-semibold'>Top Doctors to Book</h1>
      <p className='w-full sm:w-2/3 text-left text-base'>
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* Doctors Grid */}
      <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-5 px-3 sm:px-0'>
        {doctors.slice(0, 15).map((item, index) => (
          <div 
            key={index} 
            onClick={() => navigate(`/appointment/${item._id}`)}
            className='border border-blue-300 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg p-2 flex flex-col items-center text-center min-h-[180px]'
          >
            {/* Doctor Image */}
            <img src={item.image} alt={item.name} className='w-32 h-32 object-cover rounded-full' />
            
            {/* Doctor Name */}
            <p className='mt-3 text-lg font-semibold'>{item.name}</p>
            
            {/* Availability Status */}
            <p className='text-green-600 text-sm'>Available</p>
          </div>
        ))}
      </div>

      {/* Centered More Button */}
      <div className='flex justify-center w-full'>
        <button 
          onClick={() => {
            navigate('/doctors');
            window.scrollTo(0, 0);
          }} 
          className='mt-6 px-5 py-2 bg-blue-500 text-white rounded-lg text-lg font-medium hover:bg-blue-600 transition-all'
        >
          More
        </button>
      </div>

    </div>
  );
}

export default TopDoctors;
