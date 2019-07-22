"use strict";

const os = require("os");

const redis = require("../redis");
const { compressTaskConfig } = require("../config");
const { CompressError } = require("../custom-errors/task-errors");
const {
  scanDirectory,
  unlinkFiles,
  unlink,
  writeFile,
  readFile
} = require("../utils/fs-helper");
const {
  getPresetOptions,
  getThumbFlowOptions,
  getAnimatedGifCoverFlowOptions
} = require("../utils/compress-helper");
const {
  getThumbFileName,
  getCoverFileName,
  getToCompressFilePath,
  getToUploadFilePath,
  getToUploadThumbPath,
  getToUploadCoverPath
} = require("../utils/path-helper");
const { isAnimatedGIF, getFileType } = require("../utils/mime-helper");
const { doCompress } = require("../compressors");
const ImageModel = require("../db/ImageModel");

// 正在执行中的文件列表
let runningList = [];

// 一次扫描多少个文件，因为有多进程，所以可以多扫一点再进行过滤
const scanFilesCount = compressTaskConfig.paralleLimit * (os.cpus().length + 1);

/**
 * 执行压缩流程的一个阶段
 * 一个阶段可能是1或多个压缩引擎配置，如果是多个的话，则会依次尝试
 * @param {Buffer} buf
 * @param {object} stepOption
 */
const doCompressFlowStep = async (buf, stepOption) => {
  const options = stepOption instanceof Array ? stepOption : [stepOption];
  for (let i = 0, I = options.length; i < I; i++) {
    const opt = options[i];
    const startDate = new Date();
    try {
      console.log("do compress", opt);
      const outBuf = await doCompress(buf, opt);
      const endDate = new Date();
      if (outBuf) {
        return {
          buf: outBuf,
          res: {
            engine: opt.engine,
            compressOpts: opt.compressOpts || {},
            cost: endDate.getTime() - startDate.getTime()
          }
        };
      }
      continue;
    } catch (e) {
      if (i === I - 1) {
        throw e;
      }
      continue;
    }
  }
  throw new CompressError("无法找到可以使用的压缩引擎");
};

/**
 * 执行压缩流程的多个阶段
 * @param {Buffer} buf
 * @param {object[]} compressFlow
 */
const doCompressFlowSteps = async (buf, compressFlow) => {
  if (!compressFlow.length) {
    return {
      buf,
      compressRes: []
    };
  }
  const compressRes = [];
  for (let i = 0, I = compressFlow.length; i < I; i++) {
    const stepOption = compressFlow[i];
    const stepRet = await doCompressFlowStep(buf, stepOption);
    buf = stepRet.buf;
    compressRes.push(stepRet.res);
  }
  return {
    buf,
    compressRes
  };
};

const doThumbFlow = async (fileName, buf, option) => {
  console.log("thumb", JSON.stringify(option));
  const ret = await doCompressFlowSteps(buf, option);
  await writeFile(
    getToUploadThumbPath(fileName, getFileType(ret.buf)),
    ret.buf
  );
};

const doCoverFlow = async (fileName, buf, option) => {
  const ret = await doCompressFlowSteps(buf, option);
  await writeFile(getToUploadCoverPath(fileName), ret.buf);
};

/**
 * 执行一个压缩的流程
 * 一个压缩流程是一个数组，图片的buffer会像管道一样，传递图片的buffer
 * @param {string} fileName
 * @param {ImageModel} dataModel
 */
const doCompressFlow = async (fileName, dataModel) => {
  if (!dataModel.compressFlow.length) {
    dataModel.compressFlow = getPresetOptions({
      extname: dataModel.extname,
      originSize: dataModel.originSize,
      config: dataModel.config
    });
  }
  // 开始进行压缩
  dataModel.status = 2;
  await dataModel.save();
  const filePath = getToCompressFilePath(fileName);
  try {
    // 开始执行压缩流程
    let buf = await readFile(filePath);
    const stepsRet = await doCompressFlowSteps(buf, dataModel.compressFlow);
    buf = stepsRet.buf;
    const compressRes = stepsRet.compressRes;
    const updateData = {
      status: 4,
      size: buf.length,
      compressDate: new Date(),
      compressRes
    };
    // 压缩完成了
    const thumbOption = getThumbFlowOptions({
      extname: dataModel.extname,
      width: dataModel.width,
      height: dataModel.height
    });
    if (thumbOption) {
      updateData.thumb = getThumbFileName(fileName);
    }
    const isAnime = isAnimatedGIF(buf);
    if (isAnime) {
      updateData.cover = getCoverFileName(fileName);
    }
    await Promise.all([
      writeFile(getToUploadFilePath(fileName), buf),
      thumbOption ? doThumbFlow(fileName, buf, thumbOption) : null,
      isAnime
        ? doCoverFlow(fileName, buf, getAnimatedGifCoverFlowOptions())
        : null
    ]);
    await Promise.all([
      ImageModel.update(updateData, { where: { name: fileName } }),
      unlink(filePath)
    ]);
  } catch (e) {
    const updateData = {
      compressMsg: e.message || "未知压缩错误",
      compressRetry: dataModel.compressRetry + 1,
      status: 3
    };
    const needRemove = dataModel.compressRetry >= compressTaskConfig.retryLimit;
    if (needRemove) {
      updateData.status = 8;
    }
    return Promise.all([
      ImageModel.update(updateData, { where: { name: fileName } }),
      needRemove ? unlink(filePath) : null
    ]);
  }
};

/**
 * 定时跑压缩脚本
 */
const runTick = async () => {
  const scanFiles = await scanDirectory(
    compressTaskConfig.directory,
    scanFilesCount
  );
  if (!scanFiles.length) {
    return;
  }
  // 用redis标记一下，这个文件正在处理了
  const setFlags = await Promise.all(
    scanFiles.map(v => redis.set(`COMPRESS_${v}`, 1, "EX", 3600, "NX"))
  );
  // flagList是redis标记成功的，表示没有别人在动，如果key已经存在的话redis会返回null的
  const flagList = scanFiles.filter((v, k) => setFlags[k]);
  if (!flagList.length) {
    return;
  }
  // 接下来要看看当前进程还能处理几个任务，其它的要释放
  const remainLimit = compressTaskConfig.paralleLimit - runningList.length;
  const fileList = flagList.slice(0, remainLimit);
  const cleanList = flagList.slice(remainLimit);
  runningList = [...new Set([...runningList, ...fileList])];
  if (cleanList.length) {
    // 释放掉，当前进程满载了
    await redis.del.apply(redis, cleanList.map(v => `COMPRESS_${v}`));
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
    if (
      data.status === 3 &&
      data.compressRetry >= compressTaskConfig.retryLimit
    ) {
      return true;
    }
    return false;
  });
  // 准备进入压缩流程的文件列表
  const filesToCompress = fileList.filter(v => {
    const data = imageDatas.find(d => d.name === v);
    return (
      data &&
      (data.status === 1 ||
        (data.status === 3 &&
          data.compressRetry < compressTaskConfig.retryLimit))
    );
  });

  return Promise.all(
    filesToCompress.map(v =>
      doCompressFlow(v, imageDatas.find(d => d.name === v))
    )
  )
    .then(() =>
      Promise.all([
        unlinkFiles(filesToRemove.map(v => getToCompressFilePath(v))),
        ImageModel.update({ status: 8 }, { where: { name: filesToRemove } })
      ])
    )
    .catch(e => {
      console.error(e);
    })
    .finally(async () => {
      await redis.del.apply(redis, fileList.map(v => `COMPRESS_${v}`));
      runningList = runningList.filter(v => !fileList.includes(v));
    });
};

module.exports = { runTick };
