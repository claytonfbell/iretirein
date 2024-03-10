import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import moment from "moment"
import { Dispatch, SetStateAction } from "react"
import { DatePicker } from "../DatePicker"
import { InputState } from "../InputState"

interface Props {
  state: InputState
  setState: Dispatch<SetStateAction<InputState>>
}

export function Ages({ state, setState }: Props) {
  return (
    <>
      <Table sx={{ marginBottom: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              Names
            </TableCell>
            <TableCell>Birth Date</TableCell>
            <TableCell>Current Age</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              <TextField
                size="small"
                value={state.person1Name}
                onChange={(e) => {
                  setState({ ...state, person1Name: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              <DatePicker
                value={state.person1Birthday}
                onChange={(person1Birthday) => {
                  setState({ ...state, person1Birthday })
                }}
              />
            </TableCell>
            <TableCell>
              {moment().diff(state.person1Birthday, "years")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              <TextField
                size="small"
                value={state.person2Name}
                onChange={(e) => {
                  setState({ ...state, person2Name: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              <DatePicker
                value={state.person2Birthday}
                onChange={(person2Birthday) => {
                  setState({ ...state, person2Birthday })
                }}
              />
            </TableCell>
            <TableCell>
              {moment().diff(state.person2Birthday, "years")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
