"use strict";

const { compressTaskConfig } = require("../config");

const getGifPresetOptions = ({ config = {} }) => {
  const { optimizationLevel = 2 } = config;
  const compressOpts = {};
  switch (optimizationLevel) {
    case 1:
      compressOpts.lossy = 33;
      break;
    case 2:
      compressOpts.lossy = 66;
      break;
    case 3:
      compressOpts.lossy = 99;
      break;
  }
  return [{ engine: "giflossy", compressOpts }];
};

const getPngPresetOptions = ({ config = {}, originSize }) => {
  const { optimizationLevel = 2 } = config;
  const pngquantCompressOpts = {};
  switch (optimizationLevel) {
    case 1:
      pngquantCompressOpts.speed = 8;
      pngquantCompressOpts.quality = [0.8, 1];
      break;
    case 2:
      pngquantCompressOpts.speed = 4;
      pngquantCompressOpts.quality = [0.5, 0.7];
      break;
    case 3:
      pngquantCompressOpts.speed = 2;
      pngquantCompressOpts.quality = [0.3, 0.5];
      break;
  }
  if (originSize >= 4.5 * 1024 * 1024) {
    // 太大了，估计tinypng处理不了
    return [{ engine: "pngquant", compressOpts: pngquantCompressOpts }];
  }
  return [
    [
      { engine: "tinypng" },
      {
        engine: "pngquant",
        compressOpts: pngquantCompressOpts
      }
    ]
  ];
};

const getJpgPresetOptions = ({ config = {}, originSize }) => {
  const { optimizationLevel = 2 } = config;
  const mozjpegCompressOpts = {};
  switch (optimizationLevel) {
    case 1:
      mozjpegCompressOpts.quality = 80;
      break;
    case 2:
      mozjpegCompressOpts.quality = 60;
      break;
    case 3:
      mozjpegCompressOpts.quality = 30;
      break;
  }
  if (originSize > 1 * 1024 * 1024) {
    mozjpegCompressOpts.progressive = true;
  }
  if (originSize >= 4.5 * 1024 * 1024) {
    // 太大了，估计tinypng处理不了
    return [{ engine: "mozjpeg", compressOpts: mozjpegCompressOpts }];
  }
  return [
    [
      { engine: "tinypng" },
      { engine: "mozjpeg", compressOpts: mozjpegCompressOpts }
    ]
  ];
};

const getWebpPresetOptions = ({ config = {} }) => {
  const { optimizationLevel = 2 } = config;
  const webpCompressOpts = {};
  switch (optimizationLevel) {
    case 1:
      webpCompressOpts.quality = 80;
      webpCompressOpts.method = 1;
      break;
    case 2:
      webpCompressOpts.quality = 60;
      webpCompressOpts.method = 4;
      break;
    case 3:
      webpCompressOpts.quality = 30;
      webpCompressOpts.method = 6;
      break;
  }
  return [{ engine: "webp", compressOpts: webpCompressOpts }];
};

const getSvgPresetOptions = () => {
  return [{ engine: "svgo" }];
};

/**
 *
 * @param {object} param
 * @param {string} param.extname 文件类型
 * @param {number} param.originSize 文件体积
 * @param {object} param.config 配置，一般就是提供给客户端选择的
 * @param {number} param.config.optimizationLevel 压缩级别
 */
const getPresetOptions = ({ extname, originSize, config = {} }) => {
  if (!config.optimizationLevel) {
    return [];
  }
  switch (extname) {
    case "gif":
      return getGifPresetOptions({ originSize, config });
    case "png":
      return getPngPresetOptions({ originSize, config });
    case "jpg":
      return getJpgPresetOptions({ originSize, config });
    case "webp":
      return getWebpPresetOptions({ originSize, config });
    case "svg":
      return getSvgPresetOptions({ originSize, config });
  }
  return [];
};

const getThumbResize = (width, height) => {
  const { thumb } = compressTaskConfig;
  if (width <= thumb.width && height <= thumb.height) {
    // 不需要进行缩略图的生成
    return false;
  }
  if (width >= height) {
    return {
      width: thumb.width,
      height: Math.floor((thumb.width * height) / width)
    };
  } else {
    return {
      height: thumb.height,
      width: Math.floor((thumb.height * width) / height)
    };
  }
};

const getGifThumbFlowOptions = ({ width, height }) => {
  const resize = getThumbResize(width, height);
  const gifsicleCompressOptions = {
    getFrame: 0
  };
  if (resize) {
    gifsicleCompressOptions.resize = `${resize.width}x${resize.height}`;
  }

  return [
    [
      {
        engine: "gifsicle",
        compressOpts: gifsicleCompressOptions
      }
    ]
    // [{ engine: "sharp", compressOpts: sharpCompressOptions }]
  ];
};

const getJpgThumbFlowOptions = ({ width, height }) => {
  const resize = getThumbResize(width, height);
  const sharpCompressOptions = {
    resize
  };
  return [
    {
      engine: "sharp",
      compressOpts: sharpCompressOptions
    }
  ];
};

const getPngThumbFlowOptions = ({ width, height }) => {
  const resize = getThumbResize(width, height);
  const sharpCompressOptions = {
    resize
  };
  return [
    {
      engine: "sharp",
      compressOpts: sharpCompressOptions
    }
  ];
};

const getWebpThumbFlowOptions = ({ width, height }) => {
  const resize = getThumbResize(width, height);
  const sharpCompressOptions = {
    resize
  };
  return [
    {
      engine: "sharp",
      compressOpts: sharpCompressOptions
    }
  ];
};

const getSvgThumbFlowOptions = ({ width, height }) => {
  const resize = getThumbResize(width, height);
  const sharpCompressOptions = {
    resize,
    png: {} // 转成png
  };
  return [
    {
      engine: "sharp",
      compressOpts: sharpCompressOptions
    }
  ];
};

/**
 * 获取缩略图的获取配置
 * @param {object} param
 * @param {string} param.extname 文件 类型
 * @param {number} param.width 图片的宽度
 * @param {number} param.height 图片的高度
 */
const getThumbFlowOptions = ({ extname, width, height }) => {
  const resize = getThumbResize(width, height);
  if (resize) {
    switch (extname) {
      case "gif":
        return getGifThumbFlowOptions({ width, height });
      case "png":
        return getPngThumbFlowOptions({ width, height });
      case "jpg":
        return getJpgThumbFlowOptions({ width, height });
      case "webp":
        return getWebpThumbFlowOptions({ width, height });
      case "svg":
        return getSvgThumbFlowOptions({ width, height });
    }
  }
  return false;
};

const getAnimatedGifCoverFlowOptions = () => {
  return [
    {
      engine: "gifsicle",
      compressOpts: {
        getFrame: 0
      }
    }
  ];
};

module.exports = {
  getPresetOptions,
  getThumbFlowOptions,
  getAnimatedGifCoverFlowOptions
};
