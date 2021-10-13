import { getEnv } from '@helper/environment';
import { format } from '@redtea/format-axios-error';
// import SimpleNodeLogger from 'simple-node-logger';
// export const logger = SimpleNodeLogger.createRollingFileLogger({
//   logDirectory: './src/logger',
//   dateFormat: 'DD.MM.YYYY',
//   fileNamePattern: 'info_<DATE>.log',
//   //RollingInterval.Day
// });

export function log(...args): undefined {
  /**
   * Don't show the logs in CI for faster testing
   * Sometimes we turn off the logs in production environment for better performance
   */
  if (getEnv('CI', false) === 'true' || getEnv('HIDE_LOGS', false) === 'true') {
    return;
  }
  if (getEnv('IS_OFFLINE', false) === 'true') {
    args.forEach((i) => console.dir(i));
  } else {
    console.log(
      ...args.map((arg) => {
        /**
         * Axios error has complicated structure that doesn't allow debugging it easily
         */
        if (arg.isAxiosError) {
          return JSON.stringify(format(arg));
        }
        return JSON.stringify(arg);
      })
    );
  }
}
