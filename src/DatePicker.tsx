import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import dayjs from "dayjs"

interface Props {
  value: string | null
  onChange: (newValue: string | null) => void
}

export function DatePicker({ value, onChange }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker
        slotProps={{
          textField: { size: "small" },
        }}
        value={dayjs(value)}
        onChange={(newDate) => {
          onChange(newDate?.toISOString() ?? null)
        }}
      />
    </LocalizationProvider>
  )
}
