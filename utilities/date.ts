export function expiryDate() {
  const expiryDate = new Date();
  return (
    expiryDate.setDate(expiryDate.getDate() + 1) && expiryDate.toISOString()
  );
}
