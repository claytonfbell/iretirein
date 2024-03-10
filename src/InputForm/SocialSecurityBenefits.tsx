import {
  Box,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
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

export function SocialSecurityBenefits({ state, setState }: Props) {
  return (
    <>
      <Box padding={2}>
        <Typography variant="h2" marginBottom={2}>
          Social Security Benefits
        </Typography>
        <Typography>
          Get your Personalized Monthly Retirement Benefit Estimates by signing
          in at{" "}
          <Link
            href="https://www.ssa.gov/myaccount/statement.html"
            target="ssa"
          >
            https://www.ssa.gov/myaccount/statement.html
          </Link>{" "}
          and find it on page 1 of your statement PDF.
        </Typography>
      </Box>
      <Table sx={{ marginBottom: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Age</TableCell>
            <TableCell>{state.person1Name}</TableCell>
            <TableCell>{state.person2Name}</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(Array(9).keys()).map((_, index) => {
            return (
              <TableRow key={index}>
                <TableCell>{62 + index}</TableCell>
                <TableCell>
                  <MoneyInput
                    value={state.person1SocialSecurity[index]}
                    onChange={(x) => {
                      const person1SocialSecurity = [
                        ...state.person1SocialSecurity,
                      ]
                      person1SocialSecurity[index] = x
                      setState({ ...state, person1SocialSecurity })
                    }}
                    decimals={0}
                  />
                </TableCell>
                <TableCell>
                  <MoneyInput
                    value={state.person2SocialSecurity[index]}
                    onChange={(x) => {
                      const person2SocialSecurity = [
                        ...state.person2SocialSecurity,
                      ]
                      person2SocialSecurity[index] = x
                      setState({ ...state, person2SocialSecurity })
                    }}
                    decimals={0}
                  />
                </TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <Stack direction="row" spacing={1}>
                    <Typography>
                      {toMoney(
                        toDecimal(state.person1SocialSecurity[index]) +
                          toDecimal(state.person2SocialSecurity[index]),
                        0
                      )}{" "}
                      mo
                    </Typography>
                    <Typography> / </Typography>
                    {/* anual  */}
                    <Typography>
                      {toMoney(
                        mathjs
                          .chain(toDecimal(state.person1SocialSecurity[index]))
                          .add(toDecimal(state.person2SocialSecurity[index]))
                          .multiply(12)
                          .done(),
                        0
                      )}{" "}
                      yr
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}
