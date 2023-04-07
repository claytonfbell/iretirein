import { createTheme, ThemeProvider } from "@mui/material"
import { QueryClient, QueryClientProvider } from "react-query"

interface Props {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export function Providers(props: Props) {
  const theme = createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontSize: 16,
      h1: {
        fontSize: "2rem",
      },
      h2: {
        fontSize: "1.5rem",
      },
      h3: {
        fontSize: "1rem",
      },
      h4: {
        fontSize: ".75rem",
      },
    },
  })
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
