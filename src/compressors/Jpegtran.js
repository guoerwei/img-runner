"use strict";

const execa = require("execa");
const bin = require("jpegtran-bin");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isJPG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isJPG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = { ...compressOpts };
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = ["-copy", "none"];
    if (opts.progressive) {
      args.push("-progressive");
    }
    if (opts.arithmetic) {
      args.push("-arithmetic");
    } else {
      args.push("-optimize");
    }
    if (opts.grayscale) {
      args.push("-grayscale");
    }
    args.push("-outfile", tempOutputPath, tempInputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
