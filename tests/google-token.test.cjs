const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const Module=require('node:module');
const filename=require('node:path').resolve(__dirname,'../services/auth/src/modules/auth/verify-google-token.ts');
const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const m=new Module(filename, module);m.filename=filename;m.paths=module.paths;m._compile(compiled,filename);
const {verifyGoogleIdToken}=m.exports;
const {publicKey,privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'fixture-key',alg:'RS256',use:'sig'};
const originalFetch=global.fetch;
global.fetch=async()=>({ok:true,headers:{get:()=> 'max-age=180'},json:async()=>({keys:[jwk]})});
function token(changes={}){
 const now=Math.floor(Date.now()/1000);
 const header=Buffer.from(JSON.stringify({kid:'fixture-key',alg:'RS256',typ:'JWT'})).toString('base64url');
 const payload=Buffer.from(JSON.stringify({iss:'https://accounts.google.com',aud:'fixbari-test-client',sub:'sub123',email:'somebody@example.org',email_verified:true,iat:now,exp:now+300,...changes})).toString('base64url');
 const message=`${header}.${payload}`;
 const sig=crypto.sign('RSA-SHA256',Buffer.from(message),privateKey).toString('base64url');
 return `${message}.${sig}`;
}
(async()=>{
 try{
  assert.equal((await verifyGoogleIdToken(token(),'fixbari-test-client')).sub,'sub123');
  await assert.rejects(verifyGoogleIdToken(token({aud:'other'}),'fixbari-test-client'));
  await assert.rejects(verifyGoogleIdToken(token({email_verified:false}),'fixbari-test-client'));
  await assert.rejects(verifyGoogleIdToken(token({exp:1}),'fixbari-test-client'));
  await assert.rejects(verifyGoogleIdToken(token({iss:'https://attacker.example'}),'fixbari-test-client'));
  const tampered=token().split('.');tampered[1]=Buffer.from(JSON.stringify({sub:'attacker'})).toString('base64url');
  await assert.rejects(verifyGoogleIdToken(tampered.join('.'),'fixbari-test-client'));
  console.log('PASS Google ID token: valid signature, rejects wrong audience, unverified email, expiry, issuer, tampering');
 }finally{global.fetch=originalFetch;}
})().catch(e=>{console.error(e);process.exit(1)});
