import { MapPin, Thermometer, Droplets, Wind } from 'lucide-react'
import WeatherIcon from './WeatherIcon'

export function CurrentWeather({ city, currentWeather, weatherInfo }) {
  if (!currentWeather || !weatherInfo) return null

  return (
    <article className="card weather-card">
      <div className="card-header">
        <span className="card-badge">현재 날씨</span>
        <span className="city-location">
          <MapPin size={16} /> {city?.name}
        </span>
      </div>

      <div className="weather-main-info">
        <div className="weather-icon-wrapper" style={{ color: weatherInfo.color }}>
          <WeatherIcon name={weatherInfo.icon} size={72} color={weatherInfo.color} />
        </div>
        <div className="weather-temp-group">
          <div className="current-temp">
            {Math.round(currentWeather.temperature_2m ?? 0)}
            <span className="unit">°C</span>
          </div>
          <span
            className="weather-desc-badge"
            style={{
              backgroundColor: `${weatherInfo.color}20`,
              color: weatherInfo.color,
            }}
          >
            {weatherInfo.label}
          </span>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <Thermometer size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">체감 온도</span>
            <span className="detail-value">
              {Math.round(currentWeather.apparent_temperature ?? 0)}°C
            </span>
          </div>
        </div>

        <div className="detail-item">
          <Droplets size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">상대 습도</span>
            <span className="detail-value">{currentWeather.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="detail-item">
          <Wind size={18} className="detail-icon" />
          <div className="detail-text">
            <span className="detail-label">풍속</span>
            <span className="detail-value">{currentWeather.wind_speed_10m} m/s</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CurrentWeather

