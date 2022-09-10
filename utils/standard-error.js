class StandardError extends Error {
  constructor(error) {
    // if already an error then lets pass through appropriately
    if (Object.prototype.toString.call(error) === '[object Error]') {
      const message = error.message;
      delete error.message;
      super(message, error);
    } else {
      super(error);
    }

    // Error.captureStackTrace(this, StandardError);
    // add more stuff
  }
}

module.exports = StandardError;
