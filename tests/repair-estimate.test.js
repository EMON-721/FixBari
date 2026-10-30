const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
let ts;
try { ts = require('typescript'); }
catch {
  try { ts = require(path.resolve(__dirname, '../services/orders/node_modules/typescript')); }
  catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'); }
}
const filename = path.resolve(__dirname, '../services/orders/src/utils/repair-estimate.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  fileName: filename,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const mod = new Module(filename, module);
mod.filename = filename; mod.paths = module.paths; mod._compile(compiled, filename);
const { calculateRepairEstimate } = mod.exports;
let e = calculateRepairEstimate(1500, 'BASIC', 'STANDARD', 'Dhaka');
assert.deepEqual({ min:e.min, mid:e.mid, max:e.max }, { min:1403, mid:1650, max:1898 });
e = calculateRepairEstimate(1500, 'COMPLEX', 'DELUXE', 'Rajshahi');
assert.deepEqual({ min:e.min, mid:e.mid, max:e.max }, { min:4463, mid:5250, max:6038 });
assert.equal(e.method, 'RULE_BASED');
assert.throws(() => calculateRepairEstimate(-1, 'BASIC', 'STANDARD', 'Dhaka'));
assert.throws(() => calculateRepairEstimate(1500, 'NONSENSE', 'STANDARD', 'Dhaka'));
console.log('PASS: repair estimator five assertions');
