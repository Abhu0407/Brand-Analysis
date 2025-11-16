import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MentionList from './MentionList';
import { PieChart, Pie, Tooltip, Legend } from 'recharts';

export default function Dashboard(){
  const [mentions, setMentions] = useState([]);
  const [brand, setBrand] = useState('nice shoes');

  useEffect(()=> {
    fetch();
    const id = setInterval(fetch, 5000);
    return ()=> clearInterval(id);
  }, []);

  async function fetch(){
    try{
      const r = await axios.get('http://localhost:4000/api/mentions?limit=200');
      setMentions(r.data);
    }catch(e){
      console.error(e);
    }
  }

  async function startMonitoring(){
    try{
      await axios.post('http://localhost:4000/api/control/start', { brand });
      alert('Started monitoring ' + brand);
    }catch(e){ alert('error'); }
  }

  const counts = mentions.reduce((acc,m)=>{ acc[m.sentiment] = (acc[m.sentiment]||0)+1; return acc; },{});
  const pieData = Object.entries(counts).map(([k,v])=>({name:k,value:v}));

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 360px', gap:20}}>
      <div>
        <div style={{display:'flex',gap:8, marginBottom:12}}>
          <input value={brand} onChange={e=>setBrand(e.target.value)} />
          <button onClick={startMonitoring}>Start</button>
        </div>
        <h3>Recent Mentions</h3>
        <MentionList items={mentions} />
      </div>
      <div>
        <h3>Sentiment</h3>
        <PieChart width={320} height={240}>
          <Pie dataKey="value" data={pieData} outerRadius={80} fill="#8884d8">
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}
