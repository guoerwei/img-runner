"use strict";
// giflossy以前应该是在gifsicle基础上加了lossy参数，但好像现在gifsicle本身也支持lossy了？

const execa = require("execa");
const bin = require("giflossy");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isGIF } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isGIF(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = { ...compressOpts };
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = ["--no-warnings"];
    if (opts.interlaced) {
      args.push("--interlace");
    }
    if (opts.optimizationLevel) {
      args.push(`--optimize=${opts.optimizationLevel}`);
    }
    if (opts.colors) {
      args.push(`--colors=${opts.colors}`);
    }
    if (opts.lossy) {
      args.push(`--lossy=${opts.lossy}`);
    }
    if (opts.resize) {
      args.push(`--resize=${opts.resize}`);
    }
    args.push("--output", tempOutputPath, tempInputPath);
    if (opts.firstFrame) {
      args.push("#0");
    }
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
