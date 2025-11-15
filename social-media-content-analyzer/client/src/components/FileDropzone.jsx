import React from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileDropzone({ onFileSelected, disabled }){
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg', '.tiff'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => { if (acceptedFiles && acceptedFiles[0]) onFileSelected(acceptedFiles[0]); }
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'drag' : ''}`}>
      <input {...getInputProps()} disabled={disabled} />
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="icon">UP</div>
        <div className="info">
          <div className="bold">Drag & drop a PDF or image here</div>
          <div className="muted" style={{marginTop:6}}>or click to browse — supports PDF, JPG, PNG, TIFF.</div>
        </div>
      </div>
    </div>
  );
}
