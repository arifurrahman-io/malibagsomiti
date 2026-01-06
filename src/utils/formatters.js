/**
 * Formats numbers into BDT currency format
 * Example: 5000 -> ৳5,000
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace("BDT", "৳");
};

/**
 * Formats ISO dates to local Bangladesh format
 * Example: 2026-01-04 -> 04 Jan 2026
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Masks sensitive information for the UI
 * Example: 123456789 -> *****6789
 */
export const maskNID = (nid) => {
  if (!nid) return "";
  return nid.replace(/\d(?=\d{4})/g, "*");
};
