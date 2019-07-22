"use strict";

const execa = require("execa");
const bin = require("zopflipng-bin");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isPNG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf);
  }

  doCompress(buf, opts = {}, execOpts = {}) {
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = ["-y"];
    if (opts["8bit"]) {
      args.push("--lossy_8bit");
    }
    if (opts.transparent) {
      args.push("--lossy_transparent");
    }
    if (opts.iterations) {
      args.push(`--iterations=${opts.iterations}`);
    }
    if (opts.iterationsLarge) {
      args.push(`--iterations_large=${opts.iterationsLarge}`);
    }
    if (opts.more) {
      args.push("-m");
    }
    args.push(tempInputPath, tempOutputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
