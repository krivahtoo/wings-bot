'use strict'

const path = require('path')
const Sequelize = require('sequelize')
const ChannelModel = require('./modules/channel')
const GroupModel = require('./modules/group')
const SessionModel = require('./modules/session')
const SubmissionModel = require('./modules/submission')
const UserModel = require('./modules/user')
const env = process.env.NODE_ENV || 'development'
const config = require(path.join(__dirname, '/../config/database.js'))[env]

const sequelize = new Sequelize(config)

const Channel = ChannelModel(sequelize, Sequelize)
const Group = GroupModel(sequelize, Sequelize)
const Session = SessionModel(sequelize, Sequelize)
const Submission = SubmissionModel(sequelize, Sequelize)
const User = UserModel(sequelize, Sequelize)

Channel.belongsTo(User, {
  as: 'Owner',
  foreignKey: 'user_id'
})

Group.hasMany(Session, {
  foreignKey: 'group_id'
})

Session.hasMany(Submission, {
  foreignKey: 'session_id'
})
Session.belongsTo(Group, {
  foreignKey: 'group_id'
})

Submission.belongsTo(Session, {
  foreignKey: 'session_id'
})
Submission.belongsTo(Channel, {
  foreignKey: 'channel_id'
})

User.hasMany(Channel, {
  foreignKey: 'user_id'
})

module.exports = {
  sequelize,
  Sequelize,
  Channel,
  Group,
  Session,
  Submission,
  User
}
