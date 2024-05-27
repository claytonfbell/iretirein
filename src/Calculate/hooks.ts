import dayjs from "dayjs"
import { useCallback, useMemo } from "react"
import { useGlobalState } from "../GlobalStateProvider"
import { toDecimal, toPennies } from "../util"

/**
 * Calculate the total months until both people reach 100 years old.
 */
export function useTotalMonthsUntilBothReach100() {
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

export function useGetStockAppreciation() {
  const { state } = useGlobalState()
  return useCallback(
    (value: number) => {
      return Math.floor((value * toDecimal(state.stockAppreciation)) / 12)
    },
    [state.stockAppreciation]
  )
}

export function useGetDividends() {
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
export function useBaseSocialSecurity() {
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
export function useCalculateSocialSecurityGap() {
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
export function useCalculateHealthInsuranceGap() {
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

export function useAdjustForInflation() {
  const { state } = useGlobalState()
  const inflationRate = toDecimal(state.inflationRate)
  return useCallback(
    (value: number, months: number) => {
      return value * Math.pow(1 + inflationRate, months / 12)
    },
    [inflationRate]
  )
}

export function useMonthsUntilPersonReachesAge() {
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

export function useGetTaxesDue() {
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
