export const calculateCurrencyWithVat = ({
  amount,
  vatRate,
  quantity,
}: {
  amount: number;
  vatRate: number;
  quantity: number;
}) => {
  return amount * quantity * (1 + vatRate / 100);
};
