const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "process": require.resolve("process"),
    "util": require.resolve("util"),
    "assert": require.resolve("assert"),
    "url": require.resolve("url"),
    "vm": require.resolve("vm-browserify"),
    "fs": false,
    "net": false,
    "tls": false,
    "child_process": false,
  };

  // Add plugins for global variables
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process',
    }),
  ];

  // Suppress source-map-loader warnings from selected node_modules packages
  if (config.module && Array.isArray(config.module.rules)) {
    config.module.rules.forEach(rule => {
      if (!rule) return;

      const uses = rule.use || rule.loader || rule.oneOf;
      const ruleUses = Array.isArray(uses) ? uses : uses ? [uses] : [];

      if (
        rule.enforce === 'pre' &&
        ruleUses.some(u => {
          if (typeof u === 'string') return u.includes('source-map-loader');
          if (u && typeof u.loader === 'string') return u.loader.includes('source-map-loader');
          return false;
        })
      ) {
        // Exclude all node_modules from source-map-loader to avoid missing TS source warnings
        const excludeRegex = /node_modules[\\/]/;

        if (Array.isArray(rule.exclude)) {
          rule.exclude.push(excludeRegex);
        } else if (rule.exclude) {
          rule.exclude = [rule.exclude, excludeRegex];
        } else {
          rule.exclude = excludeRegex;
        }
      }
    });
  }

  return config;
};
