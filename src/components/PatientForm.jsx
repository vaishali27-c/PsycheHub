import React, { useState } from "react";

const PatientForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    address: "",
    symptoms: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/addPatient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Patient added successfully!");
        setFormData({ name: "", age: "", email: "", phone: "", address: "", symptoms: "" });
      } else {
        alert("Error adding patient");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required />
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
      <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
      <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} placeholder="Symptoms" required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Patient</button>
    </form>
  );
};

export default PatientForm;
