"use strict";

const Svgo = require("svgo");
const { isSVG } = require("../utils/mime-helper");

const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isSVG(buf);
  }

  doCompress(buf, compressOpts = {}) {
    const opts = { multipass: true, ...compressOpts };
    // 暂时不考虑svg去开子进程处理
    return new Svgo(opts)
      .optimize(buf.toString())
      .then(res => Buffer.from(res.data));
  }
}

module.exports = Compressor;
