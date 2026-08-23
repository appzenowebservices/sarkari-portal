import { getJobsCollection } from "@/db";

async function migrate() {
  const jobs = await getJobsCollection();

  const result = await jobs.updateMany(
    {
      $or: [
        { template: { $exists: false } },
        { blocks: { $exists: false } },
      ],
    },
    {
      $set: {
        template: "government",
        blocks: [],
      },
    }
  );

  console.log(`Migration complete. Modified ${result.modifiedCount} documents.`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
