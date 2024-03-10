import ClearIcon from "@mui/icons-material/Clear"
import { IconButton, TextField } from "@mui/material"
import { useRef } from "react"
import { toDecimal, toMoney } from "../util"

interface Props {
  value: string
  onChange: (newValue: string) => void
  decimals?: number
  disabled?: boolean
  minWidth?: number
  width?: number
  label?: string
}

export function MoneyInput({
  value,
  onChange,
  decimals = 2,
  disabled,
  minWidth,
  label,
  width,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <TextField
      label={label}
      size="small"
      value={value}
      disabled={disabled}
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
      sx={{
        minWidth,
        width,
        "& .clear-button": {
          display: "none",
        },
        "&:hover .clear-button": {
          display: "block",
        },
      }}
      inputRef={inputRef}
      inputProps={{
        sx: { textAlign: "right", paddingRight: 3 },
      }}
      InputProps={{
        endAdornment:
          value.length > 0 ? (
            <IconButton
              className="clear-button"
              sx={{ opacity: 0.4, right: 4, top: 4, position: "absolute" }}
              size="small"
              onClick={() => {
                onChange("")
                inputRef.current?.focus()
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null,
      }}
    />
  )
}
