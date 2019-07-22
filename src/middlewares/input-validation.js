/**
 * 使用json-schema来对接口入参进行验证
 */

"use strict";

const Ajv = require("ajv");
const ajvErrors = require("ajv-errors");
const { InputCheckError } = require("../custom-errors/check-errors");

const validate = (data = {}, schema = null) => {
  if (schema) {
    const ajv = new Ajv({
      allErrors: true,
      jsonPointers: true,
      coerceTypes: true,
      useDefaults: true,
      schemas: []
    });
    ajvErrors(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      throw new InputCheckError(
        JSON.stringify(validate.errors.map(v => v.message))
      );
    }
  }
};

module.exports = schemaPath => {
  const schema = require(`../schemas${schemaPath}`);
  return async (ctx, next) => {
    ["params", "query", "header", "cookie", "body", "files"].forEach(v => {
      if (schema[v]) {
        validate(ctx.input[v], schema[v]);
      }
    });
    await next();
  };
};
