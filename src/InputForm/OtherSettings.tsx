import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { all, create } from "mathjs"
import { useGlobalState } from "../GlobalStateProvider"
import { DecimalInput } from "./DecimalInput"
import { MoneyInput } from "./MoneyInput"

const mathjs = create(all, {})

export function OtherSettings() {
  const { formState, setFormState } = useGlobalState()

  return (
    <>
      <Box padding={2}>
        <Typography variant="h2">Other Settings</Typography>
      </Box>
      <Table sx={{ marginBottom: 3 }}>
        <TableBody>
          <TableRow>
            <TableCell>Stock Appreciation</TableCell>
            <TableCell>
              <DecimalInput
                value={formState.stockAppreciation}
                onChange={(stockAppreciation) => {
                  setFormState({
                    ...formState,
                    stockAppreciation,
                  })
                }}
                decimals={4}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Dividend Yield</TableCell>
            <TableCell>
              <DecimalInput
                value={formState.stockDividendRate}
                onChange={(stockDividendRate) => {
                  setFormState({
                    ...formState,
                    stockDividendRate,
                  })
                }}
                decimals={5}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Inflation Rate</TableCell>
            <TableCell>
              <DecimalInput
                value={formState.inflationRate}
                onChange={(inflationRate) => {
                  setFormState({
                    ...formState,
                    inflationRate,
                  })
                }}
                decimals={5}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pre Medicare Monthly Insurance</TableCell>
            <TableCell>
              <MoneyInput
                value={formState.preMedicareInsuance}
                onChange={(preMedicareInsuance) => {
                  setFormState({
                    ...formState,
                    preMedicareInsuance,
                  })
                }}
                decimals={0}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Safe Withdrawal Rate</TableCell>
            <TableCell>
              <DecimalInput
                value={formState.withdrawalRate}
                onChange={(withdrawalRate) => {
                  setFormState({
                    ...formState,
                    withdrawalRate,
                  })
                }}
                decimals={5}
                percentage
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
