"use strict";

const execa = require("execa");
const bin = require("cwebp-bin");
const tempy = require("tempy");
const { readFile, writeFile } = require("../utils/fs-helper");
const { isWEBP } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isWEBP(buf);
  }

  doCompress(buf, opts = {}, execOpts = {}) {
    const tempInputPath = tempy.file();
    const tempOutputPath = tempy.file();
    const args = ["-quiet", "-mt"];
    if (opts.preset) {
      args.push("-preset", opts.preset);
    }
    if (opts.quality) {
      args.push("-q", opts.quality);
    }
    if (opts.alphaQuality) {
      args.push("-alpha_q", opts.alphaQuality);
    }
    if (opts.method) {
      args.push("-m", opts.method);
    }
    if (opts.size) {
      args.push("-size", opts.size);
    }
    if (opts.sns) {
      args.push("-sns", opts.sns);
    }
    if (opts.filter) {
      args.push("-f", opts.filter);
    }
    if (opts.autoFilter) {
      args.push("-af");
    }
    if (opts.sharpness) {
      args.push("-sharpness", opts.sharpness);
    }
    if (opts.lossless) {
      args.push("-lossless");
    }
    if (opts.nearLossless) {
      args.push("-near_lossless", opts.nearLossless);
    }
    if (opts.crop) {
      args.push(
        "-crop",
        opts.crop.x,
        opts.crop.y,
        opts.crop.width,
        opts.crop.height
      );
    }
    if (opts.resize) {
      args.push("-resize", opts.resize.width, opts.resize.height);
    }
    if (opts.metadata) {
      args.push(
        "-metadata",
        Array.isArray(opts.metadata) ? opts.metadata.join(",") : opts.metadata
      );
    }
    args.push("-o", tempOutputPath, tempInputPath);
    return writeFile(tempInputPath, buf)
      .then(() => execa(bin, args, execOpts))
      .then(() => readFile(tempOutputPath));
  }
}

module.exports = Compressor;
