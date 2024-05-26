import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  AppBar,
  Box,
  Collapse,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import dayjs from "dayjs"
import { useCallback, useMemo, useState } from "react"
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies, toDecimal, toPennies } from "../util"

const DEBUG = false

export function Calcuate() {
  const { state } = useGlobalState()
  const totalMonths = useTotalMonthsUntilBothReach100()
  const adjustForInflation = useAdjustForInflation()
  const getTaxesDue = useGetTaxesDue()
  const monthsUntilPersonReachesAge = useMonthsUntilPersonReachesAge()
  const getDividends = useGetDividends()
  const getStockAppreciation = useGetStockAppreciation()
  const baseSocialSecurity = useBaseSocialSecurity()
  const calculateSocialSecurityGap = useCalculateSocialSecurityGap()
  const calculateHealthInsuranceGap = useCalculateHealthInsuranceGap()

  const { monthRows, financialIndependenceMonth } = useMemo(() => {
    // rough goal is to have 25x required income + 1M
    const roughPortfolioGoalStart =
      (toPennies(state.requiredIncome) -
        toPennies(state.person1SocialSecurity[0]) -
        toPennies(state.person2SocialSecurity[0])) /
        toDecimal(state.withdrawalRate) -
      toPennies("1000000")
    const roughPortfolioGoalEnd =
      roughPortfolioGoalStart + toPennies("10000000")

    const firstMonth: RowItem = new RowItem(0)
    firstMonth.bucket1.startingValue = toPennies(state.bucket1Value)
    firstMonth.bucket2.startingValue = toPennies(state.bucket2Value)
    firstMonth.bucket3.startingValue = toPennies(state.bucket3Value)
    firstMonth.calculate()

    // first pass accumulation will populate all rows, but skip calculations after rough goal is met
    let monthRows: RowItem[] = [firstMonth]
    for (let month = 1; month < totalMonths; month++) {
      const lastMonth = monthRows[month - 1]

      if (lastMonth.endingValue > roughPortfolioGoalEnd) {
        break
      }

      const newMonth = new RowItem(month)

      // starting values
      newMonth.bucket1.startingValue = lastMonth.bucket1.endingValue
      newMonth.bucket2.startingValue = lastMonth.bucket2.endingValue
      newMonth.bucket3.startingValue = lastMonth.bucket3.endingValue

      // stock appreciation
      newMonth.bucket1.stockAppreciation = getStockAppreciation(
        newMonth.bucket1.startingValue
      )
      newMonth.bucket2.stockAppreciation = getStockAppreciation(
        newMonth.bucket2.startingValue
      )
      newMonth.bucket3.stockAppreciation = getStockAppreciation(
        newMonth.bucket3.startingValue
      )

      // dividends
      newMonth.bucket1.dividends = getDividends(
        newMonth.bucket1.startingValue,
        month
      )
      newMonth.bucket2.dividends = getDividends(
        newMonth.bucket2.startingValue,
        month
      )
      newMonth.bucket3.dividends = getDividends(
        newMonth.bucket3.startingValue,
        month
      )

      // contributions
      newMonth.bucket1.contributions = state.coastFire
        ? 0
        : toPennies(state.bucket1Contribution)
      newMonth.bucket2.contributions = state.coastFire
        ? 0
        : toPennies(state.bucket2Contribution)
      newMonth.bucket3.contributions = state.coastFire
        ? 0
        : toPennies(state.bucket3Contribution)

      // withdrawals
      newMonth.bucket1.withdrawals = 0
      newMonth.bucket2.withdrawals = 0
      newMonth.bucket3.withdrawals = 0

      // calculate new values
      newMonth.calculate()

      monthRows.push(newMonth)
    }

    // second pass will find the month where reach financial independence
    monthRows.forEach((row) => {
      if (
        row.startingValue > roughPortfolioGoalStart &&
        row.startingValue < roughPortfolioGoalEnd
      ) {
        const person1BaseSocialSecurity = baseSocialSecurity(
          "person1",
          row.month
        )
        const person2BaseSocialSecurity = baseSocialSecurity(
          "person2",
          row.month
        )
        const person1AdjustedSocialSecurity = adjustForInflation(
          person1BaseSocialSecurity * 12,
          row.month
        )
        const person2AdjustedSocialSecurity = adjustForInflation(
          person2BaseSocialSecurity * 12,
          row.month
        )

        const adjustedRequiredIncome = adjustForInflation(
          toPennies(state.requiredIncome),
          row.month
        )

        const incomeNeededFromPortfolio =
          adjustedRequiredIncome -
          person1AdjustedSocialSecurity -
          person2AdjustedSocialSecurity

        // calculate taxes (regular income split evenly between both people)
        const bucket2Ratio = row.bucket2.endingValue / row.endingValue
        const regularTaxableIncome =
          bucket2Ratio * (incomeNeededFromPortfolio / 2)

        const person1Taxes = getTaxesDue(
          regularTaxableIncome / 2,
          person1AdjustedSocialSecurity,
          row.month
        )
        const person2Taxes = getTaxesDue(
          regularTaxableIncome / 2,
          person2AdjustedSocialSecurity,
          row.month
        )

        const basePortfolioNeeded =
          (incomeNeededFromPortfolio + person1Taxes + person2Taxes) /
          toDecimal(state.withdrawalRate)

        // social security gaps
        const person1SocialSecurityGap = calculateSocialSecurityGap(
          "person1",
          row.month
        )
        const person2SocialSecurityGap = calculateSocialSecurityGap(
          "person2",
          row.month
        )
        const totalSocialSecurityGap =
          person1SocialSecurityGap + person2SocialSecurityGap

        // health insurance gaps
        const person1HealthInsuranceGap = calculateHealthInsuranceGap(
          "person1",
          row.month
        )
        const person2HealthInsuranceGap = calculateHealthInsuranceGap(
          "person2",
          row.month
        )
        const totalHealthInsuranceGap =
          person1HealthInsuranceGap + person2HealthInsuranceGap

        // total portfolio needed
        const totalPortfolioNeeded =
          basePortfolioNeeded + totalSocialSecurityGap + totalHealthInsuranceGap

        // check if starting value reached goal
        row.reachedGoal = totalPortfolioNeeded < row.startingValue

        // debug
        if (DEBUG) {
          console.log({
            month: row.month,
            endingValue: formatPennies(row.endingValue),
            person1BaseSocialSecurity: formatPennies(person1BaseSocialSecurity),
            person2BaseSocialSecurity: formatPennies(person2BaseSocialSecurity),
            person1AdjustedSocialSecurity: formatPennies(
              person1AdjustedSocialSecurity
            ),
            person2AdjustedSocialSecurity: formatPennies(
              person2AdjustedSocialSecurity
            ),
            adjustedRequiredIncome: formatPennies(adjustedRequiredIncome),
            incomeNeededFromPortfolio: formatPennies(incomeNeededFromPortfolio),
            basePortfolioNeeded: formatPennies(basePortfolioNeeded),
            totalSocialSecurityGap: formatPennies(totalSocialSecurityGap),
            totalHealthInsuranceGap: formatPennies(totalHealthInsuranceGap),
            totalPortfolioNeeded: formatPennies(totalPortfolioNeeded),
            regularTaxableIncome: formatPennies(regularTaxableIncome),
            person1Taxes: formatPennies(person1Taxes),
            person2Taxes: formatPennies(person2Taxes),
            reachedGoal: row.reachedGoal ? "yes" : "no",
          })
        }
      } else if (row.startingValue > roughPortfolioGoalEnd) {
        row.reachedGoal = true
      }
    })

    // third pass, now we can calculate decumulation
    // first remove the extra rows that reached goal
    monthRows = monthRows.filter((row) => !row.reachedGoal)
    const financialIndependenceMonth = monthRows[monthRows.length - 1]
    const person1BaseSocialSecurity = baseSocialSecurity(
      "person1",
      financialIndependenceMonth.month
    )
    const person2BaseSocialSecurity = baseSocialSecurity(
      "person2",
      financialIndependenceMonth.month
    )

    for (
      let month = financialIndependenceMonth.month + 1;
      month < totalMonths;
      month++
    ) {
      const lastMonth = monthRows[month - 1]

      const newMonth = new RowItem(month)

      // starting values
      newMonth.bucket1.startingValue = lastMonth.bucket1.endingValue
      newMonth.bucket2.startingValue = lastMonth.bucket2.endingValue
      newMonth.bucket3.startingValue = lastMonth.bucket3.endingValue

      // stock appreciation
      newMonth.bucket1.stockAppreciation = getStockAppreciation(
        newMonth.bucket1.startingValue
      )
      newMonth.bucket2.stockAppreciation = getStockAppreciation(
        newMonth.bucket2.startingValue
      )
      newMonth.bucket3.stockAppreciation = getStockAppreciation(
        newMonth.bucket3.startingValue
      )

      // dividends
      newMonth.bucket1.dividends = getDividends(
        newMonth.bucket1.startingValue,
        month
      )
      newMonth.bucket2.dividends = getDividends(
        newMonth.bucket2.startingValue,
        month
      )
      newMonth.bucket3.dividends = getDividends(
        newMonth.bucket3.startingValue,
        month
      )

      // contributions
      newMonth.bucket1.contributions = 0
      newMonth.bucket2.contributions = 0
      newMonth.bucket3.contributions = 0

      // calculate withdrawals
      const person1SocialSecurity =
        month >= monthsUntilPersonReachesAge("person1", 62)
          ? adjustForInflation(person1BaseSocialSecurity, month)
          : 0
      const person2SocialSecurity =
        month >= monthsUntilPersonReachesAge("person2", 62)
          ? adjustForInflation(person2BaseSocialSecurity, month)
          : 0

      // health insurance costs
      const person1HealthInsuranceCost =
        month < monthsUntilPersonReachesAge("person1", 65)
          ? adjustForInflation(toPennies(state.preMedicareInsuance), month)
          : 0
      const person2HealthInsuranceCost =
        month < monthsUntilPersonReachesAge("person2", 65)
          ? adjustForInflation(toPennies(state.preMedicareInsuance), month)
          : 0

      const incomeNeededFromPortfolio =
        adjustForInflation(toPennies(state.requiredIncome) / 12, month) +
        (person1HealthInsuranceCost + person2HealthInsuranceCost) -
        (person1SocialSecurity + person2SocialSecurity)

      // TAX - if month is april, calculate taxes
      let totalWithdrawals = incomeNeededFromPortfolio
      if (dayjs().add(month, "month").month() === 3) {
        const bucket2Ratio =
          lastMonth.bucket2.endingValue / lastMonth.endingValue
        const regularTaxableIncome =
          bucket2Ratio * ((incomeNeededFromPortfolio * 12) / 2)

        const person1Taxes = getTaxesDue(
          regularTaxableIncome / 2,
          person1SocialSecurity,
          month
        )
        const person2Taxes = getTaxesDue(
          regularTaxableIncome / 2,
          person2SocialSecurity,
          month
        )
        totalWithdrawals =
          incomeNeededFromPortfolio + person1Taxes + person2Taxes
      }

      // first draw from bucket 3 (after tax)
      // then draw from bucket 2 (traditional)
      // then draw from bucket 1 (roth & hsa)
      newMonth.bucket3.withdrawals = Math.min(
        newMonth.bucket3.startingValue,
        totalWithdrawals
      )
      newMonth.bucket2.withdrawals = Math.min(
        newMonth.bucket2.startingValue,
        totalWithdrawals - newMonth.bucket3.withdrawals
      )
      newMonth.bucket1.withdrawals = Math.min(
        newMonth.bucket1.startingValue,
        totalWithdrawals -
          newMonth.bucket3.withdrawals -
          newMonth.bucket2.withdrawals
      )

      // calculate new values
      newMonth.calculate()

      monthRows.push(newMonth)
    }

    return { monthRows, financialIndependenceMonth }
  }, [
    adjustForInflation,
    baseSocialSecurity,
    calculateHealthInsuranceGap,
    calculateSocialSecurityGap,
    getDividends,
    getStockAppreciation,
    getTaxesDue,
    monthsUntilPersonReachesAge,
    state,
    totalMonths,
  ])

  // get a row for each year totaled up
  const yearRows: RowItem[] = monthRows.reduce((acc, row) => {
    // if month is january add it
    if (dayjs().add(row.month, "month").month() === dayjs().month()) {
      const newRow = new RowItem(row.month)

      for (let i = 0; i < 12; i++) {
        if (monthRows[row.month - i] !== undefined) {
          // starting values
          newRow.bucket1.startingValue =
            monthRows[row.month - i].bucket1.startingValue
          newRow.bucket2.startingValue =
            monthRows[row.month - i].bucket2.startingValue
          newRow.bucket3.startingValue =
            monthRows[row.month - i].bucket3.startingValue

          // bucket1
          newRow.bucket1.stockAppreciation +=
            monthRows[row.month - i].bucket1.stockAppreciation
          newRow.bucket1.dividends += monthRows[row.month - i].bucket1.dividends
          newRow.bucket1.contributions +=
            monthRows[row.month - i].bucket1.contributions
          newRow.bucket1.withdrawals +=
            monthRows[row.month - i].bucket1.withdrawals

          // bucket2
          newRow.bucket2.stockAppreciation +=
            monthRows[row.month - i].bucket2.stockAppreciation
          newRow.bucket2.dividends += monthRows[row.month - i].bucket2.dividends
          newRow.bucket2.contributions +=
            monthRows[row.month - i].bucket2.contributions
          newRow.bucket2.withdrawals +=
            monthRows[row.month - i].bucket2.withdrawals

          // bucket3
          newRow.bucket3.stockAppreciation +=
            monthRows[row.month - i].bucket3.stockAppreciation
          newRow.bucket3.dividends += monthRows[row.month - i].bucket3.dividends
          newRow.bucket3.contributions +=
            monthRows[row.month - i].bucket3.contributions
          newRow.bucket3.withdrawals +=
            monthRows[row.month - i].bucket3.withdrawals
        }
      }
      newRow.calculate()
      acc.push(newRow)
    }
    return acc
  }, [] as RowItem[])

  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"))

  return (
    <Box>
      {/* <pre>{JSON.stringify({ monthRows }, null, 2)}</pre> */}
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Mo Yr</TableCell>
            <TableCell>Ages</TableCell>
            {isMdUp ? (
              <>
                <TableCell>Starting</TableCell>
                <TableCell>Stock Appreciation</TableCell>
                <TableCell>Dividends</TableCell>
                <TableCell>Contributions</TableCell>
                <TableCell>Withdrawals</TableCell>
              </>
            ) : (
              <>
                <TableCell>+ / -</TableCell>
              </>
            )}

            <TableCell>Ending</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {yearRows.map((row) => {
            const month = dayjs().add(row.month, "month")
            return (
              <TableRow key={row.month}>
                <TableCell>{month.format("MMM YYYY")}</TableCell>
                <TableCell>
                  {month.diff(state.person1Birthday, "year")}&nbsp;/&nbsp;
                  {month.diff(state.person2Birthday, "year")}
                </TableCell>
                {isMdUp ? (
                  <>
                    <TableCell>{formatPennies(row.startingValue)}</TableCell>
                    <TableCell>
                      {formatPennies(row.stockAppreciation)}
                    </TableCell>
                    <TableCell>{formatPennies(row.dividends)}</TableCell>
                    <TableCell
                      sx={{
                        color: (theme) =>
                          row.contributions > 0
                            ? theme.palette.success.main
                            : "inherit",
                      }}
                    >
                      {formatPennies(row.contributions)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) =>
                          row.withdrawals > 0
                            ? theme.palette.error.main
                            : "inherit",
                      }}
                    >
                      {formatPennies(row.withdrawals)}
                    </TableCell>
                  </>
                ) : (
                  <TableCell>
                    <Typography
                      sx={{
                        color: (theme) =>
                          row.contributions - row.withdrawals > 0
                            ? theme.palette.success.main
                            : row.contributions - row.withdrawals < 0
                            ? theme.palette.error.main
                            : "inherit",
                      }}
                    >
                      {formatPennies(row.contributions - row.withdrawals)}
                    </Typography>
                  </TableCell>
                )}

                <TableCell>
                  <Tooltip
                    arrow
                    title={
                      <Stack>
                        <TipLineItem label="Roth & HSA">
                          {formatPennies(row.bucket1.endingValue)}
                        </TipLineItem>
                        <TipLineItem label="Traditional">
                          {formatPennies(row.bucket2.endingValue)}
                        </TipLineItem>
                        <TipLineItem label="After Tax">
                          {formatPennies(row.bucket3.endingValue)}
                        </TipLineItem>
                      </Stack>
                    }
                  >
                    <Box>{formatPennies(row.endingValue)}</Box>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <FinancialIndependenceSummary data={financialIndependenceMonth} />
    </Box>
  )
}

function TipLineItem({ label, children }: LineItemProps) {
  return (
    <Stack direction="row" justifyContent={"space-between"} spacing={2}>
      <Typography>{label}</Typography>
      <Typography>{children}</Typography>
    </Stack>
  )
}

interface FinancialIndependenceSummaryProps {
  data: RowItem
}

function FinancialIndependenceSummary({
  data,
}: FinancialIndependenceSummaryProps) {
  const { state } = useGlobalState()

  const date = dayjs().add(data.month, "month")
  // in x years and y months
  const years = Math.floor(data.month / 12)
  const months = data.month % 12
  const formattedYears = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : ""
  const formattedMonths =
    months > 0 ? `${months} month${months > 1 ? "s" : ""}` : ""

  const person1Age = date.diff(state.person1Birthday, "year")
  const person2Age = date.diff(state.person2Birthday, "year")

  const currentPortfolioValue =
    toPennies(state.bucket1Value) +
    toPennies(state.bucket2Value) +
    toPennies(state.bucket3Value)

  const progress = (currentPortfolioValue / data.endingValue) * 100

  const [open, setOpen] = useState(false)

  return (
    <>
      <Box sx={{ height: 400 }}>&nbsp;</Box>
      <AppBar position="fixed" sx={{ top: "auto", bottom: 0 }}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"start"}
        >
          <Container maxWidth="sm">
            <Stack padding={2} spacing={1}>
              <Stack direction="row" justifyContent={"space-between"}>
                <Stack
                  spacing={{ sm: 1, xs: 0 }}
                  direction={{ xs: "column", sm: "row" }}
                >
                  <BlueTitle>{date.format("MMMM YYYY")}</BlueTitle>
                  <BlueTitle>
                    ({person1Age} / {person2Age})
                  </BlueTitle>
                </Stack>

                <Stack
                  spacing={{ sm: 1, xs: 0 }}
                  direction={{ xs: "column", sm: "row" }}
                >
                  <BlueTitle>{formattedYears}</BlueTitle>
                  <BlueTitle>{formattedMonths}</BlueTitle>
                </Stack>
              </Stack>
              <Collapse in={open}>
                <Stack spacing={1}>
                  <LineItem label="Roth & HSA">
                    {formatPennies(data.bucket1.endingValue)}
                  </LineItem>
                  <LineItem label="Traditional">
                    {formatPennies(data.bucket2.endingValue)}
                  </LineItem>
                  <LineItem label="After Tax">
                    {formatPennies(data.bucket3.endingValue)}
                  </LineItem>
                  <Divider />
                  <LineItem label="Portfolio Value" bold>
                    {formatPennies(data.endingValue)}
                  </LineItem>
                  <Box>
                    <Typography
                      align="center"
                      sx={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: (theme) => theme.palette.primary.main,
                      }}
                    >
                      {progress.toFixed(0)}% Saved
                    </Typography>
                  </Box>
                  <Box width={"100%"}>
                    <LinearProgress
                      sx={{ height: 24, borderRadius: 8 }}
                      variant="determinate"
                      value={progress}
                    />
                  </Box>
                </Stack>
              </Collapse>
            </Stack>
          </Container>
          <Box paddingTop={2} paddingRight={2}>
            <IconButton onClick={() => setOpen(!open)}>
              {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
        </Stack>
      </AppBar>
    </>
  )
}

function BlueTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 24,
        fontWeight: 700,
        color: (theme) => theme.palette.primary.main,
      }}
    >
      {children}
    </Typography>
  )
}

interface LineItemProps {
  label: React.ReactNode
  children: React.ReactNode
  bold?: boolean
}

function LineItem({ label, children, bold }: LineItemProps) {
  const fontWeight = bold ? 700 : undefined

  return (
    <Stack direction="row" justifyContent={"space-between"}>
      <Typography fontWeight={fontWeight}>{label}</Typography>
      <Typography fontWeight={fontWeight}>{children}</Typography>
    </Stack>
  )
}

//-----------------------------------
// new code goes below this line during refactor
class BucketRowItem {
  startingValue: number = 0
  stockAppreciation: number = 0
  dividends: number = 0
  contributions: number = 0
  withdrawals: number = 0
  endingValue: number = 0

  constructor() {}

  calculate() {
    this.endingValue =
      this.startingValue +
      this.stockAppreciation +
      this.dividends +
      this.contributions -
      this.withdrawals
  }
}

class RowItem extends BucketRowItem {
  month: number
  bucket1: BucketRowItem
  bucket2: BucketRowItem
  bucket3: BucketRowItem
  reachedGoal: boolean = false
  constructor(month: number) {
    super()
    this.month = month
    this.bucket1 = new BucketRowItem()
    this.bucket2 = new BucketRowItem()
    this.bucket3 = new BucketRowItem()
  }

  calculate() {
    this.bucket1.calculate()
    this.bucket2.calculate()
    this.bucket3.calculate()
    this.startingValue =
      this.bucket1.startingValue +
      this.bucket2.startingValue +
      this.bucket3.startingValue
    this.stockAppreciation =
      this.bucket1.stockAppreciation +
      this.bucket2.stockAppreciation +
      this.bucket3.stockAppreciation
    this.dividends =
      this.bucket1.dividends + this.bucket2.dividends + this.bucket3.dividends
    this.contributions =
      this.bucket1.contributions +
      this.bucket2.contributions +
      this.bucket3.contributions
    this.withdrawals =
      this.bucket1.withdrawals +
      this.bucket2.withdrawals +
      this.bucket3.withdrawals
    this.endingValue =
      this.bucket1.endingValue +
      this.bucket2.endingValue +
      this.bucket3.endingValue
  }
}

/**
 * Calculate the total months until both people reach 100 years old.
 */
function useTotalMonthsUntilBothReach100() {
  const { state } = useGlobalState()
  const monthsUntilPersonReachesAge = useMonthsUntilPersonReachesAge()

  return useMemo(() => {
    const whenPerson1Reaches100YearsOld = monthsUntilPersonReachesAge(
      "person1",
      100
    )
    const whenPerson2Reaches100YearsOld = monthsUntilPersonReachesAge(
      "person2",
      100
    )
    return Math.max(
      whenPerson1Reaches100YearsOld,
      whenPerson2Reaches100YearsOld
    )
  }, [monthsUntilPersonReachesAge])
}

function useGetStockAppreciation() {
  const { state } = useGlobalState()
  return useCallback(
    (value: number) => {
      return Math.floor((value * toDecimal(state.stockAppreciation)) / 12)
    },
    [state.stockAppreciation]
  )
}

function useGetDividends() {
  const { state } = useGlobalState()
  return useCallback(
    (value: number, month: number) => {
      const isDividendMonth = dayjs().add(month, "month").month() % 3 === 0
      return isDividendMonth
        ? (value * toDecimal(state.stockDividendRate)) / 12
        : 0
    },
    [state.stockDividendRate]
  )
}

type Person = "person1" | "person2"

// get the base social security assuming we start as early possible with given month
function useBaseSocialSecurity() {
  const { state } = useGlobalState()
  return useCallback(
    (person: Person, month: number) => {
      const index = Math.min(
        8,
        Math.max(
          0,
          Math.floor(
            dayjs()
              .add(month, "month")
              .diff(
                dayjs(
                  person === "person1"
                    ? state.person1Birthday
                    : state.person2Birthday
                ).add(62, "year"),
                "months"
              ) / 12
          )
        )
      )
      return toPennies(
        person === "person1"
          ? state.person1SocialSecurity[index]
          : state.person2SocialSecurity[index]
      )
    },
    [
      state.person1Birthday,
      state.person1SocialSecurity,
      state.person2Birthday,
      state.person2SocialSecurity,
    ]
  )
}

// find social security gap, the missed income util reaching 62
function useCalculateSocialSecurityGap() {
  const { state } = useGlobalState()
  const adjustForInflation = useAdjustForInflation()

  return useCallback(
    (person: Person, month: number) => {
      let socialSecurityGap = 0
      const age62Date = dayjs(
        person === "person1" ? state.person1Birthday : state.person2Birthday
      ).add(62, "year")
      let date = dayjs().add(month, "month")
      while (date.isBefore(age62Date)) {
        socialSecurityGap =
          socialSecurityGap +
          adjustForInflation(
            toPennies(
              person === "person1"
                ? state.person1SocialSecurity[0]
                : state.person2SocialSecurity[0]
            ),
            dayjs().diff(date, "month")
          )
        date = date.add(1, "month")
      }
      return socialSecurityGap
    },
    [
      adjustForInflation,
      state.person1Birthday,
      state.person1SocialSecurity,
      state.person2Birthday,
      state.person2SocialSecurity,
    ]
  )
}

// find health insurance gaps, the private insurance cost until 65
function useCalculateHealthInsuranceGap() {
  const {
    state: { person1Birthday, person2Birthday, preMedicareInsuance },
  } = useGlobalState()
  const adjustForInflation = useAdjustForInflation()
  return useCallback(
    (person: Person, month: number) => {
      let healthInsuranceGap = 0
      const age65Date = dayjs(
        person === "person1" ? person1Birthday : person2Birthday
      ).add(65, "year")
      let date = dayjs().add(month, "month")
      while (date.isBefore(age65Date)) {
        healthInsuranceGap =
          healthInsuranceGap +
          adjustForInflation(
            toPennies(preMedicareInsuance),
            dayjs().diff(date, "month")
          )
        date = date.add(1, "month")
      }
      return healthInsuranceGap
    },
    [adjustForInflation, person1Birthday, person2Birthday, preMedicareInsuance]
  )
}

function useAdjustForInflation() {
  const { state } = useGlobalState()
  const inflationRate = toDecimal(state.inflationRate)
  return useCallback(
    (value: number, months: number) => {
      return value * Math.pow(1 + inflationRate, months / 12)
    },
    [inflationRate]
  )
}

function useMonthsUntilPersonReachesAge() {
  const {
    state: { person1Birthday, person2Birthday },
  } = useGlobalState()
  return useCallback(
    (person: Person, age: number) => {
      const whenPersonReachesAge = dayjs(
        person === "person1" ? person1Birthday : person2Birthday
      ).add(age, "year")
      const totalMonths = whenPersonReachesAge.diff(dayjs(), "month")
      return totalMonths
    },
    [person1Birthday, person2Birthday]
  )
}

function useGetTaxesDue() {
  const adjustForInflation = useAdjustForInflation()

  return useCallback(
    (taxableIncome: number, socialSecurityIncome: number, months: number) => {
      // standard deductions for 2024
      const federalStandardDeduction = adjustForInflation(14_600, months)
      const stateStandardDeduction = 2_745

      let federalTaxableIncome =
        taxableIncome + socialSecurityIncome * 0.85 - federalStandardDeduction
      let stateTaxableIncome = taxableIncome - stateStandardDeduction

      // Federal as of 2024
      // 10% = $0 to $11,600
      // 12% = $11,601 to $47,150
      // 22% = $47,151 to $100,525
      // 24% = $100,526 to $191,950
      // 32% = $191,951 to $243,725
      // 35% = $243,726 to $609,350
      // 37% = $609,351
      const taxBrackets = [
        { rate: 0.1, max: 11600 },
        { rate: 0.12, max: 47150 },
        { rate: 0.22, max: 100525 },
        { rate: 0.24, max: 191950 },
        { rate: 0.32, max: 243725 },
        { rate: 0.35, max: 609350 },
        { rate: 0.37, max: 999999999 },
      ]
      let tax = 0
      for (const bracket of taxBrackets) {
        if (federalTaxableIncome <= 0) {
          break
        }
        const amount = Math.min(
          federalTaxableIncome,
          adjustForInflation(bracket.max * 100, months)
        )
        tax += amount * bracket.rate
        federalTaxableIncome -= amount
      }

      // Oregon State as of 2024
      // Oregon doesn't tax social security
      // Taxable Income (Single Filers)
      // $0 to $3,750           4.75%
      // $3,750 to $9,450	    6.75%
      // $9,450 to $125,000	    8.75%
      // $125,000 or more       9.90%
      const stateTaxBrackets = [
        { rate: 0.0475, max: 3750 },
        { rate: 0.0675, max: 9450 },
        { rate: 0.0875, max: 125000 },
        { rate: 0.099, max: 999999999 },
      ]
      let stateTax = 0
      for (const bracket of stateTaxBrackets) {
        if (stateTaxableIncome <= 0) {
          break
        }
        const amount = Math.min(
          stateTaxableIncome,
          adjustForInflation(bracket.max * 100, months)
        )
        stateTax += amount * bracket.rate
        stateTaxableIncome -= amount
      }

      return tax
    },
    [adjustForInflation]
  )
}
