import React, { useState } from 'react';
import FileDropzone from './components/FileDropzone';
import ResultCard from './components/ResultCard';
import axios from 'axios';
import './index.css';

export default function App(){
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [result,setResult]=useState(null);
  const [previewUrl,setPreviewUrl]=useState(null);
  const [imgMeta,setImgMeta]=useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getImageMeta = (file, url) => new Promise((resolve)=>{ const img=new Image(); img.onload=()=>resolve({width:img.width,height:img.height,size:file.size,type:file.type,name:file.name}); img.onerror=()=>resolve({size:file.size,type:file.type,name:file.name}); img.src=url; });

  const handleFile=async(file)=>{
    setError(null); setResult(null); setPreviewUrl(null); setImgMeta(null); setLoading(true);
    try{
      const ext=(file.name||'').split('.').pop().toLowerCase();
      const form=new FormData(); form.append('file', file);
      if(['png','jpg','jpeg','tiff'].includes(ext)){ const url=URL.createObjectURL(file); setPreviewUrl(url); const meta=await getImageMeta(file, url); setImgMeta(meta); }
      const res = await axios.post(`${API_URL}/api/upload`, form, { headers:{'Content-Type':'multipart/form-data'}, timeout:120000 });
      setResult(res.data);
    }catch(err){ console.error(err); setError(err.response?.data?.error || err.message); }finally{ setLoading(false); }
  };

  return (
    <div className="container">
      <div className="hero">
        <div className="hero-left">
          <div className="title">Social Media Content Analyzer</div>
          <div className="subtitle small">Upload a PDF or image — extract text, get suggestions, and a short content description.</div>
        </div>
        <div className="hero-right">
          <div className="banner"><img src="/assets/banner1.png" alt="banner" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
        </div>
      </div>

      <div className="grid">
        <div>
          <FileDropzone onFileSelected={handleFile} disabled={loading} />
          {loading && <div className="card small" style={{marginTop:14}}>Processing file — this can take a few seconds.</div>}
          {error && <div className="card" style={{color:'#991b1b',marginTop:14}}>Error: {error}</div>}
          {result && <ResultCard data={result} />}
        </div>

        <aside>
          <div className="card">
            <h3 style={{marginTop:0}}>Preview</h3>
            <div style={{marginTop:8}} className="preview">
              {previewUrl ? <img src={previewUrl} alt="preview" /> : <div style={{textAlign:'center'}} className="small">No preview — upload an image to see preview here.</div>}
            </div>
            {imgMeta && <div className="meta-row"><div className="meta">Name: {imgMeta.name}</div><div className="meta">Size: {Math.round(imgMeta.size/1024)} KB</div><div className="meta">Dims: {imgMeta.width}x{imgMeta.height}</div></div>}
            <div style={{marginTop:12}} className="small">Tip: For best OCR, upload a straight, well-lit photo of the document. For face/photo analysis, upload a clear portrait.</div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h4 style={{margin:0}}>Quick Actions</h4>
            <div style={{marginTop:10,display:'flex',gap:8}}>
              <button className="btn primary" onClick={()=>window.print()}>Print Analysis</button>
              <button className="btn ghost" onClick={()=>{ navigator.clipboard.writeText(result?.text||'') }}>Copy Text</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
