const { db } = require("../config/firebase-config");

// Collection reference
const appointmentsCollection = db.collection('appointments');

// Helper functions for Appointment model operations
const Appointment = {
  // Find appointments by patient ID
  findByPatient: async (patientId) => {
    try {
      const snapshot = await appointmentsCollection.where('patientId', '==', patientId).get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error finding appointments by patient:", error);
      throw error;
    }
  },
  
  // Find appointments by doctor ID
  findByDoctor: async (doctorId) => {
    try {
      const snapshot = await appointmentsCollection.where('doctorId', '==', doctorId).get();
      
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error finding appointments by doctor:", error);
      throw error;
    }
  },
  
  // Find all appointments
  findAll: async () => {
    try {
      const snapshot = await appointmentsCollection.get();
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error finding all appointments:", error);
      throw error;
    }
  },
  
  // Find appointment by ID
  findById: async (id) => {
    try {
      const docSnapshot = await appointmentsCollection.doc(id).get();
      
      if (!docSnapshot.exists) {
        return null;
      }
      
      return {
        _id: docSnapshot.id,
        ...docSnapshot.data()
      };
    } catch (error) {
      console.error("Error finding appointment by ID:", error);
      throw error;
    }
  },
  
  // Create a new appointment
  create: async (appointmentData) => {
    try {
      // Add created date
      appointmentData.createdAt = new Date();
      
      // Add to Firestore
      const docRef = await appointmentsCollection.add(appointmentData);
      
      // Return the created document with ID
      return {
        _id: docRef.id,
        ...appointmentData
      };
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },
  
  // Update an existing appointment
  update: async (id, updates) => {
    try {
      // Check if document exists before updating
      const docRef = appointmentsCollection.doc(id);
      const docSnapshot = await docRef.get();
      
      if (!docSnapshot.exists) {
        throw new Error(`Appointment with ID ${id} not found`);
      }
      
      // Perform the update
      await docRef.update(updates);
      
      // Get the updated document
      const updatedSnapshot = await docRef.get();
      
      return {
        _id: updatedSnapshot.id,
        ...updatedSnapshot.data()
      };
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },
  
  // Delete an appointment
  delete: async (id) => {
    try {
      // Check if document exists before deleting
      const docRef = appointmentsCollection.doc(id);
      const docSnapshot = await docRef.get();
      
      if (!docSnapshot.exists) {
        throw new Error(`Appointment with ID ${id} not found`);
      }
      
      // Delete the document
      await docRef.delete();
      
      return { success: true, message: "Appointment deleted successfully" };
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },
  
  // Check if a time slot is available (not booked yet)
  isSlotAvailable: async (doctorId, appointmentDate) => {
    try {
      // Ensure we have a valid date object
      let timestamp;
      
      if (appointmentDate instanceof Date) {
        // If it's already a Date object, use it
        timestamp = appointmentDate;
      } else if (typeof appointmentDate === 'string') {
        // If it's a string, convert to Date
        timestamp = new Date(appointmentDate);
      } else if (appointmentDate && typeof appointmentDate === 'object' && appointmentDate.seconds) {
        // If it's a Firestore timestamp object
        timestamp = new Date(appointmentDate.seconds * 1000);
      } else {
        // Invalid format
        throw new Error('Invalid appointment date format');
      }
      
      // Make sure the date is valid
      if (isNaN(timestamp.getTime())) {
        throw new Error('Invalid date value');
      }
      
      console.log("Checking availability for:", timestamp);
      
      // Query appointments for the same doctor on the same day (ignoring time)
      const startOfDay = new Date(timestamp);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(timestamp);
      endOfDay.setHours(23, 59, 59, 999);
      
      const snapshot = await appointmentsCollection
        .where('doctorId', '==', doctorId)
        .get();
      
      // Check if any appointment overlaps with this time slot
      // We'll consider a match if the appointment is on the same day and has the same hour
      const conflictingAppointments = snapshot.docs.filter(doc => {
        const appointmentData = doc.data();
        let existingDate;
        
        if (appointmentData.appointmentDate instanceof Date) {
          existingDate = appointmentData.appointmentDate;
        } else if (appointmentData.appointmentDate && typeof appointmentData.appointmentDate === 'object' && appointmentData.appointmentDate.seconds) {
          existingDate = new Date(appointmentData.appointmentDate.seconds * 1000);
        } else if (typeof appointmentData.appointmentDate === 'string') {
          existingDate = new Date(appointmentData.appointmentDate);
        } else {
          return false; // Skip invalid dates
        }
        
        // Skip cancelled appointments
        if (appointmentData.status === 'cancelled') {
          return false;
        }
        
        // Check if hour and day match
        return existingDate.getDate() === timestamp.getDate() &&
               existingDate.getMonth() === timestamp.getMonth() &&
               existingDate.getFullYear() === timestamp.getFullYear() &&
               existingDate.getHours() === timestamp.getHours();
      });
      
      // If there are no conflicting appointments, the slot is available
      return conflictingAppointments.length === 0;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      throw error;
    }
  }
};

module.exports = Appointment; 