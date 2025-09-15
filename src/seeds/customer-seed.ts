// /* eslint-disable @typescript-eslint/ban-ts-comment */
// // @ts-ignore
// import { promises as fs } from "fs";
// import { parse } from "csv-parse";
// import { CustomerService } from "../modules/customer/services/customer.service";
// import type { CreateCustomerData } from "../modules/customer/types";

// interface CSVRow {
//   id: string;
//   name: string;
//   email: string;
//   address: string;
//   contactPerson: string;
//   phone: string;
// }

// // Parse phone number to extract valid phone
// function parsePhone(phone: string): string {
//   if (!phone) return "";
//   // Remove spaces and non-digit characters except +
//   return phone.replace(/[^\d+]/g, "").replace(/\s/g, "");
// }

// // Extract city from address
// function extractCity(address: string): string {
//   if (!address) return "";

//   // Common city patterns in Vietnamese addresses
//   const cityPatterns = [
//     /Tp\.?\s*HCM|TP\.?\s*Hồ Chí Minh|Hồ Chí Minh/i,
//     /Hà Nội/i,
//     /Đà Nẵng/i,
//     /Cần Thơ/i,
//     /Hải Phòng/i,
//     /Biên Hòa/i,
//     /Nha Trang/i,
//     /Huế/i,
//   ];

//   // Check for specific city patterns
//   for (const pattern of cityPatterns) {
//     if (pattern.test(address)) {
//       const match = address.match(pattern);
//       if (match) {
//         if (
//           match[0].toLowerCase().includes("hcm") ||
//           match[0].toLowerCase().includes("hồ chí minh")
//         ) {
//           return "TP. Hồ Chí Minh";
//         }
//         return match[0];
//       }
//     }
//   }

//   // Extract province/city from common patterns
//   const parts = address.split(",").map((p) => p.trim());
//   if (parts.length > 0) {
//     const lastPart = parts[parts.length - 1];
//     // Remove common prefixes
//     const cleanCity = lastPart
//       .replace(/^(Tỉnh|Thành phố|TP\.?|T\.)\s*/i, "")
//       .replace(/^(Huyện|Quận|Q\.)\s*/i, "");
//     return cleanCity || "";
//   }

//   return "";
// }

// async function readCSVFile(filePath: string): Promise<CSVRow[]> {
//   try {
//     const fileContent = await fs.readFile(filePath, "utf-8");

//     return new Promise((resolve, reject) => {
//       parse(
//         fileContent,
//         {
//           columns: ["id", "name", "email", "address", "contactPerson", "phone"],
//           skip_empty_lines: true,
//           trim: true,
//         },
//         (err: unknown, records: CSVRow[]) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(records);
//           }
//         }
//       );
//     });
//   } catch (error) {
//     console.error("Error reading CSV file:", error);
//     throw error;
//   }
// }

// function convertCSVToCustomerData(csvRows: CSVRow[]): CreateCustomerData[] {
//   return csvRows
//     .filter((row) => row.name && row.name.trim() !== "") // Filter out empty names
//     .map((row) => {
//       const phone = parsePhone(row.phone);
//       const city = extractCity(row.address);

//       const customerData: CreateCustomerData = {
//         name: row.name.trim(),
//         phone: phone || "",
//         address: row.address || "",
//         city: city,
//         country: "Việt Nam",
//       };

//       // Add optional fields if they exist
//       if (row.email && row.email.trim() !== "") {
//         customerData.email = row.email.trim();
//       }

//       if (row.contactPerson && row.contactPerson.trim() !== "") {
//         customerData.contactPerson = row.contactPerson.trim();
//       }

//       return customerData;
//     });
// }

// export async function seedCustomers(): Promise<void> {
//   try {
//     console.log("🌱 Starting customer data seeding...");

//     // Read CSV file
//     const csvPath = "./src/seeds/data/customer.csv";
//     console.log("📖 Reading CSV file:", csvPath);

//     const csvRows = await readCSVFile(csvPath);
//     console.log(`📊 Found ${csvRows.length} rows in CSV`);

//     // Convert CSV data to customer format
//     const customerData = convertCSVToCustomerData(csvRows);
//     console.log(`✅ Converted ${customerData.length} valid customer records`);

//     // Check if customers already exist to avoid duplicates
//     const existingCustomers = await CustomerService.getAllCustomers({}, 1000);
//     const existingNames = new Set(
//       existingCustomers.customers.map((c) => c.name.toLowerCase())
//     );

//     // Filter out duplicates
//     const newCustomers = customerData.filter(
//       (customer) => !existingNames.has(customer.name.toLowerCase())
//     );

//     console.log(
//       `🔍 Found ${newCustomers.length} new customers to import (${
//         customerData.length - newCustomers.length
//       } duplicates skipped)`
//     );

//     if (newCustomers.length === 0) {
//       console.log("ℹ️ No new customers to import");
//       return;
//     }

//     // Import customers in batches to avoid overwhelming Firestore
//     const batchSize = 10;
//     let imported = 0;
//     let errors = 0;

//     for (let i = 0; i < newCustomers.length; i += batchSize) {
//       const batch = newCustomers.slice(i, i + batchSize);
//       console.log(
//         `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
//           newCustomers.length / batchSize
//         )}`
//       );

//       const promises = batch.map(async (customerData) => {
//         try {
//           await CustomerService.createCustomer(customerData);
//           imported++;
//           console.log(`✅ Imported: ${customerData.name}`);
//         } catch (error) {
//           errors++;
//           console.error(`❌ Failed to import ${customerData.name}:`, error);
//         }
//       });

//       await Promise.all(promises);

//       // Small delay between batches to be nice to Firestore
//       if (i + batchSize < newCustomers.length) {
//         await new Promise((resolve) => setTimeout(resolve, 500));
//       }
//     }

//     console.log("\n📊 Seeding Summary:");
//     console.log(`✅ Successfully imported: ${imported} customers`);
//     console.log(`❌ Failed imports: ${errors} customers`);
//     console.log(
//       `📈 Total customers in database: ${
//         existingCustomers.customers.length + imported
//       }`
//     );
//     console.log("🎉 Customer seeding completed!");
//   } catch (error) {
//     console.error("💥 Error seeding customers:", error);
//     throw error;
//   }
// }
