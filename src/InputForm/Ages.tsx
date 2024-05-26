import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import moment from "moment"
import { DatePicker } from "../DatePicker"
import { useGlobalState } from "../GlobalStateProvider"

export function Ages() {
  const { formState, setFormState } = useGlobalState()
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
                value={formState.person1Name}
                onChange={(e) => {
                  setFormState({ ...formState, person1Name: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              <DatePicker
                value={formState.person1Birthday}
                onChange={(person1Birthday) => {
                  setFormState({ ...formState, person1Birthday })
                }}
              />
            </TableCell>
            <TableCell>
              {moment().diff(formState.person1Birthday, "years")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              <TextField
                size="small"
                value={formState.person2Name}
                onChange={(e) => {
                  setFormState({ ...formState, person2Name: e.target.value })
                }}
              />
            </TableCell>
            <TableCell>
              <DatePicker
                value={formState.person2Birthday}
                onChange={(person2Birthday) => {
                  setFormState({ ...formState, person2Birthday })
                }}
              />
            </TableCell>
            <TableCell>
              {moment().diff(formState.person2Birthday, "years")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}
