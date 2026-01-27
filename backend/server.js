const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { db } = require("./config/firebase-config");

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;

// Debugging: Confirm .env variables
console.log("🔍 PORT:", PORT);

// Test Firestore connection
const testFirestore = async () => {
  try {
    // Try to get a document to test connection
    await db.collection('test').doc('connection').set({
      timestamp: new Date(),
      status: 'connected'
    });
    console.log("✅ Firestore connected successfully");
  } catch (err) {
    console.error("❌ Firestore connection error:", err);
  }
};

testFirestore();

// Debugging: Log incoming requests
app.use((req, res, next) => {
  console.log(`➡️ Incoming request: ${req.method} ${req.url}`);
  next();
});

// Test route to verify server is working
app.get("/test", (req, res) => {
  res.send("✅ Test route is working!");
});

// Import patient routes
try {
  const patientRoutes = require("./routes/patientRoutes");
  console.log("✅ patientRoutes.js loaded successfully");
  app.use("/api", patientRoutes);
} catch (err) {
  console.error("❌ Error loading patientRoutes.js:", err);
}

// Import appointment routes
try {
  const appointmentRoutes = require("./routes/appointmentRoutes");
  console.log("✅ appointmentRoutes.js loaded successfully");
  app.use("/api", appointmentRoutes);
} catch (err) {
  console.error("❌ Error loading appointmentRoutes.js:", err);
}

// Import auth (OTP) routes
try {
  const authRoutes = require("./routes/authRoutes");
  console.log("✅ authRoutes.js loaded successfully");
  app.use("/api/auth", authRoutes);
} catch (err) {
  console.error("❌ Error loading authRoutes.js:", err);
}


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on http://localhost:${PORT}`));
