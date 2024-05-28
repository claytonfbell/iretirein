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
          <Stack spacing={2}>
            <FormItemRow>
              <FormItem label="Name">
                <TextField
                  size="small"
                  value={formState.person1Name}
                  onChange={(e) => {
                    setFormState({ ...formState, person1Name: e.target.value })
                  }}
                />
              </FormItem>

              <FormItem label="Birthday">
                <DatePicker
                  value={formState.person1Birthday}
                  onChange={(person1Birthday) => {
                    setFormState({ ...formState, person1Birthday })
                  }}
                />
              </FormItem>
            </FormItemRow>

            <FormItemRow>
              <FormItem label="Name">
                <TextField
                  size="small"
                  value={formState.person2Name}
                  onChange={(e) => {
                    setFormState({ ...formState, person2Name: e.target.value })
                  }}
                />
              </FormItem>
              <FormItem label="Birthday">
                <DatePicker
                  value={formState.person2Birthday}
                  onChange={(person2Birthday) => {
                    setFormState({ ...formState, person2Birthday })
                  }}
                />
              </FormItem>
            </FormItemRow>

            <FormItemRow>
              <FormItem label="Desired Infome">
                <MoneyInput
                  value={formState.requiredIncome}
                  onChange={(requiredIncome) => {
                    setFormState({ ...formState, requiredIncome })
                  }}
                  decimals={0}
                />
              </FormItem>
              <FormItem label="Health Insurance">
                <MoneyInput
                  value={formState.preMedicareInsuance}
                  onChange={(preMedicareInsuance) => {
                    setFormState({ ...formState, preMedicareInsuance })
                  }}
                  decimals={0}
                />
              </FormItem>
            </FormItemRow>

            <FormItemRow>
              <FormItem label="Stock Appreciation">
                <DecimalInput
                  value={formState.stockAppreciation}
                  onChange={(stockAppreciation) => {
                    setFormState({ ...formState, stockAppreciation })
                  }}
                  decimals={4}
                  percentage
                />
              </FormItem>
              <FormItem label="Dividend Yield">
                <DecimalInput
                  value={formState.stockDividendRate}
                  onChange={(stockDividendRate) => {
                    setFormState({ ...formState, stockDividendRate })
                  }}
                  decimals={5}
                  percentage
                />
              </FormItem>
            </FormItemRow>

            <FormItemRow>
              <FormItem label="Inflation Rate">
                <DecimalInput
                  value={formState.inflationRate}
                  onChange={(inflationRate) => {
                    setFormState({ ...formState, inflationRate })
                  }}
                  decimals={5}
                  percentage
                />
              </FormItem>

              <FormItem label="Withdrawal Rate">
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
              </FormItem>
            </FormItemRow>

            <Stack spacing={1}></Stack>
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

function FormItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Stack>
      <Label>{label}</Label>
      {children}
    </Stack>
  )
}

function FormItemRow({ children }: { children: React.ReactNode }) {
  return (
    <Stack spacing={2} direction="row" justifyContent="space-evenly">
      {children}
    </Stack>
  )
}
