import React, { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, Users } from 'lucide-react';
import { dday, eventTone, typeColor } from '../data.js';
import { ActivityIcon, Badge, PageHero, SectionHead } from '../components/ui.jsx';

export default function Activities({ calendarEvents = [], activities = [], user }) {
  const today = new Date();
  const isMember = Boolean(user);
  const visible = activities.filter(a => a.status !== '완료' && (a.access === 'public' || isMember));
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => { if (visible.length && !visible.some(a => a.id === selectedId)) setSelectedId(visible[0].id); }, [activities, user]);
  const selected = visible.find(a => a.id === selectedId);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('ko-KR',{year:'numeric',month:'long'});
  const selectedDate = new Date(viewYear, viewMonth, selectedDay);
  const isTodaySelected = monthOffset === 0 && selectedDay === today.getDate();
  const selectedSchedules = calendarEvents.filter(event => {
    const start = new Date(`${event.event_date}T00:00:00`);
    const end = new Date(`${event.end_date || event.event_date}T23:59:59`);
    return selectedDate >= start && selectedDate <= end;
  }).map(event => ({ time: event.start_time?.slice(0,5), title: event.title, place: event.place, tone: eventTone(event.event_type) }));
  const monthStart = new Date(viewYear,viewMonth,1);
  const monthEnd = new Date(viewYear,viewMonth+1,0,23,59,59);
  const monthEvents = calendarEvents.filter(event => new Date(`${event.event_date}T00:00:00`) <= monthEnd && new Date(`${event.end_date || event.event_date}T23:59:59`) >= monthStart);
  const changeMonth = direction => { setMonthOffset(monthOffset + direction); setSelectedDay(1); };
  return <><PageHero eyebrow="ACTIVITIES" title={<>함께 배우고,<br/><em>경험을 확장하세요.</em></>} description="SHIFT의 모든 활동과 모집 일정을 한눈에 확인하세요."/>
  <section className="section container activities-layout">
    <div className="calendar-card"><div className="calendar-head"><div><span className="eyebrow">SHIFT CALENDAR</span><h2>{monthName}</h2></div><div><button onClick={()=>changeMonth(-1)} aria-label="이전 달"><ChevronLeft/></button><button onClick={()=>changeMonth(1)} aria-label="다음 달"><ChevronRight/></button></div></div><Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} dbEvents={monthEvents} year={viewYear} month={viewMonth}/><div className="legend"><span><i className="blue"/>프로젝트</span><span><i className="mint"/>스터디</span><span><i className="purple"/>세미나</span><span><i className="lime"/>행사</span></div></div>
    <div className="recruit-panel"><SectionHead eyebrow="ACTIVITIES" title="모집·진행 중인 활동"/><div className="recruit-list">{visible.length?visible.map(a=><button key={a.id} className={selected?.id===a.id?'selected':''} onClick={()=>setSelectedId(a.id)}><div className={`mini-icon ${typeColor(a.activity_type)}`}><ActivityIcon type={a.activity_type}/></div><div><Badge tone={typeColor(a.activity_type)}>{a.activity_type}</Badge><h3>{a.title}</h3><span>{a.status}{a.capacity?` · ${a.capacity}`:''}</span></div><strong>{a.status==='모집 중'?dday(a.apply_end):''}</strong></button>):<div className="board-empty"><CalendarDays/><h3>등록된 활동이 없습니다</h3><p>새 활동이 열리면 이곳에 표시됩니다.</p></div>}</div></div>
    <div className="today-card"><SectionHead eyebrow={`${monthName} ${selectedDay}일`} title={isTodaySelected ? '오늘 일정' : '선택한 날짜의 일정'}/><div className="timeline">{selectedSchedules.length > 0 ? selectedSchedules.map(x=><div className="timeline-item" key={`${x.time}-${x.title}`}><time>{x.time}</time><i className={x.tone}/><div><b>{x.title}</b><span>{x.place}</span></div></div>) : <div className="empty-schedule"><CalendarDays/><b>등록된 일정이 없어요</b><span>다른 날짜를 선택해 일정을 확인해보세요.</span></div>}</div></div>
    {selected && <div className="detail-card"><div className="detail-top"><div><Badge tone={typeColor(selected.activity_type)}>{selected.activity_type}</Badge><h2>{selected.title}</h2><p>{selected.description}</p></div><strong>{selected.status==='모집 중'?dday(selected.apply_end):selected.status}</strong></div>
      <div className="detail-info">{[[Users,'대상',selected.target],[CalendarDays,'일정',selected.schedule],[MapPin,'장소',selected.place],[Users,'모집 인원',selected.capacity],[Clock3,'신청 기간',selected.apply_start?`${selected.apply_start} — ${selected.apply_end||''}`:'']].filter(([,,v])=>v).map(([I,k,v])=><div key={k}><I/><span>{k}</span><b>{v}</b></div>)}</div>
      {selected.activity_members?.length>0 && <div className="member-chips"><span className="chips-label">{selected.status==='진행 중'?'현재 작업 중':'참여 부원'}</span>{selected.activity_members.map(m=><span className="member-chip" key={m.id}>{m.member_name}</span>)}</div>}
      {selected.status==='모집 중' && selected.apply_url
        ? <a className="button" href={selected.apply_url} target="_blank" rel="noreferrer">신청하러 가기 <ExternalLink size={16}/></a>
        : selected.status==='모집 중'
          ? <button className="button" disabled title="신청 방법은 곧 공지됩니다">신청 준비 중</button>
          : <button className="button" disabled>모집이 마감된 활동입니다</button>}
    </div>}
  </section></>;
}

function Calendar({selectedDay,onSelectDay,dbEvents=[],year,month}){
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const prevMonthDays=new Date(year,month,0).getDate();
  const cells=Array.from({length:42},(_,i)=>i<firstDay?{day:prevMonthDays-firstDay+i+1,current:false}:i>=firstDay+daysInMonth?{day:i-firstDay-daysInMonth+1,current:false}:{day:i-firstDay+1,current:true});
  const eventTones={};
  dbEvents.forEach(event=>{
    const start=new Date(`${event.event_date}T00:00:00`);
    const end=new Date(`${event.end_date||event.event_date}T00:00:00`);
    const visibleStart=new Date(Math.max(start,new Date(year,month,1)));
    const visibleEnd=new Date(Math.min(end,new Date(year,month+1,0)));
    for(let date=new Date(visibleStart);date<=visibleEnd;date.setDate(date.getDate()+1))eventTones[date.getDate()]=eventTone(event.event_type);
  });
  const today=new Date();
  return <div className="calendar"><div className="weekdays">{['일','월','화','수','목','금','토'].map(d=><span key={d}>{d}</span>)}</div><div className="days">{cells.map((cell,i)=><button key={i} disabled={!cell.current} onClick={()=>cell.current&&onSelectDay(cell.day)} className={`${cell.current?'':'muted'} ${cell.current&&cell.day===selectedDay?'selected-day':''} ${cell.current&&cell.day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()?'actual-today':''}`} aria-label={cell.current?`${cell.day}일 일정 보기`:undefined}><span>{cell.day}</span>{eventTones[cell.day]&&cell.current?<i className={eventTones[cell.day]}/>:null}</button>)}</div></div>;
}
