// Cuota fija con sistema francés: la que usan bancos y financieras en Perú.
export function monthlyRate(tea: number) {
  return Math.pow(1 + tea / 100, 1 / 12) - 1;
}

export function installment(price: number, downPct: number, months: number, tea: number) {
  const principal = price * (1 - downPct / 100);
  const i = monthlyRate(tea);
  const cuota = i === 0 ? principal / months : (principal * i) / (1 - Math.pow(1 + i, -months));
  const total = cuota * months;
  return {
    principal: Math.round(principal),
    cuota: Math.round(cuota),
    interest: Math.round(total - principal),
    down: Math.round(price - principal),
  };
}
