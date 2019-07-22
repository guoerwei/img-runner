"use strict";

const { compressTaskConfig } = require("../config");

/**
 * 获取压缩引擎实例
 * @param {string} engine
 */
const getCompressor = engine => {
  switch (engine) {
    case "advpng":
      return new (require("./Advpng"))();
    case "giflossy":
      return new (require("./Giflossy"))();
    case "gifsicle":
      return new (require("./Gifsicle"))();
    case "guetzli":
      return new (require("./Guetzli"))();
    case "jpegoptim":
      return new (require("./Jpegoptim"))();
    case "jpeg-recompress":
      return new (require("./JpegRecompress"))();
    case "jpegtran":
      return new (require("./Jpegtran"))();
    case "mozjpeg":
      return new (require("./Mozjpeg"))();
    case "optipng":
      return new (require("./Optipng"))();
    case "pngcrush":
      return new (require("./Pngcrush"))();
    case "pngout":
      return new (require("./Pngout"))();
    case "pngquant":
      return new (require("./Pngquant"))();
    case "svgo":
      return new (require("./Svgo"))();
    case "tinypng":
      return new (require("./Tinypng"))();
    case "webp":
      return new (require("./Webp"))();
    case "zopfli":
      return new (require("./Zopfli"))();
    case "sharp":
      return new (require("./Sharp"))();
    default:
      return new (require("./Base"))();
  }
};

/**
 * 执行一次压缩
 * @param {Buffer} buffer
 * @param {object} options
 * @param {string} options.engine 引擎
 * @param {object} options.compressOpts 压缩参数
 * @param {object} options.execOpts 其它执行时参数，例如超时
 */
const doCompress = async (buffer, options) => {
  const compressor = getCompressor(options.engine);
  const consume = await compressor.consume();
  if (!consume) {
    return false;
  } else {
    return compressor.do(buffer, options.compressOpts || {}, {
      timeout: compressTaskConfig.taskTimeout,
      ...(options.execOpts || {})
    });
  }
};

module.exports = {
  doCompress
};
