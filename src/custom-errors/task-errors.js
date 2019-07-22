"use strict";

class TaskError extends Error {}

class CompressError extends TaskError {}

class CompressTimeoutError extends CompressError {}

class UploadError extends TaskError {}

module.exports = {
  TaskError,
  CompressError,
  CompressTimeoutError,
  UploadError
};
