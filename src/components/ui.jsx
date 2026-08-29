import React from 'react';
import {
  BookOpen, CalendarDays, ChevronLeft, FolderArchive, GraduationCap,
  Lightbulb, Sparkles, Users
} from 'lucide-react';

export function Logo({ onClick }) {
  return <button className="logo" onClick={onClick} aria-label="SHIFT 홈"><img src="/shift-header-logo.png" alt="SHIFT" /></button>;
}

export function Badge({ children, tone = 'blue' }) { return <span className={`badge ${tone}`}>{children}</span>; }
export function SectionHead({ eyebrow, title, text, action }) { return <div className="section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>; }
export function Button({ children, secondary = false, onClick }) { return <button className={secondary ? 'button secondary' : 'button'} onClick={onClick}>{children}</button>; }
export function PageHero({ eyebrow, title, description }) { return <section className="page-hero"><div className="orb orb-a" /><div className="orb orb-b" /><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>; }

export function HeroArt({ variant }) { return <div className={`hero-art ${variant}`}><div className="glow"/><div className="shape shape-1"/><div className="shape shape-2"/><div className="shape shape-3"/><div className="orbit"><Sparkles size={22}/></div></div>; }
export function ActivityCard({ item, onClick }) { return <button className="activity-card" onClick={onClick}><div className={`activity-icon ${item.color}`}><ActivityIcon type={item.type}/></div><div className="activity-top"><Badge tone={item.color}>{item.type}</Badge><strong className="dday">{item.dday}</strong></div><h3>{item.title}</h3><p>{item.desc}</p><div className="card-meta"><CalendarDays size={15}/>{item.period}</div></button>; }
export function ActivityIcon({ type }) { return type === '프로젝트' ? <Lightbulb/> : type === '스터디' ? <BookOpen/> : type === '세미나' ? <GraduationCap/> : <Users/>; }

export function SubHeader({title,back}){return <div className="sub-header container"><button onClick={back}><ChevronLeft/> 더보기</button><h1>{title}</h1></div>}
export function CoinArt(){return <div className="coin-art"><i/><i/><b>P</b><span>+120</span></div>}
export function PeopleArt(){return <div className="people-art"><Users/><i/><i/><span>+</span></div>}
export function AdminList({children}){return <div className="admin-list">{children?.length?children:<div className="board-empty"><FolderArchive/><p>등록된 데이터가 없습니다.</p></div>}</div>}
