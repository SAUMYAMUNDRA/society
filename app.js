import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import secretaryRouter from "./src/routers/secretary.routers.js";
import { connectDB } from "../society/src/Databases/db.js";
import session from "express-session";
import { Secretary } from "./src/Models/Seceratary.models.js"; // Adjust path if needed
import { isLoggedIn } from "./src/middlewares/auth.middlewares.js";
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "landing_page.html"));
});
app.get("/society", isLoggedIn,(req, res) => {
  res.sendFile(path.join(__dirname, "pages", "society.html"));
});
app.get("/login", (req, res) => {
  if (req.session.societyEmail) {
    return res.redirect("/dashboard");
  }
  res.sendFile(path.join(__dirname, "pages", "login_page.html"));
});

app.get("/addmember", isLoggedIn,(req, res) => {
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
    return res.redirect("/login");
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

// Connect to MongoDB
connectDB();
