const esModules = ['nanoid'].join('|');
/*
If, after upgrading/installing new dependencies, jest complains about 
"cannot use import outside of module" and has a dependency in that trace, add the
dependency to this list of esModules, so that it will be transformed into ESM
*/

module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
