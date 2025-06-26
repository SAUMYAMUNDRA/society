import { User } from "../Models/User.models.js";

export default async function isWorker(req, res, next) {
  try {
    // Check both session.userid and session.role
    if (!req.session.userid || req.session.role !== "worker") {
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.userid);

    if (!user || user.role !== "worker") {
      return res.status(403).send("Unauthorized: Only workers allowed");
    }

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    console.error("isWorker error:", err);
    res.status(500).send("Internal Server Error");
  }
}
