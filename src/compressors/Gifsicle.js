"use strict";
// http://www.lcdf.org/gifsicle/man.html

const execa = require("execa");
const bin = require("gifsicle");
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
    if (opts.resize) {
      args.push(`--resize=${opts.resize}`);
    }
    args.push("--output", tempOutputPath, tempInputPath);
    if (typeof opts.getFrame !== "undefined") {
      args.push(`#${opts.getFrame}`);
    }
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
