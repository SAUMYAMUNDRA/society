import express from "express";
import { Secretary } from "../Models/Seceratary.models.js";

const router = express.Router();

router.post("/api/secretary", async (req, res) => {
  
  try {
    console.log("recieved data",req.body);
    
    const {
      name,
      email,
      phone,
      dob,
      societyName,
      societyAddress,
      password,
      cpass,
      fullAddress,
    } = req.body;
    if (
      !name || !email || !phone || !dob ||
      !societyName || !societyAddress ||
      !password || !cpass || !fullAddress
    ) {
      console.log("return data");
      
      return res.status(400).json({ error: "All fields are required." });
      
    }
    const newEntry = new Secretary({
      name,
      email,
      phone,
      dob,
      societyName,
      societyAddress,
      password,
      cpass,
      fullAddress,
    });
    console.log("sending data to db");
    
    await newEntry.save();

    res.status(201).json({ message: "Secretary data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// POST /api/secretary/login
router.post("/api/secretary/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the secretary by email
    const user = await Secretary.findOne({ email });

    // If user not found or password doesn't match
    if (!user || user.password !== password) {
      console.log("user not found or pass dont match");
      
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Success
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



export default router;
