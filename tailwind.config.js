/** @type {import('tailwindcss').Config} */
// 디자인 토큰: UX 리서치 합성 결과 (블랙 베이스 + 단일 전기블루 액센트 + tabular 큰 숫자).
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0E0F11', // base 배경
        surface: {
          1: '#16181C', // 카드/탭바
          2: '#1E2126', // 바텀시트/보조버튼
          3: '#262A30' // 핸들/미선택 근육 실루엣
        },
        border: {
          subtle: '#2C3036'
        },
        text: {
          primary: '#F2F4F7',
          secondary: '#9BA1AC',
          muted: '#5C636E'
        },
        accent: {
          DEFAULT: '#3D7DFF', // 전기블루 (단일 액센트)
          subtle: '#16233F', // accent 12% 틴트
          text: '#0E0F11'
        },
        pr: '#34D399', // success/PR
        danger: '#F87171',
        warn: '#FBBF24'
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
        card: '0 1px 0 rgba(255,255,255,0.04)'
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
