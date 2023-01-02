import { Typography } from "@mui/material"
import { all, create } from "mathjs"
import moment from "moment"
import { InputState } from "./InputState"

const mathjs = create(all, {})

interface Props {
  state: InputState
}

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

export function Calculate({ state }: Props) {
  const APPRECIATION = 0.09
  const STARTING_FUND_PRICE = 133.0
  const DIVIDEND_RATE = mathjs.multiply(
    STARTING_FUND_PRICE,
    mathjs.divide(mathjs.divide(1.33, 100), 4)
  )

  let month = 0
  const bucket1: MonthlyAppreciationRow[] = []
  const bucket2: MonthlyAppreciationRow[] = []
  const bucket3: MonthlyAppreciationRow[] = []
  while (month < 12 * 60) {
    month++
    ;[bucket1, bucket2, bucket3].forEach((bucket, index) => {
      if (bucket.length === 0) {
        bucket.push(
          calculateMonthlyApprecitation({
            beginPrice: STARTING_FUND_PRICE,
            appreciation: APPRECIATION,
            dividendRate: DIVIDEND_RATE,
            month,
            contribution: toDecimal(
              index === 0
                ? state.bucket1Value
                : index === 1
                ? state.bucket2Value
                : state.bucket3Value
            ),
            cumulativeShares: 0,
          })
        )
      } else {
        const previousRow = bucket.at(-1)
        if (previousRow) {
          bucket.push(
            calculateMonthlyApprecitation({
              beginPrice: previousRow.endingPrice,
              appreciation: APPRECIATION,
              dividendRate: DIVIDEND_RATE,
              month,
              contribution: toDecimal(
                index === 0
                  ? state.bucket1Contribution
                  : index === 1
                  ? state.bucket2Contribution
                  : state.bucket3Contribution
              ),
              cumulativeShares: previousRow.cumulativeShares,
            })
          )
        }
      }
    })
  }

  const numbers = findMyYear({ state, bucket1, bucket2, bucket3 })

  return <>{numbers !== undefined ? <YourNumber numbers={numbers} /> : null}</>
}

interface YourNumberProps {
  numbers: YourNumber
}

function YourNumber({ numbers }: YourNumberProps) {
  return (
    <>
      <Typography variant="h3">
        You could be financially independent{" "}
        {moment().add(numbers.month, "months").fromNow()} in the year{" "}
        {numbers.year} at the ages of {numbers.person1Age} and{" "}
        {numbers.person2Age}.
      </Typography>
      <Typography variant="h4">
        Your portfolio value could be {toMoney(numbers.cumulativeValue)}.
      </Typography>
      <Typography variant="h4">
        You will receive about {toMoney(numbers.ssIncome)} per year in Social
        Security benefits (raises with inflation).
      </Typography>
      <Typography variant="h4">
        You can withdraw {toMoney(numbers.withdrawalIncome)} per year (raises
        each year with inflation). You will also withdraw about{" "}
        {toMoney(numbers.tax)} to pay your taxes.
      </Typography>
      <br />
      <br />
      <br />
      <br />
      <br />
      <pre>{JSON.stringify(numbers, null, 2)}</pre>
    </>
  )
}

interface FindMyYearArgs {
  state: InputState
  bucket1: MonthlyAppreciationRow[]
  bucket2: MonthlyAppreciationRow[]
  bucket3: MonthlyAppreciationRow[]
}

function findMyYear({ state, bucket1, bucket2, bucket3 }: FindMyYearArgs) {
  let month = 0
  let keepGoing = true
  while (keepGoing) {
    month++
    const numbers = findNumbersForMonth(month, {
      state,
      bucket1,
      bucket2,
      bucket3,
    })

    keepGoing =
      month < 60 * 12 &&
      numbers.cumulativeValue < numbers.requiredPortfolioValue

    if (!keepGoing) {
      return numbers
    }
  }
}

type YourNumber = ReturnType<typeof findNumbersForMonth>

function findNumbersForMonth(
  month: number,
  { state, bucket1, bucket2, bucket3 }: FindMyYearArgs
) {
  const b1 = bucket1.find((row) => row.month === month)
  const b2 = bucket2.find((row) => row.month === month)
  const b3 = bucket3.find((row) => row.month === month)

  const cumulativeValue =
    (b1?.cumulativeValue || 0) +
    (b2?.cumulativeValue || 0) +
    (b3?.cumulativeValue || 0)

  const date = moment().add(month, "months").format("MMMM, YYYY")
  const year = moment().add(month, "months").year()

  const person1Age = Math.floor(
    moment
      .duration(
        moment().add(month, "months").diff(moment(state.person1Birthday))
      )
      .asYears()
  )

  const person2Age = Math.floor(
    moment
      .duration(
        moment().add(month, "months").diff(moment(state.person2Birthday))
      )
      .asYears()
  )

  const effectiveTaxRate = 0.15
  const safeWithdrawalRate = Math.max(
    0.035,
    0.05 - (140 - (person1Age + person2Age)) * 0.0006
  )

  const healthInsuranceGap =
    Math.max(0, (65 - person1Age) * 15000) +
    Math.max(0, (65 - person2Age) * 15000)

  const person1SSAge = Math.min(70, Math.max(62, person1Age))
  const person1SS = toDecimal(state.person1SocialSecurity[person1SSAge - 62])
  const person2SSAge = Math.min(70, Math.max(62, person2Age))
  const person2SS = toDecimal(state.person2SocialSecurity[person2SSAge - 62])
  const ssGap =
    Math.max(0, (62 - person1Age) * person1SS * 12) +
    Math.max(0, (62 - person2Age) * person2SS * 12)

  const ssIncome = (person1SS + person2SS) * 12
  const withdrawalIncome = Math.max(0, toDecimal(state.takeHomePay) - ssIncome)

  const taxableRatio = (b2?.cumulativeValue || 0) / cumulativeValue
  const taxableIncome = ssIncome * 0.85 + withdrawalIncome * taxableRatio
  const tax = taxableIncome * effectiveTaxRate
  const withdrawal = withdrawalIncome + tax

  const requiredPortfolioValue =
    withdrawal / safeWithdrawalRate + healthInsuranceGap + ssGap

  return {
    month,
    date,
    year,
    person1Age,
    person2Age,
    effectiveTaxRate,
    safeWithdrawalRate,
    healthInsuranceGap,
    ssGap,
    ssIncome,
    withdrawalIncome,
    taxableIncome,
    tax,
    cumulativeValue,
    withdrawal,
    requiredPortfolioValue,
  }
}

interface MonthlyAppreciationRow {
  month: number
  beginPrice: number
  dividendAmount: number
  contribution: number
  dividendRate: number
  newShares: number
  cumulativeShares: number
  endingPrice: number
  cumulativeValue: number
}

function calculateMonthlyApprecitation({
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
