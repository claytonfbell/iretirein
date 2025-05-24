import dayjs from "dayjs"
import { useMemo } from "react"
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies, toDecimal, toPennies } from "../util"
import { RowItem } from "./RowItem"
import {
  useAdjustForInflation,
  useBaseSocialSecurity,
  useCalculateHealthInsuranceGap,
  useCalculateSocialSecurityGap,
  useGetDividends,
  useGetStockAppreciation,
  useGetTaxesDue,
  useMonthsUntilPersonReachesAge,
  useTotalMonthsUntilBothReach100,
} from "./hooks"

const DEBUG = false

export function useCalculate() {
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

  const {
    monthRows,
    financialIndependenceMonth,
    monthReachOneMillion,
    totalHealthInsuranceGap,
    totalSocialSecurityGap,
  } = useMemo(() => {
    // rough goal is to have 25x required income + 1M
    const roughPortfolioGoalStart =
      (toPennies(state.requiredIncome) -
        toPennies(
          state.person1SocialSecurity[
            parseInt(state.person1SocialSecurityAge) - 62
          ]
        ) -
        toPennies(
          state.person2SocialSecurity[
            parseInt(state.person2SocialSecurityAge) - 62
          ]
        )) /
        toDecimal(state.withdrawalRate) -
      toPennies("1000000")
    const roughPortfolioGoalEnd =
      roughPortfolioGoalStart + toPennies("10000000")

    const firstMonth: RowItem = new RowItem(0)
    firstMonth.bucket1.startingValue = toPennies(state.bucket1Value)
    firstMonth.bucket2.startingValue = toPennies(state.bucket2Value)
    firstMonth.bucket3.startingValue = toPennies(state.bucket3Value)
    firstMonth.calculate()

    let monthReachOneMillion: RowItem | null = null

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

      // check if this is the month where we reach 1M
      if (
        newMonth.endingValue >= toPennies("1000000") &&
        monthReachOneMillion === null
      ) {
        monthReachOneMillion = newMonth
      }

      monthRows.push(newMonth)
    }

    // second pass will find the month where reach financial independence
    let totalSocialSecurityGap = 0
    let totalHealthInsuranceGap = 0
    monthRows.forEach((row, index) => {
      const previousRow = index > 0 ? monthRows[index - 1] : null
      if (previousRow?.reachedGoal !== true) {
        const person1BaseSocialSecurity = baseSocialSecurity(
          "person1",
          1 +
            monthsUntilPersonReachesAge(
              "person1",
              parseInt(state.person1SocialSecurityAge)
            )
        )
        const person2BaseSocialSecurity = baseSocialSecurity(
          "person2",
          1 +
            monthsUntilPersonReachesAge(
              "person1",
              parseInt(state.person2SocialSecurityAge)
            )
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

        // social security gaps
        const person1SocialSecurityGap = calculateSocialSecurityGap(
          "person1",
          row.month
        )
        const person2SocialSecurityGap = calculateSocialSecurityGap(
          "person2",
          row.month
        )
        totalSocialSecurityGap =
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
        totalHealthInsuranceGap =
          person1HealthInsuranceGap + person2HealthInsuranceGap

        const basePortfolioNeeded =
          (incomeNeededFromPortfolio + person1Taxes + person2Taxes) /
          toDecimal(state.withdrawalRate)

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
      } else {
        row.reachedGoal = true
      }
    })

    // third pass, now we can calculate decumulation
    // first remove the extra rows that reached goal
    monthRows = monthRows.filter((row) => !row.reachedGoal)
    const financialIndependenceMonth = monthRows[monthRows.length - 1]

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
      const person1SocialSecurity = adjustForInflation(
        baseSocialSecurity("person1", month),
        month
      )
      const person2SocialSecurity = adjustForInflation(
        baseSocialSecurity("person2", month),
        month
      )

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

    return {
      monthRows,
      financialIndependenceMonth,
      monthReachOneMillion,
      totalHealthInsuranceGap,
      totalSocialSecurityGap,
    }
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

  return {
    monthRows,
    yearRows,
    financialIndependenceMonth,
    monthReachOneMillion,
    totalHealthInsuranceGap,
    totalSocialSecurityGap,
  }
}
