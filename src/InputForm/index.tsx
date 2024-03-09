import IosShareIcon from "@mui/icons-material/IosShare"
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
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
import { DatePicker } from "../DatePicker"
import { InputState } from "../InputState"
import { toDecimal, toMoney } from "../util"
import { DecimalInput } from "./DecimalInput"
import { MoneyInput } from "./MoneyInput"

const mathjs = create(all, {})

interface Props {
  state: InputState
  setState: Dispatch<SetStateAction<InputState>>
}

export function InputForm({ state, setState }: Props) {
  function handleShareClick() {
    navigator.share({
      title: "Retirement Calculator",
      text: "Retirement Calculator",
      url: window.location.href,
    })
  }

  const browserSupportsShare = !!global.navigator?.share

  return (
    <>
      <Box padding={2}>
        <Stack spacing={2}>
          <Typography variant="h1">Retirement Calculator</Typography>
          <Typography>
            Save your data by copying the URL which contains your data encoded.
            You can bookmark this page to save your data.
          </Typography>
          {/* native share button  */}
          {browserSupportsShare && (
            <Stack direction="row">
              <Button
                onClick={handleShareClick}
                variant="contained"
                startIcon={<IosShareIcon />}
              >
                Share
              </Button>
            </Stack>
          )}
        </Stack>
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
              <DatePicker
                value={state.person1Birthday}
                onChange={(person1Birthday) => {
                  setState({ ...state, person1Birthday })
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
              <DatePicker
                value={state.person2Birthday}
                onChange={(person2Birthday) => {
                  setState({ ...state, person2Birthday })
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

      <Box padding={2}>
        <Typography variant="h2">Your Retirement Buckets</Typography>
      </Box>
      <Table sx={{ marginBottom: 3, width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell>Current Value</TableCell>
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
                state.coastFire === true
                  ? 0
                  : mathjs
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
