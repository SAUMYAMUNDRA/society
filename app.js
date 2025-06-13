import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import secretaryRouter from "./src/routers/secretary.routers.js";
import { connectDB } from "../society/src/Databases/db.js";
import session from "express-session";
import { Secretary } from "./src/Models/Seceratary.models.js"; 
import { isLoggedIn } from "./src/middlewares/isLLoggedIn.js";
import isSecretary from './src/middlewares/isSecretary.auth.js';
import { Notice } from "./src/Models/Notice.models.js";
import { Createticket } from "./src/Models/Createticket.models.js";
const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: "1233",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// HTML routes
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "registration_page.html"));
});

app.get("/notice", isSecretary, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "notice_page.html"));
});

app.get("/rms/createticket", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "rms_page.html"));
});


app.get("/rmshome", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "rmshome_page.html"));
});

app.get("/api/tickets", isLoggedIn, async (req, res) => {
  try {
    const tickets = await Createticket
      .find({ Userid: req.user._id })     
      .sort({ _id: -1 })
      .populate("Userid", "name flatNo");    

    console.log("Fetched tickets:", tickets);
    res.json(tickets);
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "landing_page.html"));
});

app.get("/seclogin", (req, res) => {
  if (req.session.idr) {
    return res.redirect("/society");
  }
  res.sendFile(path.join(__dirname, "pages", "login_page.html"));
});


app.get("/login", (req, res) => {
  if (req.session.idr) {
    return res.redirect("/society");
  }
  res.sendFile(path.join(__dirname, "pages", "memberlogin_page.html"));
});

app.get("/addmember", isLoggedIn, isSecretary,(req, res) => {
  res.sendFile(path.join(__dirname, "pages", "addmembers_page.html"));
});



app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// EJS route: dashboard
app.get("/dashboard", async (req, res) => {
  if (!req.session.societyEmail) {
    return res.redirect("/seclogin");
  }

  try {
    const user = await Secretary.findOne({
      email: req.session.societyEmail,
    }).select("-password");

    if (!user) {
      return res.redirect("/login");
    }

    res.render("dashboard", { user });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Mount secretary routes
app.use(secretaryRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

app.get('/society', async (req, res) => {
  console.log(req.session.idr);
  
  const notices = await Notice.find({"secretaryId":req.session.idr}); // Replace with your DB fetch logic
  res.render('society', { notices });
});

// Connect to MongoDB
connectDB();
