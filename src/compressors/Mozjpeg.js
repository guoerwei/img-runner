"use strict";

const execa = require("execa");
const bin = require("mozjpeg");
const { isJPG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isJPG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = {
      trellis: true,
      trellisDC: true,
      overshoot: true,
      ...compressOpts
    };
    const args = [];
    if (typeof opts.quality !== "undefined") {
      args.push("-quality", opts.quality);
    }
    if (opts.progressive === false) {
      args.push("-baseline");
    }
    if (opts.targa) {
      args.push("-targa");
    }
    if (opts.revert) {
      args.push("-revert");
    }
    if (opts.fastCrush) {
      args.push("-fastcrush");
    }
    if (typeof opts.dcScanOpt !== "undefined") {
      args.push("-dc-scan-opt", opts.dcScanOpt);
    }
    if (!opts.trellis) {
      args.push("-notrellis");
    }
    if (!opts.trellisDC) {
      args.push("-notrellis-dc");
    }
    if (opts.tune) {
      args.push(`-tune-${opts.tune}`);
    }
    if (!opts.overshoot) {
      args.push("-noovershoot");
    }
    if (opts.arithmetic) {
      args.push("-arithmetic");
    }
    if (opts.dct) {
      args.push("-dct", opts.dct);
    }
    if (opts.quantBaseline) {
      args.push("-quant-baseline", opts.quantBaseline);
    }
    if (typeof opts.quantTable !== "undefined") {
      args.push("-quant-table", opts.quantTable);
    }
    if (opts.smooth) {
      args.push("-smooth", opts.smooth);
    }
    if (opts.maxMemory) {
      args.push("-maxmemory", opts.maxMemory);
    }
    if (opts.sample) {
      args.push("-sample", opts.sample.join(","));
    }
    return execa(bin, args, {
      encoding: null,
      input: buf,
      maxBuffer: Infinity,
      ...execOpts
    }).then(res => res.stdout);
  }
}

module.exports = Compressor;
