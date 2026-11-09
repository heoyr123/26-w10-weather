import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ themeMode, onToggle }) {
  const isDark = themeMode === 'dark'

  return (
    <button
      type="button"
      className="theme-mode-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <div className={`toggle-icon-wrap ${isDark ? 'dark' : 'light'}`}>
        {isDark ? <Moon size={15} /> : <Sun size={15} />}
      </div>
      <span className="toggle-label">{isDark ? '다크 모드' : '라이트 모드'}</span>
    </button>
  )
}

export default ThemeToggle

