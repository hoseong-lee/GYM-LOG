/** @type {import('tailwindcss').Config} */
// 시맨틱 컬러 토큰은 CSS 변수(공백구분 RGB)로 정의(src/assets/styles/main.css)하고
// 여기서 rgb(var(--x) / <alpha-value>) 패턴으로 노출한다 → 라이트/다크 자동 전환 + 알파 유틸 지원.
const c = (v) => `rgb(var(${v}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('--bg'),
        surface: {
          1: c('--surface-1'),
          2: c('--surface-2'),
          3: c('--surface-3')
        },
        border: {
          subtle: c('--border-subtle')
        },
        text: {
          primary: c('--text-primary'),
          secondary: c('--text-secondary'),
          muted: c('--text-muted')
        },
        accent: {
          DEFAULT: c('--accent'),
          subtle: c('--accent-subtle'),
          text: c('--accent-text')
        },
        pr: c('--pr'),
        danger: c('--danger'),
        warn: c('--warn')
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'sans-serif'
        ]
      },
      fontSize: {
        'num-display': ['36px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['24px', { lineHeight: '30px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '26px', fontWeight: '600' }],
        unit: ['13px', { lineHeight: '16px', fontWeight: '500' }]
      },
      borderRadius: {
        card: '16px',
        sheet: '24px',
        field: '12px',
        pill: '9999px'
      },
      boxShadow: {
        sheet: '0 -8px 32px rgba(0,0,0,0.45)',
        card: '0 1px 2px rgba(0,0,0,0.06)'
      },
      spacing: {
        tap: '44px',
        'tap-edge': '48px',
        tabbar: '56px',
        gutter: '16px'
      },
      transitionTimingFunction: {
        'ease-out-std': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        tap: '120ms',
        std: '200ms',
        sheet: '340ms'
      }
    }
  },
  plugins: []
}
