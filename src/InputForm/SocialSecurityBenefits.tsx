import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Link,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
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

interface Props {
  open: boolean
  onClose: () => void
}

export function SocialSecurityBenefits({ open, onClose }: Props) {
  const { formState, setFormState } = useGlobalState()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        <DialogContent>
          <Stack spacing={2} alignItems={"start"}>
            <Box padding={2}>
              <Typography variant="h2" marginBottom={2}>
                Social Security Benefits
              </Typography>
              <Typography>
                Get your Personalized Monthly Retirement Benefit Estimates by
                signing in at{" "}
                <Link
                  href="https://www.ssa.gov/myaccount/statement.html"
                  target="ssa"
                >
                  https://www.ssa.gov/myaccount/statement.html
                </Link>{" "}
                and find it on page 1 of your statement PDF.
              </Typography>
            </Box>
            <TableContainer>
              <Table sx={{ marginBottom: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Age</TableCell>
                    <TableCell>{formState.person1Name}</TableCell>
                    <TableCell>{formState.person2Name}</TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>
                      <SelectSocialSecurityAge
                        value={formState.person1SocialSecurityAge}
                        onChange={(x) => {
                          setFormState({
                            ...formState,
                            person1SocialSecurityAge: x,
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <SelectSocialSecurityAge
                        value={formState.person2SocialSecurityAge}
                        onChange={(x) => {
                          setFormState({
                            ...formState,
                            person2SocialSecurityAge: x,
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  {Array.from(Array(9).keys()).map((_, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{62 + index}</TableCell>
                        <TableCell>
                          <MoneyInput
                            value={formState.person1SocialSecurity[index]}
                            onChange={(x) => {
                              const person1SocialSecurity = [
                                ...formState.person1SocialSecurity,
                              ]
                              person1SocialSecurity[index] = x
                              setFormState({
                                ...formState,
                                person1SocialSecurity,
                              })
                            }}
                            decimals={0}
                          />
                        </TableCell>
                        <TableCell>
                          <MoneyInput
                            value={formState.person2SocialSecurity[index]}
                            onChange={(x) => {
                              const person2SocialSecurity = [
                                ...formState.person2SocialSecurity,
                              ]
                              person2SocialSecurity[index] = x
                              setFormState({
                                ...formState,
                                person2SocialSecurity,
                              })
                            }}
                            decimals={0}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Typography>
                              {toMoney(
                                toDecimal(
                                  formState.person1SocialSecurity[index]
                                ) +
                                  toDecimal(
                                    formState.person2SocialSecurity[index]
                                  ),
                                0
                              )}{" "}
                              mo
                            </Typography>
                            <Typography> / </Typography>
                            {/* anual  */}
                            <Typography>
                              {toMoney(
                                mathjs
                                  .chain(
                                    toDecimal(
                                      formState.person1SocialSecurity[index]
                                    )
                                  )
                                  .add(
                                    toDecimal(
                                      formState.person2SocialSecurity[index]
                                    )
                                  )
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
            </TableContainer>

            <Button
              size="large"
              variant="contained"
              sx={{ borderRadius: 20, minWidth: 200 }}
              onClick={onClose}
              fullWidth={isMobile}
            >
              Close
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SelectSocialSecurityAge({
  value,
  onChange,
}: {
  value: string
  onChange: (newValue: string) => void
}) {
  return (
    <Select
      fullWidth
      value={value}
      onChange={(e) => {
        onChange(e.target.value.toString())
      }}
    >
      {[62, 63, 64, 65, 66, 67, 68, 69, 70].map((x) => (
        <MenuItem key={x} value={x}>
          {x}
        </MenuItem>
      ))}
    </Select>
  )
}
