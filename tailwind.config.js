/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        'gradient-pulse': 'gradientPulse 4s ease-in-out infinite',
      },
      keyframes: {
        gradientPulse: {
          '0%, 100%': {
            backgroundPosition: 'center',
            backgroundSize: '100% 100%',
            opacity: '1',
            filter: 'blur(0px)',
          },
          '50%': {
            backgroundPosition: 'top left',
            backgroundSize: '110% 110%',
            opacity: '0.5',
            filter: 'blur(0.5px)',
          },
        },
      },
    },
  },
  plugins: [],
}
