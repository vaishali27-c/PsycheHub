import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import axios from 'axios';
import { toast } from 'react-toastify';

// Razorpay key
const RAZORPAY_KEY_ID = 'rzp_test_QwvAbXdZeqlDqE';
const BOOKING_FEE = 10; // Fixed booking fee in INR

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]); // To track already booked slots
  
  useEffect(() => {
    if (doctors?.length > 0) {
      const doctor = doctors.find(doc => doc._id === docId);
      setDocInfo(doctor);

      const today = new Date();
      let allSlots = [];

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today.getTime()); // Clone the date
        currentDate.setDate(today.getDate() + i);

        let timeSlots = [
          { dateTime: new Date(currentDate.setHours(9, 0, 0, 0)), time: "09:00 AM" },
          { dateTime: new Date(currentDate.setHours(13, 0, 0, 0)), time: "01:00 PM" },
          { dateTime: new Date(currentDate.setHours(17, 0, 0, 0)), time: "05:00 PM" },
          { dateTime: new Date(currentDate.setHours(20, 0, 0, 0)), time: "08:00 PM" }
        ];

        allSlots.push(timeSlots);
      }

      setDocSlots(allSlots);

      // Automatically set first available slot
      if (allSlots.length > 0) {
        setSelectedDayIndex(0); // Select the first available day
        setSelectedSlot(allSlots[0][0].time); // Select the first available time slot
      }
      
      // Fetch already booked slots for this doctor
      fetchBookedSlots(docId);
    }
  }, [doctors, docId]);
  
  // Function to fetch already booked slots
  const fetchBookedSlots = async (doctorId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/doctor-appointments/${doctorId}`);
      if (response.data.success) {
        // Extract the appointment dates as ISO strings for comparison
        const booked = response.data.appointments.map(apt => 
          new Date(apt.appointmentDate).toISOString()
        );
        setBookedSlots(booked);
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      // Don't show error toast to user as this is a background operation
    }
  };
  
  // Check if a slot is already booked
  const isSlotBooked = (slotDateTime) => {
    const slotISO = slotDateTime.toISOString();
    return bookedSlots.includes(slotISO);
  };
  
  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Handle booking appointment
  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    
    const patientData = localStorage.getItem('patient');
    
    if (!patientData) {
      toast.info('Please log in to book an appointment');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    
    try {
      const patient = JSON.parse(patientData);
      const selectedDate = docSlots[selectedDayIndex][0].dateTime;
      
      // Find the selected time slot
      const selectedTimeSlot = docSlots[selectedDayIndex].find(slot => slot.time === selectedSlot);
      
      if (!selectedTimeSlot) {
        toast.error('Invalid time slot selected');
        setLoading(false);
        return;
      }
      
      // Check if Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      
      if (!isLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }
      
      // Create Razorpay order
      const orderResponse = await axios.post('http://localhost:8080/api/create-razorpay-order', {
        amount: BOOKING_FEE,
        receipt: `booking_${Date.now()}`,
        name: patient.name,
        email: patient.email
      });
      
      if (!orderResponse.data.success) {
        toast.error('Failed to create payment order');
        setLoading(false);
        return;
      }
      
      const order = orderResponse.data.order;
      
      // Open Razorpay payment form
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PsycheHub",
        description: "Appointment Booking Fee",
        order_id: order.id,
        image: assets.logo,
        handler: async function (response) {
          try {
            // Verify payment signature
            const verifyResponse = await axios.post('http://localhost:8080/api/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            if (!verifyResponse.data.success) {
              toast.error('Payment verification failed');
              setLoading(false);
              return;
            }
            
            // Book appointment after successful payment
            const appointmentData = {
              patientId: patient.id,
              doctorId: docInfo._id,
              appointmentDate: selectedDate.toISOString().split('T')[0], // Get date part
              appointmentTime: selectedSlot,
              doctorName: docInfo.name,
              doctorSpeciality: docInfo.speciality,
              doctorFees: docInfo.fees,
              patientName: patient.name,
              patientEmail: patient.email,
              patientContactNumber: patient.contactNumber || '',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id
            };
            
            const bookingResponse = await axios.post('http://localhost:8080/api/book-appointment', appointmentData);
            
            if (bookingResponse.data.success) {
              toast.success('Appointment booked successfully!');
              navigate('/my-appointments');
            } else {
              toast.error(bookingResponse.data.message || 'Failed to book appointment');
            }
          } catch (error) {
            console.error('Error after payment:', error);
            toast.error('Something went wrong. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: patient.name,
          email: patient.email,
          contact: patient.contactNumber
        },
        notes: {
          doctor_name: docInfo.name,
          appointment_date: selectedDate.toLocaleDateString(),
          appointment_time: selectedSlot
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to book appointment. Please try again.');
      }
      setLoading(false);
    }
  };

  if (!docInfo) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Loading doctor details...
      </div>
    );
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 flex flex-col gap-6">
      
      {/* Doctor Info Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex flex-col items-center text-center">
          <div className="bg-blue-500 p-4 rounded-full">
            <img 
              src={docInfo.image} 
              alt={docInfo.name} 
              className="w-32 h-32 rounded-full object-cover shadow-lg"
            />
          </div>
          <p className="text-xl font-semibold flex items-center gap-2 mt-3">
            {docInfo.name}
            <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
          </p>
          <p className="text-gray-600">{docInfo.speciality}</p>
          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
            {docInfo.experience} Years Experience
          </button>
        </div>

        <div className="md:w-2/3">
          <p className="text-lg font-semibold flex items-center gap-2">
            About <img src={assets.info_icon} alt="Info" className="w-5 h-5" />
          </p>
          <p className="text-gray-700 mt-2">{docInfo.about}</p>

          <div className="mt-5">
            <p className="text-lg font-semibold">Qualifications</p>
            <p className="text-gray-600">{docInfo.degree} - {docInfo.speciality}</p>
          </div>

          <div className="mt-5 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg font-semibold">Appointment Fee</p>
            <p className="text-blue-600 font-bold text-xl">
              {currencySymbol}{docInfo.fees}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Slots Section */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-center">Booking Slots</p>

        {/* Days of the Week Selection */}
        <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
          {docSlots.map((slots, index) => (
            <button
              key={index}
              className={`flex flex-col items-center px-3 py-2 rounded-full text-sm font-medium w-14 ${
                selectedDayIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
              onClick={() => {
                setSelectedDayIndex(index);
                // Auto-select first available slot if current selection becomes invalid
                const availableSlots = slots.filter(slot => !isSlotBooked(slot.dateTime));
                if (availableSlots.length > 0 && (!selectedSlot || !slots.find(s => s.time === selectedSlot))) {
                  setSelectedSlot(availableSlots[0].time);
                }
              }}
            >
              <span>{daysOfWeek[slots[0].dateTime.getDay()]}</span>
              <span className="font-bold">{slots[0].dateTime.getDate()}</span>
            </button>
          ))}
        </div>

        {/* Show Limited Slots for Selected Day */}
        {docSlots[selectedDayIndex] && (
          <div className="mt-4 p-3 bg-white shadow-md rounded-md flex flex-wrap gap-3 justify-center">
            {docSlots[selectedDayIndex].map((slot, idx) => {
              const isBooked = isSlotBooked(slot.dateTime);
              return (
                <button
                  key={idx}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    isBooked 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60' 
                      : selectedSlot === slot.time
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => !isBooked && setSelectedSlot(slot.time)}
                  disabled={isBooked}
                >
                  {slot.time}
                  {isBooked && <span className="ml-1">(Booked)</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Booking Fee Notice */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>A booking fee of {currencySymbol}{BOOKING_FEE} will be charged to confirm your appointment</p>
        </div>

        {/* Book Appointment Button */}
        <div className="flex justify-center mt-4">
          <button 
            className={`px-6 py-3 rounded-full text-lg font-semibold ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white flex items-center gap-2`}
            onClick={handleBookAppointment}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay & Book Appointment'}
            {!loading && <img src={assets.razorpay_logo} alt="Razorpay" className="h-6" />}
          </button>
        </div>
      </div>

      {/* Related Doctors Component */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

    </div>
  );
};

export default Appointment;
