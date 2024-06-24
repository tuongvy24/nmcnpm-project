"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User.hasMany(models.Blog, { foreignKey: "authorId" });
      User.hasMany(models.Conference, { foreignKey: "userId" });
      User.hasMany(models.Activity, { foreignKey: "userId" });
      // Liên kết mới với FriendRequest
      User.hasMany(models.FriendRequest, { as: 'SentRequests', foreignKey: 'requesterId' });
      User.hasMany(models.FriendRequest, { as: 'ReceivedRequests', foreignKey: 'receiverId' });

      User.hasMany(models.Message, { as: 'SentMessages', foreignKey: 'senderId' });
      User.hasMany(models.Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });
  
      
      // Weblist.hasMany(models.Conference, { foreignKey: "weblist_id" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      mobile: DataTypes.STRING,
      imagePath: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users", // Đặt tên bảng là "weblists" để khớp với tên bảng trong cơ sở dữ liệu
      timestamps: true
    }
  );
  return User;
};
