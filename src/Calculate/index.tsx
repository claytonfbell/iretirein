import {
  Box,
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
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies } from "../util"
import { FinancialIndependenceSummary } from "./FinancialIndependenceSummary"
import { useCalculate } from "./useCalculate"

const DEBUG = false

export function Calcuate() {
  const { state } = useGlobalState()
  const { yearRows, financialIndependenceMonth, monthReachOneMillion } =
    useCalculate()
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"))

  return (
    <Stack spacing={1}>
      <Typography variant="h1">Projection</Typography>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            <TableCell>Ages</TableCell>
            {isMdUp ? (
              <>
                <TableCell align="right">Starting</TableCell>
                <TableCell align="right">Stock Appreciation</TableCell>
                <TableCell align="right">Dividends</TableCell>
                <TableCell align="right">Contributions</TableCell>
                <TableCell align="right">Withdrawals</TableCell>
              </>
            ) : (
              <>
                <TableCell align="right">+ / -</TableCell>
              </>
            )}

            <TableCell align="right">Ending</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {yearRows.map((row) => {
            const month = dayjs().add(row.month, "month")

            // row.contributions - row.withdrawals but not negative
            const positiveChangeValue =
              row.contributions - row.withdrawals > 0
                ? row.contributions - row.withdrawals
                : row.withdrawals - row.contributions

            return (
              <TableRow key={row.month}>
                <TableCell>{month.format("YYYY")}</TableCell>
                <TableCell>
                  {month.diff(state.person1Birthday, "year")}&nbsp;/&nbsp;
                  {month.diff(state.person2Birthday, "year")}
                </TableCell>
                {isMdUp ? (
                  <>
                    <TableCell align="right">
                      {formatPennies(row.startingValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatPennies(row.stockAppreciation)}
                    </TableCell>
                    <TableCell align="right">
                      {formatPennies(row.dividends)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: (theme) =>
                          row.contributions > 0
                            ? theme.palette.success.main
                            : "inherit",
                      }}
                      align="right"
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
                      align="right"
                    >
                      {formatPennies(row.withdrawals)}
                    </TableCell>
                  </>
                ) : (
                  <TableCell align="right">
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
                      {formatPennies(positiveChangeValue)}
                    </Typography>
                  </TableCell>
                )}

                <TableCell align="right">
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
      <FinancialIndependenceSummary
        data={financialIndependenceMonth}
        monthReachOneMillion={monthReachOneMillion}
      />
    </Stack>
  )
}

interface TipLineItemProps {
  label: string
  children: React.ReactNode
}

function TipLineItem({ label, children }: TipLineItemProps) {
  return (
    <Stack direction="row" justifyContent={"space-between"} spacing={2}>
      <Typography>{label}</Typography>
      <Typography>{children}</Typography>
    </Stack>
  )
}
