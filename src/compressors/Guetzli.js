"use strict";
// https://github.com/google/guetzli/

const execa = require("execa");
const bin = require("guetzli");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isPNG, isJPG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf) || isJPG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = { ...compressOpts };
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = [];
    if (
      Number.isInteger(opts.quality) &&
      opts.quality >= 0 &&
      opts.quality <= 100
    ) {
      args.push("--quality", opts.quality);
    }
    if (Number.isInteger(opts.memlimit) && opts.memlimit > 0) {
      args.push("--memlimit", opts.memlimit);
    }
    if (opts.nomemlimit) {
      args.push("--nomemlimit");
    }
    args.push(tempInputPath, tempOutputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
