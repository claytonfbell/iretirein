import { Box, Container, CssBaseline, useTheme } from "@mui/material"
import LZUTF8 from "lzutf8"
import moment from "moment"
import Head from "next/head"
import { useEffect, useState } from "react"
import { Calculate } from "../src/Calculate"
import { InputForm } from "../src/InputForm"
import { InputState } from "../src/InputState"
import { Providers } from "../src/Providers"

export default function Home() {
  const [state, setState] = useState<InputState>({
    person1Name: "Person 1",
    person2Name: "Person 2",
    person1Birthday: moment("1978-09-22 00:00:00").toISOString(),
    person2Birthday: moment("1976-06-29 00:00:00").toISOString(),
    person1SocialSecurity: ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
    person2SocialSecurity: ["0", "0", "0", "0", "0", "0", "0", "0", "0"],
    bucket1Value: "0",
    bucket1Contribution: "0",
    bucket2Value: "0",
    bucket2Contribution: "0",
    bucket3Value: "0",
    bucket3Contribution: "0",
    takeHomePay: "80000",
    stockAppreciation: "0.09",
    stockDividendRate: ".0133",
    stockPrice: "133",
    inflationRate: "0.038",
    effectiveTaxRate: "0.15",
    withdrawalRate: "0.04",
  })

  const [debounceState, setDebounceState] = useState<InputState>(state)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceState(state)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [state])

  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (loaded) {
      window.location.hash = LZUTF8.encodeBase64(
        LZUTF8.compress(JSON.stringify(state))
      )
    }
  }, [state])

  useEffect(() => {
    try {
      const fromHash = JSON.parse(
        LZUTF8.decompress(LZUTF8.decodeBase64(window.location.hash.slice(1)))
      )
      setState(fromHash)
    } catch {
      console.log(`Failed to load state from hash.`)
    }
    setLoaded(true)
  }, [])

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
      <Container sx={{ marginTop: 3, paddingLeft: 0, paddingRight: 0 }}>
        {/* <pre>{debug}</pre> */}
        {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
        <InputForm state={state} setState={setState} />
        <Box sx={{ marginTop: 6 }}>
          <Calculate state={debounceState} />
        </Box>
      </Container>
    </Providers>
  )
}
