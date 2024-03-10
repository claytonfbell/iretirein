import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { all, create } from "mathjs"
import { Dispatch, SetStateAction } from "react"
import { InputState } from "../InputState"
import { DecimalInput } from "./DecimalInput"
import { MoneyInput } from "./MoneyInput"

const mathjs = create(all, {})

interface Props {
  state: InputState
  setState: Dispatch<SetStateAction<InputState>>
}

export function OtherSettings({ state, setState }: Props) {
  return (
    <>
      <Box padding={2}>
        <Typography variant="h2">Other Settings</Typography>
      </Box>
      <Table sx={{ marginBottom: 3 }}>
        <TableBody>
          <TableRow>
            <TableCell>Current Price</TableCell>
            <TableCell>
              <MoneyInput
                value={state.stockPrice}
                onChange={(stockPrice) => {
                  setState({
                    ...state,
                    stockPrice,
                  })
                }}
                decimals={2}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Appreciation</TableCell>
            <TableCell>
              <DecimalInput
                value={state.stockAppreciation}
                onChange={(stockAppreciation) => {
                  setState({
                    ...state,
                    stockAppreciation,
                  })
                }}
                decimals={4}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Dividend</TableCell>
            <TableCell>
              <DecimalInput
                value={state.stockDividendRate}
                onChange={(stockDividendRate) => {
                  setState({
                    ...state,
                    stockDividendRate,
                  })
                }}
                decimals={5}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Inflation</TableCell>
            <TableCell>
              <DecimalInput
                value={state.inflationRate}
                onChange={(inflationRate) => {
                  setState({
                    ...state,
                    inflationRate,
                  })
                }}
                decimals={5}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tax Rate</TableCell>
            <TableCell>
              <DecimalInput
                value={state.effectiveTaxRate}
                onChange={(effectiveTaxRate) => {
                  setState({
                    ...state,
                    effectiveTaxRate,
                  })
                }}
                decimals={5}
                percentage
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Withdrawal Rate</TableCell>
            <TableCell>
              <DecimalInput
                value={state.withdrawalRate}
                onChange={(withdrawalRate) => {
                  setState({
                    ...state,
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
