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

export const calculateVatAmount = ({
  amount,
  vatRate,
}: {
  amount: number;
  vatRate: number;
}) => {
  console.log('');
  return amount * (vatRate / 100);
};
