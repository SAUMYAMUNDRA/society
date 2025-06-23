import { User } from "../Models/User.models.js"; // adjust path if needed

export async function isLoggedIn(req, res, next) {
  try {
    if (req.session && req.session.userid) {
      const user = await User.findById(req.session.userid);
      if (!user) return res.redirect("/login");

      req.user = user;  // ✅ Set user so we can access req.user._id
      next();
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error in isLoggedIn middleware:", err);
    res.status(500).send("Internal Server Error");
  }
}
