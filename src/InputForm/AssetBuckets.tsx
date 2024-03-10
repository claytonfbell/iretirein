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
import { Dispatch, SetStateAction } from "react"
import { InputState } from "../InputState"
import { toDecimal, toMoney } from "../util"
import { MoneyInput } from "./MoneyInput"

const mathjs = create(all, {})

interface Props {
  state: InputState
  setState: Dispatch<SetStateAction<InputState>>
}

export function AssetBuckets({ state, setState }: Props) {
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
                    checked={!state.coastFire}
                    onChange={() =>
                      setState((prev) => ({
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
                value={state.bucket1Value}
                onChange={(bucket1Value) => {
                  setState({
                    ...state,
                    bucket1Value,
                  })
                }}
              />
            </TableCell>

            <TableCell>
              <MoneyInput
                label={"Roth & HSA"}
                width={width}
                value={state.bucket1Contribution}
                disabled={state.coastFire}
                onChange={(bucket1Contribution) => {
                  setState({
                    ...state,
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
                value={state.bucket2Value}
                onChange={(bucket2Value) => {
                  setState({
                    ...state,
                    bucket2Value,
                  })
                }}
              />
            </TableCell>
            <TableCell>
              <MoneyInput
                label={"Traditional"}
                width={width}
                value={state.bucket2Contribution}
                disabled={state.coastFire}
                onChange={(bucket2Contribution) => {
                  setState({
                    ...state,
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
                value={state.bucket3Value}
                onChange={(bucket3Value) => {
                  setState({
                    ...state,
                    bucket3Value,
                  })
                }}
              />
            </TableCell>
            <TableCell>
              <MoneyInput
                label={"After Tax"}
                width={width}
                value={state.bucket3Contribution}
                disabled={state.coastFire}
                onChange={(bucket3Contribution) => {
                  setState({
                    ...state,
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
                    .chain(toDecimal(state.bucket1Value))
                    .add(toDecimal(state.bucket2Value))
                    .add(toDecimal(state.bucket3Value))
                    .done()
                )}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography width={width} align="right" paddingRight={5}>
                {toMoney(
                  state.coastFire === true
                    ? 0
                    : mathjs
                        .chain(toDecimal(state.bucket1Contribution))
                        .add(toDecimal(state.bucket2Contribution))
                        .add(toDecimal(state.bucket3Contribution))
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
