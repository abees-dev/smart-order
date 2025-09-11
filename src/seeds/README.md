# Customer Data Seeding

This module provides functionality to import customer data from CSV files into Firestore.

## Files

- **`src/seeds/customer-seed.ts`** - Main seeding logic with CSV parsing and Firestore import
- **`scripts/seed-customers.ts`** - Standalone script runner
- **`src/seeds/data/customer.csv`** - Source CSV data file

## Features

- ✅ **CSV Parsing** - Reads customer data from CSV file with proper field mapping
- ✅ **Data Validation** - Cleans and validates data before import
- ✅ **City Extraction** - Automatically extracts city information from addresses
- ✅ **Phone Normalization** - Standardizes phone number formats
- ✅ **Duplicate Detection** - Prevents duplicate customers based on name
- ✅ **Batch Processing** - Imports in batches to avoid overwhelming Firestore
- ✅ **Error Handling** - Continues processing even if individual imports fail
- ✅ **Progress Reporting** - Detailed console output with import statistics

## Usage

### Method 1: NPM Script (Recommended)

```bash
npm run seed:customers
```

### Method 2: Browser Console (Development)

When running in development mode (`npm run dev`), the seed function is available globally:

```javascript
// In browser console
await seedCustomers();
```

### Method 3: Direct Script Execution

```bash
npx tsx scripts/seed-customers.ts
```

## CSV Format

The expected CSV format has the following columns (in order):

1. **id** - Record ID (not used for Firestore)
2. **name** - Customer name (required)
3. **email** - Email address (optional)
4. **address** - Full address (required)
5. **contactPerson** - Contact person name (optional)
6. **phone** - Phone number (optional)

### Example CSV Row

```csv
1,Công ty TNHH ABC,admin@abc.com,"123 Đường ABC, Quận 1, TP.HCM",Anh Minh,0901234567
```

## Data Transformations

### City Extraction

The seeder automatically extracts city information from the address field:

- Recognizes major Vietnamese cities (TP.HCM, Hà Nội, Đà Nẵng, etc.)
- Extracts province/city from comma-separated address parts
- Defaults to "Không xác định" if no city can be determined

### Phone Number Cleaning

- Removes spaces and special characters except digits and +
- Preserves international format indicators
- Sets to "Không có" if empty

### Default Values

- **country**: Always set to "Việt Nam"
- **isActive**: Always set to `true`
- **createdAt/updatedAt**: Set to current timestamp

## Error Handling

- Invalid rows (missing name) are skipped
- Individual import failures don't stop the process
- Detailed error logging for debugging
- Summary statistics at completion

## Performance

- Processes data in configurable batches (default: 10 records)
- 500ms delay between batches to be respectful to Firestore
- Duplicate detection using in-memory Set for efficiency

## Security

- Only runs in development and staging environments
- Requires valid Firebase configuration
- Uses existing authentication and security rules
