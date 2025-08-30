module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        ios: '9.0',
        safari: '9.0',
        browsers: ['> 0.5%', 'last 2 versions']
      },
      useBuiltIns: 'entry',
      corejs: 3,
      modules: false
    }]
  ]
}
