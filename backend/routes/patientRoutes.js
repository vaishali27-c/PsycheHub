const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");

// Temporary in-memory store for OTPs
const otpStore = {};


// Debug route to check if API is working
router.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new patient
    const newPatient = await Patient.create({ name, email, password });
    
    res.status(201).json({ 
      message: "Patient registered successfully",
      patient: {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      message: "Login successful",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        contactNumber: patient.contactNumber,
        address: patient.address,
        photoURL: patient.photoURL
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Google Authentication Route
router.post("/google-auth", async (req, res) => {
  try {
    const { name, email, googleId, photoURL } = req.body;
    
    // Validate request data
    if (!name || !email || !googleId) {
      return res.status(400).json({ message: "Missing required fields: name, email, or googleId" });
    }
    
    console.log("Google auth request received:", { name, email, googleId: googleId.substring(0, 5) + '...', hasPhoto: !!photoURL });
    
    // Check if user already exists
    let patient = await Patient.findOne({ email });
    
    if (patient) {
      console.log("Existing user found with email:", email);
      // If user exists but doesn't have googleId or photoURL, update it
      if (!patient.googleId || (photoURL && !patient.photoURL)) {
        await Patient.update(patient._id, { 
          googleId, 
          ...(photoURL && { photoURL })
        });
        console.log("Updated existing user with Google ID and/or photo");
        
        // Get updated patient
        patient = await Patient.findOne({ email });
      }
    } else {
      // Create new patient with Google info
      console.log("Creating new user from Google auth");
      patient = await Patient.create({
        name,
        email,
        googleId,
        photoURL
      });
      console.log("New user created successfully");
    }

    res.json({ 
      message: "Google authentication successful",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        contactNumber: patient.contactNumber,
        address: patient.address,
        photoURL: patient.photoURL
      }
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: err.message || "Server error during Google authentication" });
  }
});

// Add Patient
router.post("/addPatient", async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    await newPatient.save();
    res.status(201).send("Patient added successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get Patients
router.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).send(err.message);
  }
});

// Update Profile Route
router.put("/update-profile", async (req, res) => {
  try {
    const { userId, email, name, age, contactNumber, address } = req.body;
    
    console.log("Update profile request received:", { userId, email, name, hasAge: !!age, hasContact: !!contactNumber, hasAddress: !!address });
    
    if (!userId || !email) {
      console.error("Missing required fields for profile update:", { hasUserId: !!userId, hasEmail: !!email });
      return res.status(400).json({ message: "User ID and email are required" });
    }
    
    // Find the patient by email
    const patient = await Patient.findOne({ email });
    
    if (!patient) {
      console.error("Patient not found for profile update:", { email });
      return res.status(404).json({ message: "Patient not found" });
    }
    
    console.log("Found patient for update:", { id: patient._id, email: patient.email });
    
    // Update patient fields
    const updatedFields = { 
      name: name || patient.name,
      age: age || patient.age,
      contactNumber: contactNumber || patient.contactNumber,
      address: address || patient.address
    };
    
    // Remove undefined values
    Object.keys(updatedFields).forEach(key => 
      updatedFields[key] === undefined && delete updatedFields[key]
    );
    
    console.log("Updating patient with fields:", updatedFields);
    
    // Update in database
    const updatedPatient = await Patient.update(patient._id, updatedFields);
    
    if (!updatedPatient) {
      console.error("Update operation did not return patient data");
      throw new Error("Update failed to return patient data");
    }
    
    console.log("Patient updated successfully:", { id: updatedPatient._id });
    
    res.json({ 
      message: "Profile updated successfully",
      patient: {
        id: updatedPatient._id,
        name: updatedPatient.name,
        email: updatedPatient.email,
        age: updatedPatient.age,
        contactNumber: updatedPatient.contactNumber,
        address: updatedPatient.address,
        photoURL: updatedPatient.photoURL
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
});

module.exports = router;
