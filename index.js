import { connectDB } from "./src/Databases/db.js";
import { Secretary } from "./src/Models/Seceratary.models.js";
import { Society } from "./src/Models/Society.models.js";
await connectDB();


const user = new Secretary({
  name: "Test User",
  
});

await user.save();
console.log("👤 User saved:", user);

process.exit();
