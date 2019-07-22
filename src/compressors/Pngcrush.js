"use strict";

const execa = require("execa");
const bin = require("pngcrush-bin");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isPNG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = { ...compressOpts };
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = ["-brute", "-force", "-q"];
    if (opts.reduce) {
      args.push("-reduce");
    } else {
      args.push("-noreduce");
    }
    args.push(tempInputPath, tempOutputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
