import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Users } from 'lucide-react';
import { activityData, eventTone } from '../data.js';
import { ActivityIcon, Badge, PageHero, SectionHead } from '../components/ui.jsx';

export default function Activities({ calendarEvents = [], user }) {
  const today = new Date();
  const [selected, setSelected] = useState(activityData[0]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const isMember = Boolean(user); // 로그인한 회원에게만 member 활동 노출
  const visible = activityData.filter(a => a.access === 'public' || isMember);
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
    <div className="recruit-panel"><SectionHead eyebrow="RECRUITING" title="모집 중인 활동"/><div className="recruit-list">{visible.map(a=><button key={a.id} className={selected.id===a.id?'selected':''} onClick={()=>setSelected(a)}><div className={`mini-icon ${a.color}`}><ActivityIcon type={a.type}/></div><div><Badge tone={a.color}>{a.type}</Badge><h3>{a.title}</h3><span>{a.period} · {a.capacity}</span></div><strong>{a.dday}</strong></button>)}</div></div>
    <div className="today-card"><SectionHead eyebrow={`${monthName} ${selectedDay}일`} title={isTodaySelected ? '오늘 일정' : '선택한 날짜의 일정'}/><div className="timeline">{selectedSchedules.length > 0 ? selectedSchedules.map(x=><div className="timeline-item" key={`${x.time}-${x.title}`}><time>{x.time}</time><i className={x.tone}/><div><b>{x.title}</b><span>{x.place}</span></div></div>) : <div className="empty-schedule"><CalendarDays/><b>등록된 일정이 없어요</b><span>다른 날짜를 선택해 일정을 확인해보세요.</span></div>}</div></div>
    <div className="detail-card"><div className="detail-top"><div><Badge tone={selected.color}>{selected.type}</Badge><h2>{selected.title}</h2><p>{selected.desc}</p></div><strong>{selected.dday}</strong></div><div className="detail-info">{[[Users,'대상',selected.target],[CalendarDays,'일정',selected.schedule],[MapPin,'장소',selected.place],[Users,'모집 인원',selected.capacity],[Clock3,'신청 기간',selected.period]].map(([I,k,v])=><div key={k}><I/><span>{k}</span><b>{v}</b></div>)}</div><button className="button" disabled title="신청 방법은 곧 공지됩니다">신청 준비 중</button></div>
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
