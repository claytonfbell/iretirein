import LZUTF8 from "lzutf8"
import React, { useEffect, useState } from "react"
import { InputState } from "./InputState"

type ContextType = {
  state: InputState
  formState: InputState
  setFormState: React.Dispatch<React.SetStateAction<InputState>>
}
const Context = React.createContext<ContextType | undefined>(undefined)

export function useGlobalState() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(`useGlobalState must be used within a GlobalStateProvider`)
  }
  return context
}

interface Props {
  children: React.ReactNode
}

export function GlobalStateProvider(props: Props) {
  const [formState, setFormState] = useState<InputState>({
    person1Name: "Person 1",
    person2Name: "Person 2",
    person1Birthday: "1990-01-01",
    person2Birthday: "1992-01-01",

    person1SocialSecurity: [
      "$1,641",
      "$1,763",
      "$1,895",
      "$2,067",
      "$2,240",
      "$2,407",
      "$2,479",
      "$2,679",
      "$3,005",
    ],
    person2SocialSecurity: [
      "$1,023",
      "$1,109",
      "$1,203",
      "$1,323",
      "$1,446",
      "$1,569",
      "$1,663",
      "$1,809",
      "$2,011",
    ],
    person1SocialSecurityAge: "67",
    person2SocialSecurityAge: "67",
    bucket1Value: "$520",
    bucket1Contribution: "$270",
    bucket2Value: "$1,024",
    bucket2Contribution: "$800",
    bucket3Value: "0",
    bucket3Contribution: "0",
    requiredIncome: "$100,000",
    stockAppreciation: "0.09",
    stockDividendRate: ".0148",
    inflationRate: "0.038",
    withdrawalRate: "0.04",
    coastFire: false,
    preMedicareInsuance: "$500",
  })

  const [state, setState] = useState<InputState>(formState)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setState(formState)
    }, 500)
    return () => clearTimeout(timeout)
  }, [formState])

  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (loaded) {
      window.location.hash = LZUTF8.encodeBase64(
        LZUTF8.compress(JSON.stringify(formState))
      )
    }
  }, [formState])

  useEffect(() => {
    try {
      const fromHash = JSON.parse(
        LZUTF8.decompress(LZUTF8.decodeBase64(window.location.hash.slice(1)))
      )
      setFormState(fromHash)
    } catch {
      console.log(`Failed to load state from hash.`)
    }
    setLoaded(true)
  }, [])

  const value = React.useMemo(
    (): ContextType => ({ state, formState, setFormState }),
    [state, formState, setFormState]
  )

  return <Context.Provider value={value} {...props} />
}
