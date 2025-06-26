import { Secretary } from "../Models/Seceratary.models.js";

const isSecretary = async (req, res, next) => {
  try {
    const secid = req.session.idr;

    // Check if session has role set to 'secretary'
    if (!secid || req.session.role !== "secretary") {
      return res.redirect("/seclogin");
    }

    const secretary = await Secretary.findById(secid);
    if (!secretary) return res.status(401).send("Unauthorized access");

    req.user = secretary; // Attach to request
    next();
  } catch (err) {
    console.error("isSecretary error:", err);
    return res.status(500).send("Server Error");
  }
};

export default isSecretary;
