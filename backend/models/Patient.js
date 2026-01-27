const { db } = require("../config/firebase-config");
const bcrypt = require("bcryptjs");


// Collection reference
const patientsCollection = db.collection('patients');

// Helper functions for Patient model operations
const Patient = {
  // Find a patient by email
  findOne: async (filter) => {
    try {
      const snapshot = await patientsCollection.where('email', '==', filter.email).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      // Return the first matching document
      const doc = snapshot.docs[0];
      return {
        _id: doc.id,
        ...doc.data(),
        // Add method to compare passwords
        comparePassword: async function(candidatePassword) {
          return await bcrypt.compare(candidatePassword, this.password);
        }
      };
    } catch (error) {
      console.error("Error finding patient:", error);
      throw error;
    }
  },
  
  // Find all patients
  find: async () => {
    try {
      const snapshot = await patientsCollection.get();
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error finding all patients:", error);
      throw error;
    }
  },
  
  // Create a new patient
  create: async (patientData) => {
    try {
      // Hash password if provided
      if (patientData.password) {
        patientData.password = await bcrypt.hash(patientData.password, 10);
      }
      
      // Set creation date
      patientData.date = new Date();
      
      // Add to Firestore
      const docRef = await patientsCollection.add(patientData);
      
      // Return the created document with ID
      return {
        _id: docRef.id,
        ...patientData
      };
    } catch (error) {
      console.error("Error creating patient:", error);
      throw error;
    }
  },
  
  // Update an existing patient
  update: async (id, updates) => {
    try {
      console.log(`Attempting to update patient with ID: ${id}`);
      
      if (!id) {
        throw new Error("Patient ID is required for update");
      }
      
      // Hash password if it's being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      // Check if document exists before updating
      const docRef = patientsCollection.doc(id);
      const docSnapshot = await docRef.get();
      
      if (!docSnapshot.exists) {
        console.error(`Patient with ID ${id} not found`);
        throw new Error(`Patient with ID ${id} not found`);
      }
      
      console.log(`Updating patient ${id} with fields:`, JSON.stringify(updates));
      
      // Perform the update
      await docRef.update(updates);
      
      // Get the updated document
      const updatedSnapshot = await docRef.get();
      
      if (!updatedSnapshot.exists) {
        throw new Error("Failed to retrieve updated patient data");
      }
      
      const updatedData = {
        _id: updatedSnapshot.id,
        ...updatedSnapshot.data()
      };
      
      console.log(`Patient ${id} updated successfully`);
      return updatedData;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  }
};

module.exports = Patient;
