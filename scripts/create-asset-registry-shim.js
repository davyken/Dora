/**
 * react-native-svg@15.x (and anything else importing the old
 * `@react-native/assets-registry/registry` module path) hasn't caught up
 * to React Native 0.87 removing that standalone package in favor of the
 * `react-native/asset-registry` export. Until upstream fixes this, this
 * script recreates a tiny compatible shim after every install so `npm
 * install` / `npm ci` keeps working without manual node_modules surgery.
 *
 * Safe to delete this whole workaround once react-native-svg (or whatever
 * else needs it) ships a release that imports `react-native/asset-registry`
 * directly instead of the old package name.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'node_modules', '@react-native', 'assets-registry');
fs.mkdirSync(dir, {recursive: true});

fs.writeFileSync(
  path.join(dir, 'package.json'),
  JSON.stringify(
    {
      name: '@react-native/assets-registry',
      version: '0.0.0-shim',
      main: 'registry.js',
    },
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(dir, 'registry.js'),
  // Requiring the concrete file path (rather than the `react-native/asset-registry`
  // package export) also works under Jest's react-native preset, whose
  // moduleNameMapper rewrites `react-native/*` to a literal node_modules path
  // instead of honoring package.json "exports".
  "module.exports = require('react-native/src/asset-registry.js');\n",
);

console.log('[postinstall] @react-native/assets-registry shim written');
