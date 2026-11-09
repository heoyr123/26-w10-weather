import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather'
import {
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react'
import CitySearch from './components/CitySearch'
import RecentCities from './components/RecentCities'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

const RECENT_CITIES_STORAGE_KEY = 'weather_recent_cities_v1'
const THEME_MODE_STORAGE_KEY = 'weather_theme_mode_v1'

// WMO 기상 코드별 카테고리 식별자 반환
function getWeatherStateClass(weatherCode) {
  if (weatherCode === undefined || weatherCode === null) return 'weather-clear'
  if (weatherCode >= 95) return 'weather-thunderstorm'
  if (weatherCode >= 71 && weatherCode <= 77) return 'weather-snow'
  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return 'weather-rain'
  if (weatherCode === 45 || weatherCode === 48) return 'weather-fog'
  if (weatherCode === 2 || weatherCode === 3) return 'weather-cloudy'
  return 'weather-clear'
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 라이트/다크 모드 상태 (기본값: 'light')
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_MODE_STORAGE_KEY) || 'light'
    } catch {
      return 'light'
    }
  })

  const toggleThemeMode = () => {
    setThemeMode((prev) => {
      const nextMode = prev === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode)
      } catch (e) {
        console.error('테마 모드 저장 실패:', e)
      }
      return nextMode
    })
  }

  // 최근 본 도시 로컬스토리지 상태 관리 (옵션 B)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const saveRecentCity = useCallback((city) => {
    if (!city || !city.name) return
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== city.name)
      const updated = [city, ...filtered].slice(0, 5)
      try {
        localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('로컬스토리지 저장 실패:', e)
      }
      return updated
    })
  }, [])

  const handleRemoveRecentCity = (cityName) => {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName)
      try {
        localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  const handleClearRecentCities = () => {
    setRecentCities([])
    try {
      localStorage.removeItem(RECENT_CITIES_STORAGE_KEY)
    } catch (e) {
      console.error(e)
    }
  }

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
          saveRecentCity(selectedCity)
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
  }, [selectedCity, refreshTrigger, saveRecentCity])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSelectSearchedCity = (city) => {
    setSelectedCity(city)
  }

  const currentWeather = weatherData?.current
  const currentAQ = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const aqStatus = currentAQ ? getAirQualityStatus(currentAQ.pm10, currentAQ.pm2_5) : null

  // 기상 상태 클래스 및 종합 테마 클래스 산출
  const weatherStateClass = getWeatherStateClass(currentWeather?.weather_code)
  const fullThemeClass = `mode-${themeMode} ${weatherStateClass}`

  return (
    <div className={`weather-app-wrapper ${fullThemeClass}`}>
      <div className="weather-dashboard">
        {/* 1. 헤더 영역 */}
        <header className="dashboard-header">
          <div className="header-title-box">
            <div className="header-badge-row">
              <h1 className="dashboard-title">실시간 기상 대시보드</h1>
              {weatherInfo && (
                <span
                  className="weather-theme-indicator"
                  style={{
                    backgroundColor: `${weatherInfo.color}25`,
                    borderColor: `${weatherInfo.color}60`,
                    color: weatherInfo.color,
                  }}
                >
                  <Sparkles size={12} />
                  {weatherInfo.label} 테마
                </span>
              )}
            </div>
            <p className="dashboard-subtitle">
              Open-Meteo 공개 API 기반 실시간 날씨, 24시간 추이, 주간 예보 및 대기질 모니터링
            </p>
          </div>

          <div className="header-meta">
            {/* 라이트 / 다크 모드 토글 버튼 */}
            <ThemeToggle themeMode={themeMode} onToggle={toggleThemeMode} />

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

        {/* 2. 도시 검색 및 선택 영역 */}
        <section className="search-and-presets-section" aria-label="도시 검색 및 선택">
          <CitySearch onSelectCity={handleSelectSearchedCity} />

          {/* 최근 본 도시 뱃지 */}
          <RecentCities
            cities={recentCities}
            onSelectCity={setSelectedCity}
            onRemoveCity={handleRemoveRecentCity}
            onClearAll={handleClearRecentCities}
          />

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

        {/* 3. 본문 대시보드 상태 */}
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
            <div className={`dashboard-sections-container ${loading ? 'updating' : ''}`}>
              {/* 상단 2열 카드: 현재 날씨 & 대기질 지수 */}
              <div className="cards-grid">
                <CurrentWeather
                  city={selectedCity}
                  currentWeather={currentWeather}
                  weatherInfo={weatherInfo}
                />
                <AirQualityCard
                  currentAQ={currentAQ}
                  aqStatus={aqStatus}
                />
              </div>

              {/* 중단: 24시간 기온 추이 차트 */}
              <HourlyChart
                hourly={weatherData.hourly}
                currentTime={currentWeather?.time}
              />

              {/* 하단: 7일간 주간 예보 */}
              <WeeklyForecast
                daily={weatherData.daily}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
