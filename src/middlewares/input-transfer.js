/**
 * 用于将页面或接口的入参整理成json，方便使用json-schema进行验证
 */

"use strict";

module.exports = () => {
  return async (ctx, next) => {
    ctx.input = {
      params: ctx.params, // 注意这边是引用，实际上因为在路由前引入这个中间件，这边还没有东西，要在路由后拿
      query: { ...(ctx.query || {}) }, // 转成纯对象，不然有[Object: null prototype]
      header: ctx.request.header || {},
      cookie: (() => {
        let cookie = {};
        (ctx.request.header.cookie || "")
          .split(";/s+")
          .filter(v => v)
          .forEach(v => {
            const [key, value] = v.split("=");
            cookie[key] = value;
          });
        return cookie;
      })(),
      body: (() => {
        const body = ctx.request.body || {};
        if (ctx.is("multipart/form-data")) {
          // 使用multipart/form-data时，前端无法在FormData里直接使用json对象，会需要转成字符串
          // 这里通过header自定义标签，指定哪些字符会需要解析成json
          const jsonFields = (ctx.request.header["my-json-fields"] || "").split(
            ","
          );
          jsonFields.forEach(v => {
            if (body[v]) {
              body[v] = JSON.parse(body[v]);
            }
          });
        }
        return body;
      })(),
      files: ctx.request.files || {}
    };
    await next();
  };
};
