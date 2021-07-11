module.exports = {
  presets: [
    process.env.NODE_ENV === 'test'
      ? '@babel/preset-env'
      : '@babel/preset-react'
  ],
  plugins: ['@babel/plugin-transform-runtime']
}
