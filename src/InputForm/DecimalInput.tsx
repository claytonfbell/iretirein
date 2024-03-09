import { Stack, TextField } from "@mui/material"
import { all, create } from "mathjs"
import { useEffect, useState } from "react"
import { toDecimal } from "../util"

const mathjs = create(all, {})

interface Props {
  value: string
  onChange: (newValue: string) => void
  decimals?: number
  percentage: boolean
}

export function DecimalInput({
  value,
  onChange,
  decimals = 2,
  percentage = false,
}: Props) {
  const [inputValue, setInputValue] = useState(
    mathjs.multiply(toDecimal(value), 100).toString()
  )
  useEffect(() => {
    const newValue = mathjs.multiply(toDecimal(value), 100).toString()
    if (mathjs.compare(newValue, inputValue) !== 0) {
      setInputValue(newValue)
    }
  }, [value])

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        size="small"
        value={inputValue}
        onChange={(e) => {
          let newValue = e.target.value

          // internal state
          let parts = newValue.split(".")
          if (parts.length > 2) {
            setInputValue(parts.slice(0, 2).join("."))
          } else {
            setInputValue(newValue)
          }

          // external state
          if (percentage) {
            newValue = `${mathjs.divide(toDecimal(newValue), 100)}`
          }
          onChange(toDecimal(newValue).toFixed(decimals))
        }}
        InputProps={{
          endAdornment: percentage ? "%" : undefined,
        }}
      />
      {/* <pre>{JSON.stringify({ value, inputValue }, null, 2)}</pre> */}
    </Stack>
  )
}
