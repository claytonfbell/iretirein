import { Box, LinearProgress } from "@mui/material"
import { useEffect, useRef, useState } from "react"

interface Props {
  progress: number
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(0)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (ref.current) {
        setWidth(ref.current.clientWidth)
      }
    })
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

export function ProgressBar({ progress }: Props) {
  const { ref: containerRef, width: containerWidth } = useWidth()
  const { ref: labelRef, width: labelWidth } = useWidth()

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
      }}
    >
      <LinearProgress
        sx={{ height: 32, borderRadius: 6 }}
        value={progress}
        variant="determinate"
      />
      <Box
        ref={labelRef}
        sx={{
          position: "absolute",
          bottom: 4,
          left: containerWidth / 2 - labelWidth / 2,
        }}
      >
        Portfolio today + SS could meet {progress.toFixed(1)}% of goal
      </Box>
    </Box>
  )
}
