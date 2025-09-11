function normalizeText(text: string): string {
  return (
    text
      // Convert to lowercase
      .toLowerCase()
      // Remove Vietnamese diacritics
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Remove special characters except letters, numbers and spaces
      .replace(/[^a-z0-9\s]/g, "")
      // Remove extra spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}

export { normalizeText };
