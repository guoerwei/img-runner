"use strict";

const Sequelize = require("sequelize");
const dbInstance = require("./");

// const AlbumImageModel = require("./AlbumImageModel");

class AlbumModel extends Sequelize.Model {}

AlbumModel.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        name: "u_name",
        msg: "专辑名称不能重复"
      },
      comment: "专辑名"
    }
  },
  {
    sequelize: dbInstance,
    modelName: "album"
  }
);

// AlbumModel.hasMany(AlbumImageModel);

module.exports = AlbumModel;
