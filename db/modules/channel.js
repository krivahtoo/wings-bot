'use strict'

module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('channel', {
    title: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    inviteLink: {
      type: DataTypes.STRING
    },
    subscribers: {
      type: DataTypes.INTEGER
    },
    banned: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'channel',
    underscored: true,
    timestamps: true
  })

  return Channel
}
