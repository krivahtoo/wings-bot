'use strict'

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('group', {
    title: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    photo: {
      type: DataTypes.JSON
    },
    maxWords: {
      type: DataTypes.INTEGER
    },
    minSubs: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'group',
    underscored: true,
    timestamps: true
  })

  return Group
}
