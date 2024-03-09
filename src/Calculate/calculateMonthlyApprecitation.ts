import { all, create } from "mathjs"
import { MonthlyAppreciationRow } from "."

const mathjs = create(all, {})

export function calculateMonthlyApprecitation({
  beginPrice,
  appreciation,
  dividendRate,
  month,
  contribution,
  cumulativeShares,
}: {
  beginPrice: number
  appreciation: number
  dividendRate: number
  month: number
  contribution: number
  cumulativeShares: number
}) {
  const endingPrice = mathjs.round(
    mathjs.multiply(
      beginPrice,
      Math.pow(1 + appreciation, mathjs.divide(1, 12))
    ),
    2
  )

  let dividendAmount = 0
  if (
    month % 12 === 2 ||
    month % 12 === 5 ||
    month % 12 === 8 ||
    month % 12 === 11
  ) {
    dividendAmount = mathjs.round(
      mathjs.multiply(cumulativeShares, dividendRate),
      2
    )
  }

  const newShares = mathjs.divide(
    mathjs.add(dividendAmount, contribution),
    beginPrice
  )
  const newCumulativeShares = mathjs.add(cumulativeShares, newShares)
  const cumulativeValue = mathjs.round(
    mathjs.multiply(newCumulativeShares, endingPrice),
    2
  )

  const row: MonthlyAppreciationRow = {
    month,
    beginPrice,
    dividendRate,
    dividendAmount,
    contribution,
    newShares,
    cumulativeShares: newCumulativeShares,
    endingPrice,
    cumulativeValue,
  }
  return row
}
