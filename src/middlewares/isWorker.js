import { User } from "../Models/User.models.js";
import { Secretary } from "../Models/Seceratary.models.js";

export default async function isWorkerOrSecretary(req, res, next) {
  try {
    const isWorker = req.session.userid && req.session.role === "worker";
    const isSecretary = req.session.idr && req.session.role === "secretary";

    if (isWorker) {
      const user = await User.findById(req.session.userid);
      if (!user || user.role !== "worker") {
        return res.status(403).send("Unauthorized: Worker access denied");
      }
      req.user = user;
      req.userType = "worker"; // optional flag if needed later
      return next();
    }

    if (isSecretary) {
      const secretary = await Secretary.findById(req.session.idr);
      if (!secretary) {
        return res.status(403).send("Unauthorized: Secretary access denied");
      }
      req.user = secretary;
      req.userType = "secretary"; // optional flag if needed later
      return next();
    }

    // If neither worker nor secretary
    return res.redirect("/login");
  } catch (err) {
    console.error("isWorkerOrSecretary error:", err);
    res.status(500).send("Internal Server Error");
  }
}
