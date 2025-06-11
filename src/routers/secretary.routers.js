import express from "express";
import { Secretary } from "../Models/Seceratary.models.js";
import { isLoggedIn } from "../middlewares/auth.middlewares.js";
import { User } from "../Models/User.models.js";
const router = express.Router();

/* ----------------------------------------------
   Route: Register Secretary
   Endpoint: POST /api/secretary
------------------------------------------------ */
router.post("/api/secretary", async (req, res) => {
  try {
    console.log("Received data:", req.body);

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

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !dob ||
      !societyName ||
      !societyAddress ||
      !password ||
      !cpass ||
      !fullAddress
    ) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await Secretary.findOne({ email });
    if (user) {
      return res.status(500).json({ error: "user already exists with same email" });
    }
    // Save to database
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

    console.log("Saving data to DB");
    await newEntry.save();

    res.status(201).json({ message: "Secretary data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ----------------------------------------------
   Route: Secretary Login
   Endpoint: POST /api/secretary/login
------------------------------------------------ */
router.post("/api/secretary/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    // Find user in DB
    const user = await Secretary.findOne({ email });

    // Check user and password
    if (!user || user.password !== password) {
      console.log("Invalid email or password");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ Store session
    req.session.societyEmail = email;
    req.session.idr=user._id;
    console.log("Session created:", req.session);

    res.status(200).json({ message: "Login successful", email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/dashboard", isLoggedIn, function (req, res) {
  res.render("dashboard", { user: req.user })
})


/* ----------------------------------------------
   Route: seceratory is registyring new member
   Endpoint: POST /api/addmember
*/

router.post("/api/addmember", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const {
      phone,
      flatNo
    } = req.body;
    const secretary = await Secretary.findOne({ email: req.session.societyEmail });
    const id = secretary._id;
    // Validate required fields
    if (
      !phone || !flatNo
    ) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await User.findOne({ phone,secretaryId:id});
    if (user) {
      return res.status(500).json({ error: "user already exists with same phone no in your society" });
    }
    // Save to database
   const newEntry = new User({
  phone,
  flatNo,
  secretaryId: id
});

    console.log("Saving data to DB");
    await newEntry.save();

   res.redirect('/addmember');
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});




export default router;
