import {
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { all, create } from "mathjs"
import { useGlobalState } from "../GlobalStateProvider"
import { toDecimal, toMoney } from "../util"
import { MoneyInput } from "./MoneyInput"

const mathjs = create(all, {})

export function AssetBuckets() {
  const { formState, setFormState } = useGlobalState()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const width = isMobile ? 150 : 250

  return (
    <>
      <Box padding={2}>
        <Typography variant="h2">Your Retirement Buckets</Typography>
      </Box>
      <Table sx={{ marginBottom: 3, width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography>Current Value</Typography>
            </TableCell>
            <TableCell>
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

            <TableCell>
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
            <TableCell>
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
            <TableCell>
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
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography width={width} align="right" paddingRight={5}>
                {toMoney(
                  mathjs
                    .chain(toDecimal(formState.bucket1Value))
                    .add(toDecimal(formState.bucket2Value))
                    .add(toDecimal(formState.bucket3Value))
                    .done()
                )}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography width={width} align="right" paddingRight={5}>
                {toMoney(
                  formState.coastFire === true
                    ? 0
                    : mathjs
                        .chain(toDecimal(formState.bucket1Contribution))
                        .add(toDecimal(formState.bucket2Contribution))
                        .add(toDecimal(formState.bucket3Contribution))
                        .done()
                )}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
