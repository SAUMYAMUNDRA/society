import { User } from "../Models/User.models.js";
import { Secretary } from "../Models/Seceratary.models.js";

export async function isLoggedIn(req, res, next) {
  try {
    const role = req.session.role;

    if (role === "secretary" && req.session.idr) {
      const secretary = await Secretary.findById(req.session.idr);
      if (!secretary) return res.redirect("/seclogin");
      req.user = secretary;
      return next();
    }

    if ((role === "member" || role === "worker") && req.session.userid) {
      const user = await User.findById(req.session.userid);
      if (!user) return res.redirect("/login");
      req.user = user;
      return next();
    }

    // If role or session is missing
    return res.redirect("/login");
  } catch (err) {
    console.error("Error in isLoggedIn middleware:", err);
    return res.status(500).send("Internal Server Error");
  }
}
