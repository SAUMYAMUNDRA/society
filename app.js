import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import secretaryRouter from "./src/routers/secretary.routers.js";
import { connectDB } from "../society/src/Databases/db.js";

const app = express();
const PORT = 3000;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Define a route for the root path to serve the HTML file
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "registration_page.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "landing_page.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "login_page.html"));
});

// Mount the secretary router at '/api'
app.use(secretaryRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Connect to the database
connectDB();
