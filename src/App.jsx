import{useState,useEffect,useMemo,useCallback,useRef}from"react";
const API="https://hiuclxudffbdtqtzlirc.supabase.co/functions/v1/kanban-api";
const ACT="https://hiuclxudffbdtqtzlirc.supabase.co/functions/v1/kanban-action";

const STAGES=[
  {key:"triage",label:"Triage",color:"#eb5757",nd:true,dropTarget:false},
  {key:"backlog",label:"Backlog",color:"#93959f",nd:true,dropTarget:false},
  {key:"todo",label:"Todo",color:"#f2994a",dropTarget:true},
  {key:"ready",label:"Ready",color:"#0d9373",dropTarget:false},
  {key:"done",label:"Done",color:"#0d9373",dropTarget:false},
  {key:"canceled",label:"Canceled",color:"#94a3b8",dropTarget:true},
];
function classify(i){const ls=i.labels||[];if(ls.includes("canceled"))return"canceled";if(i.state==="closed")return"done";if(ls.includes("needs-revision"))return"triage";if(ls.includes("ready")&&ls.some(l=>["cc","codex","cc-local"].includes(l)))return"ready";if(ls.some(l=>["cc","codex","cc-local"].includes(l)))return"todo";if(ls.some(l=>["lp-optimizer","dividend-app","ops","automation","infrastructure","enhancement"].includes(l)))return"backlog";return"triage"}
function daysSince(d){return d?Math.floor((new Date()-new Date(d))/864e5):0}
const EXEC={opus:{key:"opus",label:"cc-work (Opus)",color:"#9c6ade",bg:"#f3f0ff",border:"#c4b5fd",icon:"\u25c6",desc:"複雑な設計・推論 [cc-work]",action:"cc"},sonnet:{key:"sonnet",label:"cc-work (Sonnet)",color:"#5e6ad2",bg:"#eff0ff",border:"#c7d2fe",icon:"\u25c7",desc:"標準実装 [cc-work]",action:"cc"},codex:{key:"codex",label:"Codex",color:"#0d9373",bg:"#ecfdf5",border:"#a7f3d0",icon:"\u25a1",desc:"機械的作業 [Codex]",action:"codex"}};
function recommendExec(item){const t=(item.title||"").toLowerCase();const ls=item.labels||[];if(ls.includes("size:L")||["epic","phase","architect","設計","リファクタ","移行","pipeline","system","構築","統合テスト","e2e","セットアップ"].some(k=>t.includes(k)))return EXEC.opus;if(ls.includes("epic")||ls.includes("infrastructure"))return EXEC.opus;if(ls.includes("size:S")&&!ls.includes("bug"))return EXEC.codex;if(["test","lint","fix:","rename","format","typo","hello","cleanup","削除","アップロード","push"].some(k=>t.includes(k)))return EXEC.codex;return EXEC.sonnet}
const LC={"cc":"#5e6ad2","ready":"#0d9373","needs-revision":"#eb5757","bug":"#eb5757","epic":"#9c6ade","lp-optimizer":"#26b5ce","enhancement":"#0d9373","automation":"#f2994a","infrastructure":"#5e6ad2","dividend-app":"#f2c94c","ops":"#e55c8a","skill":"#0d9373","cc-local":"#d4a017","codex":"#5e6ad2","canceled":"#94a3b8"};
const SI=({status,sz=15})=>{const m={triage:["#eb5757","o"],backlog:["#93959f","o"],todo:["#f2994a","h"],ready:["#0d9373","f"],done:["#0d9373","c"],canceled:["#94a3b8","x"]};const[c,t]=m[status]||m.triage;if(t==="c")return<svg width={sz} height={sz} viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill={c}/><path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;if(t==="f")return<svg width={sz} height={sz} viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill={c}/><circle cx="8" cy="8" r="3" fill="#fff"/></svg>;if(t==="h")return<svg width={sz} height={sz} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke={c} strokeWidth="1.2"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13" fill={c}/></svg>;if(t==="x")return<svg width={sz} height={sz} viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill={c}/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>;return<svg width={sz} height={sz} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke={c} strokeWidth="1.2"/></svg>};
const Pill=({children,color,filled})=><span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"1px 7px",borderRadius:12,fontSize:10,fontWeight:500,color:filled?"#fff":(color||"#666"),background:filled?(color||"#666"):(color||"#666")+"14",whiteSpace:"nowrap",lineHeight:"18px"}}>{children}</span>;
function RefreshRing({seconds,total,onRefresh,syncing}){const pct=seconds/total,r=10,c=2*Math.PI*r;return<div onClick={onRefresh} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:8,background:syncing?"#0d937315":"#f7f7f8",border:"1px solid "+(syncing?"#0d937330":"#e6e6e9")}}><svg width="24" height="24" viewBox="0 0 24 24" style={{transform:"rotate(-90deg)"}}><circle cx="12" cy="12" r={r} fill="none" stroke="#eaeaed" strokeWidth="2"/><circle cx="12" cy="12" r={r} fill="none" stroke={syncing?"#0d9373":"#5e6ad2"} strokeWidth="2" strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/></svg><span style={{fontSize:11,fontWeight:500,color:syncing?"#0d9373":"#8e8ea0",minWidth:24}}>{syncing?"...":`${seconds}s`}</span></div>}

function DelegateModal({item,onClose,onAction}){const rec=recommendExec(item);const[size,setSize]=useState(item.labels?.find(l=>l.startsWith("size:"))?.slice(5)||"S");const[desc,setDesc]=useState(item.title);const[busy,setBusy]=useState(false);const exec=async(ex,model)=>{setBusy(true);await onAction("delegate-"+ex,{title:item.title,description:desc,size,model});setBusy(false);onClose()};return<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:998,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:12,padding:24,width:440,maxWidth:"92vw",boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}><div style={{fontSize:14,fontWeight:600,color:"#1a1a2e",marginBottom:4}}>タスクを委譲</div><div style={{fontSize:12,color:"#8e8ea0",marginBottom:8}}>#{item.number} {item.title}</div><div style={{background:rec.bg,border:`1px solid ${rec.border}`,borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{rec.icon}</span><div><div style={{fontSize:12,fontWeight:600,color:rec.color}}>推奨: {rec.label}</div><div style={{fontSize:10,color:"#8e8ea0"}}>{rec.desc}</div></div></div><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} style={{width:"100%",background:"#f7f7f8",border:"1px solid #e6e6e9",borderRadius:8,padding:10,fontSize:12,color:"#1a1a2e",resize:"vertical",marginBottom:12,boxSizing:"border-box",fontFamily:"inherit"}}/><div style={{display:"flex",gap:6,marginBottom:12}}>{["S","M","L"].map(s=><button key={s} onClick={()=>setSize(s)} style={{flex:1,padding:6,borderRadius:8,border:size===s?"2px solid #5e6ad2":"1px solid #e6e6e9",background:size===s?"#eff0ff":"#fff",color:size===s?"#5e6ad2":"#8e8ea0",fontSize:12,fontWeight:600,cursor:"pointer"}}>{s}</button>)}</div><div style={{display:"flex",gap:6}}>{[{ex:"cc",label:"cc-work (Opus)",bg:"#9c6ade",match:"opus"},{ex:"cc",label:"cc-work (Sonnet)",bg:"#5e6ad2",match:"sonnet"},{ex:"codex",label:"Codex",bg:"#0d9373",match:"codex"}].map(b=>{const isR=rec.key===b.match;return<button key={b.match} onClick={()=>exec(b.ex,b.match==="codex"?undefined:b.match)} disabled={busy} style={{flex:isR?1.3:1,padding:isR?12:10,borderRadius:10,border:isR?`2px solid ${b.bg}`:"1px solid #e6e6e9",background:isR?b.bg:"#fff",color:isR?"#fff":b.bg,fontSize:isR?13:12,fontWeight:600,cursor:"pointer",position:"relative"}}>{isR&&<span style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:9,background:b.bg,color:"#fff",padding:"1px 8px",borderRadius:8}}>推奨</span>}{b.label}</button>})}</div></div></div>}

function IssueCard({item,stage,needsDelegate,onDelegate,doAction,onDragStart}){
  const ls=item.labels||[];const isDone=stage==="done";const isCan=stage==="canceled";const urgent=needsDelegate&&!isDone&&!isCan;const rec=(!isDone&&!isCan)?recommendExec(item):null;const inactive=isDone||isCan;
  const draggable=!inactive&&(stage==="triage"||stage==="backlog");
  return<div draggable={draggable} onDragStart={e=>{if(!draggable)return;e.dataTransfer.setData("application/json",JSON.stringify({number:item.number,title:item.title,labels:ls}));e.dataTransfer.effectAllowed="move";onDragStart&&onDragStart(item)}} style={{background:urgent?"#fff8f0":inactive?"#fafafa":"#fff",borderRadius:8,padding:"12px",marginBottom:6,border:urgent?"1.5px solid #f2994a50":"1px solid #eaeaed",position:"relative",boxShadow:item.stale?"0 0 0 2px #eb575730":"none",animation:"cardIn 0.3s ease both",opacity:isCan?0.5:1,cursor:draggable?"grab":"default"}}>
    {item.stale&&!inactive&&<div style={{position:"absolute",top:8,right:8,display:"flex",alignItems:"center",gap:3,background:"#eb575712",padding:"2px 8px",borderRadius:10}}><div style={{width:6,height:6,borderRadius:"50%",background:"#eb5757",animation:"blink 1.5s infinite"}}/><span style={{fontSize:9,fontWeight:600,color:"#eb5757"}}>{daysSince(item.updated_at)}d</span></div>}
    {urgent&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><div style={{display:"inline-flex",alignItems:"center",gap:4,background:"#f2994a18",border:"1px solid #f2994a30",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600,color:"#f2994a"}}><svg width="10" height="10" viewBox="0 0 16 16"><path d="M8 1l7 14H1z" fill="none" stroke="#f2994a" strokeWidth="1.5"/><line x1="8" y1="6" x2="8" y2="10" stroke="#f2994a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="13" r="0.8" fill="#f2994a"/></svg>要委譲</div>{rec&&<div style={{display:"inline-flex",alignItems:"center",gap:4,background:rec.bg,border:`1px solid ${rec.border}`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600,color:rec.color}}>{rec.icon} {rec.label}</div>}</div>}
    {!urgent&&!inactive&&rec&&<div style={{display:"inline-flex",alignItems:"center",gap:4,background:rec.bg,border:`1px solid ${rec.border}`,borderRadius:6,padding:"2px 8px",marginBottom:6,fontSize:10,fontWeight:600,color:rec.color}}>{rec.icon} {rec.label}</div>}
    {draggable&&<div style={{position:"absolute",top:12,right:10,fontSize:10,color:"#d1d1db",display:"flex",flexDirection:"column",gap:1,lineHeight:1,cursor:"grab"}}><span>⠿</span></div>}
    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><SI status={stage} sz={14}/><span style={{fontFamily:"monospace",fontSize:10,color:"#93959f"}}>#{item.number}</span></div>
    <div onClick={()=>item.html_url&&window.open(item.html_url,"_blank")} style={{fontSize:12.5,fontWeight:500,lineHeight:1.4,color:isCan?"#93959f":"#1a1a2e",wordBreak:"break-word",cursor:"pointer",marginBottom:6,textDecoration:isCan?"line-through":"none",paddingRight:draggable?16:0}}>{item.title.length>65?item.title.slice(0,65)+"...":item.title}</div>
    {ls.filter(l=>!l.startsWith("size:")&&l!=="canceled").length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>{ls.filter(l=>!l.startsWith("size:")&&l!=="canceled").slice(0,3).map(l=><Pill key={l} color={LC[l]} filled={["cc","codex","cc-local"].includes(l)}>{l}</Pill>)}</div>}
    {!inactive&&<div style={{display:"flex",gap:4,padding:"6px 0 0",borderTop:"1px solid #f2f2f4",alignItems:"center"}}>
      {rec&&rec.key==="opus"&&<button onClick={e=>{e.stopPropagation();doAction("delegate-cc",{title:item.title,description:item.title,size:"S",model:"opus"})}} style={{display:"flex",alignItems:"center",gap:4,background:urgent?"#9c6ade":"#f3f0ff",border:urgent?"none":"1px solid #c4b5fd",borderRadius:6,padding:urgent?"5px 10px":"4px 8px",fontSize:urgent?11:10,color:urgent?"#fff":"#9c6ade",cursor:"pointer",fontWeight:600}}>{"\u25c6"} cc-work (Opus)</button>}
      {rec&&rec.key==="sonnet"&&<button onClick={e=>{e.stopPropagation();doAction("delegate-cc",{title:item.title,description:item.title,size:"S",model:"sonnet"})}} style={{display:"flex",alignItems:"center",gap:4,background:urgent?"#5e6ad2":"#eff0ff",border:urgent?"none":"1px solid #c7d2fe",borderRadius:6,padding:urgent?"5px 10px":"4px 8px",fontSize:urgent?11:10,color:urgent?"#fff":"#5e6ad2",cursor:"pointer",fontWeight:600}}>{"\u25c7"} cc-work (Sonnet)</button>}
      {rec&&rec.key==="codex"&&<button onClick={e=>{e.stopPropagation();doAction("delegate-codex",{title:item.title,description:item.title,size:"S"})}} style={{display:"flex",alignItems:"center",gap:4,background:urgent?"#0d9373":"#ecfdf5",border:urgent?"none":"1px solid #a7f3d0",borderRadius:6,padding:urgent?"5px 10px":"4px 8px",fontSize:urgent?11:10,color:urgent?"#fff":"#0d9373",cursor:"pointer",fontWeight:600}}>{"\u25a1"} Codex</button>}
      {rec&&rec.key!=="opus"&&<button onClick={e=>{e.stopPropagation();doAction("delegate-cc",{title:item.title,description:item.title,size:"S",model:"sonnet"})}} style={{background:"transparent",border:"1px solid #e6e6e9",borderRadius:6,padding:"4px 8px",fontSize:10,color:"#93959f",cursor:"pointer"}}>CC</button>}
      {rec&&rec.key!=="codex"&&<button onClick={e=>{e.stopPropagation();doAction("delegate-codex",{title:item.title,description:item.title,size:"S"})}} style={{background:"transparent",border:"1px solid #e6e6e9",borderRadius:6,padding:"4px 8px",fontSize:10,color:"#93959f",cursor:"pointer"}}>Codex</button>}
      <button onClick={e=>{e.stopPropagation();onDelegate(item)}} style={{background:"transparent",border:"1px solid #e6e6e9",borderRadius:6,padding:"4px 8px",fontSize:10,color:"#93959f",cursor:"pointer"}}>{"\u22ef"}</button>
      <button onClick={e=>{e.stopPropagation();if(confirm(`#${item.number} をキャンセル？`))doAction("cancel-issue",{number:item.number})}} style={{marginLeft:"auto",background:"transparent",border:"1px solid #e6e6e9",borderRadius:6,padding:"4px 8px",fontSize:10,color:"#b4b4c0",cursor:"pointer"}}><svg width="10" height="10" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="#b4b4c0" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
    </div>}
  </div>}

export default function App(){
  const[data,setData]=useState(null);const[ld,setLd]=useState(true);const[modal,setModal]=useState(null);const[toasts,setToasts]=useState([]);const[search,setSrc]=useState("");const[epF,setEpF]=useState(null);const[countdown,setCd]=useState(60);const[syncing,setSyncing]=useState(false);const[flash,setFlash]=useState(false);const[dragOver,setDragOver]=useState(null);const[dragging,setDragging]=useState(false);const dropBusyRef=useRef(false);
  const toast=(text,ok=true)=>{const t={text,ok,id:Date.now()};setToasts(p=>[...p,t]);setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),3000)};
  const fetchData=useCallback(async(sf=false)=>{setLd(true);setSyncing(true);try{setData(await(await fetch(API)).json());if(sf){setFlash(true);setTimeout(()=>setFlash(false),600)}}catch(e){toast(String(e),false)}setLd(false);setSyncing(false);setCd(60)},[]);
  const doAction=async(action,payload)=>{try{const d=await(await fetch(ACT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,payload})})).json();if(d.ok){toast(d.issue_number?`Issue #${d.issue_number} created`:`${action} done`);setTimeout(()=>fetchData(true),500)}else toast(d.error||"Error",false)}catch(e){toast(String(e),false)}};

  const handleDrop=useCallback(async(targetStage,e)=>{
    e.preventDefault();e.stopPropagation();setDragOver(null);setDragging(false);
    if(dropBusyRef.current)return;
    dropBusyRef.current=true;
    try{
      const raw=e.dataTransfer.getData("application/json");
      if(!raw){dropBusyRef.current=false;return}
      const item=JSON.parse(raw);
      if(targetStage==="todo"){
        const rec=recommendExec(item);
        if(!confirm(`#${item.number} を ${rec.label} で委譲しますか？`)){dropBusyRef.current=false;return}
        toast(`#${item.number} → ${rec.label} で自動委譲中...`);
        await doAction("delegate-"+rec.action,{title:item.title,description:item.title,model:rec.key==="codex"?undefined:(rec.key==="opus"?"opus":"sonnet"),size:item.labels?.find(l=>l.startsWith("size:"))?.slice(5)||"S"});
      }else if(targetStage==="canceled"){
        if(!confirm(`#${item.number} をキャンセルしますか？`)){dropBusyRef.current=false;return}
        toast(`#${item.number} をキャンセル中...`);
        await doAction("cancel-issue",{number:item.number});
      }
    }catch(err){toast("Drop error: "+err,false)}
    finally{setTimeout(()=>{dropBusyRef.current=false},2000)}
  },[]);

  useEffect(()=>{fetchData();const iv=setInterval(()=>{setCd(p=>{if(p<=1){fetchData(true);return 60}return p-1})},1000);return()=>clearInterval(iv)},[fetchData]);
  const issues=useMemo(()=>{if(!data)return[];return data.github_issues.filter(i=>!i.is_pr).map(x=>{const ls=typeof x.labels==="string"?JSON.parse(x.labels):x.labels;return{...x,labels:ls,stage:classify({...x,labels:ls}),stale:x.state==="open"&&daysSince(x.updated_at)>5}}).filter(i=>{if(search&&!i.title.toLowerCase().includes(search.toLowerCase()))return false;if(epF&&i.epic!==epF)return false;return true})},[data,search,epF]);
  const grouped=useMemo(()=>{const m={};STAGES.forEach(s=>m[s.key]=[]);issues.forEach(i=>{if(m[i.stage])m[i.stage].push(i)});m.done=m.done.slice(0,10);m.canceled=m.canceled.slice(0,10);return m},[issues]);
  const total=issues.length,closed=issues.filter(i=>i.state==="closed"&&i.stage!=="canceled").length,open=issues.filter(i=>i.state==="open").length,canceled=(grouped.canceled||[]).length;
  const pct=(total-canceled)?Math.round(closed/(total-canceled)*100):0;const nd=(grouped.triage||[]).length+(grouped.backlog||[]).length;
  const epics=[...new Set(issues.map(i=>i.epic).filter(Boolean))];

  if(ld&&!data)return<div style={{background:"#f4f4f6",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><div style={{color:"#8e8ea0"}}>Loading...</div></div>;

  return<div style={{background:"#f4f4f6",minHeight:"100vh",fontFamily:"-apple-system,'Noto Sans JP','Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
    <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}@keyframes cardIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@keyframes flash{from{opacity:1}to{opacity:0}}@keyframes nudge{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}@keyframes dropPulse{0%,100%{box-shadow:inset 0 0 0 2px #f2994a40}50%{box-shadow:inset 0 0 0 3px #f2994a80}}@keyframes dropPulseCancel{0%,100%{box-shadow:inset 0 0 0 2px #94a3b840}50%{box-shadow:inset 0 0 0 3px #94a3b880}}`}</style>
    {flash&&<div style={{position:"fixed",inset:0,background:"#0d937308",pointerEvents:"none",zIndex:900,animation:"flash 0.6s ease-out forwards"}}/>}
    <div style={{position:"fixed",bottom:16,right:16,zIndex:999,display:"flex",flexDirection:"column",gap:6}}>{toasts.map(m=><div key={m.id} style={{background:m.ok?"#0d9373":"#eb5757",color:"#fff",padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:500,boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>{m.text}</div>)}</div>
    {modal&&<DelegateModal item={modal} onClose={()=>setModal(null)} onAction={doAction}/>}

    <div style={{background:"#fff",borderBottom:"1px solid #eaeaed",padding:"12px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:26,height:26,borderRadius:6,background:"linear-gradient(135deg,#5e6ad2,#9c6ade)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>T</div><span style={{fontSize:15,fontWeight:600,color:"#1a1a2e"}}>Issue pipeline</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input type="text" placeholder="Filter..." value={search} onChange={e=>setSrc(e.target.value)} style={{background:"#f7f7f8",border:"1px solid #e6e6e9",borderRadius:6,padding:"5px 12px",fontSize:12,color:"#1a1a2e",width:160,outline:"none"}}/>
          <button onClick={async()=>{toast("Syncing...");await doAction("sync-github",{})}} style={{background:"#f7f7f8",border:"1px solid #e6e6e9",borderRadius:6,padding:"5px 10px",fontSize:11,color:"#5e6ad2",cursor:"pointer",fontWeight:500}}>🔄</button>
          <RefreshRing seconds={countdown} total={60} onRefresh={()=>fetchData(true)} syncing={syncing}/>
        </div>
      </div>
      {epics.length>0&&<div style={{display:"flex",gap:4,marginTop:8}}>{epics.map(ep=><button key={ep} onClick={()=>setEpF(epF===ep?null:ep)} style={{background:epF===ep?"#f3f0ff":"transparent",border:"1px solid "+(epF===ep?"#c4b5fd":"#e6e6e9"),borderRadius:6,padding:"3px 10px",fontSize:11,color:"#9c6ade",cursor:"pointer",fontWeight:epF===ep?600:400}}>📦 {ep}</button>)}{epF&&<button onClick={()=>setEpF(null)} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"3px 8px",fontSize:11,color:"#eb5757",cursor:"pointer"}}>✕</button>}</div>}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,padding:"12px 16px 4px"}}>
      {[{l:"Total",v:total,c:"#1a1a2e"},{l:"Open",v:open,c:"#f2994a"},{l:`Done (${pct}%)`,v:closed,c:"#0d9373"},{l:"要委譲",v:nd,c:nd?"#f2994a":"#93959f",bg:nd?"#fff8f0":undefined},{l:"Canceled",v:canceled,c:"#94a3b8"}].map(m=><div key={m.l} style={{background:m.bg||"#fff",borderRadius:8,padding:"10px 14px",border:"1px solid #eaeaed",animation:m.v>0&&m.l==="要委譲"?"nudge 3s ease infinite":"none"}}><div style={{fontSize:11,color:"#8e8ea0"}}>{m.l}</div><div style={{fontSize:22,fontWeight:500,color:m.c}}>{m.v}</div></div>)}
    </div>
    <div style={{padding:"4px 16px 4px",display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:8,background:"#eaeaed",borderRadius:4,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,#0d9373,#26b5ce)",borderRadius:4,transition:"width 0.8s ease"}}/></div><span style={{fontSize:12,fontWeight:600,color:"#1a1a2e"}}>{pct}%</span></div>
    <div style={{padding:"0 16px 8px",display:"flex",gap:12,fontSize:11}}>{Object.values(EXEC).map(e=><span key={e.key} style={{display:"flex",alignItems:"center",gap:4,color:e.color,fontWeight:500}}><span style={{background:e.bg,border:`1px solid ${e.border}`,borderRadius:4,padding:"1px 6px",fontSize:10}}>{e.icon} {e.label}</span>{e.desc}</span>)}</div>
    {/* Drag hint */}
    {dragging&&<div style={{padding:"0 16px 8px",fontSize:11,color:"#f2994a",fontWeight:500,display:"flex",alignItems:"center",gap:6}}>
      <svg width="14" height="14" viewBox="0 0 16 16"><path d="M2 8h12M10 4l4 4-4 4" stroke="#f2994a" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
      Todoにドロップ → AI推奨で自動委譲 ｜ Canceledにドロップ → キャンセル
    </div>}

    <div style={{display:"flex",gap:2,padding:"0 8px 12px",overflowX:"auto",flex:1,alignItems:"flex-start"}}>
      {STAGES.map((s,idx)=>{
        const items=grouped[s.key]||[];const isND=s.nd&&items.length>0;const isCan=s.key==="canceled";const isDrop=s.dropTarget;const isOver=dragOver===s.key;
        return<div key={s.key} style={{display:"flex",alignItems:"flex-start"}}>
          {idx>0&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",width:isCan?12:20,minHeight:80}}><svg width={isCan?"12":"20"} height="30" viewBox={isCan?"0 0 12 30":"0 0 20 30"}><path d={isCan?"M0 15h12":"M0 15h20"} stroke="#d1d1db" strokeWidth="1"/>{!isCan&&<path d="M15 10l5 5-5 5" stroke="#d1d1db" strokeWidth="1" fill="none"/>}</svg></div>}
          <div
            onDragOver={e=>{if(isDrop){e.preventDefault();e.dataTransfer.dropEffect="move";setDragOver(s.key)}}}
            onDragEnter={e=>{if(isDrop){e.preventDefault();setDragOver(s.key)}}}
            onDragLeave={()=>{if(dragOver===s.key)setDragOver(null)}}
            onDrop={e=>isDrop&&handleDrop(s.key,e)}
            style={{flex:"1 1 220px",minWidth:isCan?160:220,maxWidth:isCan?220:340,
              background:isOver?(s.key==="canceled"?"#f0f0f3":"#fff3e6"):isND?"#fff8f0":isCan?"#f9f9fa":s.color+"06",
              borderRadius:10,
              border:isOver?(s.key==="canceled"?"2px dashed #94a3b8":"2px dashed #f2994a"):isND?`2px solid #f2994a40`:isCan?"1px dashed #d1d1db":`1px solid ${s.color}18`,
              overflow:"hidden",transition:"all 0.2s",
              animation:isOver?(s.key==="canceled"?"dropPulseCancel 1s infinite":"dropPulse 1s infinite"):"none"}}>
            <div style={{padding:"10px 12px",borderBottom:isND?`1px solid #f2994a20`:isCan?"1px dashed #d1d1db":`1px solid ${s.color}18`,display:"flex",alignItems:"center",gap:6}}>
              <SI status={s.key}/><span style={{fontSize:13,fontWeight:600,color:s.color}}>{s.label}</span>
              <span style={{background:s.color+"18",color:s.color,fontSize:11,fontWeight:700,borderRadius:10,padding:"1px 8px"}}>{items.length}</span>
              {isND&&<span style={{marginLeft:"auto",fontSize:10,fontWeight:600,color:"#f2994a",background:"#f2994a18",padding:"2px 8px",borderRadius:10,animation:"blink 2s infinite"}}>要委譲</span>}
              {isDrop&&dragging&&<span style={{marginLeft:isND?0:"auto",fontSize:10,color:isCan?"#94a3b8":"#f2994a",fontWeight:600}}>⬇ Drop</span>}
            </div>
            <div style={{maxHeight:600,overflowY:"auto",padding:"6px",minHeight:isDrop&&dragging?80:0}}>
              {items.map(it=><IssueCard key={it.number} item={it} stage={s.key} needsDelegate={s.nd} onDelegate={setModal} doAction={doAction} onDragStart={()=>setDragging(true)}/>)}
              {items.length===0&&<div style={{padding:isDrop&&dragging?30:16,textAlign:"center",fontSize:11,color:"#b4b4c0"}}>{isDrop&&dragging?"ここにドロップ":isCan?"No canceled":"Empty"}</div>}
            </div>
          </div>
        </div>
      })}
    </div>

    <div style={{padding:"6px 16px",borderTop:"1px solid #eaeaed",background:"#fff",display:"flex",justifyContent:"space-between",fontSize:10,color:"#b4b4c0",flexWrap:"wrap",gap:6}}>
      <div style={{display:"flex",gap:8}}>{STAGES.map(s=><span key={s.key} style={{display:"flex",alignItems:"center",gap:3}}><SI status={s.key} sz={10}/>{s.label}</span>)}</div>
      <span>Drag: Triage/Backlog → Todo(自動委譲) or Canceled ｜ Updated {data?.synced_at?new Date(data.synced_at).toLocaleTimeString("ja-JP"):"—"}</span>
    </div>
  </div>
}
