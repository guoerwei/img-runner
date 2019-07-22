"use strict";

const Sequelize = require("sequelize");
const dbInstance = require("./");

const AlbumModel = require("./AlbumModel");
const ImageModel = require("./ImageModel");

class AlbumImageModel extends Sequelize.Model {}

AlbumImageModel.init(
  {},
  {
    sequelize: dbInstance,
    modelName: "album_image",
    indexes: [
      {
        name: "u_album_image",
        unique: true,
        fields: ["albumId", "imageId"]
      }
    ]
  }
);

AlbumImageModel.belongsTo(AlbumModel, {
  onDelete: "cascade",
  hooks: true
});
AlbumImageModel.belongsTo(ImageModel, {
  onDelete: "cascade",
  hooks: true
});

module.exports = AlbumImageModel;
