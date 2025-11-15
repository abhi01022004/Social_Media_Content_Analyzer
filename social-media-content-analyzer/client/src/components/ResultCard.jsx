import React from 'react';

export default function ResultCard({ data }){
  return (
    <div className="card" id="analysis-card" style={{marginTop:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <h2 style={{margin:0}}>Extracted Text & Analysis</h2>
          <div className="small" style={{marginTop:4}}>Automatic extraction, NLP description & suggestions</div>
        </div>
        <div className="actions">
          <button className="btn ghost" onClick={()=>navigator.clipboard?.writeText(data.text)}>Copy</button>
          <button className="btn primary" onClick={()=>window.print()}>Print</button>
        </div>
      </div>

      <div style={{marginTop:12}} className="extracted">{data.text || 'No extracted text'}</div>

      <h3 style={{marginTop:12}}>Document Description</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div className="card" style={{padding:10}}>
          <strong>Type</strong><div className="small" style={{marginTop:6}}>{data.description?.type || 'Unknown'}</div>
        </div>
        <div className="card" style={{padding:10}}>
          <strong>Confidence</strong><div className="small" style={{marginTop:6}}>{data.description?.confidence ? (data.description.confidence*100).toFixed(0) + '%' : '—'}</div>
        </div>
        <div style={{gridColumn:'1/-1'}} className="card" style={{padding:12}}>
          <strong>Summary</strong>
          <div className="small" style={{marginTop:6}}>{data.description?.summary || 'No summary available.'}</div>
        </div>
        <div style={{gridColumn:'1/-1'}} className="card" style={{padding:12}}>
          <strong>Keywords</strong>
          <div className="small" style={{marginTop:6}}>{data.description?.keywords ? data.description.keywords.join(', ') : '—'}</div>
        </div>
      </div>

      <h3 style={{marginTop:12}}>Suggestions</h3>
      <div className="suggestions">
        <ul>{data.suggestions && data.suggestions.length ? data.suggestions.map((s,i)=><li key={i}>{s}</li>) : <li>No suggestions</li>}</ul>
      </div>
    </div>
  );
}
