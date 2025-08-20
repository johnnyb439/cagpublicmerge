import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dynamic-green': '#10B981',
        'emerald-green': '#059669',
        'forest-green': '#047857',
        'dynamic-blue': '#0891B2',
        'sky-blue': '#0EA5E9',
        'navy-blue': '#1E40AF',
        'patriot-red': '#DC2626',
        'opportunity-orange': '#F97316',
        'command-black': '#000000',
        'base-white': '#FFFFFF',
        'ops-charcoal': '#1F2937',
        'intel-gray': '#6B7280',
        'cyber-cyan': '#06B6D4'
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif']
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #047857 0%, #10B981 25%, #0891B2 50%, #0EA5E9 75%, #1E40AF 100%)',
        'professional-gradient': 'linear-gradient(180deg, #000000 0%, #1F2937 100%)',
        'tech-gradient': 'linear-gradient(90deg, #0891B2 0%, #10B981 100%)',
        'patriot-gradient': 'linear-gradient(90deg, #DC2626 0%, #FFFFFF 50%, #1E40AF 100%)'
      }
    },
  },
  plugins: [],
}
export default config