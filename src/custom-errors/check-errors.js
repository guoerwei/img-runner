"use strict";

/**
 * 验证错误用的Error对象
 */
class CheckError extends Error {}

/**
 * 接口入参里验证错误用的Error对象
 */
class InputCheckError extends CheckError {
  constructor(msg, fileName = undefined, lineNumber = undefined) {
    super("参数验证失败", fileName, lineNumber);
    this.statusCode = 400;
    this.data = JSON.parse(msg);
  }
}

/**
 * 页面不存在的时候用的
 */
class ResourceNotFoundError extends CheckError {
  constructor(msg, fileName = undefined, lineNumber = undefined) {
    super(msg, fileName, lineNumber);
    this.statusCode = 404;
  }
}

class TinypngInvalidateError extends CheckError {}

module.exports = {
  CheckError,
  InputCheckError,
  ResourceNotFoundError,
  TinypngInvalidateError
};
