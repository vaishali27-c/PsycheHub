import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const specializations = [
  "Clinical Psychologist",
  "Counseling Psychologist",
  "Child & Adolescent Psychologist",
  "Geriatric Psychologist",
  "Addiction & Rehabilitation Psychologist",
];

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState(speciality || "");
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  // Filter doctors based on selected specialty
  useEffect(() => {
    if (selectedSpeciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === selectedSpeciality));
    } else {
      setFilterDoc(doctors);
    }
  }, [doctors, selectedSpeciality]);

  return (
    <div className="max-w-screen-lg mx-auto p-5">
      <h2 className="text-2xl font-bold mb-6 text-center">Browse Specialist Psychologists</h2>

      {/* Specialties List */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {specializations.map((spec, index) => (
          <button 
            key={index} 
            onClick={() => setSelectedSpeciality(spec)} 
            className={`px-4 py-2 rounded-lg border cursor-pointer transition ${
              selectedSpeciality === spec ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {filterDoc.length > 0 ? (
          filterDoc.map((item, index) => (
            <div 
              key={index} 
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-300 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg p-4 flex flex-col items-center text-center"
            >
              <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-full" />
              <p className="mt-3 text-lg font-semibold">{item.name}</p>
              <p className="text-gray-500">{item.speciality}</p>
              <p className="text-green-600 text-sm">Available</p>
            </div>
          ))
        ) : (
          <p className="text-red-500 text-center col-span-full">No doctors found for this specialty.</p>
        )}
      </div>
    </div>
  );
};

export default Doctors;
