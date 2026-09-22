import mongoose from "mongoose";

import connectDB from "../config/db.js";

import Complaint from "../models/Complaint.js";

const runMigration =
  async () => {
    try {
      await connectDB();

      const complaints =
        await Complaint.find({
          status:
            "resolved",

          $or: [
            {
              resolvedAt: {
                $exists:
                  false,
              },
            },

            {
              resolvedAt:
                null,
            },
          ],
        }).select(
          "_id updatedAt"
        );

      let updatedCount =
        0;

      for (
        const complaint of
        complaints
      ) {
        complaint.resolvedAt =
          complaint.updatedAt;

        await complaint.save();

        updatedCount += 1;
      }

      console.log(
        `Backfilled resolvedAt for ${updatedCount} complaints.`
      );

      await mongoose.disconnect();

      console.log(
        "resolvedAt migration completed."
      );

      process.exit(0);
    } catch (error) {
      console.error(
        "resolvedAt migration failed:",
        error
      );

      await mongoose.disconnect();

      process.exit(1);
    }
  };

runMigration();