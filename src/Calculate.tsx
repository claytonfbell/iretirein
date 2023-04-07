import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { all, create } from "mathjs"
import moment from "moment"
import { useQuery } from "react-query"
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
  const DIVIDEND_RATE = mathjs.multiply(
    toDecimal(state.stockPrice),
    mathjs.divide(toDecimal(state.stockDividendRate), 4)
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
            beginPrice: toDecimal(state.stockPrice),
            appreciation: toDecimal(state.stockAppreciation),
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
              appreciation: toDecimal(state.stockAppreciation),
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

  const { data: numbers } = useFindMyYear({ state, bucket1, bucket2, bucket3 })

  return (
    <>
      {numbers !== undefined ? (
        <YourNumber numbers={numbers} state={state} />
      ) : null}
    </>
  )
}

interface YourNumberProps {
  numbers: YourNumber
  state: InputState
}

function YourNumber({ numbers, state }: YourNumberProps) {
  const { data: schedule } = useBuildSchedule({ numbers, state })

  return (
    <>
      <Typography variant="h2" sx={{ marginBottom: 2 }}>
        {numbers.year} is your year to be financially independent!
      </Typography>
      <Typography variant="h3" sx={{ marginBottom: 2 }}>
        That is {moment().add(numbers.month, "months").fromNow()}, and you will
        be {numbers.person1Age} and {numbers.person2Age} years old.
      </Typography>
      <Typography variant="h3" sx={{ marginBottom: 2 }}>
        Your portfolio will may be worth {toMoney(numbers.cumulativeValue, 0)}.
      </Typography>

      <Typography variant="h3" sx={{ marginBottom: 2 }}>
        Assumes an effective tax rate of{" "}
        {mathjs.multiply(toDecimal(state.effectiveTaxRate), 100)}%.
      </Typography>
      <Typography variant="h3" sx={{ marginBottom: 2 }}>
        Safe withdrawal rate starting at{" "}
        {mathjs.round(mathjs.multiply(toDecimal(state.withdrawalRate), 100), 2)}
        % and rising annually with inflation rate of{" "}
        {mathjs.multiply(toDecimal(state.inflationRate), 100)}%.
      </Typography>
      <br />
      <br />
      <br />
      <br />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Months</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Ages</TableCell>
            <TableCell>Stock Price</TableCell>
            <TableCell>Contribute / Sold</TableCell>
            <TableCell>Dividends</TableCell>
            <TableCell>New Shares</TableCell>
            <TableCell>Total Shares</TableCell>
            <TableCell>Total Value</TableCell>
            <TableCell>SS Income</TableCell>
            <TableCell>Health Care Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule !== undefined ? (
            <>
              {schedule.all.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>
                    {moment().add(row.month, "months").format("MMMM, YYYY")}
                  </TableCell>
                  <TableCell>
                    {moment()
                      .add(row.month, "months")
                      .diff(moment(state.person1Birthday), "years")}
                    /
                    {moment()
                      .add(row.month, "months")
                      .diff(moment(state.person2Birthday), "years")}
                  </TableCell>
                  <TableCell>{toMoney(row.endingPrice, 0)}</TableCell>
                  <TableCell
                    sx={{
                      color: row.contribution > 0 ? "green" : "red",
                    }}
                  >
                    {toMoney(row.contribution, 0)}
                  </TableCell>
                  <TableCell>{toMoney(row.dividendAmount, 0)}</TableCell>
                  <TableCell
                    sx={{
                      color: row.newShares > 0 ? "green" : "red",
                    }}
                  >
                    {mathjs.round(row.newShares, 1).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {mathjs.round(row.cumulativeShares, 1).toLocaleString()}
                  </TableCell>
                  <TableCell>{toMoney(row.cumulativeValue, 0)}</TableCell>
                  <TableCell>
                    {row.ssIncome !== undefined
                      ? toMoney(row.ssIncome, 0)
                      : null}
                  </TableCell>
                  <TableCell>
                    {row.healthInsuranceGap !== undefined
                      ? toMoney(row.healthInsuranceGap, 0)
                      : null}
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : null}
        </TableBody>
      </Table>
      <br />
      <br />
      <br />
      {/* <pre>{JSON.stringify({ schedule }, null, 2)}</pre> */}
    </>
  )
}

async function buildSchedule({ numbers, state }: YourNumberProps) {
  const [bucket1, bucket2, bucket3] = [
    numbers.bucket1,
    numbers.bucket2,
    numbers.bucket3,
  ].map((bucket, bucketIndex) => {
    let prev: MonthlyAppreciationRow | null = null
    const withdrawalAmount = mathjs.multiply(
      mathjs.divide(numbers.withdrawalIncome, 12),
      numbers.ratios[bucketIndex]
    )

    let lastWithdrawal = withdrawalAmount

    let person1SS = numbers.person1SS
    let person2SS = numbers.person2SS

    return (
      bucket
        // filter out rows that are too far in the future
        .filter((row) => {
          const age1 = moment()
            .add(row.month, "months")
            .diff(state.person1Birthday, "years")
          const age2 = moment()
            .add(row.month, "months")
            .diff(state.person2Birthday, "years")
          const youngest = Math.min(age1, age2)
          return youngest < 100
        })
        // calculate decumulation
        .map((row) => {
          let newRow = row

          if (row.month > numbers.month) {
            // adjust withdrawal amount for inflation every year
            if (row.month % 12 === 0) {
              lastWithdrawal = mathjs.round(
                mathjs.multiply(
                  lastWithdrawal,
                  Math.pow(1 + toDecimal(state.inflationRate), 1)
                ),
                2
              )
            }

            const person1Age = moment()
              .add(row.month, "months")
              .diff(state.person1Birthday, "years")

            const person2Age = moment()
              .add(row.month, "months")
              .diff(state.person2Birthday, "years")

            // health insurance
            let healthInsuranceGap = 0
            if (person1Age < 65) {
              healthInsuranceGap = healthInsuranceGap + 15000 / 12
            }
            if (person2Age < 65) {
              healthInsuranceGap = healthInsuranceGap + 15000 / 12
            }
            healthInsuranceGap = mathjs.multiply(
              healthInsuranceGap,
              numbers.ratios[bucketIndex]
            )

            // adjust ss for inflation
            if (row.month % 12 === 0) {
              person1SS = mathjs.round(
                mathjs.multiply(
                  person1SS,
                  Math.pow(1 + toDecimal(state.inflationRate), 1)
                ),
                2
              )
              person2SS = mathjs.round(
                mathjs.multiply(
                  person2SS,
                  Math.pow(1 + toDecimal(state.inflationRate), 1)
                ),
                2
              )
            }

            // Social Security
            let ssIncome = 0
            let ssGap = 0
            if (person1Age >= 62) {
              ssIncome = ssIncome + person1SS
            } else {
              ssGap = ssGap + person1SS
            }
            if (person2Age >= 62) {
              ssIncome = ssIncome + person2SS
            } else {
              ssGap = ssGap + person2SS
            }
            ssIncome = mathjs.multiply(ssIncome, numbers.ratios[bucketIndex])
            ssGap = mathjs.multiply(ssGap, numbers.ratios[bucketIndex])

            // withdrawal for taxes
            let tax = 0
            const withdrawalIncome = lastWithdrawal + healthInsuranceGap + ssGap

            const taxableIncome =
              ssIncome * 0.85 + withdrawalIncome * (bucketIndex === 1 ? 1 : 0)

            tax = mathjs.round(
              mathjs.multiply(taxableIncome, toDecimal(state.effectiveTaxRate)),
              2
            )
            tax = mathjs.multiply(tax, numbers.ratios[bucketIndex])

            const contribution =
              0 - lastWithdrawal - tax - healthInsuranceGap - ssGap
            newRow = calculateMonthlyApprecitation({
              beginPrice: row.beginPrice,
              appreciation: toDecimal(state.stockAppreciation),
              dividendRate: row.dividendRate,
              month: row.month,
              contribution,
              cumulativeShares: prev?.cumulativeShares || 0,
            })
            newRow = { ...newRow, healthInsuranceGap, ssIncome, ssGap }
          }
          prev = newRow
          return { ...newRow }
        })
    )
  })

  const all = bucket1.map((_, index) => {
    const row: MonthlyAppreciationRow = {
      month: _.month,
      beginPrice: _.beginPrice,
      dividendRate: _.dividendRate,
      contribution: mathjs
        .chain(bucket1[index].contribution)
        .add(bucket2[index].contribution)
        .add(bucket3[index].contribution)
        .done(),
      dividendAmount: mathjs
        .chain(bucket1[index].dividendAmount)
        .add(bucket2[index].dividendAmount)
        .add(bucket3[index].dividendAmount)
        .done(),
      newShares: mathjs
        .chain(bucket1[index].newShares)
        .add(bucket2[index].newShares)
        .add(bucket3[index].newShares)
        .done(),
      cumulativeShares: mathjs
        .chain(bucket1[index].cumulativeShares)
        .add(bucket2[index].cumulativeShares)
        .add(bucket3[index].cumulativeShares)
        .done(),
      endingPrice: _.endingPrice,
      cumulativeValue: mathjs
        .chain(bucket1[index].cumulativeValue)
        .add(bucket2[index].cumulativeValue)
        .add(bucket3[index].cumulativeValue)
        .done(),
      healthInsuranceGap: mathjs
        .chain(bucket1[index].healthInsuranceGap || 0)
        .add(bucket2[index].healthInsuranceGap || 0)
        .add(bucket3[index].healthInsuranceGap || 0)
        .done(),
      ssGap: mathjs
        .chain(bucket1[index].ssGap || 0)
        .add(bucket2[index].ssGap || 0)
        .add(bucket3[index].ssGap || 0)
        .done(),
      ssIncome: mathjs
        .chain(bucket1[index].ssIncome || 0)
        .add(bucket2[index].ssIncome || 0)
        .add(bucket3[index].ssIncome || 0)
        .done(),
    }
    return row
  })

  return { bucket1, bucket2, bucket3, all }
}

function useBuildSchedule(args: YourNumberProps) {
  return useQuery(["buildSchedule", args], () => {
    return buildSchedule(args)
  })
}

interface FindMyYearArgs {
  state: InputState
  bucket1: MonthlyAppreciationRow[]
  bucket2: MonthlyAppreciationRow[]
  bucket3: MonthlyAppreciationRow[]
}

async function findMyYear({
  state,
  bucket1,
  bucket2,
  bucket3,
}: FindMyYearArgs) {
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

function useFindMyYear(args: FindMyYearArgs) {
  return useQuery(["findMyYear", args], () => {
    return findMyYear(args)
  })
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

  const ratios = [
    (b1?.cumulativeValue || 0) / cumulativeValue,
    (b2?.cumulativeValue || 0) / cumulativeValue,
    (b3?.cumulativeValue || 0) / cumulativeValue,
  ]

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
  const tax = mathjs.multiply(taxableIncome, toDecimal(state.effectiveTaxRate))
  const withdrawal = withdrawalIncome + tax

  const requiredPortfolioValue =
    mathjs.divide(withdrawal, toDecimal(state.withdrawalRate)) +
    healthInsuranceGap +
    ssGap

  return {
    month,
    date,
    year,
    person1Age,
    person2Age,
    healthInsuranceGap,
    ssGap,
    ssIncome,
    person1SS,
    person2SS,
    withdrawalIncome,
    taxableIncome,
    tax,
    taxableRatio,
    cumulativeValue,
    withdrawal,
    requiredPortfolioValue,
    bucket1,
    bucket2,
    bucket3,
    ratios,
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

  healthInsuranceGap?: number
  ssIncome?: number
  ssGap?: number
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
