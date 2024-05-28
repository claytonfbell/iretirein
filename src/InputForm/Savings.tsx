import {
  Box,
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
import { useEffect, useRef, useState } from "react"
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies, toPennies } from "../util"
import { MoneyInput } from "./MoneyInput"

export function Savings() {
  const { formState, setFormState } = useGlobalState()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const boxRef = useRef<HTMLDivElement>(null)

  // observe the boxRef width if it changes
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (boxRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setWidth(entry.contentRect.width)
        }
      })
      observer.observe(boxRef.current)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <Stack>
      <Typography variant="h1">Savings</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCellBox>
              <Typography paddingRight={5}>Current Value</Typography>
            </TableCellBox>
            <TableCellBox variant="right" padRight>
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
            </TableCellBox>
            {!isMobile ? <TableCell align="right">Yearly</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCellBox>
              <MoneyInput
                label={"Roth & HSA"}
                value={formState.bucket1Value}
                onChange={(bucket1Value) => {
                  setFormState({
                    ...formState,
                    bucket1Value,
                  })
                }}
              />
            </TableCellBox>

            <TableCellBox>
              <MoneyInput
                label={"Roth & HSA"}
                value={formState.bucket1Contribution}
                disabled={formState.coastFire}
                onChange={(bucket1Contribution) => {
                  setFormState({
                    ...formState,
                    bucket1Contribution,
                  })
                }}
              />
            </TableCellBox>

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
            <TableCellBox>
              <MoneyInput
                label={"Traditional"}
                value={formState.bucket2Value}
                onChange={(bucket2Value) => {
                  setFormState({
                    ...formState,
                    bucket2Value,
                  })
                }}
              />
            </TableCellBox>
            <TableCellBox>
              <MoneyInput
                label={"Traditional"}
                value={formState.bucket2Contribution}
                disabled={formState.coastFire}
                onChange={(bucket2Contribution) => {
                  setFormState({
                    ...formState,
                    bucket2Contribution,
                  })
                }}
              />
            </TableCellBox>

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
            <TableCellBox>
              <MoneyInput
                label={"After Tax"}
                value={formState.bucket3Value}
                onChange={(bucket3Value) => {
                  setFormState({
                    ...formState,
                    bucket3Value,
                  })
                }}
              />
            </TableCellBox>
            <TableCellBox>
              <MoneyInput
                label={"After Tax"}
                value={formState.bucket3Contribution}
                disabled={formState.coastFire}
                onChange={(bucket3Contribution) => {
                  setFormState({
                    ...formState,
                    bucket3Contribution,
                  })
                }}
              />
            </TableCellBox>

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
            <TableCellBox>
              <Typography paddingRight={5}>
                {formatPennies(
                  toPennies(formState.bucket1Value) +
                    toPennies(formState.bucket2Value) +
                    toPennies(formState.bucket3Value)
                )}
              </Typography>
            </TableCellBox>
            <TableCellBox variant="right">
              <Typography align="right" paddingRight={5}>
                {formatPennies(
                  formState.coastFire === true
                    ? 0
                    : toPennies(formState.bucket1Contribution) +
                        toPennies(formState.bucket2Contribution) +
                        toPennies(formState.bucket3Contribution)
                )}
              </Typography>
            </TableCellBox>

            {!isMobile ? (
              <TableCell align="right" sx={{ minWidth: 120 }}>
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

interface TableCellBoxProps {
  children: React.ReactNode
  variant?: "left" | "right"
  padRight?: boolean
}

function TableCellBox({
  children,
  padRight = false,
  variant = "left",
}: TableCellBoxProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return (
    <TableCell align={variant === "right" && isMobile ? "right" : undefined}>
      <Box
        sx={{
          textAlign: "right",
          paddingRight: padRight ? 2 : 0,
        }}
        maxWidth={256}
      >
        {children}
      </Box>
    </TableCell>
  )
}
