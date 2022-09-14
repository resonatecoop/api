module.exports.SwaggerError = () => ({
  type: 'object',
  properties: {
    code: {
      type: 'string'
    },
    message: {
      type: 'string'
    }
  },
  required: ['code', 'message']
})
