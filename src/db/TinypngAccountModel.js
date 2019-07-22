"use strict";

const Sequelize = require("sequelize");
const dbInstance = require("./");

class TinypngAccountModel extends Sequelize.Model {}

TinypngAccountModel.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        name: "u_name",
        msg: "名称不能重复"
      },
      comment: "用于方便分辨"
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        name: "u_key",
        msg: "key不能重复"
      },
      comment: "调用tinify所需要用的key"
    },
    monthlyLimit: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "此账号每个月可使用的次数上限"
    }
  },
  {
    sequelize: dbInstance,
    modelName: "tinypng_account"
  }
);

module.exports = TinypngAccountModel;
