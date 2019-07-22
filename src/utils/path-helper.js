"use strict";

const path = require("path");

const { compressTaskConfig, uploadTaskConfig } = require("../config");

/**
 * 去掉后缀名
 * @param {string} fileName
 */
const stripExtname = fileName => {
  const lastIndex = fileName.lastIndexOf(".");
  return lastIndex < 0 ? fileName : fileName.substr(0, lastIndex);
};

/**
 * 获取得待压缩的文件路径
 * @param {string} fileName
 */
const getToCompressFilePath = fileName => {
  return path.resolve(compressTaskConfig.directory, fileName);
};

/**
 * 获取待上传的文件路径
 * @param {string} fileName
 */
const getToUploadFilePath = fileName => {
  return path.resolve(uploadTaskConfig.directory.main, fileName);
};

/**
 * 根据原文件名，得到缩略图的文件名
 * @param {string} fileName
 */
const getThumbFileName = (fileName, extName) => {
  const extname = extName ? `.${extName}` : path.extname(fileName);
  return `${stripExtname(fileName)}-thumb${extname}`;
};

/**
 * 根据原文件名，得到封面的文件名
 * @param {string} fileName
 */
const getCoverFileName = fileName => {
  const extname = path.extname(fileName);
  return `${stripExtname(fileName)}-cover${extname}`;
};

/**
 * 根据原文件名，得到缩略图的路径
 * @param {string} fileName
 */
const getToUploadThumbPath = fileName => {
  return path.resolve(
    uploadTaskConfig.directory.thumb,
    getThumbFileName(fileName)
  );
};

/**
 * 根据原文件名，得到封面图的路径
 * @param {string} fileName
 */
const getToUploadCoverPath = fileName => {
  return path.resolve(
    uploadTaskConfig.directory.cover,
    getCoverFileName(fileName)
  );
};

module.exports = {
  getToCompressFilePath,
  getToUploadFilePath,
  getThumbFileName,
  getCoverFileName,
  getToUploadThumbPath,
  getToUploadCoverPath
};
