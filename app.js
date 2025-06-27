import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import secretaryRouter from "./src/routers/secretary.routers.js";
import { connectDB } from "../society/src/Databases/db.js";
import session from "express-session";
import { Secretary } from "./src/Models/Seceratary.models.js";
import { Fine } from  "../society/src/Models/Fine.models.js"
import { isLoggedIn } from "./src/middlewares/isLLoggedIn.js";
import isSecretary from './src/middlewares/isSecretary.auth.js';
import { Notice } from "./src/Models/Notice.models.js";
import { Createticket } from "./src/Models/Createticket.models.js";
import { User } from './src/Models/User.models.js'
import { MaintenanceBills } from "./src/Models/Maintenancebills.models.js";
import { error, log } from "console";
import { AsyncLocalStorage } from "async_hooks";
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
  res.sendFile(path.join(__dirname, "pages", "rmsgenerateticket_page.html"));
});

app.get("/showtickets_page.html", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "showtickets_page.html"));
});


app.get("/rmshome", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "rmshome_page.html"));
});

app.get("/api/tickets", isLoggedIn, async (req, res) => {
  try {
    const tickets = await Createticket
      .find({ Userid: req.session.userid })
      .sort({ _id: -1 })
      .populate("Userid", "flatNo");

    console.log("Fetched tickets:", tickets);
    res.json(tickets);
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/fms/generate-bills", isLoggedIn, isSecretary, async (req, res) => {
  try {
    const { month, amount, dueDate } = req.body;
    const allUsers = await User.find();

    const billPromises = allUsers.map(user =>
      MaintenanceBills.create({
        userId: user._id,
        month,
        amount,
        dueDate
      })
    )
    await Promise.all(billPromises);
    res.send("✅ Bills generated successfully for all members.");
  } catch (err) {
    console.log("error generating bills for all users");
    res.status(500).send("❌ Failed to generate bills.");

  }
})

app.get("/fms/generate", isLoggedIn, isSecretary, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "generate_bills_page.html"));
})


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

app.get("/addmember", isLoggedIn, isSecretary, (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "addmembers_page.html"));
});

app.get("/fms",isLoggedIn,(req,res)=>{
  res.render('fms_dashboard');
})

app.get("/fms/fines", isLoggedIn, (req, res) => {
  res.send("<h1 style='font-family:sans-serif;text-align:center;margin-top:50px;'>⚠️ Fines system coming soon!</h1>");
});






app.get('/fms/history',isLoggedIn,async (req,res)=>{
  try {
      const userId=req.session.userid;
      const bills= await MaintenanceBills.find({userId}).sort({dueDate:-1});
      res.render("payment_history",{bills});
  } catch (error) {
    console.error("error getting bills histroy");
    res.send(500).status("error getting bills histroy");
  }
})





app.get('/fms/fine/generate',isSecretary,isLoggedIn,async (req,res)=>{
  try {
      const users=await User.find({role:"member"});
      res.render("generate_fine",{users});
  } catch (error) {
      console.error("error generating fines",error);
      res.status(500).send("error generating fines");
      
  }
})



app.post('/fms/fine/generate', isLoggedIn, isSecretary, async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    await Fine.create({
      userId,
      amount,
      reason,
      status: "Pending"
    });

    res.send("✅ Fine issued successfully.");
  } catch (err) {
    console.error("Error issuing fine:", err);
    res.status(500).send("❌ Failed to issue fine.");
  }
});



app.get('/fms/fine/all',isLoggedIn,isSecretary,async (req,res)=>{
  try {
      const fines=await Fine.find().populate('userId','name flatNo').sort({issueDate:-1});
      res.render('all_fines',{fines});
  } catch (error) {
      console.error("error shpwing all fines of all users",error);
      res.status(500).send("error shpwing all fines of all users");
      
  }
})

app.post('/fms/fines/pay/:fineId', isLoggedIn, async (req, res) => {
  try {
    const fineId = req.params.fineId;

    await Fine.findByIdAndUpdate(fineId, {
      status: "Paid",
      paymentDate: new Date(),
      transactionId: "TXN" + Date.now()
    });

    res.redirect('/fms/fines');
  } catch (err) {
    console.error("Error paying fine:", err);
    res.status(500).send("❌ Failed to pay fine.");
  }
});


app.get('/fms/fines', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userid;

    const fines = await Fine.find({ userId, status: "Pending" }).sort({ issuedDate: -1 });

    res.render("my_fines", { fines });
  } catch (err) {
    console.error("Error loading user's fines:", err);
    res.status(500).send("Failed to load fines");
  }
});




app.post("/fms/fines/pay/:fineId", isLoggedIn, async (req, res) => {
  try {
    const fineId = req.params.fineId;

    await Fine.findByIdAndUpdate(fineId, {
      status: "Paid",
      paymentDate: new Date(),
      transactionId: "TXN" + Date.now(),
    });

    console.log("✅ Fine paid successfully");
    res.redirect("/fms/fines");
  } catch (error) {
    console.error("❌ Error updating fine status:", error);
    res.status(500).send("Failed to update fine status.");
  }
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
  try {
    const userId = req.session.userid || req.session.idr;
    if (!userId) return res.redirect('/login');

    const user = await User.findById(userId) || await Secretary.findById(userId);
    if (!user) return res.redirect('/login');

    const secretaryId = user.secretaryId || user._id;
    const notices = await Notice.find({ secretaryId });
    const secretary = await Secretary.findById(secretaryId);
    const fines = await Fine.find({ userId, status: "Pending" }).sort({ issuedDate: -1 });
    // 👇 Define pendingBillCount
    let pendingBillCount = 0;
    if (user.role === "member") {
      pendingBillCount = await MaintenanceBills.countDocuments({
        userId,
        status: { $ne: "Paid" }
      });
    }

    // ✅ Single final res.render call with all data
    res.render('society', {
  notices,
  secretaryName: secretary?.name || "NA",
  secretaryPhone: secretary?.phone || "NA",
  pendingBillCount,
  fines
});

  } catch (err) {
    console.error("error loading society page", err);
    res.status(500).send("internal server error");
  }
});


app.post("/fms/pay/:billid", isLoggedIn, async (req, res) => {
  try {
    const billId = req.params.billid;

    await MaintenanceBills.findByIdAndUpdate(billId, {
      status: "Paid",
      paymentDate: new Date(),
      transactionId: "TXN" + Date.now(),
    });

    console.log("✅ Successfully paid payment");
    return res.redirect("/fms/mybills"); // ✅ Only one response, with return
  } catch (error) {
    console.error("❌ Error updating status of payment:", error);

    // ✅ Safe fallback if response hasn't already been sent
    if (!res.headersSent) {
      return res.status(500).send("Failed to update payment status for user: " + req.session.userid);
    }
  }
});


app.get("/fms/allbills",isLoggedIn,isSecretary,async(req,res)=>{
  try {
      const bills = await MaintenanceBills.find()
      .populate("userId", "name flatNo")
      .sort({ dueDate: -1 });

    res.render("allbills", { bills });
  } catch (error) {
      console.error("error fetching all bills for secretary",error);
      res.status(500).send("error fetching all bills for secretary");
      
  }
})



app.get("/fms/mybills", isLoggedIn, async (req, res) => {
  try {
    const bills = await MaintenanceBills
      .find({ userId: req.session.userid })
      .sort({ dueDate: -1 });

    res.render("mybills", { bills });
  } catch (err) {
    console.error("Error fetching user's bills:", err);
    res.status(500).send("Failed to load bills");
  }
});






app.get("/fms/user/:userId/bills", isLoggedIn,isSecretary, async (req, res) => {
  try {
    const {userId}=req.params;
    const bills = await MaintenanceBills
      .find({ userId })
      .sort({ dueDate: -1 });
      const user=await User.findById(userId);
     res.render("user_bills", { bills, user });
  } catch (err) {
    console.error("Error fetching user bills:", err);
    res.status(500).send("Error fetching user bills");
  }
});








connectDB();
