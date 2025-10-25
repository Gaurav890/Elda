import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			bg: '#F9FAFB',
  			surface: '#FFFFFF',
  			textPrimary: '#1A1A1A',
  			textSecondary: '#555555',
  			success: '#4CAF50',
  			warn: '#F9A825',
  			error: '#E53935',
  			severityLow: '#2196F3',
  			severityMedium: '#F9A825',
  			severityHigh: '#F57C00',
  			severityCritical: '#E53935',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))',
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-playfair-display)', 'Playfair Display', 'serif'],
  			body: ['var(--font-nunito-sans)', 'Nunito Sans', 'sans-serif'],
  			serif: ['var(--font-playfair-display)', 'Playfair Display', 'serif'],
  			sans: ['var(--font-nunito-sans)', 'Nunito Sans', 'sans-serif']
  		},
  		fontSize: {
  			h1: ['40px', { lineHeight: '1.2', fontWeight: '700' }],
  			h2: ['28px', { lineHeight: '1.3', fontWeight: '600' }],
  			body: ['18px', { lineHeight: '1.6', fontWeight: '400' }],
  			caption: ['14px', { lineHeight: '1.5', fontWeight: '400' }]
  		},
  		boxShadow: {
  			soft: '0 4px 16px rgba(0, 0, 0, 0.08)',
  			'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12)'
  		},
  		borderRadius: {
  			sm: '8px',
  			md: '12px',
  			lg: '16px',
  			xl: '20px'
  		},
  		transitionDuration: {
  			DEFAULT: '200ms'
  		},
  		transitionTimingFunction: {
  			DEFAULT: 'ease-in-out'
  		},
  		minHeight: {
  			button: '44px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
