import { Box, useTheme } from "@mui/material"

interface ModDialProps {
  modulus: number
  remainder: number
  sum: number
}

// 合計を modulus で割った余りを時計のような円で表示する。0 の位置が「負け」のマス。
export default function ModDial({ modulus, remainder, sum }: ModDialProps) {
  const theme = useTheme()
  const palette = (theme.vars ?? theme).palette
  const size = 168
  const center = size / 2
  const radius = 64

  return (
    <Box
      sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}
      role="img"
      aria-label={`合計 ${sum}、${modulus}で割った余りは ${remainder}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={center} cy={center} r={radius} fill="none" style={{ stroke: palette.divider }} strokeWidth={2} />
        {Array.from({ length: modulus }, (_, index) => {
          const angle = (index / modulus) * Math.PI * 2 - Math.PI / 2
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          const active = index === remainder
          const isZero = index === 0
          const fill = active
            ? palette.primary.main
            : isZero
              ? palette.error.main
              : palette.background.paper
          const textColor = active || isZero ? "#fff" : palette.text.secondary

          return (
            <g key={index} style={{ transition: "all 0.3s ease" }}>
              <circle
                cx={x}
                cy={y}
                r={active ? 15 : 12}
                style={{ fill, stroke: active || isZero ? "none" : palette.divider }}
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={active ? 14 : 12}
                fontWeight={700}
                style={{ fill: textColor }}
              >
                {index}
              </text>
            </g>
          )
        })}
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <Box>
          <Box sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 700, letterSpacing: "0.1em" }}>合計</Box>
          <Box sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{sum}</Box>
        </Box>
      </Box>
    </Box>
  )
}
