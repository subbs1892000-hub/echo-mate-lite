const formatMessage = (level, message) =>
  `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;

const requestLogger = (message) => {
  console.log(formatMessage("info", message));
};

const errorLogger = (error) => {
  const message = error?.stack || error?.message || "Unknown server error";
  console.error(formatMessage("error", message));
};

module.exports = { requestLogger, errorLogger };
