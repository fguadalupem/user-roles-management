import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos QBIT
        'qbit-blue': {
          DEFAULT: '#005EB8',
          light: '#0077D4',
          dark: '#004A94',
        },
        'qbit-green': {
          DEFAULT: '#8DC63F',
          light: '#A5D55F',
          dark: '#75AD2F',
        },
        'snow': '#FAFAFA',
        'smoke': '#F5F5F5',
        'steel': {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#1A1D20',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-qbit': 'linear-gradient(135deg, #005EB8 0%, #0077D4 100%)',
        'gradient-qbit-green': 'linear-gradient(135deg, #8DC63F 0%, #75AD2F 100%)',
      },
    },
  },
  plugins: [],
}

export default config