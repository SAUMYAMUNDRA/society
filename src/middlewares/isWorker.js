import {User} from'../Models/User.models.js'

export default async function isWorker(req, res, next) {
  try {
    if (!req.session.userid) {
      return res.redirect("/login"); // Not logged in
    }

    const user = await User.findById(req.session.userid);

    if (!user || user.role !== "worker") {
      return res.status(403).send("Unauthorized: Only workers allowed");
    }

    req.user = user; // pass user to next middleware/handler
    next();
  } catch (err) {
    console.error("isWorker error:", err);
    res.status(500).send("Internal Server Error");
  }
}
