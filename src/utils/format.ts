import { format } from "date-fns";

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
