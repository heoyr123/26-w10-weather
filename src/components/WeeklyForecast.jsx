import { useMemo } from 'react'
import { CalendarDays, Droplets } from 'lucide-react'
import WeatherIcon from './WeatherIcon'
import { getWeatherInfo } from '../api/weather'

export function WeeklyForecast({ daily }) {
  const daysList = useMemo(() => {
    if (!daily?.time || daily.time.length === 0) return []

    const dayNames = ['일', '월', '화', '수', '목', '금', '토']

    const maxTemps = daily.temperature_2m_max || []
    const minTemps = daily.temperature_2m_min || []
    const codes = daily.weather_code || []
    const precipProb = daily.precipitation_probability_max || []

    const globalMin = Math.min(...minTemps.filter((n) => typeof n === 'number'))
    const globalMax = Math.max(...maxTemps.filter((n) => typeof n === 'number'))
    const globalRange = globalMax - globalMin === 0 ? 1 : globalMax - globalMin

    return daily.time.slice(0, 7).map((dateStr, idx) => {
      const date = new Date(dateStr)
      const dayOfWeek = dayNames[date.getDay()]
      const formattedDate = `${date.getMonth() + 1}.${date.getDate()}`

      let label = `${formattedDate} (${dayOfWeek})`
      if (idx === 0) label = `오늘 (${formattedDate})`
      else if (idx === 1) label = `내일 (${formattedDate})`

      const code = codes[idx] ?? 0
      const weather = getWeatherInfo(code)
      const min = Math.round(minTemps[idx] ?? 0)
      const max = Math.round(maxTemps[idx] ?? 0)
      const rain = precipProb[idx] ?? 0

      // 주간 전체 기온 범위 내에서 막대 바의 시작점과 너비 비율 계산
      const barLeft = Math.max(0, ((min - globalMin) / globalRange) * 100)
      const barWidth = Math.max(10, ((max - min) / globalRange) * 100)

      return {
        dateStr,
        label,
        weather,
        min,
        max,
        rain,
        barLeft,
        barWidth,
      }
    })
  }, [daily])

  if (daysList.length === 0) return null

  return (
    <article className="card weekly-forecast-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-badge">주간 예보</span>
          <h3 className="section-title">
            <CalendarDays size={16} /> 7일간 날씨 및 기온 전망
          </h3>
        </div>
      </div>

      <div className="weekly-rows-list">
        {daysList.map((day) => (
          <div key={day.dateStr} className="weekly-row">
            <div className="day-label-box">
              <span className="day-label">{day.label}</span>
            </div>

            <div className="day-weather-cell">
              <WeatherIcon name={day.weather.icon} size={24} color={day.weather.color} />
              <span className="weather-name">{day.weather.label}</span>
            </div>

            <div className="day-rain-cell">
              {day.rain > 0 ? (
                <span className="rain-badge">
                  <Droplets size={12} /> {day.rain}%
                </span>
              ) : (
                <span className="rain-none">-</span>
              )}
            </div>

            <div className="day-temp-range-cell">
              <span className="temp-min">{day.min}°</span>
              <div className="temp-range-bar-track">
                <div
                  className="temp-range-bar-fill"
                  style={{
                    left: `${day.barLeft}%`,
                    width: `${day.barWidth}%`,
                  }}
                />
              </div>
              <span className="temp-max">{day.max}°</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default WeeklyForecast

