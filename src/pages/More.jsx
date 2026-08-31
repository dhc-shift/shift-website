import React, { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ExternalLink, LogIn } from 'lucide-react';
import { RECRUIT_SITE_URL } from '../data.js';
import { Button, CoinArt, PageHero, PeopleArt, SectionHead, SubHeader } from '../components/ui.jsx';

export default function More({setPage,user,memberStats,mileageHistory,summary,mileageItems}) {
  const [detail,setDetail]=useState(null);
  if(detail==='mileage')return <Mileage back={()=>setDetail(null)} user={user} memberStats={memberStats} history={mileageHistory} summary={summary} items={mileageItems} setPage={setPage}/>;
  if(detail==='recruit')return <Recruit back={()=>setDetail(null)}/>;
  return <><PageHero eyebrow="MORE" title={<>SHIFT를 더 깊이<br/><em>경험하는 방법.</em></>} description="꾸준한 활동을 기록하고, 새로운 동료로 합류하세요."/><section className="section container more-grid"><button className="feature-card mileage" onClick={()=>setDetail('mileage')}><div><span className="eyebrow">MILEAGE</span><h2>성장의 모든 순간을<br/>차곡차곡 기록해요.</h2><p>SHIFT 활동으로 마일리지를 쌓고 특별한 혜택을 만나보세요.</p><span className="button secondary">마일리지 확인하기 <ArrowRight size={16}/></span></div><CoinArt/></button><button className="feature-card recruit" onClick={()=>setDetail('recruit')}><div><span className="eyebrow">JOIN SHIFT</span><h2>다음 변화의 시작,<br/>당신을 기다려요.</h2><p>아이디어를 함께 현실로 옮길 2기 신입부원을 모집합니다.</p><span className="button secondary">모집 안내 보기 <ArrowRight size={16}/></span></div><PeopleArt/></button></section></>;
}

const medals=['🥇','🥈','🥉'];

function Mileage({back,user,memberStats,history=[],summary,items=[],setPage}){
  const thisMonth=new Date().toISOString().slice(0,7);
  const monthTotal=history.filter(h=>(h.activity_date||'').startsWith(thisMonth)).reduce((sum,h)=>sum+h.final_score,0);
  const topThree=Array.isArray(summary?.top_three)?summary.top_three:[];
  return <><SubHeader title="마일리지" back={back}/><section className="section container">
    {!user&&<div className="board-empty"><LogIn/><h3>로그인이 필요합니다</h3><p>내 마일리지와 등급은 로그인 후 확인할 수 있습니다.</p><Button onClick={()=>setPage('login')}>로그인하기 <ArrowRight size={16}/></Button></div>}
    {user&&<div className="mileage-summary"><div><span>나의 마일리지</span><strong>{(memberStats?.total_mileage??0).toLocaleString()}<small>P</small></strong><p>이번 달 <b>{monthTotal>=0?`+${monthTotal}`:monthTotal}P</b>를 적립했어요</p></div><div><span>현재 등급</span><strong className="rank">{memberStats?.current_tier||'미정'}</strong><div className="progress"><i/></div><p>{memberStats?.current_rank?<>전체 <b>{memberStats.current_rank}위</b>예요</>:'등급은 활동 마일리지로 결정돼요'}</p></div><CoinArt/></div>}
    <div className="mileage-columns">
      {user&&<div className="panel"><SectionHead eyebrow="HISTORY" title="적립 · 차감 내역"/>{history.length?history.slice(0,8).map(x=><div className="history" key={x.record_id}><time>{(x.activity_date||'').slice(5).replace('-','.')}</time><b>{x.activity_name}</b><strong className={x.final_score<0?'minus':''}>{x.final_score>=0?`+${x.final_score}`:x.final_score}P</strong></div>):<p className="body-copy">아직 적립 내역이 없어요.</p>}</div>}
      <div className="panel"><SectionHead eyebrow="LEADERBOARD" title="마일리지 TOP 3"/>{topThree.length?topThree.map((x,i)=><div className="ranking" key={x.name}><span>{medals[i]}</span><b>{x.name}</b><strong>{(x.mileage??0).toLocaleString()}P</strong></div>):<p className="body-copy">집계된 순위가 아직 없어요.</p>}</div>
    </div>
    <div className="panel criteria"><SectionHead eyebrow="POINT GUIDE" title="활동별 지급 기준"/><div className="criteria-grid">{items.length?items.slice(0,8).map(x=><div key={x.activity_name}><Check/><span>{x.activity_name}</span><b>{x.requires_manual_score?'변동':`+${x.base_score}P`}</b></div>):[['정기 모임 출석','+20P'],['스터디 수료','+150P'],['프로젝트 완주','+300P'],['세미나 발표','+80P']].map(x=><div key={x[0]}><Check/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div>
  </section></>;
}

function Recruit({back}){return <><SubHeader title="신입부원 모집" back={back}/><section className="section container recruit-page"><div className="recruit-hero"><span className="eyebrow">SHIFT 2기 RECRUITING</span><h2>당신의 아이디어가<br/><em>세상을 움직이는 순간.</em></h2><p>SHIFT와 함께 배우고 만들며 성장할 2기 동료를 기다립니다.</p><Button onClick={()=>window.open(RECRUIT_SITE_URL,'_blank','noopener')}>지원서 작성하기 <ExternalLink size={16}/></Button><PeopleArt/></div><div className="recruit-info">{[['모집 기간','2026.08.31 — 09.04'],['모집 대상','IT와 디지털 헬스케어에 관심 있는 대학생'],['지원 방법','온라인 지원서 제출 → 인터뷰 → 최종 발표']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</div><SectionHead eyebrow="FAQ" title="자주 묻는 질문"/><div className="faq">{[['개발 경험이 없어도 지원할 수 있나요?','네, 가능합니다. 현재의 실력보다 함께 배우고 실행하려는 태도를 더 중요하게 생각합니다. 코딩 소모임과 IT 온보딩 세션으로 기초부터 함께 시작할 수 있어요.'],['학교나 전공에 제한이 있나요?','디지털헬스케어학부 학술동아리지만, IT와 디지털 헬스케어에 관심이 있다면 전공과 학년에 관계없이 지원할 수 있습니다.'],['활동은 주로 언제 진행되나요?','정기 활동은 학기 중 진행되며, 프로그램별 일정은 모집 시 공지합니다. 소모임과 커피챗은 참여자들과 조율해 유연하게 운영됩니다.']].map(([q,a])=><details key={q}><summary>{q}<ChevronDown/></summary><p>{a}</p></details>)}</div></section></>}
