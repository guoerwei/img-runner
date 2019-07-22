/**
 * 用于应用启动的时候，初始化数据库
 */

"use strict";

const ImageModel = require("./ImageModel");
const TinypngAccountModel = require("./TinypngAccountModel");
const AlbumModel = require("./AlbumModel");
const AlbumImageModel = require("./AlbumImageModel");

const doInit = async () => {
  await Promise.all([
    ImageModel.sync(),
    TinypngAccountModel.sync(),
    AlbumModel.sync(),
    AlbumImageModel.sync()
  ]);
};

module.exports = doInit;
