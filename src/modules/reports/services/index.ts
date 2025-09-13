import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  AdditionalCost,
  CreateAdditionalCostData,
  UpdateAdditionalCostData,
  ReportSummary,
  ChartData,
  MonthlyReport,
  SupplierSummary,
  CustomerSummary,
  ProductSummary,
  InvoiceBreakdown,
  ComparisonReport,
} from "../types";
import type { InputInvoice, OutputInvoice } from "@/modules/invoice/types";
import { COLLECTIONS } from "@/constants";

// Service cho chi phí phát sinh
export class AdditionalCostService {
  static async create(data: CreateAdditionalCostData): Promise<AdditionalCost> {
    const now = Timestamp.now();
    const docData = {
      ...data,
      date: Timestamp.fromDate(data.date),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.ADDITIONAL_COSTS),
      docData
    );

    return {
      id: docRef.id,
      ...docData,
    };
  }

  static async update(data: UpdateAdditionalCostData): Promise<void> {
    const { id, ...updateData } = data;
    const docRef = doc(db, COLLECTIONS.ADDITIONAL_COSTS, id);

    const docData = {
      ...updateData,
      ...(updateData.date && { date: Timestamp.fromDate(updateData.date) }),
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, docData);
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ADDITIONAL_COSTS, id);
    await deleteDoc(docRef);
  }

  static async getByPeriod(
    dateFrom: Date,
    dateTo: Date
  ): Promise<AdditionalCost[]> {
    const q = query(
      collection(db, COLLECTIONS.ADDITIONAL_COSTS),
      where("date", ">=", Timestamp.fromDate(dateFrom)),
      where("date", "<=", Timestamp.fromDate(dateTo)),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdditionalCost[];
  }

  static async getByOrderId(orderId: string): Promise<AdditionalCost[]> {
    const q = query(
      collection(db, COLLECTIONS.ADDITIONAL_COSTS),
      where("orderId", "==", orderId),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdditionalCost[];
  }
}

// Service cho báo cáo
export class ReportService {
  // Lấy dữ liệu hóa đơn đầu vào theo khoảng thời gian (từ SUPPLY_IMPORTS)
  static async getInputInvoices(
    dateFrom: Date,
    dateTo: Date
  ): Promise<InputInvoice[]> {
    const q = query(
      collection(db, COLLECTIONS.SUPPLY_IMPORTS),
      where("createdAt", ">=", Timestamp.fromDate(dateFrom)),
      where("createdAt", "<=", Timestamp.fromDate(dateTo)),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InputInvoice[];
  }

  // Lấy dữ liệu hóa đơn đầu ra theo khoảng thời gian (từ ORDERS)
  static async getOutputInvoices(
    dateFrom: Date,
    dateTo: Date
  ): Promise<OutputInvoice[]> {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where("createdAt", ">=", Timestamp.fromDate(dateFrom)),
      where("createdAt", "<=", Timestamp.fromDate(dateTo)),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as OutputInvoice[];
  }

  static async generateSummary(
    period: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<ReportSummary> {
    const [inputInvoices, outputInvoices, additionalCosts] = await Promise.all([
      this.getInputInvoices(dateFrom, dateTo),
      this.getOutputInvoices(dateFrom, dateTo),
      AdditionalCostService.getByPeriod(dateFrom, dateTo),
    ]);

    console.log("Input Invoices:", inputInvoices);
    console.log("Output Invoices:", outputInvoices);

    const totalInputAmount = inputInvoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );
    const totalOutputAmount = outputInvoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );
    const totalInputVat = inputInvoices.reduce(
      (sum, invoice) => sum + (invoice.vatAmount || 0),
      0
    );
    const totalOutputVat = outputInvoices.reduce(
      (sum, invoice) => sum + (invoice.vatAmount || 0),
      0
    );
    const totalAdditionalCosts = additionalCosts.reduce(
      (sum, cost) => sum + cost.amount,
      0
    );

    const profit = totalOutputAmount - totalInputAmount;
    const netVat = totalOutputVat - totalInputVat;
    const netProfit = profit - totalAdditionalCosts;

    return {
      period,
      totalInputAmount,
      totalOutputAmount,
      totalInputVat,
      totalOutputVat,
      netVat,
      profit,
      additionalCosts: totalAdditionalCosts,
      netProfit,
      inputInvoiceCount: inputInvoices.length,
      outputInvoiceCount: outputInvoices.length,
    };
  }

  // Tạo dữ liệu biểu đồ theo tháng
  static async generateChartData(months: string[]): Promise<ChartData[]> {
    const chartData: ChartData[] = [];

    for (const month of months) {
      const [year, monthNum] = month.split("-");
      const dateFrom = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const dateTo = new Date(parseInt(year), parseInt(monthNum), 0);

      const summary = await this.generateSummary(month, dateFrom, dateTo);

      chartData.push({
        period: month,
        inputAmount: summary.totalInputAmount,
        outputAmount: summary.totalOutputAmount,
        profit: summary.profit,
        additionalCosts: summary.additionalCosts,
        netProfit: summary.netProfit,
        inputVat: summary.totalInputVat,
        outputVat: summary.totalOutputVat,
        netVat: summary.netVat,
      });
    }

    return chartData;
  }

  // Lấy top nhà cung cấp
  static async getTopSuppliers(
    dateFrom: Date,
    dateTo: Date,
    limitCount = 10
  ): Promise<SupplierSummary[]> {
    const inputInvoices = await this.getInputInvoices(dateFrom, dateTo);

    const supplierMap = new Map<string, SupplierSummary>();

    inputInvoices.forEach((invoice) => {
      const existing = supplierMap.get(invoice.supplierId);
      if (existing) {
        existing.totalAmount += invoice.totalAmount || 0;
        existing.totalVat += invoice.vatAmount || 0;
        existing.invoiceCount += 1;
        if (
          invoice.createdAt.toMillis() > existing.lastInvoiceDate.toMillis()
        ) {
          existing.lastInvoiceDate = invoice.createdAt;
        }
      } else {
        supplierMap.set(invoice.supplierId, {
          supplierId: invoice.supplierId,
          supplierName: invoice.supplierName,
          totalAmount: invoice.totalAmount || 0,
          totalVat: invoice.vatAmount || 0,
          invoiceCount: 1,
          lastInvoiceDate: invoice.createdAt,
        });
      }
    });

    return Array.from(supplierMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limitCount);
  }

  // Lấy top khách hàng
  static async getTopCustomers(
    dateFrom: Date,
    dateTo: Date,
    limitCount = 10
  ): Promise<CustomerSummary[]> {
    const outputInvoices = await this.getOutputInvoices(dateFrom, dateTo);

    const customerMap = new Map<string, CustomerSummary>();

    outputInvoices.forEach((invoice) => {
      const customerId = invoice.customerId || "guest";
      const customerName = invoice.customerName || "Khách vãng lai";

      const existing = customerMap.get(customerId);
      if (existing) {
        existing.totalAmount += invoice.totalAmount || 0;
        existing.totalVat += invoice.vatAmount || 0;
        existing.invoiceCount += 1;
        if (
          invoice.createdAt.toMillis() > existing.lastInvoiceDate.toMillis()
        ) {
          existing.lastInvoiceDate = invoice.createdAt;
        }
      } else {
        customerMap.set(customerId, {
          customerId: invoice.customerId,
          customerName,
          totalAmount: invoice.totalAmount || 0,
          totalVat: invoice.vatAmount || 0,
          invoiceCount: 1,
          lastInvoiceDate: invoice.createdAt,
        });
      }
    });

    return Array.from(customerMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limitCount);
  }

  // Lấy top sản phẩm/vật tư
  static async getTopProducts(
    dateFrom: Date,
    dateTo: Date,
    limitCount = 10
  ): Promise<ProductSummary[]> {
    const outputInvoices = await this.getOutputInvoices(dateFrom, dateTo);

    const productMap = new Map<string, ProductSummary>();

    outputInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const existing = productMap.get(item.itemId);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.totalRevenue += item.totalPrice;
          existing.averagePrice = existing.totalRevenue / existing.quantitySold;
        } else {
          productMap.set(item.itemId, {
            itemId: item.itemId,
            itemName: item.itemName,
            itemType: item.itemType,
            category: item.category,
            quantitySold: item.quantity,
            totalRevenue: item.totalPrice,
            averagePrice: item.unitPrice,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limitCount);
  }

  // Phân tích hóa đơn
  static async getInvoiceBreakdown(
    dateFrom: Date,
    dateTo: Date
  ): Promise<InvoiceBreakdown> {
    const [inputInvoices, outputInvoices] = await Promise.all([
      this.getInputInvoices(dateFrom, dateTo),
      this.getOutputInvoices(dateFrom, dateTo),
    ]);

    const inputTaxed = inputInvoices
      .filter((inv) => inv.taxType === "taxed")
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const inputNonTaxed = inputInvoices
      .filter((inv) => inv.taxType === "non-taxed")
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const outputTaxed = outputInvoices
      .filter((inv) => inv.taxType === "taxed")
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const outputNonTaxed = outputInvoices
      .filter((inv) => inv.taxType === "non-taxed")
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    return {
      input: {
        taxed: inputTaxed,
        nonTaxed: inputNonTaxed,
        totalCount: inputInvoices.length,
      },
      output: {
        taxed: outputTaxed,
        nonTaxed: outputNonTaxed,
        totalCount: outputInvoices.length,
      },
    };
  }

  // Tạo báo cáo tháng đầy đủ
  static async generateMonthlyReport(month: string): Promise<MonthlyReport> {
    const [year, monthNum] = month.split("-");
    const dateFrom = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const dateTo = new Date(parseInt(year), parseInt(monthNum), 0);

    const [
      summary,
      topSuppliers,
      topCustomers,
      topProducts,
      additionalCosts,
      invoiceBreakdown,
    ] = await Promise.all([
      this.generateSummary(month, dateFrom, dateTo),
      this.getTopSuppliers(dateFrom, dateTo, 5),
      this.getTopCustomers(dateFrom, dateTo, 5),
      this.getTopProducts(dateFrom, dateTo, 10),
      AdditionalCostService.getByPeriod(dateFrom, dateTo),
      this.getInvoiceBreakdown(dateFrom, dateTo),
    ]);

    return {
      period: month,
      summary,
      topSuppliers,
      topCustomers,
      topProducts,
      additionalCosts,
      invoiceBreakdown,
    };
  }

  // So sánh với kỳ trước
  static async generateComparisonReport(
    currentPeriod: string,
    previousPeriod: string
  ): Promise<ComparisonReport> {
    const parseMonth = (period: string) => {
      const [year, month] = period.split("-");
      return {
        dateFrom: new Date(parseInt(year), parseInt(month) - 1, 1),
        dateTo: new Date(parseInt(year), parseInt(month), 0),
      };
    };

    const current = parseMonth(currentPeriod);
    const previous = parseMonth(previousPeriod);

    const [currentSummary, previousSummary] = await Promise.all([
      this.generateSummary(currentPeriod, current.dateFrom, current.dateTo),
      this.generateSummary(previousPeriod, previous.dateFrom, previous.dateTo),
    ]);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      currentPeriod: currentSummary,
      previousPeriod: previousSummary,
      growth: {
        inputAmount: calculateGrowth(
          currentSummary.totalInputAmount,
          previousSummary.totalInputAmount
        ),
        outputAmount: calculateGrowth(
          currentSummary.totalOutputAmount,
          previousSummary.totalOutputAmount
        ),
        profit: calculateGrowth(currentSummary.profit, previousSummary.profit),
        netProfit: calculateGrowth(
          currentSummary.netProfit,
          previousSummary.netProfit
        ),
      },
    };
  }
}
