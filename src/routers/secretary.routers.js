
import express from "express";
import { Secretary } from "../Models/Seceratary.models.js";
import { isLoggedIn } from "../middlewares/isLLoggedIn.js";
import { User } from "../Models/User.models.js";
import { Notice } from "../Models/Notice.models.js";
import isSecretary from "../middlewares/isSecretary.auth.js";
import { Createticket } from '../Models/Createticket.models.js';
import isWorker from "../middlewares/isWorker.js";
import { MaintenanceBills } from "../Models/Maintenancebills.models.js";
import { Event } from "../Models/Event.models.js";
import { EventRegistration } from "../Models/EventRegistration.models.js";
import { name } from "ejs";

const router = express.Router();

// ----------------------------------------------
// 🔐 Secretary Registration & Login Routes
// ----------------------------------------------

router.post("/api/secretary", async (req, res) => {
  try {
    const {
      name, email, phone, dob,
      societyName, societyAddress,
      password, cpass, fullAddress
    } = req.body;

    if (!name || !email || !phone || !dob || !societyName || !societyAddress || !password || !cpass || !fullAddress) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const user = await Secretary.findOne({ email });
    if (user) return res.status(500).json({ error: "User already exists." });

    await new Secretary({
      name, email, phone, dob, societyName,
      societyAddress, password, cpass, fullAddress
    }).save();

    res.status(201).json({ message: "Secretary registered successfully" });
  } catch (error) {
    console.error("Error saving secretary:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/api/secretary/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await Secretary.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ error: "Invalid email or password" });

    req.session.idr = user._id;
    req.session.role = "secretary";
    req.session.pass = password;
    res.status(200).json({ message: "Login successful", email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// ----------------------------------------------
// 👤 Member Management
// ----------------------------------------------

router.post("/api/addmember", isSecretary, async (req, res) => {
  try {
    const { phone, flatNo, role } = req.body;
    if (!phone || !flatNo) return res.status(400).json({ error: "All fields are required." });

    const existing = await User.findOne({ phone });
    if (existing) return res.status(500).json({ error: "User already exists with same phone" });

    const secId = req.session.idr;
    await new User({ phone, flatNo, secretaryId: secId, role: role || "member" }).save();

    res.redirect('/addmember');
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------------------------
// 📢 Notice Publishing
// ----------------------------------------------

router.post("/api/notice", isSecretary, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "All fields are required." });

    const secId = req.session.idr;
    await new Notice({ title, content, secretaryId: secId }).save();

    res.redirect('/notice');
  } catch (error) {
    console.error("Error publishing notice:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------------------------
// 🛠️ Worker Routes
// ----------------------------------------------

router.get("/worker-dashboard", isWorker, async (req, res) => {
  try {
    const worker = req.user;
    const tickets = await Createticket.find({ Secid: worker.secretaryId }).sort({ _id: -1 }).populate("Userid", "flatNo");
    res.render("worker_dashboard", { worker, tickets });
  } catch (err) {
    console.error("Worker dashboard error:", err);
    res.status(500).send("Server Error");
  }
});

router.post("/api/ticket/close/:id", isWorker, async (req, res) => {
  try {
    await Createticket.findByIdAndUpdate(req.params.id, { Status: "Closed" });
    res.redirect("/worker-dashboard");
  } catch (err) {
    console.error("Error closing ticket:", err);
    res.status(500).send("Failed to close ticket");
  }
});

// ----------------------------------------------
// 🧑‍💼 Member Login + Create Ticket
// ----------------------------------------------

router.post("/api/member/login", async (req, res) => {
  try {
    const { PhoneNo, password } = req.body;
    if (!PhoneNo || !password) return res.status(400).json({ error: "All fields are required." });

    const user = await User.findOne({ phone: PhoneNo });
    if (user) {
      req.session.userid = user._id;
      req.session.role = user.role;
      return res.redirect(user.role === "worker" ? "/worker-dashboard" : "/society");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/api/rms/createticket", async (req, res) => {
  try {
    const { category, date_available, contact_no, description } = req.body;
    const userId = req.session.userid;
    const user = await User.findById(userId);
    const secretary = await Secretary.findById(user.secretaryId);

    const ticket = new Createticket({
      Userid: userId,
      Secid: secretary._id,
      Flatno: user.flatNo,
      Category: category,
      Prefered_date_and_time: date_available,
      Conatctno: contact_no,
      Description: description,
      Status: "Pending"
    });

    await ticket.save();
    res.redirect('/showtickets_page.html');
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).send("Internal Server Error");
  }
});





// ----------------------------------------------
// 🛠️ Event Routes
// ----------------------------------------------
router.get('/event/create',isSecretary,(req,res)=>{
  res.render('event_create')
});


router.post('/event/create',isSecretary,async (req,res)=>{
  const { title, description, date, time, venue, organizer, capacity}=req.body;
  try {
        const newEvent=new Event({
      title,
      description,
      date,
      time,
      venue,
      organizer,
      capacity: capacity ? Number(capacity) : undefined,
      createdBy: req.session.secretaryId //check
    });
    await newEvent.save();
    console.log("event created sucessfully");
    res.redirect('/list');
        
  } catch (error) {
      console.error("error creating event",error);
      res.status(500).send('Error creating event');
      
  }
})




// ----------------------------------------------
// 🛠️ Event Routes to show all tickets
// ----------------------------------------------

router.get('/list',isLoggedIn, async (req,res)=>{
  try {
      const events=await Event.find().sort({date:1});
      const userId=req.session.userid;
      const secretaryId=req.session.idr;
      console.log(secretaryId);
      res.render('event_list',{
        events,
        userId,
         //check
        secretaryId,//check
      }) 
        
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).send('Error fetching events');
  }
})





// ----------------------------------------------
// 🧑‍💼 Event registration and capacity check for member
// ----------------------------------------------
router.post('/register/:eventId',isLoggedIn,async (req,res)=>{
  const eventId=req.params.eventId;
  const user=req.session.userId;
  try {
        const event=await Event.findById(eventId);
        if(!event){
            console.log("event not found");
            return res.status(404).send("event not found");
        }
        const already_registerd=await EventRegistration.findOne({eventId, user});;
        if(already_registerd){
          return res.send(`you have already reg for event ${event.title}`);
        }
        if(event.capacity){
          const count=await EventRegistration.countDocuments({eventId});
          if(count>=event.capacity){
             return res.send('⚠️ Event is full. Registration closed.');
          }
        }
        const newreg=new EventRegistration({eventId,user});
        await newreg.save();
        res.redirect('/event/list');
  } catch (error) {
      console.error("registration error",error);
      res.status(500).send("registration error");
      
  }
})


// ----------------------------------------------
// 🧑‍💼 show count of event memebers to sec
// ----------------------------------------------
router.get('/event/attendees/:eventId', isSecretary, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send('Event not found');

    const registrations = await EventRegistration.find({ eventId }).populate('userId');
    res.render('event_attendees', { event, registrations });

  } catch (error) {
    console.error("Error fetching list of attendees:", error);
    res.status(500).send("Error fetching list of attendees");
  }
});








export default router;


