/**
 * 图片模型
 */

"use strict";

const Sequelize = require("sequelize");

const dbInstance = require("./");

class ImageModel extends Sequelize.Model {}

ImageModel.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        name: "u_name",
        msg: "filename不应该重复"
      },
      comment: "文件名"
    },
    extname: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "文件后缀"
    },
    size: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "文件体积"
    },
    width: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "图片宽度"
    },
    height: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "图片高度"
    },
    status: {
      type: Sequelize.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment:
        "状态：1待压缩，2压缩中，3压缩失败，4待上传，5上传中，6上传失败，7已完成，8已删除"
    },
    cover: {
      type: Sequelize.STRING,
      comment: "专门给GIF动画准备的首帧静态图文件名"
    },
    thumb: {
      type: Sequelize.STRING,
      comment: "缩略图文件名"
    },
    originSize: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      default: 0,
      comment: "图片原始体积"
    },
    config: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "从客户端提交的一些简单的配置"
    },
    compressFlow: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "执行压缩的流程配置"
    },
    compressRetry: {
      type: Sequelize.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "压缩的失败次数"
    },
    compressMsg: {
      type: Sequelize.STRING,
      defaultValue: "",
      comment: "最近一次压缩失败的原因"
    },
    compressDate: {
      type: Sequelize.DATE,
      comment: "完成压缩的时间"
    },
    compressRes: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "执行压缩的结果"
    },
    uploadRetry: {
      type: Sequelize.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: "上传的失败次数"
    },
    uploadMsg: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
      comment: "最近一次上传失败的原因"
    },
    completeDate: {
      type: Sequelize.DATE,
      comment: "完成上传的时间"
    }
  },
  {
    sequelize: dbInstance,
    modelName: "image"
  }
);

module.exports = ImageModel;
