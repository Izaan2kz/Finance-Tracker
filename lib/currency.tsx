"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const currencies: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$" },
  { code: "ARS", name: "Argentine Peso", symbol: "ARS$" },
  { code: "COP", name: "Colombian Peso", symbol: "COP$" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JD" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
];

const STORAGE_KEY = "financer-currency";

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
  getCurrencyInfo: () => CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  formatAmount: (n) => `$${n.toFixed(2)}`,
  getCurrencyInfo: () => currencies[0],
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && currencies.some((c) => c.code === saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const formatAmount = useCallback((amount: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "VND" ? 0 : 2,
        maximumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "VND" ? 0 : 2,
      }).format(amount);
    } catch {
      const info = currencies.find((c) => c.code === currency) || currencies[0];
      return `${info.symbol}${amount.toFixed(2)}`;
    }
  }, [currency]);

  const getCurrencyInfo = useCallback(() => {
    return currencies.find((c) => c.code === currency) || currencies[0];
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, getCurrencyInfo }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
