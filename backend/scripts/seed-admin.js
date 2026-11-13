import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env" });

const run = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "System Administrator";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the backend .env file.",
    );
  }

  await mongoose.connect(process.env.MONGODB_URL);

  const User = mongoose.model(
    "User",
    new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true, lowercase: true },
        password: String,
        role: { type: String, enum: ["user", "admin"], default: "user" },
        status: {
          type: String,
          enum: ["pending", "approved", "blocked"],
          default: "pending",
        },
      },
      { timestamps: true },
    ),
  );

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

  if (existingAdmin) {
    existingAdmin.role = "admin";
    existingAdmin.status = "approved";
    existingAdmin.name = adminName;
    existingAdmin.password = await bcrypt.hash(adminPassword, 10);
    await existingAdmin.save();
    console.log(`Admin user updated: ${adminEmail}`);
    return mongoose.disconnect();
  }

  const adminUser = await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: await bcrypt.hash(adminPassword, 10),
    role: "admin",
    status: "approved",
  });

  console.log(`Admin user created: ${adminUser.email}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Admin seed failed:", error.message);
  process.exit(1);
});
