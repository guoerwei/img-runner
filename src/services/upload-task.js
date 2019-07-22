"use strict";

const os = require("os");

const redis = require("../redis");
const { uploadTaskConfig } = require("../config");
const { getInstance } = require("../oss-clients");
const { scanDirectory, unlinkFiles, unlink } = require("../utils/fs-helper");
const {
  getToUploadFilePath,
  getToUploadThumbPath,
  getToUploadCoverPath
} = require("../utils/path-helper");

const ImageModel = require("../db/ImageModel");

// 正在执行中的文件列表
let runningList = [];

// 一次扫描多少个文件，因为有多进程，所以可以多扫一点再进行过滤
const scanFilesCount = uploadTaskConfig.paralleLimit * (os.cpus().length + 1);

/**
 * 上传一张图片
 * @param {string} fileName
 * @param {ImageModel} dataModel
 */
const doOneUpload = async (fileName, dataModel) => {
  // 设置为上传中
  dataModel.status = 5;
  await dataModel.save();
  const filePath = getToUploadFilePath(fileName);
  try {
    const updateData = {
      status: 7,
      completeData: new Date()
    };
    await Promise.all([
      getInstance().doUpload(filePath, fileName),
      dataModel.thumb
        ? getInstance().doUpload(
            getToUploadThumbPath(fileName),
            dataModel.thumb
          )
        : null,
      dataModel.cover
        ? getInstance().doUpload(
            getToUploadCoverPath(fileName),
            dataModel.cover
          )
        : null
    ]);
    await Promise.all([
      ImageModel.update(updateData, { where: { name: fileName } }),
      unlink(filePath),
      dataModel.thumb ? unlink(getToUploadThumbPath(fileName)) : null,
      dataModel.cover ? unlink(getToUploadCoverPath(fileName)) : null
    ]);
  } catch (e) {
    const updateData = {
      uploadMsg: e.message || "未知上传错误",
      uploadRetry: dataModel.uploadRetry + 1,
      status: 6
    };
    const needRemove = dataModel.uploadRetry >= uploadTaskConfig.retryLimit;
    if (needRemove) {
      updateData.status = 8;
    }
    return Promise.all([
      ImageModel.update(updateData, { where: { name: fileName } }),
      needRemove ? unlink(filePath) : null,
      needRemove && dataModel.thumb
        ? unlink(getToUploadThumbPath(fileName))
        : null,
      needRemove && dataModel.cover
        ? unlink(getToUploadCoverPath(fileName))
        : null
    ]);
  }
};

/**
 * 定时跑上传脚本
 */
const runTick = async () => {
  const scanFiles = await scanDirectory(
    uploadTaskConfig.directory.main,
    scanFilesCount
  );
  if (!scanFiles.length) {
    return;
  }
  // 用redis标记一下，这个文件正在处理了
  const setFlags = await Promise.all(
    scanFiles.map(v => redis.set(`UPLOAD_${v}`, 1, "EX", 3600, "NX"))
  );
  // flagList是redis标记成功的，表示没有别人在动，如果key已经存在的话redis会返回null的
  const flagList = scanFiles.filter((v, k) => setFlags[k]);
  if (!flagList.length) {
    return;
  }
  // 接下来看看当前进程还能处理几个任务，其它的要释放
  const remainLimit = uploadTaskConfig.paralleLimit - runningList.length;
  const fileList = flagList.slice(0, remainLimit);
  const cleanList = flagList.slice(remainLimit);
  runningList = [...new Set([...runningList, ...fileList])];
  if (cleanList.length) {
    // 释放掉，当前进程满载了
    await redis.del.apply(redis, cleanList.map(v => `UPLOAD_${v}`));
  }
  if (!fileList.length) {
    return;
  }
  // 开始读取数据库
  const imageDatas = await ImageModel.findAll({ where: { name: fileList } });
  // 这边做一些异常的排查，虽然可能不常见
  // 准备删除的异常文件
  const filesToRemove = fileList.filter(v => {
    const data = imageDatas.find(d => d.name === v);
    if (!data) {
      return true;
    }
    if (data.status === 7 || data.status === 8) {
      return true;
    }
    if (data.status === 6 && data.uploadRetry >= uploadTaskConfig.retryLimit) {
      return true;
    }
    return false;
  });
  // 准备进入上传流程的文件列表
  const filesToUpload = fileList.filter(v => {
    const data = imageDatas.find(d => d.name === v);
    return (
      data &&
      (data.status === 4 ||
        (data.status === 6 && data.uploadRetry < uploadTaskConfig.retryLimit))
    );
  });

  return Promise.all(
    filesToUpload.map(v => doOneUpload(v, imageDatas.find(d => d.name === v)))
  )
    .then(() =>
      Promise.all([
        unlinkFiles([
          ...filesToRemove.map(v => getToUploadFilePath(v)),
          ...filesToRemove
            .filter(v => {
              const data = imageDatas.find(d => d.name === v);
              return data && data.thumb;
            })
            .map(v => {
              const data = imageDatas.find(d => d.name === v);
              return getToUploadThumbPath(data.name);
            }),
          ...filesToRemove
            .filter(v => {
              const data = imageDatas.find(d => d.name === v);
              return data && data.cover;
            })
            .map(v => {
              const data = imageDatas.find(d => d.name === v);
              return getToUploadCoverPath(data.name);
            })
        ]),
        ImageModel.update({ status: 8 }, { where: { name: filesToRemove } })
      ])
    )
    .catch(e => {
      console.error(e);
    })
    .finally(async () => {
      await redis.del.apply(redis, fileList.map(v => `UPLOAD_${v}`));
      runningList = runningList.filter(v => !fileList.includes(v));
    });
};

module.exports = {
  runTick
};
