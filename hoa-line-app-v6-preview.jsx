import React, { useState } from 'react';

// ========== ICONS (精簡版) ==========
const I = {
  home: ({c="w-6 h-6",color="currentColor",filled}) => <svg className={c} viewBox="0 0 24 24" fill={filled?color:"none"}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6a1 1 0 00-1-1h-4a1 1 0 00-1 1v6H4a1 1 0 01-1-1v-9.5z" stroke={filled?"none":color} strokeWidth="1.5"/></svg>,
  users: ({c="w-6 h-6",color="currentColor",filled}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.5"/><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" fill={filled?color:"none"}/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.5"/></svg>,
  building: ({c="w-6 h-6",color="currentColor"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  settings: ({c="w-6 h-6",color="currentColor"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.18V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-2.82-1.18l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00-1.18-2.82H3a2 2 0 110-4h.09a1.65 1.65 0 001.18-2.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 002.82-1.18V3a2 2 0 114 0v.09a1.65 1.65 0 002.82 1.18l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 001.18 2.82H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.5"/></svg>,
  chevronRight: ({c="w-5 h-5",color="#C7C7CC"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
  chevronLeft: ({c="w-5 h-5",color="#06C755"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
  plus: ({c="w-6 h-6",color="white"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M12 5v14m7-7H5" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
  search: ({c="w-5 h-5",color="#86868B"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  phone: ({c="w-5 h-5",color="#007AFF"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" stroke={color} strokeWidth="1.5"/></svg>,
  dollarSign: ({c="w-4 h-4",color="#FF3B30"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  wrench: ({c="w-4 h-4",color="#FF9500"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  calendar: ({c="w-4 h-4",color="#06C755"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  alertCircle: ({c="w-5 h-5",color="#FF9500"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  star: ({c="w-4 h-4",color="#FF9500",filled}) => <svg className={c} viewBox="0 0 24 24" fill={filled?color:"none"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="1.5"/></svg>,
  folder: ({c="w-6 h-6",color="#FF9500"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke={color} strokeWidth="1.5"/></svg>,
  mic: ({c="w-6 h-6",color="#AF52DE"}) => <svg className={c} viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke={color} strokeWidth="1.5"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  line: ({c="w-5 h-5",color="white"}) => <svg className={c} viewBox="0 0 24 24" fill={color}><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>,
};

// ========== MOCK DATA ==========
const residents = [
  {id:'R001',unit:'3F-1',name:'王大明',phone:'0912-345-678',role:'主委',payments:[{m:1,p:1},{m:2,p:1},{m:3,p:1},{m:4,p:0},{m:5,p:0}]},
  {id:'R002',unit:'5F-2',name:'李小華',phone:'0923-456-789',role:'財委',payments:[{m:1,p:1},{m:2,p:1},{m:3,p:1},{m:4,p:1},{m:5,p:1}]},
  {id:'R003',unit:'2F-1',name:'張美玲',phone:'0934-567-890',role:'住戶',payments:[{m:1,p:1},{m:2,p:0},{m:3,p:0},{m:4,p:0},{m:5,p:0}]},
  {id:'R004',unit:'7F-1',name:'陳建宏',phone:'0945-678-901',role:'監委',payments:[{m:1,p:1},{m:2,p:1},{m:3,p:1},{m:4,p:1},{m:5,p:1}]},
  {id:'R005',unit:'4F-2',name:'林志玲',phone:'0956-789-012',role:'住戶',payments:[{m:1,p:1},{m:2,p:1},{m:3,p:1},{m:4,p:0},{m:5,p:0}]},
];

const vendors = [
  {id:'V001',name:'永信電梯',cat:'電梯維護',contact:'陳經理',phone:'02-2345-6789',rating:4.5},
  {id:'V002',name:'大安清潔',cat:'清潔服務',contact:'林小姐',phone:'02-3456-7890',rating:4.0},
  {id:'V003',name:'台北水電行',cat:'水電維修',contact:'張師傅',phone:'0922-333-444',rating:4.8},
];

const repairs = [
  {id:'RP001',title:'電梯異音',status:'done',date:'2024-05-01'},
  {id:'RP002',title:'地下室漏水',status:'wip',date:'2024-05-05'},
  {id:'RP003',title:'大廳燈泡更換',status:'pending',date:'2024-05-08'},
];

// ========== COMPONENTS ==========
const Badge = ({children,v='default'}) => {
  const s = {default:'bg-gray-100 text-gray-800',success:'bg-green-100 text-green-600',warning:'bg-orange-100 text-orange-600',danger:'bg-red-100 text-red-600',primary:'bg-green-100 text-[#06C755]'};
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s[v]}`}>{children}</span>;
};

const Card = ({children,className=""}) => <div className={`bg-white rounded-2xl p-4 ${className}`}>{children}</div>;

const TabBar = ({screen,setScreen}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-6 pt-2 pb-6 z-40">
    <div className="flex justify-around">
      {[{id:'home',l:'首頁',Icon:I.home},{id:'residents',l:'住戶',Icon:I.users},{id:'vendors',l:'廠商',Icon:I.building},{id:'settings',l:'設定',Icon:I.settings}].map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} className={`flex flex-col items-center gap-1 ${screen===t.id?'text-[#06C755]':'text-gray-400'}`}>
          <t.Icon c="w-6 h-6" color={screen===t.id?'#06C755':'#9CA3AF'} filled={screen===t.id} />
          <span className="text-[10px] font-medium">{t.l}</span>
        </button>
      ))}
    </div>
  </div>
);

// ========== SCREENS ==========
const HomeScreen = ({setScreen}) => {
  const unpaid = residents.filter(r => !r.payments[r.payments.length-1].p);
  const pending = repairs.filter(r => r.status !== 'done');
  
  return (
    <div className="pb-24">
      <div className="bg-gradient-to-b from-[#06C755] to-[#05A847] text-white">
        <div className="h-10" />
        <div className="px-5 py-6">
          <p className="text-white/80 text-sm">早安 👋</p>
          <h1 className="text-2xl font-bold mt-1">幸福社區管委會</h1>
        </div>
      </div>
      <div className="px-5 -mt-4 space-y-4">
        <Card className="shadow-lg">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><I.alertCircle />近期重要事項</h2>
          <div className="space-y-3">
            {unpaid.length > 0 && <AlertRow icon={<I.dollarSign />} text={`${unpaid.length} 戶尚未繳納管理費`} bg="bg-red-50" onClick={() => setScreen('residents')} />}
            {pending.length > 0 && <AlertRow icon={<I.wrench />} text={`${pending.length} 件維修單待處理`} bg="bg-orange-50" />}
            <AlertRow icon={<I.calendar />} text="下次管委會：5/15（三）19:30" bg="bg-green-50" />
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard icon={<I.users c="w-6 h-6" color="#06C755" />} title="住戶管理" sub={`${residents.length} 戶`} onClick={() => setScreen('residents')} />
          <QuickCard icon={<I.building c="w-6 h-6" color="#007AFF" />} title="廠商管理" sub={`${vendors.length} 家`} onClick={() => setScreen('vendors')} />
          <QuickCard icon={<I.mic />} title="會議紀錄" sub="2 份" />
          <QuickCard icon={<I.folder />} title="文件庫" sub="4 份" />
        </div>
        <Card>
          <div className="flex justify-between mb-3"><h2 className="font-semibold text-gray-900">管理費收繳</h2><button onClick={() => setScreen('residents')} className="text-sm text-[#06C755]">查看</button></div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3"><div className="h-full bg-green-500 rounded-full" style={{width:`${((residents.length-unpaid.length)/residents.length)*100}%`}} /></div>
          <p className="text-sm text-gray-500">{residents.length-unpaid.length}/{residents.length} 戶已繳</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">維修追蹤</h2>
          {repairs.map(r => <RepairRow key={r.id} r={r} />)}
        </Card>
      </div>
    </div>
  );
};

const AlertRow = ({icon,text,bg,onClick}) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl ${bg}`}>
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">{icon}</div>
    <span className="text-sm text-gray-900 flex-1 text-left">{text}</span>
    <I.chevronRight />
  </button>
);

const QuickCard = ({icon,title,sub,onClick}) => (
  <button onClick={onClick} className="bg-white rounded-2xl p-4 text-left shadow-sm active:bg-gray-50">
    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">{icon}</div>
    <p className="font-semibold text-gray-900">{title}</p>
    <p className="text-sm text-gray-500">{sub}</p>
  </button>
);

const RepairRow = ({r}) => (
  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl mb-2 last:mb-0">
    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><I.wrench c="w-5 h-5" color="#9CA3AF" /></div>
    <div className="flex-1"><p className="font-medium text-gray-900">{r.title}</p><p className="text-xs text-gray-500">{r.date}</p></div>
    <Badge v={r.status==='done'?'success':r.status==='wip'?'primary':'warning'}>{r.status==='done'?'完成':r.status==='wip'?'處理中':'待處理'}</Badge>
  </div>
);

const ResidentsScreen = ({setDetail}) => {
  const [q,setQ] = useState('');
  const [f,setF] = useState('all');
  const unpaid = residents.filter(r => !r.payments[r.payments.length-1].p);
  const list = residents.filter(r => {
    const m = r.name.includes(q) || r.unit.includes(q);
    if (!m) return false;
    if (f === 'unpaid') return !r.payments[r.payments.length-1].p;
    if (f === 'committee') return ['主委','財委','監委'].includes(r.role);
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200"><div className="h-10" /><div className="px-5 py-4"><h1 className="text-lg font-semibold text-center">住戶管理</h1></div></div>
      <div className="px-5 py-4 space-y-4">
        <div className="relative"><I.search c="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="搜尋..." className="w-full bg-gray-200 rounded-xl pl-10 pr-4 py-3" /></div>
        <div className="flex gap-2">
          {['all','unpaid','committee'].map(x => <button key={x} onClick={() => setF(x)} className={`px-4 py-2 rounded-full text-sm font-medium ${f===x?(x==='unpaid'?'bg-red-500 text-white':'bg-[#06C755] text-white'):'bg-white'}`}>{x==='all'?'全部':x==='unpaid'?`未繳(${unpaid.length})`:'管委會'}</button>)}
        </div>
        {f === 'unpaid' && unpaid.length > 0 && <button className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2"><I.line />一鍵催繳</button>}
        <div className="space-y-2">
          {list.map(r => {
            const paid = r.payments[r.payments.length-1].p;
            return (
              <button key={r.id} onClick={() => setDetail(r)} className="w-full bg-white rounded-xl p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paid?'bg-green-100':'bg-red-100'}`}><span className={`font-bold ${paid?'text-green-600':'text-red-500'}`}>{r.unit.split('-')[0]}</span></div>
                <div className="flex-1 text-left"><div className="flex items-center gap-2"><span className="font-medium">{r.name}</span>{r.role !== '住戶' && <Badge v="primary">{r.role}</Badge>}</div><p className="text-sm text-gray-500">{r.unit} · {r.phone}</p></div>
                {!paid && <Badge v="danger">未繳</Badge>}
                <I.chevronRight />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ResidentDetail = ({r,onBack}) => {
  const [tab,setTab] = useState('info');
  const paid = r.payments.filter(p => p.p).length;
  const unpaidAmt = r.payments.filter(p => !p.p).length * 2000;
  
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200"><div className="h-10" /><div className="px-5 py-4 flex items-center"><button onClick={onBack} className="flex items-center text-[#06C755]"><I.chevronLeft />返回</button><h1 className="flex-1 text-lg font-semibold text-center pr-12">住戶詳情</h1></div></div>
      <div className="px-5 py-4 space-y-4">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><span className="text-xl font-bold text-[#06C755]">{r.unit.split('-')[0]}</span></div>
            <div><div className="flex items-center gap-2"><h2 className="text-xl font-bold">{r.name}</h2>{r.role !== '住戶' && <Badge v="primary">{r.role}</Badge>}</div><p className="text-gray-500">{r.unit}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 rounded-xl"><I.line c="w-5 h-5" color="#06C755" /><span className="text-xs text-gray-500">LINE</span></button>
            <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 rounded-xl"><I.phone /><span className="text-xs text-gray-500">通話</span></button>
            <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 rounded-xl"><I.phone c="w-5 h-5" color="#34C759" /><span className="text-xs text-gray-500">電話</span></button>
          </div>
        </Card>
        <div className="flex bg-gray-200 rounded-xl p-1">
          {['info','payments'].map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${tab===t?'bg-white shadow-sm':''}`}>{t==='info'?'基本資料':'繳費紀錄'}</button>)}
        </div>
        {tab === 'info' ? (
          <Card><InfoRow l="電話" v={r.phone} /><InfoRow l="身份" v={r.role} last /></Card>
        ) : (
          <>
            <Card>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-green-500">{paid}</p><p className="text-xs text-gray-500">已繳</p></div>
                <div><p className="text-2xl font-bold text-red-500">{r.payments.length - paid}</p><p className="text-xs text-gray-500">未繳</p></div>
                <div><p className="text-2xl font-bold text-orange-500">${unpaidAmt.toLocaleString()}</p><p className="text-xs text-gray-500">欠繳</p></div>
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold mb-3">繳費歷史</h3>
              {r.payments.map((p,i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span>2024年{p.m}月</span>
                  <span className={p.p ? 'text-green-500' : 'text-red-500'}>{p.p ? '✓ 已繳' : '未繳'}</span>
                </div>
              ))}
            </Card>
            {unpaidAmt > 0 && <button className="w-full py-4 bg-[#06C755] text-white rounded-xl font-semibold flex items-center justify-center gap-2"><I.line />發送催繳通知</button>}
          </>
        )}
      </div>
    </div>
  );
};

const VendorsScreen = ({setDetail}) => {
  const [q,setQ] = useState('');
  const list = vendors.filter(v => v.name.includes(q) || v.cat.includes(q));
  
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200"><div className="h-10" /><div className="px-5 py-4"><h1 className="text-lg font-semibold text-center">廠商管理</h1></div></div>
      <div className="px-5 py-4 space-y-4">
        <div className="relative"><I.search c="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="搜尋廠商..." className="w-full bg-gray-200 rounded-xl pl-10 pr-4 py-3" /></div>
        <div className="space-y-3">
          {list.map(v => (
            <button key={v.id} onClick={() => setDetail(v)} className="w-full bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><I.building c="w-6 h-6" color="#007AFF" /></div>
              <div className="flex-1 text-left">
                <p className="font-medium">{v.name}</p>
                <p className="text-sm text-gray-500">{v.cat} · {v.contact}</p>
                <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(i => <I.star key={i} filled={i <= v.rating} />)}</div>
              </div>
              <I.chevronRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const VendorDetail = ({v,onBack}) => (
  <div className="min-h-screen bg-gray-100 pb-24">
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200"><div className="h-10" /><div className="px-5 py-4 flex items-center"><button onClick={onBack} className="flex items-center text-[#06C755]"><I.chevronLeft />返回</button><h1 className="flex-1 text-lg font-semibold text-center pr-12">廠商詳情</h1></div></div>
    <div className="px-5 py-4 space-y-4">
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center"><I.building c="w-8 h-8" color="#007AFF" /></div>
          <div><h2 className="text-xl font-bold">{v.name}</h2><p className="text-gray-500">{v.cat}</p><div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(i => <I.star key={i} filled={i <= v.rating} />)}<span className="text-sm text-gray-500 ml-1">{v.rating}</span></div></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 rounded-xl"><I.line c="w-5 h-5" color="#06C755" /><span className="text-xs text-gray-500">LINE</span></button>
          <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 rounded-xl"><I.phone /><span className="text-xs text-gray-500">電話</span></button>
          <button className="flex flex-col items-center gap-1 py-3 bg-gray-100 rounded-xl"><I.phone c="w-5 h-5" color="#FF9500" /><span className="text-xs text-gray-500">編輯</span></button>
        </div>
      </Card>
      <Card><InfoRow l="聯絡人" v={v.contact} /><InfoRow l="電話" v={v.phone} last /></Card>
    </div>
  </div>
);

const SettingsScreen = () => (
  <div className="min-h-screen bg-gray-100 pb-24">
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200"><div className="h-10" /><div className="px-5 py-4"><h1 className="text-lg font-semibold text-center">設定</h1></div></div>
    <div className="px-5 py-4 space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4"><div><p className="text-sm text-gray-500">目前方案</p><p className="text-xl font-bold">免費版</p></div><button className="px-4 py-2 bg-[#06C755] text-white rounded-full text-sm font-medium">升級</button></div>
        <div className="pt-4 border-t border-gray-200">
          <div className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">AI 會議紀錄</span><span>2/3</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-orange-400 rounded-full" style={{width:'66%'}} /></div></div>
          <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">AI 財務報表</span><span>1/2</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{width:'50%'}} /></div></div>
        </div>
      </Card>
      <Card><InfoRow l="社區名稱" v="幸福社區" /><InfoRow l="戶數" v="48 戶" /><InfoRow l="管理費" v="NT$ 2,000/月" last /></Card>
      <button className="w-full py-4 bg-white rounded-xl text-red-500 font-medium">退出管理者身份</button>
    </div>
  </div>
);

const InfoRow = ({l,v,last}) => <div className={`flex justify-between py-3 ${!last?'border-b border-gray-100':''}`}><span className="text-gray-500">{l}</span><span className="font-medium">{v}</span></div>;

// ========== MAIN APP ==========
export default function App() {
  const [screen,setScreen] = useState('home');
  const [residentDetail,setResidentDetail] = useState(null);
  const [vendorDetail,setVendorDetail] = useState(null);

  const back = (s) => { setScreen(s); setResidentDetail(null); setVendorDetail(null); };

  if (residentDetail) return <ResidentDetail r={residentDetail} onBack={() => back('residents')} />;
  if (vendorDetail) return <VendorDetail v={vendorDetail} onBack={() => back('vendors')} />;

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen font-sans">
      {screen === 'home' && <HomeScreen setScreen={setScreen} />}
      {screen === 'residents' && <ResidentsScreen setDetail={setResidentDetail} />}
      {screen === 'vendors' && <VendorsScreen setDetail={setVendorDetail} />}
      {screen === 'settings' && <SettingsScreen />}
      {!residentDetail && !vendorDetail && <TabBar screen={screen} setScreen={setScreen} />}
    </div>
  );
}
