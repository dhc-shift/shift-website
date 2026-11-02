import React from 'react';
import { ArrowRight, Check, LogIn } from 'lucide-react';
import { Button, CoinArt, SectionHead, SubHeader } from '../components/ui.jsx';

const medals=['🥇','🥈','🥉'];

export default function Mileage({user,memberStats,history=[],summary,items=[],setPage}){
  const thisMonth=new Date().toISOString().slice(0,7);
  const monthTotal=history.filter(h=>(h.activity_date||'').startsWith(thisMonth)).reduce((sum,h)=>sum+h.final_score,0);
  const topThree=Array.isArray(summary?.top_three)?summary.top_three:[];
  return <><SubHeader title="마일리지"/><section className="section container">
    {!user&&<div className="board-empty"><LogIn/><h3>로그인이 필요합니다</h3><p>내 마일리지와 등급은 로그인 후 확인할 수 있습니다.</p><Button onClick={()=>setPage('login')}>로그인하기 <ArrowRight size={16}/></Button></div>}
    {user&&<div className="mileage-summary"><div><span>나의 마일리지</span><strong>{(memberStats?.total_mileage??0).toLocaleString()}<small>P</small></strong><p>이번 달 <b>{monthTotal>=0?`+${monthTotal}`:monthTotal}P</b>를 적립했어요</p></div><div><span>현재 등급</span><strong className="rank">{memberStats?.current_tier||'미정'}</strong><div className="progress"><i/></div><p>{memberStats?.current_rank?<>전체 <b>{memberStats.current_rank}위</b>예요</>:'등급은 활동 마일리지로 결정돼요'}</p></div><CoinArt/></div>}
    <div className="mileage-columns">
      {user&&<div className="panel mileage-history"><SectionHead eyebrow="HISTORY" title="적립 · 차감 내역"/>{history.length?history.slice(0,8).map(x=><div className="history" key={x.record_id}><time>{(x.activity_date||'').slice(5).replace('-','.')}</time><b>{x.activity_name}</b><strong className={x.final_score<0?'minus':''}>{x.final_score>=0?`+${x.final_score}`:x.final_score}P</strong></div>):<p className="body-copy">아직 적립 내역이 없어요.</p>}</div>}
      <div className="panel"><SectionHead eyebrow="LEADERBOARD" title="마일리지 TOP 3"/>{topThree.length?topThree.map((x,i)=><div className="ranking" key={x.name}><span>{medals[i]}</span><b>{x.name}</b><strong>{(x.mileage??0).toLocaleString()}P</strong></div>):<p className="body-copy">집계된 순위가 아직 없어요.</p>}</div>
    </div>
    <div className="panel criteria"><SectionHead eyebrow="POINT GUIDE" title="활동별 지급 기준"/><div className="criteria-grid">{items.length?items.slice(0,8).map(x=><div key={x.activity_name}><Check/><span>{x.activity_name}</span><b>{x.requires_manual_score?'변동':`+${x.base_score}P`}</b></div>):[['정기 모임 출석','+20P'],['스터디 수료','+150P'],['프로젝트 완주','+300P'],['세미나 발표','+80P']].map(x=><div key={x[0]}><Check/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div>
  </section></>;
}
