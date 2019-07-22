/**
 * 文件操作的一些常用方法
 */

"use strict";

const fs = require("fs");
const { exec } = require("child_process");

/**
 * promise版的lstat
 * @param {string} filePath
 */
const lstat = filePath => {
  return new Promise((resolve, reject) => {
    fs.lstat(filePath, (e, res) => {
      if (e) {
        reject(e);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * promise版的readFile
 * @param {string} filePath
 * @param {object} options
 */
const readFile = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (e, res) => {
      if (e) {
        reject(e);
      } else {
        resolve(res);
      }
    });
  });
};

/**
 * promise版的writeFile
 * @param {string} filePath
 * @param {buffer} buf
 * @param {object} options
 */
const writeFile = (filePath, buf, options = {}) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, buf, options, e => {
      console.log("write file done", filePath, e);
      if (e) {
        reject(e);
      } else {
        resolve();
      }
    });
  });
};

/**
 * promise版的unlink
 * @param {string} filePath
 */
const unlink = filePath => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, e => {
      console.log("unlink done", filePath, e);
      if (e) {
        reject(e);
      } else {
        resolve();
      }
    });
  });
};

/**
 * 批量删除文件
 * @param {string[]} files
 */
const unlinkFiles = async files => {
  return Promise.all(files.map(v => unlink(v).catch(() => {})));
};

/**
 * 扫描目录里的文件，按时间顺序排列，优先拿最旧的数据
 * @param {string} dir
 * @param {number} count
 */
const scanDirectory = (dir, count) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${dir} && ls -t`, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          stdout
            .split("\n")
            .filter(Boolean)
            .reverse()
            .slice(0, count)
        );
      }
    });
  });
};

module.exports = {
  lstat,
  readFile,
  writeFile,
  unlink,
  unlinkFiles,
  scanDirectory
};
