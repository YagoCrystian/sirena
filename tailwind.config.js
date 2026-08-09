/** @type {import('tailwindcss').Config} */
module.exports = {
    content:[
      "./index.html",
      "./script.js"
    ],
    theme: {
      extend: {
        colors: {
          ocean:    { DEFAULT:'#0D3B66', light:'#1296DB', dark:'#092944' },
          turquoise:{ DEFAULT:'#1296DB', light:'#4DB8E8' },
          mint:     { DEFAULT:'#F45BA3', light:'#F8A0C9' },
          slate:    { DEFAULT:'#22313F', soft:'#5B6B78' },
          cardgray: '#F3F6F8'
        },
        fontFamily: {
          display: ['Poppins','sans-serif'],
          body: ['Inter','sans-serif']
        },
        boxShadow: {
          soft: '0 10px 30px -10px rgba(13,59,102,0.15)',
          softer: '0 4px 20px -6px rgba(13,59,102,0.12)',
          lift: '0 20px 40px -12px rgba(13,59,102,0.28)'
        },
        borderRadius: {
          xl2: '1.5rem'
        }
      }
    }
}

