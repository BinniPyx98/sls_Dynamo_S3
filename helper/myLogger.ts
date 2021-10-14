import SimpleNodeLogger from 'simple-node-logger';

 const logger = SimpleNodeLogger.createRollingFileLogger({
  logDirectory: './',
  dateFormat: 'DD.MM.YYYY',
  fileNamePattern: 'info_<DATE>.log',
  //RollingInterval.Day
});
export default logger;
