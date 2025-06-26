import express from "express";
import { Secretary } from "../Models/Seceratary.models.js";
import { isLoggedIn } from "../middlewares/isLLoggedIn.js";
import { User } from "../Models/User.models.js";
import { Notice } from "../Models/Notice.models.js";
import isSecretary from "../middlewares/isSecretary.auth.js";
import {Createticket} from '../Models/Createticket.models.js'
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
    req.session.idr=user._id;
    req.session.role = "secretary";
    req.session.pass = password;
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

router.post("/api/addmember",isSecretary, async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const {
      phone,
      flatNo,
      role
    } = req.body;
    const secretary = await Secretary.findOne({ _id: req.session.idr });
    const id = secretary._id;
    // Validate required fields
    if (
      !phone || !flatNo
    ) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await User.findOne({ phone });
    if (user) {
      return res.status(500).json({ error: "user already exists with same phone no in your society" });
    }
    // Save to database
   const newEntry = new User({
  phone,
  flatNo,
  secretaryId: id,
  role:role || "member"
});

    console.log("Saving data to DB");
    await newEntry.save();

   res.redirect('/addmember');
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});



/* ----------------------------------------------
   Route: seceratory is publishing notice
   Endpoint: POST /api/notice
*/


router.post("/api/notice",isSecretary, async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const {
      title,
      content
    } = req.body;
    const secretary = await Secretary.findOne({ _id:req.session.idr});
    const id = secretary._id;
    
    if (
      !title || !content
    ) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "All fields are required." });
    }
    // Save to database
   const newEntry = new Notice({
  title,
  content,
  secretaryId: id
});

    console.log("Saving data to DB");
    await newEntry.save();

   res.redirect('/notice');
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Server error" });
  }
});



/* ----------------------------------------------
   Route: worker dashboard route
   Endpoint: POST /api/notice
*/
import isWorker from "../middlewares/isWorker.js"; // ⬅️ make sure this import is correct

router.get("/worker-dashboard", isWorker, async (req, res) => {
  try {
    const worker = req.user; // from middleware

    const tickets = await Createticket.find({ Secid: worker.secretaryId })
      .sort({ _id: -1 })
      .populate("Userid", "flatNo");

    res.render("worker_dashboard", { worker, tickets });
  } catch (err) {
    console.error("Worker dashboard error:", err);
    res.status(500).send("Server Error");
  }
});



/* ----------------------------------------------
   Route: worker ticket close
*/

router.post("/api/ticket/close/:id",isWorker, async (req, res) => {
  try {
    const ticketId = req.params.id;

    // Update ticket status to Closed
    await Createticket.findByIdAndUpdate(ticketId, { Status: "Closed" });

    console.log(`Ticket ${ticketId} marked as Closed ✅`);
    res.redirect("/worker-dashboard");
  } catch (err) {
    console.error("Error closing ticket:", err);
    res.status(500).send("Failed to close ticket");
  }
});








router.post("/api/member/login", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const {
      PhoneNo,
      password
    } = req.body;

    if (
      !PhoneNo || !password
    ) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "All fields are required." });
    }

    
    
    const user = await User.findOne({ "phone":  PhoneNo });
    if(user){
      console.log("adding to session");
      
       
        req.session.userid=user._id;
        req.session.role = user.role;
         console.log("✅ Session set:", req.session);
    }
    


   if (user.role === "worker") {
  res.redirect("/worker-dashboard");
} else {
  res.redirect("/society");
}
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});





router.post("/api/rms/createticket", async (req, res) => {
  try {
    const {
      category,
      date_available,
      contact_no,
      description,
      
    } = req.body;
   
    
    const userId = req.session.userid;
   
    const user= await User.findOne({_id:userId})
    
    console.log("user:",user);
    
    
   
    
    const secretary = await Secretary.findOne({ _id: user.secretaryId });
     console.log("seceratary:",secretary);
     
    const id = secretary._id;

    
    const secId = id; 
    const flatNo = user.flatNo; 
    
    
    const ticket = new Createticket ({
      Userid: userId,
      Secid: secId,
      Flatno: flatNo,
      Category: category,
      Prefered_date_and_time: date_available,
      Conatctno: contact_no,
      Description: description,
      Status: "Pending"
    });

  await ticket.save();
console.log("query received");
res.redirect('/showtickets_page.html');
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).send("Internal Server Error");
  }
});export default router;