import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import {
  AppBar,
  Box,
  Collapse,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import dayjs from "dayjs"
import { all, create } from "mathjs"
import moment from "moment"
import { useMemo, useState } from "react"
import { InputState } from "../InputState"
import { toDecimal, toMoney } from "../util"
import { ProgressBar } from "./ProgressBar"
import { useBuildSchedule } from "./useBuildSchedule"
import { useCalculateCurrentProgress } from "./useCalculateCurrentProgress"
import { YourNumberType } from "./useFindMyYear"

const mathjs = create(all, {})

export interface YourNumberProps {
  numbers: YourNumberType
  state: InputState
}

export function YourNumber({ numbers, state }: YourNumberProps) {
  const { data: schedule } = useBuildSchedule({ numbers, state })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [expanded, setExpanded] = useState(!isMobile)

  // get duration in two units
  const fromNowString = useMemo(() => {
    const when = moment().add(numbers.month, "months")
    const duration = moment.duration(when.diff(moment()))
    const years = Math.floor(duration.asYears())
    const months = Math.floor(duration.asMonths() - years * 12)
    const monthsString = months === 1 ? `${months} month` : `${months} months`
    const yearsString =
      years === 0 ? null : years === 1 ? `${years} year` : `${years} years`
    return `in ${[yearsString, monthsString]
      .filter((x) => x !== null)
      .join(" and ")}`
  }, [numbers.month])

  const progress = useCalculateCurrentProgress(state)

  const when = dayjs().add(numbers.month, "months")

  return (
    <>
      <AppBar
        variant="outlined"
        position="fixed"
        color="primary"
        sx={{ top: "auto", bottom: 0 }}
      >
        <Box
          paddingTop={1}
          paddingBottom={1}
          sx={{ backgroundColor: theme.palette.primary.dark }}
        >
          <Container>
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography component="div" variant="h1">
                  {when.format("MMMM YYYY")} is your Financial Independence
                  Date!
                </Typography>
                <Box>
                  <IconButton onClick={() => setExpanded(!expanded)}>
                    {expanded ? (
                      <KeyboardArrowDownIcon />
                    ) : (
                      <KeyboardArrowRightIcon />
                    )}
                  </IconButton>
                </Box>
              </Stack>
              <Collapse in={expanded} timeout={200}>
                <Stack spacing={3}>
                  <Typography variant="h2">
                    That is {fromNowString}, and you will be{" "}
                    {numbers.person1Age} and {numbers.person2Age} years old.
                  </Typography>
                  <Typography variant="h2">
                    Your portfolio may be worth{" "}
                    {toMoney(numbers.cumulativeValue, 0)}.
                  </Typography>
                  <Typography variant="h2">
                    Assumes an effective tax rate of{" "}
                    {mathjs.multiply(toDecimal(state.effectiveTaxRate), 100)}%.
                  </Typography>
                  <Typography variant="h2">
                    Safe withdrawal rate starting at{" "}
                    {mathjs.round(
                      mathjs.multiply(toDecimal(state.withdrawalRate), 100),
                      2
                    )}
                    % and rising annually with inflation rate of{" "}
                    {mathjs.multiply(toDecimal(state.inflationRate), 100)}%.
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    maxWidth={400}
                  >
                    <Stack>
                      <Typography variant="h2">Roth & HSA</Typography>
                      <Typography variant="h2">
                        {toMoney(numbers.bucket1CumulativeValue, 0)}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="h2">Traditional</Typography>
                      <Typography variant="h2">
                        {toMoney(numbers.bucket2CumulativeValue, 0)}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="h2">After Tax</Typography>
                      <Typography variant="h2">
                        {toMoney(numbers.bucket3CumulativeValue, 0)}
                      </Typography>
                    </Stack>
                  </Stack>
                  <ProgressBar progress={progress} />
                </Stack>
              </Collapse>
            </Stack>
          </Container>
        </Box>
      </AppBar>

      <br />
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Ages</TableCell>
            <TableCell>+/-</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Dividends
            </TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              SS Income
            </TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Health Care
            </TableCell>
            <TableCell>Total Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(schedule?.all || []).map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                {moment().add(row.month, "months").format("M/YYYY")}
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
              <TableCell
                sx={{
                  color:
                    row.contribution > 0
                      ? "green"
                      : row.contribution < 0
                      ? "red"
                      : "inherit",
                }}
              >
                {toMoney(row.contribution, 0)}
              </TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                {toMoney(row.dividendAmount, 0)}
              </TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                {row.ssIncome !== undefined ? toMoney(row.ssIncome, 0) : null}
              </TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                {row.healthInsuranceGap !== undefined
                  ? toMoney(row.healthInsuranceGap, 0)
                  : null}
              </TableCell>
              <TableCell>{toMoney(row.cumulativeValue, 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
      <br />
      <br />
      <Box sx={{ height: 400 }}>&nbsp;</Box>
      {/* <pre>{JSON.stringify({ schedule }, null, 2)}</pre> */}
    </>
  )
}
