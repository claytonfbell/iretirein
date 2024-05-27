import {
  Checkbox,
  FormControlLabel,
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
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies, toPennies } from "../util"
import { MoneyInput } from "./MoneyInput"

export function Savings() {
  const { formState, setFormState } = useGlobalState()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const width = isMobile ? 150 : 250

  return (
    <Stack>
      <Typography variant="h1">Savings</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Current Value</TableCell>
            <TableCell align={isMobile ? "right" : undefined}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!formState.coastFire}
                    onChange={() =>
                      setFormState((prev) => ({
                        ...prev,
                        coastFire: !prev.coastFire,
                      }))
                    }
                  />
                }
                label={
                  <Typography fontSize="inherit">
                    Monthly Contributions
                  </Typography>
                }
              />
            </TableCell>
            {!isMobile ? <TableCell align="right">Yearly</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <MoneyInput
                label={"Roth & HSA"}
                width={width}
                value={formState.bucket1Value}
                onChange={(bucket1Value) => {
                  setFormState({
                    ...formState,
                    bucket1Value,
                  })
                }}
              />
            </TableCell>

            <TableCell align={isMobile ? "right" : undefined}>
              <MoneyInput
                label={"Roth & HSA"}
                width={width}
                value={formState.bucket1Contribution}
                disabled={formState.coastFire}
                onChange={(bucket1Contribution) => {
                  setFormState({
                    ...formState,
                    bucket1Contribution,
                  })
                }}
              />
            </TableCell>

            {!isMobile ? (
              <TableCell align="right">
                <Typography align="right">
                  {formatPennies(
                    formState.coastFire === true
                      ? 0
                      : toPennies(formState.bucket1Contribution) * 12
                  )}
                </Typography>
              </TableCell>
            ) : null}
          </TableRow>
          <TableRow>
            <TableCell>
              <MoneyInput
                label={"Traditional"}
                width={width}
                value={formState.bucket2Value}
                onChange={(bucket2Value) => {
                  setFormState({
                    ...formState,
                    bucket2Value,
                  })
                }}
              />
            </TableCell>
            <TableCell align={isMobile ? "right" : undefined}>
              <MoneyInput
                label={"Traditional"}
                width={width}
                value={formState.bucket2Contribution}
                disabled={formState.coastFire}
                onChange={(bucket2Contribution) => {
                  setFormState({
                    ...formState,
                    bucket2Contribution,
                  })
                }}
              />
            </TableCell>

            {!isMobile ? (
              <TableCell align="right">
                <Typography align="right">
                  {formatPennies(
                    formState.coastFire === true
                      ? 0
                      : toPennies(formState.bucket2Contribution) * 12
                  )}
                </Typography>
              </TableCell>
            ) : null}
          </TableRow>
          <TableRow>
            <TableCell>
              <MoneyInput
                label={"After Tax"}
                width={width}
                value={formState.bucket3Value}
                onChange={(bucket3Value) => {
                  setFormState({
                    ...formState,
                    bucket3Value,
                  })
                }}
              />
            </TableCell>
            <TableCell align={isMobile ? "right" : undefined}>
              <MoneyInput
                label={"After Tax"}
                width={width}
                value={formState.bucket3Contribution}
                disabled={formState.coastFire}
                onChange={(bucket3Contribution) => {
                  setFormState({
                    ...formState,
                    bucket3Contribution,
                  })
                }}
              />
            </TableCell>

            {!isMobile ? (
              <TableCell align="right">
                <Typography align="right">
                  {formatPennies(
                    formState.coastFire === true
                      ? 0
                      : toPennies(formState.bucket3Contribution) * 12
                  )}
                </Typography>
              </TableCell>
            ) : null}
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography width={width} align="right" paddingRight={5}>
                {formatPennies(
                  toPennies(formState.bucket1Value) +
                    toPennies(formState.bucket2Value) +
                    toPennies(formState.bucket3Value)
                )}
              </Typography>
            </TableCell>
            <TableCell align={isMobile ? "right" : undefined}>
              <Typography width={width} align="right" paddingRight={5}>
                {formatPennies(
                  formState.coastFire === true
                    ? 0
                    : toPennies(formState.bucket1Contribution) +
                        toPennies(formState.bucket2Contribution) +
                        toPennies(formState.bucket3Contribution)
                )}
              </Typography>
            </TableCell>

            {!isMobile ? (
              <TableCell align="right">
                <Typography align="right">
                  {formatPennies(
                    formState.coastFire === true
                      ? 0
                      : toPennies(formState.bucket1Contribution) * 12 +
                          toPennies(formState.bucket2Contribution) * 12 +
                          toPennies(formState.bucket3Contribution) * 12
                  )}
                </Typography>
              </TableCell>
            ) : null}
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  )
}
