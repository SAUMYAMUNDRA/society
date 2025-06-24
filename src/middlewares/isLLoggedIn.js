import { User } from "../Models/User.models.js";
import { Secretary } from "../Models/Seceratary.models.js";

export async function isLoggedIn(req, res, next) {
  try {
    // Check if member is logged in
    if (req.session && req.session.userid) {
      const user = await User.findById(req.session.userid);
      if (!user) return res.redirect("/login");
      req.user = user;
      return next();
    }

    // Check if secretary is logged in
    if (req.session && req.session.idr) {
      const sec = await Secretary.findById(req.session.idr);
      if (!sec) return res.redirect("/seclogin");
      req.user = sec;
      return next();
    }

    // If neither, redirect to login
    return res.redirect("/login");
  } catch (err) {
    console.error("Error in isLoggedIn middleware:", err);
    return res.status(500).send("Internal Server Error");
  }
}
