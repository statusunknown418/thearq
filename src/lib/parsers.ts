/**
 * Parses values to currency
 * @param value Amount in cents
 * @returns
 */
export const parseCompactCurrency = (value: number) => {
  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(receiveAmount(value));
};

export const parseLongCurrency = (value: number) => {
  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(receiveAmount(value));
};

export const receiveAmount = (value: number) => {
  return value / 100;
};

export const sendAmount = (value: number) => {
  return value * 100;
};

export const parseNumber = (value: number) => {
  return Intl.NumberFormat(undefined, {}).format(value);
};
