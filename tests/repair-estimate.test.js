// Executes the real TypeScript function after the test runner compiles the pure utility.
const assert=require('node:assert/strict');
const {calculateRepairEstimate}=require(process.argv[2]);
let e=calculateRepairEstimate(1500,'BASIC','STANDARD','Dhaka');
assert.deepEqual({min:e.min,mid:e.mid,max:e.max},{min:1403,mid:1650,max:1898});
e=calculateRepairEstimate(1500,'COMPLEX','DELUXE','Rajshahi');
assert.deepEqual({min:e.min,mid:e.mid,max:e.max},{min:4463,mid:5250,max:6038});
assert.equal(e.method,'RULE_BASED');
assert.throws(()=>calculateRepairEstimate(-1,'BASIC','STANDARD','Dhaka'));
assert.throws(()=>calculateRepairEstimate(1500,'NONSENSE','STANDARD','Dhaka'));
console.log('Repair estimator: 5 assertions passed');
