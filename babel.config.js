module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Existing
      ['react-native-worklets-core/plugin'], // <--- ADD THIS LINE
    ],
  };
};