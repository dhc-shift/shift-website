import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Badge, PageHero } from '../components/ui.jsx';

const artByType = {프로젝트:'art-care',스터디:'art-cloud',세미나:'art-data',행사:'art-people'};

export default function Archive({ activities = [] }) {
  const completed = activities.filter(a=>a.status==='완료').map(a=>({
    type:a.activity_type, title:a.title, period:a.schedule||'', desc:a.description,
    art:artByType[a.activity_type]||'art-note', members:(a.activity_members||[]).map(m=>m.member_name), note:a.result_note, poster:a.poster_url, photos:(a.photos||[]).map(ph=>ph.url)
  }));
  const all=completed;
  const [filter,setFilter]=useState('전체'); const [selected,setSelected]=useState(null); const list=filter==='전체'?all:all.filter(a=>a.type===filter); return <><PageHero eyebrow="ARCHIVE" title={<>우리가 함께 만든<br/><em>시간과 결과.</em></>} description="SHIFT의 도전과 성장의 순간을 기록합니다."/><section className="section container"><div className="filter-row">{['전체','프로젝트','스터디','세미나','행사'].map(f=><button className={filter===f?'active':''} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div><div className="archive-grid">{list.map((a,i)=><button className="archive-card" onClick={()=>setSelected(a)} key={a.title}><div className={`archive-art ${a.art}`}>{a.poster?<img className="archive-poster" src={a.poster} alt=""/>:<><div className="fake-window"><i/><i/><i/></div><span>{String(i+1).padStart(2,'0')}</span></>}</div><div className="archive-copy"><div><Badge tone={a.type==='프로젝트'?'blue':a.type==='스터디'?'mint':a.type==='세미나'?'purple':'yellow'}>{a.type}</Badge><time>{a.period}</time></div><h3>{a.title}</h3><p>{a.desc}</p><span className="text-link">기록 보기 <ArrowRight size={15}/></span></div></button>)}</div></section>{selected&&<ArchiveModal item={selected} close={()=>setSelected(null)}/>}</> }

function ArchiveModal({item,close}){return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={close}><X/></button><div className={`modal-visual ${item.art}`}>{item.poster&&<img className="modal-poster" src={item.poster} alt=""/>}<Badge>{item.type}</Badge><h2>{item.title}</h2><p>{item.period}</p></div><div className="modal-body"><h3>프로그램 소개</h3><p>{item.desc}</p><h3>활동 결과</h3><div className="result-box"><Check/><span>{item.note||'최종 결과물 발표와 회고 완료'}</span></div>{item.members?.length>0&&<><h3>함께한 부원</h3><div className="member-chips">{item.members.map(name=><span className="member-chip" key={name}>{name}</span>)}</div></>}{item.photos?.length>0?<><h3>활동 사진</h3><div className="gallery">{item.photos.map(url=><a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt="활동 사진"/></a>)}</div></>:null}</div></div></div>}
