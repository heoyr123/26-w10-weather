import { useState, useEffect } from 'react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react'
import './App.css'

// 날씨 코드에 매핑되는 Lucide 아이콘 컴포넌트 렌더러
function WeatherIcon({ name, size = 48, color }) {
  const iconProps = { size, color, strokeWidth: 2 }
  switch (name) {
    case 'Sun':
      return <Sun {...iconProps} />
    case 'SunDim':
      return <SunDim {...iconProps} />
    case 'CloudSun':
      return <CloudSun {...iconProps} />
    case 'Cloud':
      return <Cloud {...iconProps} />
    case 'CloudFog':
      return <CloudFog {...iconProps} />
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} />
    case 'CloudRain':
      return <CloudRain {...iconProps} />
    case 'Snowflake':
      return <Snowflake {...iconProps} />
    case 'CloudLightning':
      return <CloudLightning {...iconProps} />
    default:
      return <Cloud {...iconProps} />
  }
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const [weather, airQuality] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ])
        if (!ignore) {
          setWeatherData(weather)
          setAirQualityData(airQuality)
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          )
        }
      } catch (err) {
        console.error(err)
        if (!ignore) {
          setError('기상 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [selectedCity, refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const currentWeather = weatherData?.current
  const currentAQ = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

  return (
    <div className="weather-dashboard">
      {/* 헤더 영역 */}
      <header className="dashboard-header">
        <div className="header-title-box">
          <h1 className="dashboard-title">실시간 기상 대시보드</h1>
          <p className="dashboard-subtitle">
            Open-Meteo 공개 API 기반 실시간 날씨 및 대기질 모니터링
          </p>
        </div>
        <div className="header-meta">
          {lastUpdated && (
            <span className="last-updated">
              <Calendar size={14} /> 최근 갱신: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            title="새로고침"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            새로고침
          </button>
        </div>
      </header>

      {/* 도시 빠른 선택 탭 */}
      <section className="city-selector-section" aria-label="도시 선택">
        <div className="city-buttons-wrapper">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = city.name === selectedCity.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <MapPin size={14} />
                {city.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* 본문 대시보드 상태 */}
      <main className="dashboard-content">
        {loading && !weatherData && (
          <div className="status-box loading-box">
            <RefreshCw size={36} className="spinning" />
            <p>실시간 기상 정보를 불러오고 있습니다...</p>
          </div>
        )}

        {error && (
          <div className="status-box error-box">
            <AlertCircle size={36} color="#ef4444" />
            <h3>안내</h3>
            <p>{error}</p>
            <button
              type="button"
              className="retry-button"
              onClick={handleRefresh}
            >
              다시 시도
            </button>
          </div>
        )}

        {!error && weatherData && airQualityData && (
          <div className={`cards-grid ${loading ? 'updating' : ''}`}>
            {/* 1. 현재 날씨 카드 */}
            <article className="card weather-card">
              <div className="card-header">
                <span className="card-badge">현재 날씨</span>
                <span className="city-location">
                  <MapPin size={16} /> {selectedCity.name}
                </span>
              </div>

              <div className="weather-main-info">
                <div className="weather-icon-wrapper" style={{ color: weatherInfo?.color }}>
                  <WeatherIcon name={weatherInfo?.icon} size={72} color={weatherInfo?.color} />
                </div>
                <div className="weather-temp-group">
                  <div className="current-temp">
                    {Math.round(currentWeather?.temperature_2m ?? 0)}
                    <span className="unit">°C</span>
                  </div>
                  <span
                    className="weather-desc-badge"
                    style={{ backgroundColor: `${weatherInfo?.color}20`, color: weatherInfo?.color }}
                  >
                    {weatherInfo?.label}
                  </span>
                </div>
              </div>

              <div className="weather-details-grid">
                <div className="detail-item">
                  <Thermometer size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">체감 온도</span>
                    <span className="detail-value">
                      {Math.round(currentWeather?.apparent_temperature ?? 0)}°C
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <Droplets size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">상대 습도</span>
                    <span className="detail-value">
                      {currentWeather?.relative_humidity_2m}%
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <Wind size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">풍속</span>
                    <span className="detail-value">
                      {currentWeather?.wind_speed_10m} m/s
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* 2. 미세먼지 카드 */}
            <article className="card air-quality-card">
              <div className="card-header">
                <span className="card-badge">대기질 지수</span>
                <span
                  className="aq-status-badge"
                  style={{ backgroundColor: aqStatus?.badgeColor }}
                >
                  {aqStatus?.status}
                </span>
              </div>

              <div className="aq-metrics-list">
                <div className="aq-metric-box">
                  <div className="aq-metric-header">
                    <span className="metric-name">미세먼지 (PM10)</span>
                    <span className="metric-status-text" style={{ color: aqStatus?.badgeColor }}>
                      {currentAQ?.pm10 > 150 ? '매우나쁨' : currentAQ?.pm10 > 80 ? '나쁨' : currentAQ?.pm10 > 30 ? '보통' : '좋음'}
                    </span>
                  </div>
                  <div className="metric-val-row">
                    <span className="metric-value">{Math.round(currentAQ?.pm10 ?? 0)}</span>
                    <span className="metric-unit">㎍/㎥</span>
                  </div>
                  <div className="aq-guide-bar">
                    <span className="guide-legend">기준: ~30 좋음 / ~80 보통 / ~150 나쁨</span>
                  </div>
                </div>

                <div className="aq-metric-box">
                  <div className="aq-metric-header">
                    <span className="metric-name">초미세먼지 (PM2.5)</span>
                    <span className="metric-status-text" style={{ color: aqStatus?.badgeColor }}>
                      {currentAQ?.pm2_5 > 75 ? '매우나쁨' : currentAQ?.pm2_5 > 35 ? '나쁨' : currentAQ?.pm2_5 > 15 ? '보통' : '좋음'}
                    </span>
                  </div>
                  <div className="metric-val-row">
                    <span className="metric-value">{Math.round(currentAQ?.pm2_5 ?? 0)}</span>
                    <span className="metric-unit">㎍/㎥</span>
                  </div>
                  <div className="aq-guide-bar">
                    <span className="guide-legend">기준: ~15 좋음 / ~35 보통 / ~75 나쁨</span>
                  </div>
                </div>
              </div>

              <footer className="aq-footer">
                <small>※ 대한민국 환경부 통합대기환경지수(CAI) 등급 기준 준용</small>
              </footer>
            </article>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
