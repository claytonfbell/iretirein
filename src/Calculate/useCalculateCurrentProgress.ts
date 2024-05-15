import { all, create } from "mathjs"
import { InputState } from "../InputState"
import { toDecimal } from "../util"

const mathjs = create(all, {})

export function useCalculateCurrentProgress(state: InputState) {
  const totalSavedNow = mathjs
    .chain(toDecimal(state.bucket1Value))
    .add(toDecimal(state.bucket2Value))
    .add(toDecimal(state.bucket3Value))
    .done()
  const amountCouldWithdrawNow = mathjs.multiply(
    toDecimal(state.withdrawalRate),
    totalSavedNow
  )

  const socialSecurityAt62 = mathjs.multiply(
    12,
    mathjs.add(
      toDecimal(state.person1SocialSecurity[0]),
      toDecimal(state.person2SocialSecurity[0])
    )
  )
  const progress = mathjs.multiply(
    100,
    mathjs.divide(amountCouldWithdrawNow, toDecimal(state.takeHomePay))
  )
  return progress
}
