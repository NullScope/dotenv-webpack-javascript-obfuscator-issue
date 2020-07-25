// Webpack Loader version of this webpack plugin - https://github.com/mrsteele/dotenv-webpack
const dotenv = require('dotenv-defaults');
const fs = require('fs');
const loaderUtils = require('loader-utils');

// Mostly taken from here: https://github.com/motdotla/dotenv-expand/blob/master/lib/main.js#L4
const interpolate = (env, vars) => {
  const matches = env.match(/\$([a-zA-Z0-9_]+)|\${([a-zA-Z0-9_]+)}/g) || [];
  let newEnv;

  matches.forEach((match) => {
    const key = match.replace(/\$|{|}/g, '');
    let variable = vars[key] || '';
    variable = interpolate(variable, vars);
    newEnv = env.replace(match, variable);
  });

  return newEnv;
};

module.exports = (content) => {
  const options = loaderUtils.getOptions(this);
  const config = { path: './.env', ...options };

  const initializeVars = () => (config.systemvars ? { ...process.env } : {});

  /**
   * Displays a console message if 'silent' is falsey
   * @param {String} msg - The message.
   * @param {Boolean} silent - If true, display the message, if false, suppress the message.
   */
  const warn = (msg, silent) => (!silent && console.warn(msg));

  /**
   * Load a file.
   * @param {String} config.file - The file to load.
   * @param {Boolean} config.silent - If true, suppress warnings, if false, display warnings.
   * @returns {Object}
   */
  const loadFile = ({ file, silent }) => {
    try {
      return fs.readFileSync(file, 'utf8');
    } catch (err) {
      warn(`Failed to load ${file}.`, silent);
      return {};
    }
  };

  const getDefaults = () => {
    const { silent, defaults } = config;

    if (defaults) {
      return loadFile({
        file: defaults === true ? './.env.defaults' : defaults,
        silent,
      });
    }

    return '';
  };

  const getEnvs = () => {
    const { path, silent, safe } = config;

    const env = dotenv.parse(loadFile({
      file: path,
      silent,
    }), getDefaults());

    let blueprint = env;
    if (safe) {
      let file = './.env.example';
      if (safe !== true) {
        file = safe;
      }
      blueprint = dotenv.parse(loadFile({
        file,
        silent,
      }));
    }

    return {
      env,
      blueprint,
    };
  };

  const gatherVariables = () => {
    const { safe, allowEmptyValues } = config;
    const vars = initializeVars();

    const { env, blueprint } = getEnvs();

    Object.keys(blueprint).forEach((key) => {
      const value = Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : env[key];

      const isMissing = typeof value === 'undefined' || value === null
        || (!allowEmptyValues && value === '');

      if (safe && isMissing) {
        throw new Error(`Missing environment variable: ${key}`);
      } else {
        vars[key] = value;
      }
    });

    // add the leftovers
    if (safe) {
      Object.assign(vars, env);
    }

    return vars;
  };

  const formatData = (vars = {}) => {
    const { expand } = config;
    return Object.keys(vars).reduce((obj, key) => {
      const v = vars[key];
      const vKey = `process.env.${key}`;
      let vValue;
      const newObj = obj;

      if (expand) {
        if (v.substring(0, 2) === '\\$') {
          vValue = v.substring(1);
        } else if (v.indexOf('\\$') > 0) {
          vValue = v.replace(/\\\$/g, '$');
        } else {
          vValue = interpolate(v, vars);
        }
      } else {
        vValue = v;
      }

      newObj[vKey] = JSON.stringify(vValue);

      return newObj;
    }, {});
  };

  const data = formatData(gatherVariables());
  let newContent = content;

  Object.keys(data).forEach((key) => {
    newContent = newContent.replace(key, data[key]);
  });

  return newContent;
};
