"use strict";
// 具体可支持的参数：
// http://sharp.pixelplumbing.com/en/stable/
// 暂时还没找到可以中断的方法，一般用来生成缩略图好了

const sharp = require("sharp");
const { isPNG, isGIF, isJPG, isWEBP, isSVG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf) || isGIF(buf) || isJPG(buf) || isWEBP(buf) || isSVG(buf);
  }

  doCompress(buf, compressOpts = {}) {
    const opts = { ...compressOpts };
    let compressor = sharp(buf).withMetadata({});
    if (opts.resize) {
      compressor = compressor.resize(opts.resize);
    }
    if (opts.jpg || opts.jpeg) {
      compressor = compressor.jpeg(opts.jpg || opts.jpeg);
    }
    if (opts.png) {
      compressor = compressor.png(opts.png);
    }
    if (opts.webp) {
      compressor = compressor.webp(opts.webp);
    }
    compressor = compressor.toBuffer();
    return compressor;
  }
}

module.exports = Compressor;
