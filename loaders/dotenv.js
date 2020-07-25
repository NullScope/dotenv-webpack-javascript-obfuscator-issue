// Webpack Loader version of this webpack plugin - https://github.com/mrsteele/dotenv-webpack
const dotenv = require('dotenv-defaults');
const fs = require('fs');

// Mostly taken from here: https://github.com/motdotla/dotenv-expand/blob/master/lib/main.js#L4
const interpolate = (env, vars) => {
  const matches = env.match(/\$([a-zA-Z0-9_]+)|\${([a-zA-Z0-9_]+)}/g) || []

  matches.forEach((match) => {
    const key = match.replace(/\$|{|}/g, '')
    let variable = vars[key] || ''
    variable = interpolate(variable, vars)
    env = env.replace(match, variable)
  })

  return env
}

module.exports = function(content) {
  const config = Object.assign({}, {
    path: './.env'
  }, {})

  const gatherVariables = () => {
    const { safe, allowEmptyValues } = config
    const vars = initializeVars()

    const { env, blueprint } = getEnvs()

    Object.keys(blueprint).map(key => {
      const value = Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : env[key]

      const isMissing = typeof value === 'undefined' || value === null ||
        (!allowEmptyValues && value === '')

      if (safe && isMissing) {
        throw new Error(`Missing environment variable: ${key}`)
      } else {
        vars[key] = value
      }
    })

    // add the leftovers
    if (safe) {
      Object.assign(vars, env)
    }

    return vars
  };

  const initializeVars = () => {
    return (config.systemvars) ? Object.assign({}, process.env) : {}
  }

  const getEnvs = () => {
    const { path, silent, safe } = config

    const env = dotenv.parse(loadFile({
      file: path,
      silent
    }), getDefaults())

    let blueprint = env
    if (safe) {
      let file = './.env.example'
      if (safe !== true) {
        file = safe
      }
      blueprint = dotenv.parse(loadFile({
        file,
        silent
      }))
    }

    return {
      env,
      blueprint
    }
  }

  const getDefaults = () => {
    const { silent, defaults } = config

    if (defaults) {
      return loadFile({
        file: defaults === true ? './.env.defaults' : defaults,
        silent
      })
    }

    return ''
  }

  const formatData = (vars = {}) => {
    const { expand } = config
    return Object.keys(vars).reduce((obj, key) => {
      const v = vars[key]
      const vKey = `process.env.${key}`
      let vValue
      if (expand) {
        if (v.substring(0, 2) === '\\$') {
          vValue = v.substring(1)
        } else if (v.indexOf('\\$') > 0) {
          vValue = v.replace(/\\\$/g, '$')
        } else {
          vValue = interpolate(v, vars)
        }
      } else {
        vValue = v
      }

      obj[vKey] = JSON.stringify(vValue)

      return obj
    }, {})
  }

  /**
   * Load a file.
   * @param {String} config.file - The file to load.
   * @param {Boolean} config.silent - If true, suppress warnings, if false, display warnings.
   * @returns {Object}
   */
  const loadFile = ({ file, silent }) => {
    try {
      return fs.readFileSync(file, 'utf8')
    } catch (err) {
      warn(`Failed to load ${file}.`, silent)
      return {}
    }
  }

  /**
   * Displays a console message if 'silent' is falsey
   * @param {String} msg - The message.
   * @param {Boolean} silent - If true, display the message, if false, suppress the message.
   */
  const warn = (msg, silent) => {
    !silent && console.warn(msg)
  }

  const data = formatData(gatherVariables());

  for (const key in data) {
    content = content.replace(key, data[key]);
  }

  return content;
};