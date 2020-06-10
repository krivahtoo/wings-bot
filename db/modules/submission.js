
module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('submission', {
    confirmed: {
      type: DataTypes.BOOLEAN
    },
    massageId: {
      type: DataTypes.STRING
    },
    shared: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'submission',
    underscored: true,
    timestamps: true
  })

  return Submission
}
