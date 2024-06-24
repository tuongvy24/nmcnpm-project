"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, { as: 'Sender', foreignKey: 'senderId' });
      Message.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiverId' });
    }
  }
  Message.init(
    {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      timestamps: true
    }
  );
  return Message;
};
