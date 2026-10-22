import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const TEACHER_NAME = process.env.INITIAL_TEACHER_NAME?.trim() || "Teacher";
const TEACHER_EMAIL = process.env.INITIAL_TEACHER_EMAIL?.toLowerCase().trim();
const TEACHER_PASSWORD = process.env.INITIAL_TEACHER_PASSWORD?.trim();

async function seedTeacher() {
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in environment variables or .env.local.");
    process.exit(1);
  }

  if (!TEACHER_EMAIL || !TEACHER_PASSWORD) {
    console.error(
      "Error: INITIAL_TEACHER_EMAIL and INITIAL_TEACHER_PASSWORD must be defined in .env.local or environment variables before seeding."
    );
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas.");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("Database handle not found.");
    process.exit(1);
  }

  const usersCollection = db.collection("users");

  // Check if teacher with this email already exists
  const existingTeacher = await usersCollection.findOne({ email: TEACHER_EMAIL });

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(TEACHER_PASSWORD, salt);

  if (existingTeacher) {
    console.log(`Teacher with email '${TEACHER_EMAIL}' already exists (Role: ${existingTeacher.role}).`);
    // Ensure role is teacher and status active
    await usersCollection.updateOne(
      { _id: existingTeacher._id },
      {
        $set: {
          role: "teacher",
          status: "active",
          passwordHash: passwordHash,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`Updated credentials for Teacher '${TEACHER_NAME}' (${TEACHER_EMAIL}).`);
  } else {
    const newTeacher = {
      name: TEACHER_NAME,
      email: TEACHER_EMAIL,
      passwordHash: passwordHash,
      role: "teacher",
      avatar: "owl",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newTeacher);
    console.log(`Successfully created Initial Teacher Account!`);
    console.log(`ID: ${result.insertedId}`);
    console.log(`Name: ${TEACHER_NAME}`);
    console.log(`Email: ${TEACHER_EMAIL}`);
    console.log(`Role: teacher`);
  }

  await mongoose.disconnect();
  console.log("Database disconnected. Teacher seed complete.");
}

seedTeacher().catch((err) => {
  console.error("Teacher seed failed:", err);
  process.exit(1);
});
