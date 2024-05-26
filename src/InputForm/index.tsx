import IosShareIcon from "@mui/icons-material/IosShare"
import { Box, Button, Stack, Typography } from "@mui/material"
import { all, create } from "mathjs"
import { Ages } from "./Ages"
import { AssetBuckets } from "./AssetBuckets"
import { IncomeNeeded } from "./IncomeNeeded"
import { OtherSettings } from "./OtherSettings"
import { SocialSecurityBenefits } from "./SocialSecurityBenefits"

const mathjs = create(all, {})

export function InputForm() {
  function handleShareClick() {
    navigator.share({
      title: "Retirement Calculator",
      text: "Retirement Calculator",
      url: window.location.href,
    })
  }

  const browserSupportsShare = !!global.navigator?.share

  return (
    <Stack spacing={3}>
      <Box padding={2}>
        <Stack spacing={2}>
          <Typography variant="h1">Retirement Calculator</Typography>
          <Typography>
            Save your data by copying the URL which contains your data encoded.
            You can bookmark this page to save your data.
          </Typography>
          {/* native share button  */}
          {browserSupportsShare && (
            <Stack direction="row">
              <Button
                onClick={handleShareClick}
                variant="contained"
                startIcon={<IosShareIcon />}
              >
                Share
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      <Ages />
      <IncomeNeeded />
      <SocialSecurityBenefits />
      <AssetBuckets />
      <OtherSettings />
    </Stack>
  )
}
