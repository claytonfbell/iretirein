import { all, create } from "mathjs"
import { useMemo } from "react"
import { InputState } from "../InputState"
import { toDecimal } from "../util"
import { YourNumber } from "./YourNumber"
import { calculateMonthlyApprecitation } from "./calculateMonthlyApprecitation"
import { useFindMyYear } from "./useFindMyYear"

const mathjs = create(all, {})

interface Props {
  state: InputState
}

export function Calculate({ state: inputState }: Props) {
  const state = useMemo(() => {
    return {
      ...inputState,
      bucket1Contribution: inputState.coastFire
        ? "0"
        : inputState.bucket1Contribution,
      bucket2Contribution: inputState.coastFire
        ? "0"
        : inputState.bucket2Contribution,
      bucket3Contribution: inputState.coastFire
        ? "0"
        : inputState.bucket3Contribution,
    }
  }, [inputState])

  const DIVIDEND_RATE = mathjs.multiply(
    toDecimal(state.stockPrice),
    mathjs.divide(toDecimal(state.stockDividendRate), 4)
  )

  const { bucket1, bucket2, bucket3 } = useMemo(() => {
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
    return { bucket1, bucket2, bucket3 }
  }, [state])

  const { data: numbers } = useFindMyYear({ state, bucket1, bucket2, bucket3 })

  return (
    <>
      {numbers !== undefined ? (
        <YourNumber numbers={numbers} state={state} />
      ) : null}
    </>
  )
}

export interface MonthlyAppreciationRow {
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
