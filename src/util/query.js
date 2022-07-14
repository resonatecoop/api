const queryBuilder = (sequelize) => {
  return (query, values) => {
    return sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      replacements: values
    })
  }
}

module.exports = queryBuilder
