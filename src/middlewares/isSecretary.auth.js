import { Secretary } from "../Models/Seceratary.models.js";

const isSecretary = async (req, res, next) => {
  try {
    const secid = req.session.idr;

    if (!secid) return res.redirect("/seclogin");

    const secretary = await Secretary.findById(secid);

    if (!secretary) return res.status(401).send("Unauthorized access");

    req.user = secretary; // Optional: for future use
    next();
  } catch (err) {
    console.error("isSecretary error:", err);
    return res.status(500).send("Server Error");
  }
};

export default isSecretary;
