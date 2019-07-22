"use strict";

const execa = require("execa");
const bin = require("optipng-bin");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isPNG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = {
      optimizationLevel: 3,
      bitDepthReduction: true,
      colorTypeReduction: true,
      paletteReduction: true,
      strip: true,
      ...compressOpts
    };
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = ["-clobber", "-fix"];
    if (opts.optimizationLevel) {
      args.push("-o", opts.optimizationLevel);
    }
    args.push("-out", tempOutputPath);
    if (opts.strip) {
      args.push("-strip", "all");
    }
    if (!opts.bitDepthReduction) {
      args.push("-nb");
    }
    if (!opts.colorTypeReduction) {
      args.push("-nc");
    }
    if (!opts.paletteReduction) {
      args.push("-np");
    }
    if (opts.resize) {
      args.push(`-zw ${opts.resize}`);
    }
    args.push(tempInputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
