"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FriendRequest extends Model {
    static associate(models) {
      FriendRequest.belongsTo(models.User, { as: 'Requester', foreignKey: 'requesterId' });
      FriendRequest.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiverId' });
    }
  }
  FriendRequest.init(
    {
      requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
      }
    },
    {
      sequelize,
      modelName: "FriendRequest",
      tableName: "friend_requests",
      timestamps: true
    }
  );
  return FriendRequest;
};
