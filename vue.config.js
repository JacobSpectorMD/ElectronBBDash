module.exports = {
  devServer: {
    disableHostCheck: true,
  },

  transpileDependencies: ['vuetify'],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
    electronBuilder: {
      nodeIntegration: true,
      externals: ['sqlite3'],
      enableRemoteModule: true,
      preload: 'src/preload.js',
    },
  },
}
