import { all, create } from "mathjs"
import moment from "moment"
import { useQuery } from "react-query"
import { MonthlyAppreciationRow } from "."
import { toDecimal } from "../util"
import { YourNumberProps } from "./YourNumber"
import { calculateMonthlyApprecitation } from "./calculateMonthlyApprecitation"

const mathjs = create(all, {})

export function useBuildSchedule(args: YourNumberProps) {
  return useQuery(["buildSchedule", args], () => {
    return buildSchedule(args)
  })
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
