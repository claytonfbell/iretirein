import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import moment from "moment"
import { Dispatch, SetStateAction } from "react"
import { InputState } from "../src/InputState"
import { toDecimal, toMoney } from "./Calculate"

interface Props {
  state: InputState
  setState: Dispatch<SetStateAction<InputState>>
}

interface MoneyInputProps {
  value: string
  onChange: (newValue: string) => void
  decimals?: number
}

function MoneyInput({ value, onChange, decimals = 2 }: MoneyInputProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => {
        let parts = e.target.value.split(".")
        if (parts.length > 2) {
          onChange(parts.slice(0, 2).join("."))
        }
        onChange(e.target.value)
      }}
      onBlur={(e) => {
        onChange(toMoney(toDecimal(value), decimals))
      }}
    />
  )
}

export function InputForm({ state, setState }: Props) {
  return (
    <>
      <Typography variant="h1">Retirement Calculator</Typography>
      <Typography>
        Estimates at what age you can be financially independent.
      </Typography>
      <br />
      <br />
      <br />
      <Typography variant="h2">Your Ages</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Birth Date</TableCell>
            <TableCell>Current Age</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Person 1</TableCell>
            <TableCell>
              <TextField
                type="date"
                value={state.person1Birthday}
                onChange={(e) => {
                  setState({ ...state, person1Birthday: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              {moment().diff(state.person1Birthday, "years")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Person 2</TableCell>
            <TableCell>
              <TextField
                type="date"
                value={state.person2Birthday}
                onChange={(e) => {
                  setState({ ...state, person2Birthday: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              {moment().diff(state.person2Birthday, "years")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br />
      <br />
      <br />
      <Typography variant="h2">Take Home Pay</Typography>
      <Typography>
        This is the amount of money you take home after taxes and deductions
        that you wish to continue spending during retirement to maintain your
        current lifestyle. You can exclude money that you additionaly put into
        savings since you will no longer do that during retirement.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Annual Take Home Pay</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <MoneyInput
                value={state.takeHomePay}
                onChange={(takeHomePay) => {
                  setState({
                    ...state,
                    takeHomePay,
                  })
                }}
                decimals={0}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br />
      <br />
      <br />
      <Typography variant="h2">Social Security Benefits</Typography>
      <Typography>
        Get your Personalized Monthly Retirement Benefit Estimates by signing in
        at{" "}
        <Link href="https://www.ssa.gov/myaccount/statement.html" target="ssa">
          https://www.ssa.gov/myaccount/statement.html
        </Link>{" "}
        and find it on page 1 of your statement PDF.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Start Age</TableCell>
            <TableCell>Person 1</TableCell>
            <TableCell>Person 2</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(Array(9).keys()).map((_, index) => {
            return (
              <TableRow key={index}>
                <TableCell>Age {62 + index}</TableCell>
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <br />
      <br />
      <br />
      <Typography variant="h2">Your Retirement Buckets</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Current Value</TableCell>
            <TableCell>Monthly Contribution</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Roth IRA, Roth 401k, and HSA</TableCell>
            <TableCell>
              <MoneyInput
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
                value={state.bucket1Contribution}
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
            <TableCell>Traditional IRA and Traditional 401k</TableCell>
            <TableCell>
              <MoneyInput
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
                value={state.bucket2Contribution}
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
            <TableCell>Regular Investment Savings</TableCell>
            <TableCell>
              <MoneyInput
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
                value={state.bucket3Contribution}
                onChange={(bucket3Contribution) => {
                  setState({
                    ...state,
                    bucket3Contribution,
                  })
                }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <br />
      <br />
      <br />
    </>
  )
}
