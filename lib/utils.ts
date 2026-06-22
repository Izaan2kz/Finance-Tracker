export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getScopeRange(scope: string): { from: Date; to: Date; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (scope) {
    case "this-month":
      return {
        from: new Date(year, month, 1),
        to: new Date(year, month + 1, 0),
        label: `${now.toLocaleString("en-US", { month: "long" })} ${year}`,
      };
    case "last-month": {
      const lastMonth = month === 0 ? 11 : month - 1;
      const lastYear = month === 0 ? year - 1 : year;
      return {
        from: new Date(lastYear, lastMonth, 1),
        to: new Date(lastYear, lastMonth + 1, 0),
        label: `${new Date(lastYear, lastMonth).toLocaleString("en-US", { month: "long" })} ${lastYear}`,
      };
    }
    case "this-quarter": {
      const quarterStart = Math.floor(month / 3) * 3;
      return {
        from: new Date(year, quarterStart, 1),
        to: new Date(year, quarterStart + 3, 0),
        label: `Q${Math.floor(month / 3) + 1} ${year}`,
      };
    }
    case "this-year":
      return {
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31),
        label: `${year}`,
      };
    default:
      return {
        from: new Date(year, month, 1),
        to: new Date(year, month + 1, 0),
        label: `${now.toLocaleString("en-US", { month: "long" })} ${year}`,
      };
  }
}
