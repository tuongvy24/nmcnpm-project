"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Weblist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Weblist.hasMany(models.Conference, { foreignKey: "weblist_id" });
    }
  }
  Weblist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      web_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Weblist",
      tableName: "weblists", // Đặt tên bảng là "weblists" để khớp với tên bảng trong cơ sở dữ liệu
      timestamps: false
    }
  );
  return Weblist;
};
