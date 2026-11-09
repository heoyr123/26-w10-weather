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
} from 'lucide-react'

/**
 * WMO 날씨 코드 및 식별자에 매핑되는 Lucide 아이콘 렌더러
 */
export function WeatherIcon({ name, size = 24, color, strokeWidth = 2, className = '' }) {
  const props = { size, color, strokeWidth, className }
  switch (name) {
    case 'Sun':
      return <Sun {...props} />
    case 'SunDim':
      return <SunDim {...props} />
    case 'CloudSun':
      return <CloudSun {...props} />
    case 'Cloud':
      return <Cloud {...props} />
    case 'CloudFog':
      return <CloudFog {...props} />
    case 'CloudDrizzle':
      return <CloudDrizzle {...props} />
    case 'CloudRain':
      return <CloudRain {...props} />
    case 'Snowflake':
      return <Snowflake {...props} />
    case 'CloudLightning':
      return <CloudLightning {...props} />
    default:
      return <Cloud {...props} />
  }
}

export default WeatherIcon

