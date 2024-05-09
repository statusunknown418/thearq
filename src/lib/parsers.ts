/**
 * Parses values to currency
 * @param value Amount in cents
 * @returns
 */
export const parseCurrency = (value: number) => {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
};

export const receiveAmount = (value: number) => {
  return value / 100;
};

export const sendAmount = (value: number) => {
  return value * 100;
};

export const parseNumber = (value: number) => {
  return Intl.NumberFormat().format(value);
};
