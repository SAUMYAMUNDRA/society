
import express from "express";
import { Secretary } from "../Models/Seceratary.models.js";
import { isLoggedIn } from "../middlewares/isLLoggedIn.js";
import bcrypt from 'bcrypt';
import { User } from "../Models/User.models.js";
import { Notice } from "../Models/Notice.models.js";
import isSecretary from "../middlewares/isSecretary.auth.js";
import { Createticket } from '../Models/Createticket.models.js';
import { LostFoundItem } from "../Models/LostFoundItem.models.js";
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
    const {
       name,
      age,
      email,
      phone,
      dob,
      address,
      flatNo,
      role
     } = req.body;
 if (!name || !email || !phone || !flatNo ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

     const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: "User already exists with same phone." });
    }
     const newUser = new User({
      name,
      age,
      email,
      phone,
      dob,
      address,
      flatNo,
      secretaryId: req.session.idr,
      role: role || "member"
    });
    await newUser.save();
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
    
    if(!user){
        return res.status(401).json({ error: "User not found." });
    }
    if(!user.password){
      return res.status(401).json({ error: "Password not set. Contact secretary." });
    }

    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
       return res.status(401).json({ error: "Invalid password." });
    }
     req.session.userid = user._id;
    req.session.role = user.role;
    return res.redirect(user.role === "worker" ? "/worker-dashboard" : "/society");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------------------------
// 🧑‍💼 Member set pass for 1st time
// ----------------------------------------------
router.get('/set-password', (req, res) => {
  res.render('set_password', { success: false });
});

router.post('/set-password',async (req,res)=>{
    const {phone,password,cpassword}=req.body;
    if(!phone || !password || !cpassword){
        return res.status(400).send("All fields are required.");
    }
    if(password!==cpassword){
      return res.send("passwords do not match");
    }
    const user=await User.findOne({phone});
    if(!user){
      return res.status(404).send(`no account found with phone no:${phone}`);
    }
    if (user.passwordSet) {
    return res.send("Password already set. Please log in.");
  }
  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.passwordSet = true;
  await user.save();
  return res.render('set_password', { success: true });
})







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
router.post('/event/register/:eventId', isLoggedIn, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.session.userid;

    // Ensure only members can register
    if (!userId || req.session.role !== "member") {
      return res.status(403).send("Only members can register for events.");
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send("Event not found");

    // Check if already registered
    const alreadyRegistered = await EventRegistration.findOne({ eventId, user: userId });
    if (alreadyRegistered) {
      return res.send(`⚠️ You have already registered for "${event.title}".`);
    }

    // Check capacity
    if (event.capacity) {
      const count = await EventRegistration.countDocuments({ eventId });
      if (count >= event.capacity) {
        return res.send("⚠️ Event is full. Registration closed.");
      }
    }

    // Register the user
    const newReg = new EventRegistration({ eventId, user: userId });
    await newReg.save();

    // Get secretaryId from User model
    const user = await User.findById(userId);
    const secretaryId = user.secretaryId;

    // Create Notice
    await new Notice({
      title: "Event Registration Successful",
      content: `You have successfully registered for: ${event.title}`,
      secretaryId
    }).save();

    console.log(`✅ Member ${userId} registered for event ${event.title}`);

    // Redirect with query param to show success message
    res.redirect("/list?registered=1");
    
  } catch (error) {
    console.error("🚨 Registration error:", error);
    res.status(500).send("Server error during event registration.");
  }
});

// ----------------------------------------------
// 📝 Lost and Found - dashboard
// ----------------------------------------------
router.get('/lnf/dashboard', isLoggedIn, (req, res) => {
  res.render('lnf_dashboard');
});




// ----------------------------------------------
// 📝 Lost and Found - Show Form Page
// ----------------------------------------------





router.get('/lnf/post', isLoggedIn, (req, res) => {
  res.render('lnf_post'); // ✅ correct
});


// ----------------------------------------------
// 📦 Lost and Found - POST Item
// ----------------------------------------------
router.post('/lnf/post', isLoggedIn, async (req, res) => {
  try {
    const { title, description, location, type, imageUrl } = req.body;

    const newItem = new LostFoundItem({
      title,
      description,
      location,
      type,
      imageUrl,
      postedBy: req.session.userid,
    });

    await newItem.save();
    res.redirect('/lnf'); // ✅ FIXED: Redirect to item list
  } catch (err) {
    console.error("Error posting lost/found item:", err);
    res.status(500).send("Server Error");
  }
});



// ----------------------------------------------
// 📋 Lost and Found - View All Items
// ----------------------------------------------


router.get('/lnf',isLoggedIn,async (req,res)=>{
  try {
const u = req.session.userid;
const user = await User.findById(u); // wait for the user document
const flatNo = user?.flatNo || "Unknown";
console.log(flatNo);
    const items=await LostFoundItem.find().sort({date:-1}).populate('postedBy', 'flatNo');
    res.render('lnf_list',{items,flatNo});
  } catch (error) {
     console.error("Error fetching lost/found items:", error);
    res.status(500).send("Error loading lost and found board.");
  }
})


// ----------------------------------------------
// 📋 Update status if claimed
// ----------------------------------------------
router.post('/lnf/claim/:id', isLoggedIn, async (req, res) => {
  try {
    const u = req.session.userid;
    const user = await User.findById(u);
    const flatNo = user?.flatNo || "Unknown";

    await LostFoundItem.findByIdAndUpdate(req.params.id, {
      status: 'Claimed',
      claimedBy: {
        userId: u,
        flatNo: flatNo
      },
      claimedAt: new Date()
    });

    res.redirect('/lnf');
  } catch (err) {
    console.error("Error claiming item:", err);
    res.status(500).send("Failed to mark item as claimed");
  }
});




// ----------------------------------------------
// 🛠️ admin panel route on society home page
// ----------------------------------------------
router.get('/adminpanel',isSecretary,(req,res)=>{
  res.render("adminpanel");
})




export default router;


