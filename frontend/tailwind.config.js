/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080A0E',
        obsidian: {
          DEFAULT: '#080A0E',
          deep: '#05070A',
          subtle: '#0C0F14',
          surface: '#11151B',
          surface2: '#151A21',
          surface3: '#1A2028',
        },
        warm: {
          white: '#F3F0E8',
          muted: '#D8D4CA',
          secondary: '#8E8A82',
          subtle: '#6E6A63',
          border: 'rgba(243, 240, 232, 0.08)',
          'border-strong': 'rgba(243, 240, 232, 0.16)',
        },
        signal: {
          orange: '#FF6B35',
          light: '#FF804F',
          dark: '#D94F20',
          subtle: 'rgba(255, 107, 53, 0.12)',
          border: 'rgba(255, 107, 53, 0.30)',
        },
        // Restrained semantic status colors
        semantic: {
          success: '#10B981',
          'success-subtle': 'rgba(16, 185, 129, 0.12)',
          warning: '#FF6B35',
          'warning-subtle': 'rgba(255, 107, 53, 0.12)',
          error: '#EF4444',
          'error-subtle': 'rgba(239, 68, 68, 0.12)',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'orange-glow': '0 0 24px rgba(255, 107, 53, 0.15)',
        'orange-sm': '0 0 12px rgba(255, 107, 53, 0.20)',
        'card-elevated': '0 8px 30px rgba(0, 0, 0, 0.40)',
      }
    },
  },
  plugins: [],
}
