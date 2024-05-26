import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { useGlobalState } from "../GlobalStateProvider"
import { MoneyInput } from "./MoneyInput"

export function IncomeNeeded() {
  const { formState, setFormState } = useGlobalState()
  return (
    <Stack spacing={1}>
      <Typography variant="h2" marginBottom={2}>
        Take Home Pay
      </Typography>
      <Typography>
        This is the amount of money you take home after taxes and deductions
        that you wish to continue spending during retirement to maintain your
        current lifestyle. You can exclude money that you additionaly put into
        savings since you will no longer do that during retirement.
      </Typography>
      <Table sx={{ marginBottom: 3 }}>
        <TableBody>
          <TableRow>
            <TableCell>
              <MoneyInput
                value={formState.requiredIncome}
                onChange={(takeHomePay) => {
                  setFormState({
                    ...formState,
                    requiredIncome: takeHomePay,
                  })
                }}
                decimals={0}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  )
}
