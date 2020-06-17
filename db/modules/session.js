
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('session', {
    status: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'session',
    underscored: true,
    timestamps: true
  })

  return Session
}
