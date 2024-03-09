// string to decimal
export function toDecimal(input: string) {
  const decimal = Number(String(input).replace(/[^0-9.-]+/g, ""))
  if (isNaN(decimal)) {
    return 0
  }
  return decimal
}

// format as money
export function toMoney(input: number, digits: number = 2) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(input)
}
