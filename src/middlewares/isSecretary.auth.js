import { Secretary } from "../Models/Seceratary.models.js";

const isSecretary = async (req, res, next) => {
  try {
    const secid=req.session.idr;
    const secpass=req.session.pass;

    const secretary = await Secretary.findOne({ _id: secid,password:secpass });
    
    if (!secretary) {
      return res.status(401).send("Unauthorized access");
    }

   

     next();
  } catch (err) {
    console.error("isSecretary error:", err);
    return res.status(500).send("Server Error");
  }
};

export default isSecretary;
