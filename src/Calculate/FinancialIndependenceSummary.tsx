import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  AppBar,
  Box,
  Collapse,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material"
import dayjs from "dayjs"
import { useState } from "react"
import { useGlobalState } from "../GlobalStateProvider"
import { formatPennies, toPennies } from "../util"
import { RowItem } from "./RowItem"

interface Props {
  data: RowItem
  monthReachOneMillion: RowItem | null
  totalHealthInsuranceGap: number
  totalSocialSecurityGap: number
}

export function FinancialIndependenceSummary({
  data,
  monthReachOneMillion,
  totalHealthInsuranceGap,
  totalSocialSecurityGap,
}: Props) {
  const { state } = useGlobalState()

  const date = dayjs().add(data.month, "month")
  // in x years and y months
  const years = Math.floor(data.month / 12)
  const months = data.month % 12
  const formatYears = (years: number) =>
    years > 0 ? `${years} year${years > 1 ? "s" : ""}` : ""
  const formatMonths = (months: number) =>
    months > 0 ? `${months} month${months > 1 ? "s" : ""}` : ""

  const formattedYears = formatYears(years)
  const formattedMonths = formatMonths(months)

  const oneMillYears = formatYears(
    Math.floor((monthReachOneMillion?.month || 0) / 12)
  )
  const oneMillMonths = formatMonths((monthReachOneMillion?.month || 0) % 12)

  const person1Age = date.diff(state.person1Birthday, "year")
  const person2Age = date.diff(state.person2Birthday, "year")

  const currentPortfolioValue =
    toPennies(state.bucket1Value) +
    toPennies(state.bucket2Value) +
    toPennies(state.bucket3Value)

  const progress = (currentPortfolioValue / data.endingValue) * 100

  const [open, setOpen] = useState(false)

  return (
    <>
      <Box sx={{ height: 400 }}>&nbsp;</Box>
      <AppBar position="fixed" sx={{ top: "auto", bottom: 0 }}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"start"}
        >
          <Container maxWidth="sm">
            <Stack padding={2} spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={"space-between"}
              >
                <Stack
                  spacing={{ sm: 1, xs: 0 }}
                  direction={{ xs: "column", sm: "row" }}
                >
                  <BlueTitle>{date.format("MMMM YYYY")}</BlueTitle>
                  <BlueTitle>
                    ({person1Age} / {person2Age})
                  </BlueTitle>
                </Stack>

                <Stack
                  spacing={{ sm: 1, xs: 0 }}
                  direction={{ xs: "column", sm: "row" }}
                >
                  <BlueTitle>{formattedYears}</BlueTitle>
                  <BlueTitle>{formattedMonths}</BlueTitle>
                </Stack>
              </Stack>

              <Collapse in={open}>
                <Stack spacing={1}>
                  <LineItem label="Roth & HSA">
                    {formatPennies(data.bucket1.endingValue)}
                  </LineItem>
                  <LineItem label="Traditional">
                    {formatPennies(
                      data.bucket2.endingValue -
                        totalHealthInsuranceGap -
                        totalSocialSecurityGap
                    )}
                  </LineItem>
                  <LineItem label="Social Security Gap Bonds" secondary>
                    {formatPennies(totalSocialSecurityGap)}
                  </LineItem>
                  <LineItem label="Health Insurance Bonds" secondary>
                    {formatPennies(totalHealthInsuranceGap)}
                  </LineItem>
                  <LineItem label="After Tax">
                    {formatPennies(data.bucket3.endingValue)}
                  </LineItem>

                  <Divider />
                  <LineItem label="FI Goal" bold>
                    {formatPennies(data.endingValue)}
                  </LineItem>
                  <LineItem label="Current">
                    {formatPennies(currentPortfolioValue)}
                  </LineItem>
                  {monthReachOneMillion !== null ? (
                    <LineItem label="1M Goal">
                      {`${oneMillYears} ${oneMillMonths}`}
                    </LineItem>
                  ) : null}
                  <Box>
                    <Typography
                      align="center"
                      sx={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: (theme) => theme.palette.primary.main,
                      }}
                    >
                      {progress.toFixed(0)}% Saved
                    </Typography>
                  </Box>
                  <Box width={"100%"}>
                    <LinearProgress
                      sx={{ height: 24, borderRadius: 8 }}
                      variant="determinate"
                      value={progress}
                    />
                  </Box>
                </Stack>
              </Collapse>
            </Stack>
          </Container>
          <Box paddingTop={2} paddingRight={2}>
            <IconButton onClick={() => setOpen(!open)}>
              {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
        </Stack>
      </AppBar>
    </>
  )
}

function BlueTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 24,
        fontWeight: 700,
        color: (theme) => theme.palette.primary.main,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
  )
}

interface LineItemProps {
  label: React.ReactNode
  children: React.ReactNode
  bold?: boolean
  secondary?: boolean
}

function LineItem({ label, children, bold, secondary }: LineItemProps) {
  const fontWeight = bold ? 700 : undefined

  return (
    <Stack direction="row" justifyContent={"space-between"}>
      <Typography
        sx={{
          marginLeft: secondary ? 2 : 0,
        }}
        fontWeight={fontWeight}
      >
        {label}
      </Typography>
      <Typography fontWeight={fontWeight}>{children}</Typography>
    </Stack>
  )
}
