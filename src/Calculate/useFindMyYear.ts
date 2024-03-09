import { all, create } from "mathjs"
import moment from "moment"
import { useQuery } from "react-query"
import { MonthlyAppreciationRow } from "."
import { InputState } from "../InputState"
import { toDecimal } from "../util"

const mathjs = create(all, {})

export function useFindMyYear(args: FindMyYearArgs) {
  return useQuery(["findMyYear", args], () => {
    return findMyYear(args)
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

export type YourNumberType = ReturnType<typeof findNumbersForMonth>

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

  const bucket1CumulativeValue = b1?.cumulativeValue || 0
  const bucket2CumulativeValue = b2?.cumulativeValue || 0
  const bucket3CumulativeValue = b3?.cumulativeValue || 0

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
    bucket1CumulativeValue,
    bucket2CumulativeValue,
    bucket3CumulativeValue,
    withdrawal,
    requiredPortfolioValue,
    bucket1,
    bucket2,
    bucket3,
    ratios,
  }
}
