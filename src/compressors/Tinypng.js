"use strict";

const { isPNG, isJPG } = require("../utils/mime-helper");
const Base = require("./Base");
const { consume, getAvailableKey } = require("../services/tinypng-account");
const { getInstance } = require("../services/tinypng-instance");

class Compressor extends Base {
  typeAvailable(buf) {
    return isPNG(buf) || isJPG(buf);
  }

  consume() {
    return consume();
  }

  doCompress(buf, opts = {}, execOpts = { tinify: null }) {
    if (!execOpts.tinify) {
      return Promise.resolve(buf);
    }
    const { tinify } = execOpts;
    return new Promise((resolve, reject) => {
      const source = tinify.fromBuffer(buf);
      const resize = {};
      if (opts.method) {
        resize.method = opts.method;
      }
      if (opts.width) {
        resize.width = opts.width;
      }
      if (opts.height) {
        resize.height = opts.height;
      }
      const uploadSource = Object.keys(resize).length
        ? source.resize(resize)
        : source;
      uploadSource.toBuffer((e, res) => {
        if (e) {
          reject(e);
        } else {
          resolve(res);
        }
      });
    });
  }

  async do(buf, opts = {}, execOpts = {}) {
    console.log("use tinypng", opts, execOpts);
    const key = await getAvailableKey();
    const tinify = await getInstance(key);
    console.log("get tinypng-key", key);
    return new Promise((resolve, reject) => {
      let isEnd = false;
      if (execOpts.timeout) {
        setTimeout(() => {
          if (!isEnd) {
            isEnd = true;
            console.log("tinypng timeout");
            reject(new Error("tinypng超时"));
          }
        }, execOpts.timeout);
        this.doCompress(buf, opts, { ...execOpts, tinify })
          .then(res => {
            console.log("tinypng then");
            if (!isEnd) {
              isEnd = true;
              resolve(res);
            }
          })
          .catch(e => {
            console.log("tinypng catch");
            if (!isEnd) {
              isEnd = true;
              reject(e);
            }
          });
      }
    });
  }
}

module.exports = Compressor;
