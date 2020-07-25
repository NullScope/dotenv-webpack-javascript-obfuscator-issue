const path = require('path');

const rules = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true
      }
    }
  },
  {
    test: /\.(tsx?|jsx?)$/i,
    exclude: /(node_modules|\.webpack)/,
    include: path.resolve(__dirname, 'src'),
    enforce: 'post',
    use: [
      {
        loader: 'obfuscator-loader',
        options: {
          compact: true,
          controlFlowFlattening: false,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: false,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: false,
          debugProtectionInterval: false,
          disableConsoleOutput: false,
          domainLock: [],
          identifierNamesGenerator: 'hexadecimal',
          identifiersDictionary: [],
          identifiersPrefix: '',
          inputFileName: '',
          log: false,
          numbersToExpressions: false,
          renameGlobals: false,
          renameProperties: false,
          reservedNames: [],
          reservedStrings: [],
          rotateStringArray: true,
          seed: 0,
          selfDefending: false,
          shuffleStringArray: true,
          simplify: true,
          sourceMap: false,
          sourceMapBaseUrl: '',
          sourceMapFileName: '',
          sourceMapMode: 'separate',
          splitStrings: false,
          splitStringsChunkLength: 10,
          stringArray: true,
          stringArrayEncoding: false,
          stringArrayThreshold: 0.75,
          target: 'browser',
          transformObjectKeys: false,
          unicodeEscapeSequence: false
        },
      },
    ],
  }
];

module.exports = rules;
