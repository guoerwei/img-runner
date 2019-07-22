"use strict";

const execa = require("execa");
const bin = require("jpeg-recompress-bin");
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
    const args = ["--quiet"];
    if (opts.accurate) {
      args.push("--accurate");
    }
    if (opts.quality) {
      args.push("--quality", opts.quality);
    }
    if (opts.method) {
      args.push("--method", opts.method);
    }
    if (opts.target) {
      args.push("--target", opts.target);
    }
    if (opts.min) {
      args.push("--min", opts.min);
    }
    if (opts.max) {
      args.push("--max", opts.max);
    }
    if (opts.loops) {
      args.push("--loops", opts.loops);
    }
    if (opts.defish) {
      args.push("--defish", opts.defish);
    }
    if (opts.zoom) {
      args.push("--zoom", opts.zoom);
    }
    if (opts.progressive === false) {
      args.push("--no-progressive");
    }
    if (opts.subsample) {
      args.push("--subsample", opts.subsample);
    }
    if (opts.strip !== false) {
      args.push("--strip");
    }
    args.push(tempInputPath, tempOutputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
