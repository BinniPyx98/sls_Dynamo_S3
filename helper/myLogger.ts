import SimpleNodeLogger from 'simple-node-logger';

export const logger = SimpleNodeLogger.createRollingFileLogger({
  logDirectory: './src/logger',
  dateFormat: 'DD.MM.YYYY',
  fileNamePattern: 'info_<DATE>.log',
  //RollingInterval.Day
});
