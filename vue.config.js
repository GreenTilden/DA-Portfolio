const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/da-portfolio/' // Replace with your repository name
    : '/',
  outputDir: 'docs'  // GitHub Pages will serve content from /docs folder
})