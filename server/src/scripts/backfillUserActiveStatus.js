import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const runMigration =
  async () => {
    try {
      await connectDB();

      const result =
        await User.updateMany(
          {
            isActive: {
              $exists: false,
            },
          },
          {
            $set: {
              isActive: true,
            },
          }
        );

      console.log(
        `Updated ${result.modifiedCount} existing users.`
      );

      await mongoose.disconnect();

      console.log(
        "User migration completed."
      );

      process.exit(0);
    } catch (error) {
      console.error(
        "User migration failed:",
        error
      );

      await mongoose.disconnect();

      process.exit(1);
    }
  };

runMigration();