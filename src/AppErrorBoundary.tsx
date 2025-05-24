import { Alert, AlertTitle, Button } from "@mui/material"
import { ErrorBoundary } from "react-error-boundary"

interface Props {
  children: React.ReactNode
}

export function AppErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Alert severity="error" sx={{ marginTop: 2 }}>
          <AlertTitle>Something went wrong:</AlertTitle>
          <pre>{error.message}</pre>
          <Button
            color="inherit"
            variant="contained"
            onClick={() => resetErrorBoundary()}
          >
            Try again
          </Button>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
