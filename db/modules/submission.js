
module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('submission', {
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    massageId: {
      type: DataTypes.INTEGER
    },
    shared: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'submission',
    underscored: true,
    timestamps: true
  })

  return Submission
}
