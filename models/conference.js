"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Conference.belongsTo(models.Weblist, { foreignKey: "weblist_id" });
     
    }
  }
  Conference.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      website: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      title: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      conference: {
        type: DataTypes.TEXT,
        // allowNull: false
      },      
      location: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      now_deadline: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      date: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      running_date: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      starting_date: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      ending_date: {
        type: DataTypes.TEXT,
        // allowNull: false
      },
      notification: {
        type: DataTypes.TEXT
      },      
      subformat: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: "Conference",
      tableName: "conferences", // Đặt tên bảng là "conferences" để khớp với tên bảng trong cơ sở dữ liệu
      timestamps: false
    }
  );
  return Conference;
};
