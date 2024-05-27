import { Button, Drawer, Stack, TextField } from "@mui/material"
import { DatePicker } from "../DatePicker"
import { useGlobalState } from "../GlobalStateProvider"
import { DecimalInput } from "./DecimalInput"
import { Label } from "./Label"
import { MoneyInput } from "./MoneyInput"

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsDrawer({ open, onClose }: Props) {
  const { formState, setFormState } = useGlobalState()
  return (
    <>
      <Drawer open={open} onClose={onClose} anchor="right">
        <Stack
          justifyContent={"space-between"}
          minHeight={"100vh"}
          maxWidth={"100vw"}
          minWidth={300}
          width={400}
          padding={2}
        >
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Stack>
                <Label>Name</Label>
                <TextField
                  size="small"
                  value={formState.person1Name}
                  onChange={(e) => {
                    setFormState({ ...formState, person1Name: e.target.value })
                  }}
                />
              </Stack>
              <Stack>
                <Label>Birthday</Label>
                <DatePicker
                  value={formState.person1Birthday}
                  onChange={(person1Birthday) => {
                    setFormState({ ...formState, person1Birthday })
                  }}
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Name</Label>
                <TextField
                  size="small"
                  value={formState.person2Name}
                  onChange={(e) => {
                    setFormState({ ...formState, person2Name: e.target.value })
                  }}
                />
              </Stack>
              <Stack>
                <Label>Birthday</Label>
                <DatePicker
                  value={formState.person2Birthday}
                  onChange={(person2Birthday) => {
                    setFormState({ ...formState, person2Birthday })
                  }}
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Desired Income</Label>
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
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Stock Appreciation</Label>
                <DecimalInput
                  value={formState.stockAppreciation}
                  onChange={(stockAppreciation) => {
                    setFormState({
                      ...formState,
                      stockAppreciation,
                    })
                  }}
                  decimals={4}
                  percentage
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Dividend Yield</Label>
                <DecimalInput
                  value={formState.stockDividendRate}
                  onChange={(stockDividendRate) => {
                    setFormState({
                      ...formState,
                      stockDividendRate,
                    })
                  }}
                  decimals={5}
                  percentage
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Inflation Rate</Label>
                <DecimalInput
                  value={formState.inflationRate}
                  onChange={(inflationRate) => {
                    setFormState({
                      ...formState,
                      inflationRate,
                    })
                  }}
                  decimals={5}
                  percentage
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Pre Medicare Monthly Insurance</Label>
                <MoneyInput
                  value={formState.preMedicareInsuance}
                  onChange={(preMedicareInsuance) => {
                    setFormState({
                      ...formState,
                      preMedicareInsuance,
                    })
                  }}
                  decimals={0}
                />
              </Stack>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Label>Safe Withdrawal Rate</Label>
                <DecimalInput
                  value={formState.withdrawalRate}
                  onChange={(withdrawalRate) => {
                    setFormState({
                      ...formState,
                      withdrawalRate,
                    })
                  }}
                  decimals={5}
                  percentage
                />
              </Stack>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            size="large"
            sx={{ borderRadius: 20 }}
            onClick={onClose}
          >
            Close
          </Button>
        </Stack>
      </Drawer>
    </>
  )
}
