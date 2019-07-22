/**
 * 通用的全局配置
 * 各个环境的配置将会继承这份配置
 * 注意，将使用 object-spread 来继承，这意味着各个环境特有的配置将会覆盖对应的属性不是追加
 */

"use strict";

const path = require("path");

module.exports = {
  pageConfig: {
    path: "/static"
  },

  // oss相关的配置
  ossConfig: {
    // 考虑未来可能有多个oss，所以这么写
    main: require(path.resolve(__dirname, "../../.private-oss.json"))
  },

  dbConfig: {
    host: "mysql",
    port: 3306,
    user: "root",
    pass: "123456",
    db: "img_runner"
  },

  redisConfig: {
    host: "redis",
    port: 6379,
    db: 0
  },

  // 压缩任务的配置
  compressTaskConfig: {
    directory: path.resolve(__dirname, "../../storage/income"), // 待压缩目录
    tickTime: 1000, // 多少时间跑一次扫描脚本
    taskTimeout: 120000, // 调用一个压缩引擎处理时的超时时间(部分引擎不支持)
    paralleLimit: 2, // 单个进程同时可以执行多少任务
    retryLimit: 3, // 失败多少次后放弃
    thumb: {
      // 缩略图尺寸，少于这个大小的话不进行缩略，大于这个大小的话，等比压缩在这个范围之内
      width: 200,
      height: 200
    }
  },

  // 上传任务的配置
  uploadTaskConfig: {
    directory: {
      // 待上传的目录分为3个
      // 一个是用于扫描的主目录，压缩完的图片就放这里
      main: path.resolve(__dirname, "../../storage/to-upload/main"),
      // 一个是用于放缩略图的目录
      thumb: path.resolve(__dirname, "../../storage/to-upload/thumb"),
      // 一个是用于放gif封面的目录
      cover: path.resolve(__dirname, "../../storage/to-upload/cover")
    },
    tickTime: 2000, // 多少时间跑一次
    paralleLimit: 5, // 单个进程同时可以执行多少上传任务
    retryLimit: 3 // 失败多少次后放弃
  }
};
