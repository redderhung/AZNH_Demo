/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const config = require('./config');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  appName: "tmpn",
  env: "dev",
  apiUrl: config.apiUrl,
  connectionString: config.connectionString,
  apiKey: "",
};
