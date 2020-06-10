'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING
    },
    isBot: {
      type: DataTypes.BOOLEAN
    },
    username: {
      type: DataTypes.STRING
    },
    languageCode: {
      type: DataTypes.STRING
    },
    banned: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'user',
    underscored: true,
    timestamps: true
  })

  return User
}
