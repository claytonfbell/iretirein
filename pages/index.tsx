import { Box, Container, CssBaseline, Stack, useTheme } from "@mui/material"
import Head from "next/head"
import { AppErrorBoundary } from "../src/AppErrorBoundary"
import { Calcuate } from "../src/Calculate"
import { InputForm } from "../src/InputForm"
import { Providers } from "../src/Providers"

export default function Home() {
  const theme = useTheme()

  return (
    <Providers>
      <Head>
        <title>iretirein.com</title>
        <meta name="description" content="Retirement calculartor" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <CssBaseline />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 16,
          backgroundColor: theme.palette.primary.main,
        }}
      />
      <Container sx={{ marginTop: 3 }}>
        <Stack spacing={4}>
          <InputForm />
          <AppErrorBoundary>
            <Calcuate />
          </AppErrorBoundary>
        </Stack>
      </Container>
    </Providers>
  )
}
