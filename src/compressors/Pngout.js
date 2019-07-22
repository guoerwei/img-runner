"use strict";

const execa = require("execa");
const bin = require("pngout-bin");
const { isPNG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    // pngout是用来对别的工具产生的png进行再优化
    const opts = { ...compressOpts };
    const args = ["-", "-", "-f0", "-y", "-force", "-q"];
    if (typeof opts.strategy === "number") {
      args.push(`-s${opts.strategy}`);
    }
    return execa(bin, args, {
      encoding: null,
      input: buf,
      ...execOpts
    }).then(res => res.stdout);
  }
}

module.exports = Compressor;
