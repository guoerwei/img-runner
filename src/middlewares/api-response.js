/**
 * 给ctx里注入api常用的输出方法
 */

"use strict";

module.exports = () => {
  return async (ctx, next) => {
    /**
     * 抛错
     */
    ctx.throwApiError = err => {
      const response = {
        success: false,
        msg: err.message || "系统错误"
      };
      if (err.data) {
        response.data = err.data;
      }
      ctx.type = "application/json";
      ctx.throw(err.statusCode || 500, JSON.stringify(response), {
        expose: true // expose需要为true才能把500错误的自定义描述输出来
      });
    };

    /**
     * 输出，注意输出后并不会中止原代码继续执行
     */
    ctx.apiResponse = (data = null, code = 200) => {
      ctx.type = "application/json";
      ctx.status = code;
      ctx.body = JSON.stringify({
        success: true,
        data
      });
    };

    try {
      await next();
    } catch (e) {
      ctx.throwApiError(e);
    }
  };
};
