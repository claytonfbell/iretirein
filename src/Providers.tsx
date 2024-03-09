import {
  createTheme,
  ThemeProvider,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { QueryClient, QueryClientProvider } from "react-query"

interface Props {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export function Providers(props: Props) {
  const parentTheme = useTheme()
  const isMobile = useMediaQuery(parentTheme.breakpoints.down("sm"))
  const theme = createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontSize: 14,
      h1: {
        fontSize: "1.8em",
      },
      h2: {
        fontSize: "1.2em",
      },
      h3: {
        fontSize: "1em",
      },
      h4: {
        fontSize: ".75em",
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
