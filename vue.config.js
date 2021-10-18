module.exports = {
  devServer: {
    disableHostCheck: true,
    host: 'localhost',
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
      builderOptions: {
        appId: 'com.jacobspectormd.bbdash',
        // mac: {
        //   icon: 'build/icons/icon.png',
        // },
        win: {
          icon: 'build/icons/icon.png',
          target: ['portable'],
        },
      },
      nodeIntegration: true,
      externals: ['sqlite3'],
      enableRemoteModule: true,
      preload: 'src/preload.js',
    },
  },
}
