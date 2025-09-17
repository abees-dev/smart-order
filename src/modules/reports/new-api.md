# Reports API Documentation

This module provides comprehensive reporting functionality for the Smart Order BE application, including financial summaries, charts, and analytics.

## API Endpoints

### 1. Summary Report

**GET** `/reports/summary`

Generate a summary report for a specific period.

**Query Parameters:**

- `period`: string - Type of period ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')
- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)

**Response:**

```json
{
  "period": "monthly_2024-09_2024-09",
  "totalInputAmount": 150000,
  "totalOutputAmount": 200000,
  "totalInputVat": 15000,
  "totalOutputVat": 20000,
  "netVat": 5000,
  "profit": 50000,
  "additionalCosts": 5000,
  "netProfit": 45000,
  "inputInvoiceCount": 25,
  "outputInvoiceCount": 30
}
```

### 2. Chart Data

**GET** `/reports/chart-data`

Generate chart data for visualization over multiple periods.

**Query Parameters:**

- `period`: string - Type of period ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')
- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)

**Response:**

```json
[
  {
    "period": "2024-08",
    "inputAmount": 120000,
    "outputAmount": 180000,
    "profit": 60000,
    "additionalCosts": 8000,
    "netProfit": 52000,
    "inputVat": 12000,
    "outputVat": 18000,
    "netVat": 6000
  },
  {
    "period": "2024-09",
    "inputAmount": 150000,
    "outputAmount": 200000,
    "profit": 50000,
    "additionalCosts": 5000,
    "netProfit": 45000,
    "inputVat": 15000,
    "outputVat": 20000,
    "netVat": 5000
  }
]
```

### 3. Monthly Report

**GET** `/reports/monthly`

Generate a comprehensive monthly report including all analytics.

**Query Parameters:**

- `month`: string - Month in YYYY-MM format

**Response:**

```json
{
  "period": "2024-09",
  "summary": {
    /* ReportSummary object */
  },
  "topSuppliers": [
    /* SupplierSummary array */
  ],
  "topCustomers": [
    /* CustomerSummary array */
  ],
  "topProducts": [
    /* ProductSummary array */
  ],
  "additionalCosts": [
    /* AdditionalCost array */
  ],
  "invoiceBreakdown": {
    /* InvoiceBreakdown object */
  }
}
```

### 4. Comparison Report

**GET** `/reports/comparison`

Compare performance between two periods.

**Query Parameters:**

- `currentPeriod`: string - Current period in YYYY-MM format
- `previousPeriod`: string - Previous period in YYYY-MM format

**Response:**

```json
{
  "currentPeriod": {
    /* ReportSummary for current period */
  },
  "previousPeriod": {
    /* ReportSummary for previous period */
  },
  "growth": {
    "inputAmount": 25.5,
    "outputAmount": 11.1,
    "profit": -16.7,
    "netProfit": -13.5
  }
}
```

### 5. Top Suppliers

**GET** `/reports/top-suppliers`

Get top suppliers by total amount for a period.

**Query Parameters:**

- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)
- `limit`: string (optional) - Number of suppliers to return (default: 10, max: 100)

**Response:**

```json
[
  {
    "supplierId": "supplier_id_1",
    "supplierName": "ABC Supply Co.",
    "totalAmount": 75000,
    "totalVat": 7500,
    "invoiceCount": 12,
    "lastInvoiceDate": "2024-09-15T10:30:00Z"
  }
]
```

### 6. Top Customers

**GET** `/reports/top-customers`

Get top customers by total amount for a period.

**Query Parameters:**

- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)
- `limit`: string (optional) - Number of customers to return (default: 10, max: 100)

**Response:**

```json
[
  {
    "customerId": "customer_id_1",
    "customerName": "XYZ Corporation",
    "totalAmount": 120000,
    "totalVat": 12000,
    "invoiceCount": 8,
    "lastInvoiceDate": "2024-09-20T14:15:00Z"
  }
]
```

### 7. Top Products

**GET** `/reports/top-products`

Get top-selling products/supplies by revenue for a period.

**Query Parameters:**

- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)
- `limit`: string (optional) - Number of products to return (default: 10, max: 100)

**Response:**

```json
[
  {
    "itemId": "product_id_1",
    "itemName": "Premium Widget",
    "itemType": "product",
    "category": "Electronics",
    "quantitySold": 150,
    "totalRevenue": 45000,
    "averagePrice": 300
  }
]
```

### 8. Additional Costs

**GET** `/reports/additional-costs`

Get additional costs for a period, optionally filtered by order.

**Query Parameters:**

- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)
- `orderId`: string (optional) - Filter by specific order ID
- `costType`: string (optional) - Filter by cost type

**Response:**

```json
[
  {
    "id": "cost_id_1",
    "orderId": "order_id_1",
    "costType": "transport",
    "description": "Delivery costs",
    "amount": 2500,
    "quantity": 1,
    "unitPrice": 2500,
    "supplier": "Transport Co.",
    "invoiceNumber": "TRP-001",
    "incurredDate": "2024-09-10T00:00:00Z",
    "notes": "Express delivery",
    "createdBy": "user_id_1",
    "createdAt": "2024-09-10T08:30:00Z",
    "updatedAt": "2024-09-10T08:30:00Z"
  }
]
```

### 9. Invoice Breakdown

**GET** `/reports/invoice-breakdown`

Get breakdown of invoices by tax type for a period.

**Query Parameters:**

- `period`: string - Type of period ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')
- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)

**Response:**

```json
{
  "input": {
    "taxed": 135000,
    "nonTaxed": 15000,
    "totalCount": 25
  },
  "output": {
    "taxed": 180000,
    "nonTaxed": 20000,
    "totalCount": 30
  }
}
```

### 10. Input Invoices

**GET** `/reports/input-invoices`

Get all input invoices (from supply imports) for a period.

**Query Parameters:**

- `period`: string - Type of period ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')
- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)

### 11. Output Invoices

**GET** `/reports/output-invoices`

Get all output invoices (from completed orders) for a period.

**Query Parameters:**

- `period`: string - Type of period ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')
- `dateFrom`: string - Start date (ISO format)
- `dateTo`: string - End date (ISO format)

## Usage Examples

### Get Monthly Summary for September 2024

```bash
GET /reports/summary?period=monthly&dateFrom=2024-09-01&dateTo=2024-09-30
```

### Get Chart Data for Last 6 Months

```bash
GET /reports/chart-data?period=monthly&dateFrom=2024-04-01&dateTo=2024-09-30
```

### Get Comprehensive Monthly Report

```bash
GET /reports/monthly?month=2024-09
```

### Compare Current Month with Previous Month

```bash
GET /reports/comparison?currentPeriod=2024-09&previousPeriod=2024-08
```

### Get Top 5 Suppliers for Q3 2024

```bash
GET /reports/top-suppliers?dateFrom=2024-07-01&dateTo=2024-09-30&limit=5
```

## Data Types

### ReportSummary

Financial summary for a specific period including revenues, costs, VAT, and profit calculations.

### ChartData

Data optimized for chart visualization showing trends over multiple periods.

### SupplierSummary / CustomerSummary

Analytics for top suppliers/customers including total amounts, invoice counts, and last transaction dates.

### ProductSummary

Product/supply performance metrics including quantities sold, revenue, and average prices.

### AdditionalCost

Additional costs incurred for orders, including transport, labor, materials, etc.

### InvoiceBreakdown

Statistical breakdown of invoices by tax type (taxed vs non-taxed).

## Error Handling

All endpoints return proper HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error

Error responses include descriptive error messages to help with debugging.
