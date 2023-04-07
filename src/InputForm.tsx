import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { all, create } from "mathjs"
import moment from "moment"
import { Dispatch, SetStateAction } from "react"
import { InputState } from "../src/InputState"
import { toDecimal, toMoney } from "./Calculate"

const mathjs = create(all, {})

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
      size="small"
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

interface DecimalInputProps {
  value: string
  onChange: (newValue: string) => void
  decimals?: number
}

function DecimalInput({ value, onChange, decimals = 2 }: DecimalInputProps) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => {
        let parts = e.target.value.split(".")
        if (parts.length > 2) {
          onChange(parts.slice(0, 2).join("."))
        }
        onChange(e.target.value)
      }}
      onBlur={(e) => {
        onChange(toDecimal(value).toFixed(decimals))
      }}
    />
  )
}

export function InputForm({ state, setState }: Props) {
  return (
    <>
      <Box padding={2}>
        <Typography variant="h1" marginBottom={2}>
          Retirement Calculator
        </Typography>
        <Typography>
          Save your data by copying the URL and sharing it with others. You can
          bookmark this page to save your data.
        </Typography>
      </Box>
      <Table sx={{ marginBottom: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Names
            </TableCell>
            <TableCell>Birth Date</TableCell>
            <TableCell>Current Age</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              <TextField
                size="small"
                value={state.person1Name}
                onChange={(e) => {
                  setState({ ...state, person1Name: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
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
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              <TextField
                size="small"
                value={state.person2Name}
                onChange={(e) => {
                  setState({ ...state, person2Name: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                size="small"
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

      <Box padding={2}>
        <Typography variant="h2" marginBottom={2}>
          Take Home Pay
        </Typography>
        <Typography>
          This is the amount of money you take home after taxes and deductions
          that you wish to continue spending during retirement to maintain your
          current lifestyle. You can exclude money that you additionaly put into
          savings since you will no longer do that during retirement.
        </Typography>
      </Box>
      <Table sx={{ marginBottom: 3 }}>
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
                  {toMoney(
                    toDecimal(state.person1SocialSecurity[index]) +
                      toDecimal(state.person2SocialSecurity[index])
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Box padding={2}>
        <Typography variant="h2">Your Retirement Buckets</Typography>
      </Box>
      <Table sx={{ marginBottom: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Current Value</TableCell>
            <TableCell>Monthly Contribution</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Roth&nbsp;&&nbsp;HSA</TableCell>
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
            <TableCell>Traditional</TableCell>
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
            <TableCell>After Tax</TableCell>
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

          <TableRow>
            <TableCell>Totals</TableCell>
            <TableCell>
              {toMoney(
                mathjs
                  .chain(toDecimal(state.bucket1Value))
                  .add(toDecimal(state.bucket2Value))
                  .add(toDecimal(state.bucket3Value))
                  .done()
              )}
            </TableCell>
            <TableCell>
              {toMoney(
                mathjs
                  .chain(toDecimal(state.bucket1Contribution))
                  .add(toDecimal(state.bucket2Contribution))
                  .add(toDecimal(state.bucket3Contribution))
                  .done()
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

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
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
