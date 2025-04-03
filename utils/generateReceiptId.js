export const generateReceiptId = () => {
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const receiptId = (timestamp + randomDigits).slice(-10); // Ensuring the receiptId is 10 characters long
    return receiptId;
  };