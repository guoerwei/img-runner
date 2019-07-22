/**
 * 一些mime相关的方法
 */

"use strict";

const isGIF = buf => {
  if (!buf || buf.length < 3) {
    return false;
  }
  return buf[0] === 71 && buf[1] === 73 && buf[2] === 70;
};

const isJPG = buf => {
  if (!buf || buf.length < 3) {
    return false;
  }
  return buf[0] === 255 && buf[1] === 216 && buf[2] === 255;
};

const isPNG = buf => {
  if (!buf || buf.length < 8) {
    return false;
  }
  return (
    buf[0] === 137 &&
    buf[1] === 80 &&
    buf[2] === 78 &&
    buf[3] === 71 &&
    buf[4] === 13 &&
    buf[5] === 10 &&
    buf[6] === 26 &&
    buf[7] === 10
  );
};

const isWEBP = buf => {
  if (isJPG(buf)) {
    return true;
  }
  if (isPNG(buf)) {
    return true;
  }
  if (!buf || buf.length < 12) {
    return false;
  }
  return buf[8] === 87 && buf[9] === 69 && buf[10] === 66 && buf[11] === 80;
};

const isBinary = buf => {
  const isBuf = Buffer.isBuffer(buf);
  for (let i = 0; i < 24; i++) {
    const charCode = isBuf ? buf[i] : buf.charCodeAt(i);
    if (charCode === 65533 || charCode <= 8) {
      return true;
    }
  }
  return false;
};

const isSVG = buf => {
  const regex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*\s*(?:\[?(?:\s*<![^>]*>\s*)*\]?)*[^>]*>\s*)?<svg[^>]*>[^]*<\/svg>\s*$/i;
  return (
    Boolean(buf) &&
    !isBinary(buf) &&
    regex.test(buf.toString().replace(/<!--([\s\S]*?)-->/g, ""))
  );
};

/**
 * 判断一张gif是不是有多帧
 * 从 https://github.com/mailcharts/animated-gif-detector/blob/master/index.js 抄来的
 * @param {Buffer} buf
 */
const isAnimatedGIF = buf => {
  if (!isGIF(buf)) {
    return false;
  }
  const BLOCK_TERMINATOR = { value: Buffer.from("00") };
  const EXTENSION_INTRODUCER = { value: Buffer.from("21"), head: 0, tail: 1 };
  const GRAPHIC_CONTROL_LABEL = { value: Buffer.from("f9"), head: 1, tail: 2 };
  let count = 0;
  let pointer = "";
  for (let i = 0, I = buf.length; i < I; i++) {
    const res =
      pointer == BLOCK_TERMINATOR.value &&
      buf.toString(
        "hex",
        i + EXTENSION_INTRODUCER.head,
        i + EXTENSION_INTRODUCER.tail
      ) == EXTENSION_INTRODUCER.value &&
      buf.toString(
        "hex",
        i + GRAPHIC_CONTROL_LABEL.head,
        i + GRAPHIC_CONTROL_LABEL.tail
      ) == GRAPHIC_CONTROL_LABEL.value;
    if (res) {
      count++;
    }
    if (count > 1) {
      return true;
    }
    pointer = buf.toString("hex", i, i + 1);
  }
  return false;
};

const getFileType = buf => {
  if (isGIF(buf)) {
    return "gif";
  } else if (isJPG(buf)) {
    return "jpg";
  } else if (isPNG(buf)) {
    return "png";
  } else if (isWEBP(buf)) {
    return "webp";
  } else if (isSVG(buf)) {
    return "svg";
  }
  return false;
};

module.exports = {
  isGIF,
  isJPG,
  isPNG,
  isWEBP,
  isSVG,
  isAnimatedGIF,
  getFileType
};
