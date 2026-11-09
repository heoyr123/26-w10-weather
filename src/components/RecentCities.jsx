import { History, X, Trash2 } from 'lucide-react'

export function RecentCities({ cities, onSelectCity, onRemoveCity, onClearAll }) {
  if (!cities || cities.length === 0) return null

  return (
    <div className="recent-cities-section">
      <div className="recent-header">
        <span className="recent-title">
          <History size={13} /> 최근 본 도시
        </span>
        {cities.length > 1 && (
          <button
            type="button"
            className="clear-all-btn"
            onClick={onClearAll}
            title="기록 모두 지우기"
          >
            <Trash2 size={12} /> 전체 삭제
          </button>
        )}
      </div>

      <div className="recent-chips-list">
        {cities.map((city) => (
          <div key={`${city.name}-${city.lat}-${city.lon}`} className="recent-chip">
            <button
              type="button"
              className="recent-chip-btn"
              onClick={() => onSelectCity(city)}
            >
              {city.name}
            </button>
            <button
              type="button"
              className="recent-chip-remove"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveCity(city.name)
              }}
              title="삭제"
              aria-label={`${city.name} 최근 기록 삭제`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentCities

