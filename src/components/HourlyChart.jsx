import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export function HourlyChart({ hourly, currentTime }) {
  // 현재 시각 기준 향후 24시간 데이터 추출
  const hoursData = useMemo(() => {
    if (!hourly?.time || hourly.time.length === 0) return []

    let startIndex = 0
    if (currentTime) {
      const currentHourPrefix = currentTime.slice(0, 13) // "YYYY-MM-DDTHH"
      const foundIdx = hourly.time.findIndex((t) => t.startsWith(currentHourPrefix))
      if (foundIdx !== -1) {
        startIndex = foundIdx
      }
    }

    const count = 24
    const clampedStart = Math.min(startIndex, Math.max(0, hourly.time.length - count))
    const sliceEnd = clampedStart + count

    const times = hourly.time.slice(clampedStart, sliceEnd)
    const temps = hourly.temperature_2m.slice(clampedStart, sliceEnd)
    const codes = hourly.weather_code ? hourly.weather_code.slice(clampedStart, sliceEnd) : []

    return times.map((t, idx) => {
      const date = new Date(t)
      const hour = date.getHours()
      const hourLabel = idx === 0 ? '지금' : `${hour}시`
      const temp = Math.round(temps[idx] ?? 0)
      const code = codes[idx] ?? 0
      const weather = getWeatherInfo(code)

      return {
        time: t,
        hourLabel,
        temp,
        code,
        weather,
      }
    })
  }, [hourly, currentTime])

  if (hoursData.length === 0) return null

  // SVG 차트 좌표 계산
  const width = 840
  const height = 230
  const padLeft = 40
  const padRight = 40
  const padTop = 45
  const padBottom = 55
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom

  const temps = hoursData.map((d) => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp === 0 ? 1 : maxTemp - minTemp

  const points = hoursData.map((d, i) => {
    const x = padLeft + (i / (hoursData.length - 1)) * plotWidth
    const y = padTop + plotHeight - ((d.temp - minTemp) / tempRange) * plotHeight
    return { ...d, x, y }
  })

  // 폴리라인 및 폴리곤(면적 채우기) 좌표 문자열
  const linePointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPointsStr = `${points[0].x.toFixed(1)},${(height - padBottom + 15).toFixed(1)} ` +
    linePointsStr +
    ` ${points[points.length - 1].x.toFixed(1)},${(height - padBottom + 15).toFixed(1)}`

  return (
    <article className="card hourly-chart-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-badge">시간별 예보</span>
          <h3 className="section-title">
            <Clock size={16} /> 24시간 기온 추이
          </h3>
        </div>
        <div className="chart-temp-range-legend">
          <span className="range-item min">최저 {minTemp}°C</span>
          <span className="range-item max">최고 {maxTemp}°C</span>
        </div>
      </div>

      <div className="chart-svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="hourly-svg-chart"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="24시간 기온 변화 차트"
        >
          <defs>
            <linearGradient id="hourlyTempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 배경 그라데이션 영역 */}
          <polygon points={areaPointsStr} fill="url(#hourlyTempGradient)" />

          {/* 기준 가이드라인 (최저, 최고) */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={width - padRight}
            y2={padTop}
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />
          <line
            x1={padLeft}
            y1={padTop + plotHeight}
            x2={width - padRight}
            y2={padTop + plotHeight}
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />

          {/* 꺾은선 */}
          <polyline
            points={linePointsStr}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 및 라벨 */}
          {points.map((p, idx) => {
            const isMajor = idx % 3 === 0 || idx === points.length - 1 || p.temp === maxTemp || p.temp === minTemp
            const isMax = p.temp === maxTemp
            const isMin = p.temp === minTemp

            return (
              <g key={p.time} className="chart-point-group">
                {/* 수직 점선 (주요 포인트) */}
                {isMajor && (
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2={height - padBottom + 8}
                    stroke="var(--border)"
                    strokeDasharray="2 2"
                    strokeOpacity="0.5"
                  />
                )}

                {/* 데이터 점 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isMax || isMin ? 5 : isMajor ? 4 : 2.5}
                  className={`chart-circle ${isMax ? 'is-max' : isMin ? 'is-min' : ''}`}
                />

                {/* 기온 텍스트 (주요 시간대 표시) */}
                {isMajor && (
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className={`chart-temp-label ${isMax ? 'label-max' : isMin ? 'label-min' : ''}`}
                  >
                    {p.temp}°
                  </text>
                )}

                {/* 시간 레이블 (3시간 간격) */}
                {(idx % 3 === 0 || idx === points.length - 1) && (
                  <text
                    x={p.x}
                    y={height - padBottom + 25}
                    textAnchor="middle"
                    className="chart-time-label"
                  >
                    {p.hourLabel}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* 모바일 가로 스크롤 카드 리스트 (보조 뷰) */}
      <div className="hourly-chips-scroll">
        {hoursData.map((d, i) => (
          <div key={d.time} className={`hourly-chip ${i === 0 ? 'current' : ''}`}>
            <span className="chip-time">{d.hourLabel}</span>
            <div className="chip-icon" style={{ color: d.weather.color }}>
              <WeatherIcon name={d.weather.icon} size={22} color={d.weather.color} />
            </div>
            <span className="chip-temp">{d.temp}°</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export default HourlyChart

