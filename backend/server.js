import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "pe-fund-dev-secret";

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "blocked"],
      default: "pending",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

const ensureDefaultAdmin = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    existingAdmin.name =
      process.env.ADMIN_NAME || existingAdmin.name || "System Administrator";
    existingAdmin.email = adminEmail;
    existingAdmin.role = "admin";
    existingAdmin.status = "approved";

    const passwordMatches = await existingAdmin.comparePassword(adminPassword);
    if (!passwordMatches) {
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
    }

    console.log(`Admin account confirmed: ${adminEmail}`);
    return;
  }

  const adminUser = await User.create({
    name: process.env.ADMIN_NAME || "System Administrator",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    status: "approved",
  });

  console.log(`Default admin created: ${adminUser.email}`);
};

const fundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

fundSchema.index({ user: 1, createdAt: -1 });

const Fund = mongoose.model("Fund", fundSchema);

const lpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    commitment: {
      type: Number,
      required: true,
    },
    dateOfJoin: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Lp = mongoose.model("Lp", lpSchema);

const closeSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    merged: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

closeSchema.index({ date: 1, user: 1 }, { unique: true });

const Close = mongoose.model("Close", closeSchema);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    requirement: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      default: 0,
    },
    sector: {
      type: String,
      default: "Other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Company = mongoose.model("Company", companySchema);

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

console.log(signToken);

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.token || user.token !== token) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Your account is pending admin approval.",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message:
          "Your account has been blocked. Please contact an administrator.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }

  next();
};

const syncUserCloseState = async (userId) => {
  const lps = await Lp.find({ user: userId }).select("dateOfJoin");
  const dates = [
    ...new Set(lps.map((lp) => lp.dateOfJoin).filter(Boolean)),
  ].sort((a, b) => new Date(a) - new Date(b));

  const existingCloses = await Close.find({ user: userId }).sort({ date: 1 });
  const existingMap = new Map(
    existingCloses.map((close) => [close.date, close]),
  );

  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    const closeDoc = existingMap.get(date) || new Close({ date, user: userId });
    closeDoc.user = userId;
    closeDoc.date = date;
    closeDoc.merged = i === 0;
    await closeDoc.save();
    existingMap.set(date, closeDoc);
  }

  const staleDates = existingCloses
    .filter((close) => !dates.includes(close.date))
    .map((close) => close._id);

  if (staleDates.length > 0) {
    await Close.deleteMany({ _id: { $in: staleDates } });
  }

  const closes = await Close.find({ user: userId }).sort({ date: 1 });

  if (closes.length > 0 && !closes[0].merged) {
    closes[0].merged = true;
    await closes[0].save();
  }

  return closes;
};

app.get("/", (req, res) => {
  res.send("Business Backend is running");
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const isAdminRegistration =
      normalizedEmail === normalizeEmail(process.env.ADMIN_EMAIL || "");

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      status: isAdminRegistration ? "approved" : "pending",
      role: isAdminRegistration ? "admin" : "user",
    });

    res.status(201).json({
      message:
        "Registration successful. Your account is pending admin approval.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register user.",
      error: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Your account is awaiting admin approval.",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message:
          "Your account has been blocked. Please contact an administrator.",
      });
    }

    const token = signToken(user);
    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login.", error: error.message });
  }
});

app.get("/api/auth/me", protect, async (req, res) => {
  res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    },
  });
});

app.post("/api/auth/logout", protect, async (req, res) => {
  try {
    req.user.token = null;
    await req.user.save();

    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    res.status(500).json({ message: "Failed to log out." });
  }
});

app.get("/api/admin/users", protect, requireAdmin, async (req, res) => {
  try {
    const invalidUserIds = await User.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: "" },
        { email: { $exists: false } },
        { email: null },
        { email: "" },
      ],
    }).select("_id");

    if (invalidUserIds.length > 0) {
      await User.deleteMany({
        _id: { $in: invalidUserIds.map((user) => user._id) },
      });
    }

    const users = await User.find({
      name: { $exists: true, $ne: null, $ne: "" },
      email: { $exists: true, $ne: null, $ne: "" },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users.", error: error.message });
  }
});

app.patch(
  "/api/admin/users/:id/status",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      const allowed = ["pending", "approved", "blocked"];

      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid account status." });
      }

      const targetUser = await User.findById(req.params.id);

      if (!targetUser) {
        return res.status(404).json({ message: "User not found." });
      }

      if (
        String(targetUser._id) === String(req.user._id) &&
        status === "blocked"
      ) {
        return res
          .status(400)
          .json({ message: "You cannot block your own admin account." });
      }

      if (targetUser.role === "admin" && status === "blocked") {
        const otherAdmins = await User.find({
          role: "admin",
          status: "approved",
          _id: { $ne: targetUser._id },
        });

        if (otherAdmins.length === 0) {
          return res.status(400).json({
            message: "At least one active admin account must remain available.",
          });
        }
      }

      targetUser.status = status;
      await targetUser.save();

      res.status(200).json({
        message: `User status updated to ${status}.`,
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          status: targetUser.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update user status.",
        error: error.message,
      });
    }
  },
);

app.get("/api/funds", protect, async (req, res) => {
  try {
    const funds = await Fund.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(funds);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch funds.", error: error.message });
  }
});

app.post("/api/funds", protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Fund name is required." });
    }

    const fund = await Fund.create({
      name,
      description: description || "",
      user: req.user._id,
    });

    res.status(201).json({ message: "Fund created successfully.", fund });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create fund.", error: error.message });
  }
});

app.get("/api/closes", protect, async (req, res) => {
  try {
    const closes = await syncUserCloseState(req.user._id);

    res.json({
      data: {
        mergedDates: closes
          .filter((close) => close.merged)
          .map((close) => close.date),
        closes,
      },
    });
  } catch (error) {
    console.error("Error fetching closes:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch closes", error: error.message });
  }
});

app.post("/api/closes/merge", protect, async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Close date is required." });
    }

    const closes = await syncUserCloseState(req.user._id);
    const nextClose = closes.find((close, index) => index > 0 && !close.merged);

    if (!nextClose || nextClose.date !== date) {
      return res
        .status(400)
        .json({ message: "Only the next sequential close can be merged." });
    }

    nextClose.merged = true;
    await nextClose.save();

    const updatedCloses = await Close.find({ user: req.user._id }).sort({
      date: 1,
    });

    res.json({
      message: "Close merged successfully",
      data: {
        mergedDates: updatedCloses
          .filter((close) => close.merged)
          .map((close) => close.date),
        closes: updatedCloses,
      },
    });
  } catch (error) {
    console.error("Error merging close:", error);
    res
      .status(500)
      .json({ message: "Failed to merge close", error: error.message });
  }
});

app.get("/api/companies", protect, async (req, res) => {
  try {
    const companies = await Company.find({ user: req.user._id });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/companies", protect, async (req, res) => {
  try {
    const { name, requirement, profit, sector, isActive } = req.body;

    if (!name || !requirement) {
      return res
        .status(400)
        .json({ message: "Company name and requirement are required." });
    }

    const newCompany = await Company.create({
      name,
      requirement: Number(requirement),
      profit: Number(profit || 0),
      sector: sector || "Other",
      isActive: isActive !== false,
      user: req.user._id,
    });

    res
      .status(201)
      .json({ message: "Company added successfully", company: newCompany });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/companies/:id", protect, async (req, res) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    const allowedFields = [
      "name",
      "requirement",
      "profit",
      "sector",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        company[field] =
          field === "requirement" || field === "profit"
            ? Number(req.body[field])
            : req.body[field];
      }
    });

    await company.save();
    res.status(200).json({ message: "Company updated successfully", company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/companies/:id", protect, async (req, res) => {
  try {
    const deletedCompany = await Company.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found." });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/lps", protect, async (req, res) => {
  try {
    const name = req.body.name ?? req.body.userName;
    const { commitment, dateOfJoin } = req.body;

    if (!name || !commitment || !dateOfJoin) {
      return res.status(400).json({
        message: "name (or userName), commitment and dateOfJoin are required",
      });
    }

    const savedLp = await Lp.create({
      name,
      commitment: Number(commitment),
      dateOfJoin,
      user: req.user._id,
    });

    await syncUserCloseState(req.user._id);

    res.status(201).json({ message: "LP saved successfully", data: savedLp });
  } catch (error) {
    console.error("Error saving LP:", error);
    res
      .status(500)
      .json({ message: "Failed to save LP", error: error.message });
  }
});

app.get("/api/lps", protect, async (req, res) => {
  try {
    const lps = await Lp.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(lps);
  } catch (error) {
    console.error("Error fetching LPs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch LPs", error: error.message });
  }
});

app.put("/api/lps/:id", protect, async (req, res) => {
  try {
    const lp = await Lp.findOne({ _id: req.params.id, user: req.user._id });

    if (!lp) {
      return res.status(404).json({ message: "LP not found." });
    }

    lp.name = req.body.name ?? lp.name;
    lp.commitment =
      req.body.commitment !== undefined
        ? Number(req.body.commitment)
        : lp.commitment;
    lp.dateOfJoin = req.body.dateOfJoin ?? lp.dateOfJoin;

    await lp.save();
    await syncUserCloseState(req.user._id);
    res.status(200).json(lp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/lps/:id", protect, async (req, res) => {
  try {
    const deletedLP = await Lp.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedLP) {
      return res.status(404).json({ message: "LP not found." });
    }

    await syncUserCloseState(req.user._id);
    res.status(200).json({ message: "LP deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL is missing in your environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log("Connected to MongoDB");
    await ensureDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
