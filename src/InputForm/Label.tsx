import { Typography } from "@mui/material"

interface Props {
  children: React.ReactNode
}

export function Label({ children }: Props) {
  return (
    <Typography
      variant="caption"
      sx={{
        textTransform: "uppercase",
        fontWeight: 600,
        opacity: 0.5,
      }}
    >
      {children}
    </Typography>
  )
}
