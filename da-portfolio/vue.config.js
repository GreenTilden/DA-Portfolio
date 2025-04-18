// vue.config.js - Configuration for GitHub Pages deployment
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/lab-automation-portfolio/' // Replace with your repository name
    : '/',
  outputDir: 'docs',  // GitHub Pages will serve from /docs folder
}