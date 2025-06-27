
import React, { useState , useEffect} from "react";
import FootballFieldDetailed from "./FootballFieldDetailed";

// --- Origin point helper ---
function getOriginCoords(direction, redzone, hash){
  const map = {
    'Going In_false_Left':   [75, 215],
    'Going In_false_Middle': [75, 145],
    'Going In_false_Right':  [75, 75],
    'Going In_true_Left':    [20, 215],
    'Going In_true_Middle':  [20, 145],
    'Going In_true_Right':   [20, 75],
    'Going Out_false_Left':  [25, 75],
    'Going Out_false_Middle':[25, 145],
    'Going Out_false_Right': [25, 215],
    'Going Out_true_Left':   [80, 75],
    'Going Out_true_Middle': [80, 145],
    'Going Out_true_Right':  [80, 215],
  };
  return map[`${direction}_${redzone}_${hash}`];
}
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const defaultForm = {
  x:"",y:"",result:"",quarter:"",down:"",distance:"",
  hash:"",week:"",receiver:"",redzone:false,team:"",direction:""
};
const defaultFilter = {
  result:"",quarter:"",down:"",hash:"",redzone:"",
  week:"",receiver:"",team:"",direction:""
};

const STORAGE_KEY = "qb_passes_v1";

export default function App(){
  const [passes,setPasses]   = useState([]);

useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { setPasses(JSON.parse(saved)); } catch {}
  }
}, []);

useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
}, [passes]);
  const [form,setForm]       = useState(defaultForm);
  const [editIdx,setEdit]    = useState(null);
  const [filter,setFilter]   = useState(defaultFilter);
  const [hoverXY,setHoverXY] = useState(null);

  /* ------ helpers ------ */
  const initials = r => r ? r.trim().split(" ").map(w=>w[0]).join("").toUpperCase() : "";
  const resetFilters = () => setFilter(defaultFilter);

  /* ------ CRUD ------ */
  function save(){
    if(form.x===""||form.y===""||form.result==="") return;
    const entry = {...form, x:+form.x, y:+form.y};
    if(editIdx !== null){
      const cp=[...passes]; cp[editIdx]=entry; setPasses(cp); setEdit(null);
    }else{
      setPasses([...passes, entry]);
    }
    setForm(defaultForm);
  }
  const startEdit = i=>{ setEdit(i); setForm(passes[i]); };
  const del = i => {
    const cp=[...passes]; cp.splice(i,1); setPasses(cp);
    if(editIdx===i){ setEdit(null); setForm(defaultForm); }
  };

  /* ------ filtering ------ */
  const shown = passes.map((p,i)=>({...p,i})).filter(p=>
    (!filter.result   || p.result===filter.result) &&
    (!filter.quarter  || p.quarter===filter.quarter) &&
    (!filter.down     || p.down===filter.down) &&
    (!filter.hash     || p.hash===filter.hash) &&
    (!filter.redzone  || (filter.redzone==="Yes")===p.redzone) &&
    (!filter.week     || p.week===filter.week) &&
    (!filter.receiver || p.receiver.toLowerCase().includes(filter.receiver.toLowerCase())) &&
    (!filter.team     || p.team.toLowerCase().includes(filter.team.toLowerCase())) &&
    (!filter.direction|| p.direction===filter.direction)
  );

  /* ------ Excel export/import ------ */
  function exportExcel(){
    const head=Object.keys(defaultForm);
    const rows=shown.map(r=>head.map(h=>r[h]));
    const ws=XLSX.utils.aoa_to_sheet([head,...rows]);
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Passes");
    const blob=XLSX.write(wb,{bookType:"xlsx",type:"array"});
    saveAs(new Blob([blob]),"passes.xlsx");
  }
  function importFile(e){
    const f=e.target.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload = ev=>{
      const wb=XLSX.read(new Uint8Array(ev.target.result),{type:"array"});
      const js=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});
      const mapped = js.map(r=>({
        x:+r.x||+r.X||"", y:+r.y||+r.Y||"",
        result:r.result||r.Result||"", quarter:r.quarter||r.Quarter||"",
        down:r.down||r.Down||"", distance:r.distance||r.Distance||"",
        hash:r.hash||r.Hash||"", week:r.week||r.Week||"",
        receiver:r.receiver||r.Receiver||"", redzone:(r.redzone||r.RedZone||"").toString().toLowerCase()==="yes",
        team:r.team||r.Team||"", direction:r.direction||r.Direction||""
      }));
      setPasses(prev=>[...prev,...mapped]);
    };
    reader.readAsArrayBuffer(f);
  }

  /* ------ styles ------ */
  const cap = (label)=>label.charAt(0).toUpperCase()+label.slice(1);
  const inputBase = {padding:"6px 8px",border:"1px solid #ccc",borderRadius:5,fontSize:14};
  const selectBase = {...inputBase};
  const btn = {background:"#2563eb",color:"#fff",border:"none",padding:"6px 12px",borderRadius:5, cursor:"pointer"};

  return (
    <div style={{background:"#101820",color:"#fefefe",minHeight:"100vh",fontFamily:"sans-serif",padding:24}}>
      <h1 style={{fontSize:28,color:"#38bdf8",marginBottom:16}}>QB Passing Map</h1>

      {/* -------- Data Entry -------- */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:24,alignItems:"center"}}>
        <input style={inputBase} placeholder="X" value={form.x} onChange={e=>setForm({...form,x:e.target.value})}/>
        <input style={inputBase} placeholder="Y" value={form.y} onChange={e=>setForm({...form,y:e.target.value})}/>
        <select style={selectBase} value={form.result} onChange={e=>setForm({...form,result:e.target.value})}>
          <option value="">Result</option><option>Completion</option><option>Incompletion</option><option>Interception</option>
        </select>
        <select style={selectBase} value={form.quarter} onChange={e=>setForm({...form,quarter:e.target.value})}>
          <option value="">Quarter</option>{["1","2","3","4","OT"].map(q=><option key={q}>{q}</option>)}
        </select>
        <select style={selectBase} value={form.down} onChange={e=>setForm({...form,down:e.target.value})}>
          <option value="">Down</option>{["1","2","3","4"].map(d=><option key={d}>{d}</option>)}
        </select>
        <input style={inputBase} placeholder="Distance" value={form.distance} onChange={e=>setForm({...form,distance:e.target.value})}/>
        <select style={selectBase} value={form.hash} onChange={e=>setForm({...form,hash:e.target.value})}>
          <option value="">Hash</option>{["Left","Middle","Right"].map(h=><option key={h}>{h}</option>)}
        </select>
        <select style={selectBase} value={form.direction} onChange={e=>setForm({...form,direction:e.target.value})}>
          <option value="">Direction</option><option>Going In</option><option>Going Out</option>
        </select>
        <input style={inputBase} placeholder="Week" value={form.week} onChange={e=>setForm({...form,week:e.target.value})}/>
        <input style={inputBase} placeholder="Receiver" value={form.receiver} onChange={e=>setForm({...form,receiver:e.target.value})}/>
        <input style={inputBase} placeholder="Team" value={form.team} onChange={e=>setForm({...form,team:e.target.value})}/>
        <label style={{display:"flex",alignItems:"center",gap:6}}>
          <input type="checkbox" checked={form.redzone} onChange={e=>setForm({...form,redzone:e.target.checked})}/>Red Zone
        </label>
        <button style={btn} onClick={save}>{editIdx!==null?"Update":"Add"} Pass</button>
        {editIdx!==null && <button style={{...btn,background:"#aaa"}} onClick={()=>{setEdit(null);setForm(defaultForm);}}>Cancel</button>}
      </div>

      {/* -------- Field -------- */}
      <div style={{position:"relative",marginBottom:24}}
           onMouseMove={e=>{
             const b=e.currentTarget.getBoundingClientRect();
             const relX=(e.clientX-b.left)/b.width;
             const yards=Math.round(((relX-0.0833)/0.8334)*100);
             const relY=Math.round(e.clientY-b.top);
             setHoverXY({x:yards,y:relY});
           }}
           onMouseLeave={()=>setHoverXY(null)}>
        <FootballFieldDetailed/>

{/* Origin QB marker */}
{(() => {
  const d = filter.direction;
  const h = filter.hash;
  const rz = filter.redzone ? (filter.redzone==="Yes") : null;
  if(!d || !h || rz===null) return null;
  const o = getOriginCoords(d, rz, h);
  if(!o) return null;
  const [ox, oy] = o;
  return (
    <div style={{
      position:"absolute",
      left:`calc(8.33% + ${(ox/100)*83.34}%)`,
      top:oy,
      width:20,height:20,
      background:"black",
      color:"white",
      fontSize:10,
      lineHeight:"20px",
      textAlign:"center",
      fontWeight:"700",
      border:"1px solid white",
      transform:"translate(-50%, -50%)",
      pointerEvents:"none"
    }}>QB</div>
  );
})()}
        {shown.map(p=>(
          <div key={p.i} style={{position:"absolute",left:`calc(8.33% + ${(p.x/100)*83.34}%)`,
                       top:p.y,transform:"translate(-50%,-50%)",textAlign:"center"}}>
            <div style={{fontSize:18,color:p.result==="Completion"?"lime":p.result==="Incompletion"?"yellow":"red"}}>
              {p.result==="Completion"?"✅":p.result==="Incompletion"?"❌":"⚠️"}
            </div>
            <div style={{fontSize:10}}>{initials(p.receiver)}</div>
          </div>
        ))}
        {hoverXY && (
          <div style={{position:"absolute",right:12,bottom:12,background:"#0008",padding:"4px 8px",
                       fontSize:12,borderRadius:4}}>
            X: {hoverXY.x}&nbsp; Y: {hoverXY.y}
          </div>
        )}
      </div>

      {/* -------- Filters -------- */}
      <h2 style={{fontSize:20,marginBottom:8,color:"#38bdf8"}}>Filters</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:24,alignItems:"center"}}>
        <select style={selectBase} value={filter.result} onChange={e=>setFilter({...filter,result:e.target.value})}>
          <option value="">Result</option><option>Completion</option><option>Incompletion</option><option>Interception</option>
        </select>
        <select style={selectBase} value={filter.quarter} onChange={e=>setFilter({...filter,quarter:e.target.value})}>
          <option value="">Quarter</option>{["1","2","3","4","OT"].map(q=><option key={q}>{q}</option>)}
        </select>
        <select style={selectBase} value={filter.down} onChange={e=>setFilter({...filter,down:e.target.value})}>
          <option value="">Down</option>{["1","2","3","4"].map(d=><option key={d}>{d}</option>)}
        </select>
        <select style={selectBase} value={filter.hash} onChange={e=>setFilter({...filter,hash:e.target.value})}>
          <option value="">Hash</option>{["Left","Middle","Right"].map(h=><option key={h}>{h}</option>)}
        </select>
        <select style={selectBase} value={filter.direction} onChange={e=>setFilter({...filter,direction:e.target.value})}>
          <option value="">Direction</option><option>Going In</option><option>Going Out</option>
        </select>
        <select style={selectBase} value={filter.redzone} onChange={e=>setFilter({...filter,redzone:e.target.value})}>
          <option value="">Red Zone</option><option>Yes</option><option>No</option>
        </select>
        <input style={inputBase} placeholder="Week" value={filter.week} onChange={e=>setFilter({...filter,week:e.target.value})}/>
        <input style={inputBase} placeholder="Receiver" value={filter.receiver} onChange={e=>setFilter({...filter,receiver:e.target.value})}/>
        <input style={inputBase} placeholder="Team" value={filter.team} onChange={e=>setFilter({...filter,team:e.target.value})}/>
        <button style={btn} onClick={resetFilters}>Reset Filters</button>
        <button style={{...btn,background:"#059669"}} onClick={exportExcel}>Export Excel</button>
        <label style={{...btn,background:"#52525b",display:"flex",justifyContent:"center"}} >
          Import CSV/Excel
          <input type="file" accept=".csv,.xlsx" style={{display:"none"}} onChange={importFile}/>
        </label>
      </div>

      {/* -------- Table -------- */}
      <table className="no-print" className="no-print" style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead>
          <tr>{Object.keys(defaultForm).map(h=><th key={h} style={{border:"1px solid #444",padding:6,background:"#1e293b"}}>{cap(h)}</th>)}<th/></tr>
        </thead>
        <tbody>
          {shown.map(p=>(
            <tr key={p.i}>
              {Object.keys(defaultForm).map(h=><td key={h} style={{border:"1px solid #333",padding:4,textAlign:"center"}}>{p[h]?.toString()}</td>)}
              <td style={{textAlign:"center",border:"1px solid #333",padding:4}}>
                <button onClick={()=>startEdit(p.i)}>✏️</button>
                <button onClick={()=>del(p.i)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
