function normalizeText(text: string): string {
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
}

const generateOrderNumber = () => {
  const d = new Date();
  const yy = d.getFullYear().toString().slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const ts = String(d.getTime()).slice(-6);
  return `PO-${yy}${mm}${dd}-${ts}`;
};

export { normalizeText, generateOrderNumber };
