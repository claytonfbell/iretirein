import { TextField } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import { DatePicker as MUIDatePicker } from "@mui/x-date-pickers/DatePicker"
import moment from "moment"
interface Props {
  value: string | null
  onChange: (newValue: string | null) => void
}

export function DatePicker({ value, onChange }: Props) {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <MUIDatePicker
          value={moment(value)}
          onChange={(newValue) => {
            onChange(newValue?.toISOString() ?? null)
          }}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
    </>
  )
}
