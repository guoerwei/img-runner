"use strict";

const execa = require("execa");
const bin = require("advpng-bin");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isPNG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = { optimizationLevel: 3, ...compressOpts };
    const tempPath = tempy.file();
    const args = ["--recompress", "--quiet"];
    if (typeof opts.optimizationLevel === "number") {
      args.push(`-${opts.optimizationLevel}`);
    }
    if (typeof opts.iterations === "number") {
      args.push("--iter", opts.iterations);
    }
    args.push(tempPath);
    return writeFile(tempPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempPath));
  }
}

module.exports = Compressor;
