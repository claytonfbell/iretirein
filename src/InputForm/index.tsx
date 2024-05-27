import EditIcon from "@mui/icons-material/Edit"
import {
  Button,
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
import moment from "moment"
import { useState } from "react"
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies, toPennies } from "../util"
import { Savings } from "./Savings"
import { SettingsDrawer } from "./SettingsDrawer"
import { SocialSecurityBenefits } from "./SocialSecurityBenefits"

export function InputForm() {
  const { formState } = useGlobalState()
  const [openSettings, setOpenSettings] = useState(false)
  const [openSocialSecurity, setOpenSocialSecurity] = useState(false)
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"))

  return (
    <Stack spacing={4} paddingTop={2}>
      <Stack spacing={2}>
        <Typography variant="h1">Retirement Calculator</Typography>
        <Typography>
          Save your data by copying the URL which contains your data encoded.
          You can bookmark this page to save your data.
        </Typography>
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Age</TableCell>
            {isSmUp ? (
              <TableCell align="right">Social Security (mo)</TableCell>
            ) : null}
            <TableCell align="right">Social Security (yr)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{formState.person1Name}</TableCell>
            <TableCell>
              {moment().diff(formState.person1Birthday, "years")}
            </TableCell>

            {isSmUp ? (
              <TableCell align="right">
                {formatPennies(toPennies(formState.person1SocialSecurity[0]))} -{" "}
                {formatPennies(toPennies(formState.person1SocialSecurity[8]))}
              </TableCell>
            ) : null}
            <TableCell align="right">
              {formatPennies(
                12 * toPennies(formState.person1SocialSecurity[0])
              )}{" "}
              -{" "}
              {formatPennies(
                12 * toPennies(formState.person1SocialSecurity[8])
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{formState.person2Name}</TableCell>
            <TableCell>
              {moment().diff(formState.person2Birthday, "years")}
            </TableCell>
            {isSmUp ? (
              <TableCell align="right">
                {formatPennies(toPennies(formState.person2SocialSecurity[0]))} -{" "}
                {formatPennies(toPennies(formState.person2SocialSecurity[8]))}
              </TableCell>
            ) : null}
            <TableCell align="right">
              {formatPennies(
                12 * toPennies(formState.person2SocialSecurity[0])
              )}{" "}
              -{" "}
              {formatPennies(
                12 * toPennies(formState.person2SocialSecurity[8])
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Button
                  size="small"
                  onClick={() => setOpenSettings(true)}
                  startIcon={<EditIcon />}
                  variant="outlined"
                >
                  Edit Settings
                </Button>
                <Button
                  size="small"
                  onClick={() => setOpenSocialSecurity(true)}
                  startIcon={<EditIcon />}
                  variant="outlined"
                >
                  Edit Social Security
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <SettingsDrawer
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
      <SocialSecurityBenefits
        open={openSocialSecurity}
        onClose={() => setOpenSocialSecurity(false)}
      />

      <Savings />
    </Stack>
  )
}
