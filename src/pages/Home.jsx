import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { activityData } from '../data.js';
import { ActivityCard, Badge, Button, HeroArt, SectionHead } from '../components/ui.jsx';

export default function Home({ setPage, notices = [] }) {
  const slides = [
    { eyebrow: '2026 SECOND HALF', title: <>새로운 가능성은<br/><em>함께할 때 시작돼요</em></>, text: 'SHIFT 2기 신입부원을 모집합니다.', cta: '모집 자세히 보기', art: 'cube' },
    { eyebrow: 'BUILD WITH SHIFT', title: <>아이디어를 세상에<br/><em>실행으로 옮겨보세요</em></>, text: '2026 신규 프로젝트 팀 빌딩이 시작됩니다.', cta: '프로젝트 둘러보기', art: 'rings' },
    { eyebrow: 'SHIFT CONNECT', title: <>배움과 경험이 만나는<br/><em>커뮤니티의 하루</em></>, text: '9월, SHIFT 네트워킹 데이에 초대합니다.', cta: '행사 확인하기', art: 'network' }
  ];
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused]);
  const recentNotices = notices.slice(0, 5);
  return <>
    <section className="hero container hero-with-rail">
      <div className="hero-panel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="hero-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {slides.map((s, i) => <div className="hero-slide" key={i} aria-hidden={i !== slide}>
            <div className="hero-copy"><span className="eyebrow">{s.eyebrow}</span><h1>{s.title}</h1><p>{s.text}</p><Button onClick={() => setPage(i === 0 ? 'more' : 'activities')}>{s.cta}<ArrowRight size={17}/></Button></div>
            <HeroArt variant={s.art}/>
          </div>)}
        </div>
        <button className="slider-arrow left" onClick={() => setSlide((slide + slides.length - 1) % slides.length)} aria-label="이전 배너"><ChevronLeft/></button>
        <button className="slider-arrow right" onClick={() => setSlide((slide + 1) % slides.length)} aria-label="다음 배너"><ChevronRight/></button>
        <div className="slider-dots">{slides.map((_, i) => <button key={i} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={`배너 ${i + 1}`}/>)}</div>
      </div>
      <aside className="notice-rail">
        <div className="notice-rail-head"><span className="eyebrow">NOTICE</span><h2>공지사항</h2><button className="text-link" onClick={() => setPage('board')}>전체 보기 <ArrowRight size={14}/></button></div>
        <div className="notice-rail-list">
          {recentNotices.length
            ? recentNotices.map(n => <button key={n.id} onClick={() => setPage('board')}>
                <div className="notice-rail-top"><Badge tone={n.is_pinned ? 'blue' : 'gray'}>{n.is_pinned ? '필독' : '공지'}</Badge><time>{n.published_at}</time></div>
                <strong>{n.title}</strong>
              </button>)
            : <div className="notice-rail-empty"><b>등록된 공지가 없습니다</b><span>새 소식이 올라오면 여기에 표시돼요.</span></div>}
        </div>
      </aside>
    </section>
    <section className="section container">
      <SectionHead eyebrow="NOW OPEN" title="지금, 함께할 수 있는 활동" text="관심 있는 활동을 발견하고 새로운 동료를 만나보세요." action={<button className="text-link" onClick={() => setPage('activities')}>전체 보기 <ArrowRight size={15}/></button>}/>
      <div className="activity-grid">{activityData.map(a => <ActivityCard key={a.id} item={a} onClick={() => setPage('activities')}/>)}</div>
    </section>
  </>;
}
