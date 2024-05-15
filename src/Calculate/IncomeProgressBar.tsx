import { Box, LinearProgress, Stack, Typography } from "@mui/material"
import { all, create } from "mathjs"
import { useEffect, useRef, useState } from "react"
import { InputState } from "../InputState"
import { toDecimal, toMoney } from "../util"

interface Props {
  state: InputState
}

export function IncomeProgressBar({ state }: Props) {
  const { progress, income, requiredIncome } =
    useCalculateCurrentProgress(state)

  const { ref: containerRef, width } = useWidth()

  return (
    <Stack spacing={1}>
      <Typography variant="h2">
        Income from Portfolio Today with Social Security:
      </Typography>
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
        }}
      >
        <LinearProgress
          sx={{ height: 32, borderRadius: 6 }}
          value={progress}
          variant="determinate"
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            width,
          }}
        >
          <Stack alignItems={"center"}>
            <Typography variant="h2">
              {toMoney(income, 0)} of {toMoney(requiredIncome, 0)} (
              {progress.toFixed(0)}%)
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Stack>
  )
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(0)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (ref.current) {
        setWidth(ref.current.clientWidth)
      }
    })
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

const mathjs = create(all, {})

function useCalculateCurrentProgress(state: InputState) {
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
  const income = mathjs.add(amountCouldWithdrawNow, socialSecurityAt62)
  const requiredIncome = toDecimal(state.takeHomePay)
  const progress = mathjs.multiply(100, mathjs.divide(income, requiredIncome))
  return { progress, income, requiredIncome }
}
