const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Razorpay = require('razorpay');

// Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_test_QwvAbXdZeqlDqE',
  key_secret: 'Q0es7z4gxFiHc9dno1C3VoYP'
});

// Create Razorpay order
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, receipt, name, email } = req.body;
    
    // Validate required fields
    if (!amount || !receipt) {
      return res.status(400).json({ 
        message: "Missing required fields: amount or receipt" 
      });
    }
    
    // Amount should be in paisa (1 INR = 100 paisa)
    const options = {
      amount: amount * 100, // Convert to paisa
      currency: "INR",
      receipt: receipt,
      notes: {
        name: name || '',
        email: email || ''
      }
    };
    
    // Create the order
    razorpay.orders.create(options, (err, order) => {
      if (err) {
        console.error("Razorpay order creation error:", err);
        return res.status(500).json({ message: "Failed to create payment order" });
      }
      
      res.json({ 
        success: true,
        order: order
      });
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ message: err.message });
  }
});

// Verify Razorpay payment
router.post("/verify-razorpay-payment", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        message: "Missing payment verification details" 
      });
    }
    
    // Create signature verification data
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', 'Q0es7z4gxFiHc9dno1C3VoYP');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    
    // Verify signature
    if (generated_signature === razorpay_signature) {
      res.json({ 
        success: true,
        message: "Payment verified successfully" 
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: "Payment verification failed" 
      });
    }
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all appointments (admin only)
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get appointments for a specific patient
router.get("/patient-appointments/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    
    const appointments = await Appointment.findByPatient(patientId);
    
    res.json({ 
      success: true,
      appointments 
    });
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get appointments for a specific doctor
router.get("/doctor-appointments/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    const appointments = await Appointment.findByDoctor(doctorId);
    
    res.json({ 
      success: true,
      appointments 
    });
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({ message: err.message });
  }
});

// Book a new appointment
router.post("/book-appointment", async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      appointmentDate, 
      appointmentTime,
      doctorName,
      doctorSpeciality,
      doctorFees,
      patientName,
      patientEmail,
      patientContactNumber,
      paymentId,
      orderId
    } = req.body;
    
    // Validate required fields
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        message: "Missing required fields: patientId, doctorId, appointmentDate, or appointmentTime" 
      });
    }
    
    if (!paymentId || !orderId) {
      return res.status(400).json({ 
        message: "Payment information is required" 
      });
    }
    
    console.log("Appointment data received:", { appointmentDate, appointmentTime });
    
    // Parse the date more robustly
    let appointmentDateTime;
    
    try {
      // If appointmentDate is already a Date object
      if (appointmentDate instanceof Date) {
        appointmentDateTime = appointmentDate;
      } 
      // If appointmentDate is in ISO format (YYYY-MM-DD)
      else if (typeof appointmentDate === 'string' && appointmentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateParts = appointmentDate.split("-");
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateParts[2]);
        
        appointmentDateTime = new Date(year, month, day);
      } 
      // If it's a standard date string that JavaScript can parse
      else {
        appointmentDateTime = new Date(appointmentDate);
      }
      
      // Ensure the date is valid
      if (isNaN(appointmentDateTime.getTime())) {
        throw new Error("Invalid appointment date format");
      }
      
      // Add time to the date
      // Parse the time component
      let timeHour = 0;
      let timeMinute = 0;
      
      if (appointmentTime.includes(":")) {
        // Parse HH:MM format
        const timeParts = appointmentTime.split(":");
        let hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1].replace(/\D/g, '')); // Remove AM/PM and get just minutes
        
        // Handle AM/PM
        if (appointmentTime.toLowerCase().includes('pm') && hours < 12) {
          hours += 12;
        } else if (appointmentTime.toLowerCase().includes('am') && hours === 12) {
          hours = 0;
        }
        
        timeHour = hours;
        timeMinute = minutes;
      } else {
        // Fallback for other time formats
        console.log("Using fallback time parsing");
        const isPM = appointmentTime.toLowerCase().includes('pm');
        let hour = parseInt(appointmentTime.match(/\d+/)[0]);
        
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        
        timeHour = hour;
        timeMinute = 0;
      }
      
      // Set the time component on our date
      appointmentDateTime.setHours(timeHour, timeMinute, 0, 0);
      
    } catch (error) {
      console.error("Date parsing error:", error);
      return res.status(400).json({ 
        message: "Invalid date or time format. Please try again." 
      });
    }
    
    console.log("Parsed appointment datetime:", appointmentDateTime);
    
    // Check if the appointment slot is available
    const isAvailable = await Appointment.isSlotAvailable(doctorId, appointmentDateTime);
    
    if (!isAvailable) {
      return res.status(409).json({ message: "This appointment slot is already booked" });
    }
    
    // Create the appointment with proper date formatting
    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: appointmentDateTime,
      appointmentTime, // Store the original time string for display
      appointmentDateString: appointmentDate, // Store the original date string for display
      formattedAppointmentDate: appointmentDateTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }), // Pre-formatted date for consistent display
      doctorName,
      doctorSpeciality,
      doctorFees,
      patientName,
      patientEmail,
      patientContactNumber,
      status: 'scheduled', // scheduled, completed, cancelled
      createdAt: new Date(),
      formattedCreatedAt: new Date().toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }), // Pre-formatted booking date
      payment: {
        id: paymentId,
        orderId: orderId,
        amount: 10, // Fixed booking fee
        status: 'completed'
      }
    });
    
    res.status(201).json({ 
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment
    });
  } catch (err) {
    console.error("Error booking appointment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Cancel an appointment
router.put("/cancel-appointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required for verification" });
    }
    
    // Get the appointment to verify ownership
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Verify that the appointment belongs to the patient
    if (appointment.patientId !== patientId) {
      return res.status(403).json({ message: "You can only cancel your own appointments" });
    }
    
    // Update the appointment status
    const updatedAppointment = await Appointment.update(id, { 
      status: 'cancelled',
      cancelledAt: new Date()
    });
    
    res.json({ 
      success: true,
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment
    });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Reschedule an appointment
router.put("/reschedule-appointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, appointmentDate, appointmentTime } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    if (!patientId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        message: "Missing required fields: patientId, appointmentDate, or appointmentTime" 
      });
    }
    
    // Get the appointment to verify ownership
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Verify that the appointment belongs to the patient
    if (appointment.patientId !== patientId) {
      return res.status(403).json({ message: "You can only reschedule your own appointments" });
    }
    
    // Combine date and time to create a JavaScript Date object
    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.match(/(\d+):(\d+)/).slice(1, 3);
    const isPM = appointmentTime.toLowerCase().includes('pm');
    
    let hour = parseInt(hours);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    appointmentDateTime.setHours(hour, parseInt(minutes), 0, 0);
    
    // Check if the new appointment slot is available
    const isAvailable = await Appointment.isSlotAvailable(appointment.doctorId, appointmentDateTime);
    
    if (!isAvailable) {
      return res.status(409).json({ message: "This appointment slot is already booked" });
    }
    
    // Update the appointment
    const updatedAppointment = await Appointment.update(id, { 
      appointmentDate: appointmentDateTime,
      status: 'rescheduled',
      rescheduledAt: new Date()
    });
    
    res.json({ 
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment
    });
  } catch (err) {
    console.error("Error rescheduling appointment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a specific appointment
router.get("/appointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json({ 
      success: true,
      appointment 
    });
  } catch (err) {
    console.error("Error fetching appointment details:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 