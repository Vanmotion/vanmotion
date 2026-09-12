const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (
  request,
  parent,
  isMain,
  options,
) {
  if (request.startsWith("@/")) {
    request = path.join(root, request.slice(2));
  }

  return originalResolveFilename.call(
    this,
    request,
    parent,
    isMain,
    options,
  );
};

function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");

  const output = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;

  module._compile(output, filename);
}

require.extensions[".ts"] = compileTypeScript;
require.extensions[".tsx"] = compileTypeScript;
