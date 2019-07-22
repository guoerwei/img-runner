"use strict";

const execa = require("execa");
const bin = require("jpegoptim-bin");
const { isJPG } = require("../utils/mime-helper");
const Base = require("./Base");

class Compressor extends Base {
  typeAvailable(buf) {
    return isJPG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = {
      stripAll: true,
      stripCom: true,
      stripExif: true,
      stripIptc: true,
      stripIcc: true,
      stripXmp: true,
      ...compressOpts
    };
    const args = ["--stdin", "--stdout"];
    if (opts.stripAll) {
      args.push("--strip-all");
    }
    if (opts.stripCom) {
      args.push("--strip-com");
    }
    if (opts.stripExif) {
      args.push("--strip-exif");
    }
    if (opts.stripIptc) {
      args.push("--strip-iptc");
    }
    if (opts.stripIcc) {
      args.push("--strip-icc");
    }
    if (opts.stripXmp) {
      args.push("--strip-xmp");
    }
    if (opts.progressive) {
      args.push("--all-progressive");
    }
    if (opts.max !== undefined) {
      args.push(`--max=${opts.max}`);
    }
    if (opts.size) {
      args.push(`--size=${opts.size}`);
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
