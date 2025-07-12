module.exports = {
  content: [
    "./**/*.html",
    "./**/*.md",
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/**/*.md"
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
