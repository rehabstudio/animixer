/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

if (
  process.argv.indexOf('--pre-render') !== -1 ||
  process.argv.indexOf('--prerender') !== -1
) {
  require('pre-render')('./build', ['/', '/about']);
}
