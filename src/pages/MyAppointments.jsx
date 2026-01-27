import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './appointmentStyles.css';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const appointmentRefs = useRef({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for the back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const patientData = localStorage.getItem('patient');
    if (!patientData) {
      toast.info('Please log in to view your appointments');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const patient = JSON.parse(patientData);
      const response = await axios.get(`http://localhost:8080/api/patient-appointments/${patient.id}`);
      
      if (response.data.success) {
        // Sort appointments by date (newest first)
        const sorted = response.data.appointments.sort((a, b) => 
          new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );
        setAppointments(sorted);
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch your appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const patientData = localStorage.getItem('patient');
    if (!patientData) {
      toast.info('Please log in to cancel an appointment');
      navigate('/login');
      return;
    }

    try {
      setCancellingId(appointmentId);
      const patient = JSON.parse(patientData);
      
      const response = await axios.put(`http://localhost:8080/api/cancel-appointment/${appointmentId}`, {
        patientId: patient.id
      });
      
      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        // Update the appointments list
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === appointmentId 
              ? { ...apt, status: 'cancelled', cancelledAt: new Date() } 
              : apt
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatAppointmentDate = (dateString) => {
    try {
      // Check if we have a valid date string
      if (!dateString) return "N/A";
      
      // Handle different date formats
      let date;
      
      // Handle Firestore timestamp object (has seconds and nanoseconds)
      if (dateString && typeof dateString === 'object' && dateString.seconds) {
        date = new Date(dateString.seconds * 1000);
      } 
      // Handle string date format
      else if (typeof dateString === 'string') {
        date = new Date(dateString);
      }
      // Handle date object
      else if (dateString instanceof Date) {
        date = dateString;
      } 
      else {
        return "Invalid Date";
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      },
      completed: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      },
      cancelled: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      },
      rescheduled: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        )
      }
    };

    const config = statusConfig[status] || {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: null
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.bgColor} ${config.textColor}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleDownloadPDF = async (appointment) => {
    try {
      setDownloadingId(appointment._id);
      
      if (!appointmentRefs.current[appointment._id]) {
        toast.error('Unable to generate PDF. Please try again.');
        return;
      }
      
      const element = appointmentRefs.current[appointment._id];
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add PsycheHub header
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text('PsycheHub', 105, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Your Mental Health Partner', 105, 22, { align: 'center' });
      
      // Add a horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(10, 25, 200, 25);
      
      // Add appointment confirmation title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Appointment Confirmation', 105, 35, { align: 'center' });
      
      // Add appointment details in text format for better clarity
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);
      
      // Add details
      const startY = 45;
      const lineHeight = 7;
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Patient Details:', 15, startY);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Name: ${appointment.patientName || 'N/A'}`, 15, startY + lineHeight);
      pdf.text(`Email: ${appointment.patientEmail || 'N/A'}`, 15, startY + lineHeight * 2);
      pdf.text(`Contact: ${appointment.patientContactNumber || 'N/A'}`, 15, startY + lineHeight * 3);
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Doctor Details:', 15, startY + lineHeight * 5);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Name: ${appointment.doctorName || 'N/A'}`, 15, startY + lineHeight * 6);
      pdf.text(`Speciality: ${appointment.doctorSpeciality || 'N/A'}`, 15, startY + lineHeight * 7);
      pdf.text(`Consultation Fee: ₹${appointment.doctorFees || 'N/A'}`, 15, startY + lineHeight * 8);
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Appointment Details:', 15, startY + lineHeight * 10);
      pdf.setFont(undefined, 'normal');

      const appointmentDate = appointment.formattedAppointmentDate || 
        formatAppointmentDate(appointment.appointmentDate) || 
        appointment.appointmentDateString || 'N/A';
      
      pdf.text(`Date: ${appointmentDate}`, 15, startY + lineHeight * 11);
      pdf.text(`Time: ${appointment.appointmentTime || 'N/A'}`, 15, startY + lineHeight * 12);
      pdf.text(`Status: ${appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'N/A'}`, 15, startY + lineHeight * 13);
      
      if (appointment.payment) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Payment Details:', 15, startY + lineHeight * 15);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Payment ID: ${appointment.payment.id || 'N/A'}`, 15, startY + lineHeight * 16);
        pdf.text(`Amount Paid: ₹${appointment.payment.amount || '0'}`, 15, startY + lineHeight * 17);
        pdf.text(`Payment Status: ${appointment.payment.status || 'N/A'}`, 15, startY + lineHeight * 18);
      }
      
      // Add the appointment card image
      pdf.addImage(imgData, 'PNG', 10, startY + lineHeight * 20, pdfWidth - 20, pdfHeight * 0.5);
      
      // Important information section
      const importantY = startY + lineHeight * 20 + pdfHeight * 0.5 + 10;
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(220, 38, 38); // Red color
      pdf.text('Important Information:', 15, importantY);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.text('1. Please arrive 15 minutes before your scheduled appointment time.', 15, importantY + lineHeight);
      pdf.text('2. Bring your ID proof and any previous medical records if applicable.', 15, importantY + lineHeight * 2);
      pdf.text('3. Cancellations should be made at least 24 hours before the appointment.', 15, importantY + lineHeight * 3);
      pdf.text('4. For any queries, please contact our support at support@psychehub.com', 15, importantY + lineHeight * 4);
      
      // Add footer
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(10, 280, 200, 280);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('PsycheHub - Your Mental Health Partner', 105, 285, { align: 'center' });
      pdf.text(`Downloaded on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 290, { align: 'center' });
      
      // Save the PDF
      pdf.save(`PsycheHub_Appointment_${appointment.doctorName.replace(/\s+/g, '_')}_${appointmentDate.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('Appointment details downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download appointment details. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse mt-6"></div>
            <div className="flex gap-3 mt-4">
              <div className="h-10 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-600">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
            <p className="text-gray-600">View and manage your scheduled appointments</p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Book New Appointment
          </button>
        </div>
        
        {appointments.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-10 text-center border border-gray-100">
            <div className="bg-blue-50 w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center">
              <img 
                src={assets.calendar_icon || "https://img.icons8.com/color/96/000000/calendar.png"} 
                alt="No Appointments" 
                className="w-14 h-14"
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">No Appointments Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">You don't have any appointments scheduled yet. Book an appointment with one of our specialists.</p>
            <button 
              onClick={() => navigate('/doctors')} 
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map(appointment => (
              <div key={appointment._id} className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 appointment-card">
                {/* Colored Status Bar */}
                <div className={`h-2 w-full ${
                  appointment.status === 'scheduled' ? 'bg-green-500' : 
                  appointment.status === 'completed' ? 'bg-blue-500' : 
                  appointment.status === 'cancelled' ? 'bg-red-500' : 
                  'bg-yellow-500'
                }`}></div>
                
                <div 
                  className="p-6"
                  ref={el => appointmentRefs.current[appointment._id] = el}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                        {appointment.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-semibold text-gray-800">{appointment.doctorName}</h2>
                          <div className="status-badge">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                        <p className="text-gray-600 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {appointment.doctorSpeciality}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-bold text-lg">₹{appointment.doctorFees}</p>
                      <p className="text-xs text-gray-500">Consultation Fee</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Appointment Date</p>
                        <p className="font-medium text-gray-800">
                          {appointment.formattedAppointmentDate || 
                            (appointment.appointmentDateString 
                              ? formatAppointmentDate(appointment.appointmentDate) !== "Invalid Date" 
                                  ? formatAppointmentDate(appointment.appointmentDate) 
                                  : appointment.appointmentDateString
                              : formatAppointmentDate(appointment.appointmentDate))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Appointment Time</p>
                        <p className="font-medium text-gray-800">
                          {appointment.appointmentTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booking Date</p>
                        <p className="font-medium text-gray-800">
                          {appointment.formattedCreatedAt || formatAppointmentDate(appointment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Information */}
                  {appointment.payment && (
                    <div className="mt-5 border-t border-gray-200 pt-5">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h3>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <p className="font-medium text-green-600">
                              {appointment.payment.status || 'Completed'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Booking Fee</p>
                          <p className="font-medium text-gray-800">₹{appointment.payment.amount || 10}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment ID</p>
                          <p className="font-medium text-xs text-gray-700 max-w-[120px] truncate">
                            {appointment.payment.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 pb-6 pt-2 flex justify-between">
                  <button
                    onClick={() => handleDownloadPDF(appointment)}
                    className="px-4 py-2.5 bg-white border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-sm download-button"
                    disabled={downloadingId === appointment._id}
                  >
                    {downloadingId === appointment._id ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </>
                    )}
                  </button>
                  
                  {appointment.status === 'scheduled' && (
                    <button 
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1.5 pulse-animation"
                      disabled={cancellingId === appointment._id}
                    >
                      {cancellingId === appointment._id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Appointment
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {appointment.status === 'cancelled' && (
                  <div className="px-6 pb-4 text-sm text-gray-500 text-right italic">
                    Cancelled on {formatAppointmentDate(appointment.cancelledAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MyAppointments;
