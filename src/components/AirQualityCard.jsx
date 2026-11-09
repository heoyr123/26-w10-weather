export function AirQualityCard({ currentAQ, aqStatus }) {
  if (!currentAQ || !aqStatus) return null

  const getPm10Status = (val) => {
    if (val > 150) return { label: '매우나쁨', color: '#ef4444' }
    if (val > 80) return { label: '나쁨', color: '#f97316' }
    if (val > 30) return { label: '보통', color: '#3b82f6' }
    return { label: '좋음', color: '#10b981' }
  }

  const getPm25Status = (val) => {
    if (val > 75) return { label: '매우나쁨', color: '#ef4444' }
    if (val > 35) return { label: '나쁨', color: '#f97316' }
    if (val > 15) return { label: '보통', color: '#3b82f6' }
    return { label: '좋음', color: '#10b981' }
  }

  const pm10Info = getPm10Status(currentAQ.pm10)
  const pm25Info = getPm25Status(currentAQ.pm2_5)

  return (
    <article className="card air-quality-card">
      <div className="card-header">
        <span className="card-badge">대기질 지수</span>
        <span
          className="aq-status-badge"
          style={{ backgroundColor: aqStatus.badgeColor }}
        >
          {aqStatus.status}
        </span>
      </div>

      <div className="aq-metrics-list">
        <div className="aq-metric-box">
          <div className="aq-metric-header">
            <span className="metric-name">미세먼지 (PM10)</span>
            <span className="metric-status-text" style={{ color: pm10Info.color }}>
              {pm10Info.label}
            </span>
          </div>
          <div className="metric-val-row">
            <span className="metric-value">{Math.round(currentAQ.pm10 ?? 0)}</span>
            <span className="metric-unit">㎍/㎥</span>
          </div>
          <div className="aq-guide-bar">
            <span className="guide-legend">기준: ~30 좋음 / ~80 보통 / ~150 나쁨</span>
          </div>
        </div>

        <div className="aq-metric-box">
          <div className="aq-metric-header">
            <span className="metric-name">초미세먼지 (PM2.5)</span>
            <span className="metric-status-text" style={{ color: pm25Info.color }}>
              {pm25Info.label}
            </span>
          </div>
          <div className="metric-val-row">
            <span className="metric-value">{Math.round(currentAQ.pm2_5 ?? 0)}</span>
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
  )
}

export default AirQualityCard

