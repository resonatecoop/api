module.exports = () => {
  return err => {
    return {
      status: err.status,
      message: err.message,
      errors: err.errors, // errors from openapi validator
      data: null
    }
  }
}
