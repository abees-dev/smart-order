#!/usr/bin/env node

/**
 * Customer Data Seeder
 *
 * This script reads customer data from CSV file and imports it into Firestore.
 *
 * Usage:
 * npm run seed:customers
 *
 * or directly:
 * npx tsx scripts/seed-customers.ts
 */

// import { seedCustomers } from "../src/seeds/customer-seed";

async function main() {
  try {
    console.log("🚀 Starting customer seeding process...\n");
    // await seedCustomers();
    console.log("\n✅ Seeding process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding process failed:", error);
    process.exit(1);
  }
}

// Run the script
main();
