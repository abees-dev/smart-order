import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export const normalizeText = (text: string): string => {
  return (
    text
      // Convert to lowercase
      .toLowerCase()
      // Remove Vietnamese diacritics
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D")
      // Remove special characters except letters, numbers and spaces
      .replace(/[^a-z0-9\s]/g, "")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      .replace(/đ/g, "d")

      .trim()
  );
};

export const generateOrderNumber = () => {
  const d = new Date();
  const dateFormat = format(d, "yyMMdd");
  const ts = String(d.getTime()).slice(-6);
  return `PO-${dateFormat}-${ts}`;
};

// Format currency for Vietnamese locale
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date for various input types
export const formatDate = (
  date: Timestamp | Date | string | number
): string => {
  if (!date) return "";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return "";
  }

  if (isNaN(dateObj.getTime())) return "";

  return format(dateObj, "dd/MM/yyyy");
};

// Format date with time
export const formatDateTime = (
  date: Timestamp | Date | string | number
): string => {
  if (!date) return "";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return "";
  }

  if (isNaN(dateObj.getTime())) return "";

  return format(dateObj, "dd/MM/yyyy HH:mm");
};
