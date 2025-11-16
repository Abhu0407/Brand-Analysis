import React from 'react';

export default function MentionList({ items }){
  return (
    <div style={{ maxHeight:600, overflow:'auto', border:'1px solid #eee', padding:8, background:'#fff' }}>
      {items.map(it => (
        <div key={it._id} style={{ padding:10, borderBottom:'1px solid #f0f0f0' }}>
          <div style={{ fontSize:12, color:'#666' }}>{it.platform} • {new Date(it.createdAt).toLocaleString()}</div>
          <div style={{ marginTop:6 }}>{it.content?.slice(0,400)}{it.content && it.content.length>400 ? '...' : ''}</div>
          <div style={{ marginTop:6, fontSize:12 }}><strong>Sentiment:</strong> {it.sentiment} ({it.sentimentScore?.toFixed?.(2) ?? ''})</div>
        </div>
      ))}
    </div>
  );
}
