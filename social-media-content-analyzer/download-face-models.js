const fs = require('fs');
const path = require('path');
const https = require('https');
const MODEL_DIR = path.join(__dirname, 'client', 'public', 'models');
const RAW_BASE = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const manifests = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'face_expression_model-weights_manifest.json',
  'face_landmark_68_model-weights_manifest.json'
];
function ensureDir(d){ if(!fs.existsSync(d)) fs.mkdirSync(d, { recursive:true }); }
function downloadFile(url, dest){ return new Promise((resolve,reject)=>{ const file = fs.createWriteStream(dest); https.get(url, res=>{ if(res.statusCode!==200){ file.close(); if(fs.existsSync(dest)) fs.unlinkSync(dest); return reject(new Error('status '+res.statusCode)); } res.pipe(file); file.on('finish', ()=>file.close(resolve)); }).on('error', err=>{ if(fs.existsSync(dest)) fs.unlinkSync(dest); reject(err); }); }); }
async function downloadManifestAndShards(manifest){ const manifestUrl = RAW_BASE + manifest; const dest = path.join(MODEL_DIR, manifest); console.log('Downloading', manifestUrl); await downloadFile(manifestUrl, dest); const manifestJson = JSON.parse(fs.readFileSync(dest,'utf8')); const paths = new Set(); if(Array.isArray(manifestJson.paths)) manifestJson.paths.forEach(p=>paths.add(p)); if(Array.isArray(manifestJson.weights)) manifestJson.weights.forEach(w=>{ if(typeof w==='string') paths.add(w); else if(w.path) paths.add(w.path); else if(w.file) paths.add(w.file); }); for(const p of paths){ if(!p) continue; const fileName = path.basename(p); const remote = RAW_BASE + fileName; const local = path.join(MODEL_DIR, fileName); if(fs.existsSync(local)){ console.log('Exists', fileName); continue; } try{ console.log(' ->', remote); await downloadFile(remote, local); console.log('Saved', fileName); }catch(e){ console.warn('Failed', remote, e.message); } } }
(async ()=>{ try{ ensureDir(MODEL_DIR); for(const m of manifests) await downloadManifestAndShards(m); console.log('Done.'); }catch(e){ console.error('Error', e); process.exit(1);} })();
