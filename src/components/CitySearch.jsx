import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스(Debounce) 적용
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(trimmed)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 중 오류 발생:', err)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      setIsOpen(false)
    } else {
      setIsLoading(true)
    }
  }

  const handleSelect = (item) => {
    const region = item.admin1 ? ` (${item.admin1})` : ''
    const country = item.country ? ` · ${item.country}` : ''
    const displayName = `${item.name}${region}${country}`

    onSelectCity({
      name: displayName,
      lat: item.latitude,
      lon: item.longitude,
    })

    setQuery('')
    setIsOpen(false)
    setResults([])
    setIsLoading(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 검색 (영문 Seoul, Tokyo, London 등 2글자 이상 입력)..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          aria-label="도시 검색"
        />

        {isLoading && <Loader2 size={16} className="search-loader spinning" />}

        {!isLoading && query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="search-empty-state">
              검색 결과가 없습니다. 도시 영문명(예: Seoul, Busan, Jeju)을 입력해 보세요.
            </div>
          ) : (
            <ul className="search-results-list" role="listbox">
              {results.map((item) => (
                <li
                  key={`${item.id}-${item.latitude}-${item.longitude}`}
                  className="search-result-item"
                  role="option"
                  aria-selected="false"
                  onClick={() => handleSelect(item)}
                >
                  <MapPin size={16} className="item-icon" />
                  <div className="item-text">
                    <span className="item-name">{item.name}</span>
                    <span className="item-sub">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default CitySearch
