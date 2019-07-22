"use strict";

const execa = require("execa");
const bin = require("pngquant-bin");
const { isPNG } = require("../utils/mime-helper");
const Base = require("./Base");

class Pngquant extends Base {
  typeAvailable(buf) {
    return isPNG(buf);
  }

  doCompress(buf, compressOpts = {}, execOpts = {}) {
    const opts = { ...compressOpts };
    const args = ["-"];
    if (typeof opts.speed !== "undefined") {
      args.push("--speed", opts.speed);
    }
    if (typeof opts.strip !== "undefined") {
      args.push("--strip");
    }
    if (typeof opts.quality !== "undefined") {
      const [min, max] = opts.quality;
      args.push(
        "--quality",
        `${Math.round(min * 100)}-${Math.round(max * 100)}`
      );
    }
    if (typeof opts.dithering !== "undefined") {
      if (typeof opts.dithering === "number") {
        args.push(`--floyd=${opts.dithering}`);
      } else if (opts.dithering === false) {
        args.push("--ordered");
      }
    }
    if (typeof opts.posterize !== "undefined") {
      args.push("--posterize", opts.posterize);
    }
    if (opts.verbose !== "undefined") {
      args.push("--verbose");
    }
    return execa(bin, args, {
      encoding: null,
      maxBuffer: Infinity,
      input: buf,
      ...execOpts
    })
      .then(res => res.stdout)
      .catch(e => {
        console.log("error", e);
        if (e.code === 99) {
          return buf;
        }
        throw e;
      });
  }
}

module.exports = Pngquant;
