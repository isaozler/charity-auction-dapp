// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

// TODO: remove dependencies
// eslint-plugin-import
// eslint-plugin-react
// eslint-plugin-simple-import-sort
// and make sure @kadena-dev/eslint-config has them as dependencies instead of devDependencies
module.exports = {
  extends: [
    'next/core-web-vitals',
    // '@kadena-dev/eslint-config/profile/react'
  ],
  parserOptions: { tsconfigRootDir: __dirname },
};
