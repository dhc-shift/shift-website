import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { dday, typeColor } from '../data.js';
import { ActivityCard, Badge, Button, HeroArt, SectionHead } from '../components/ui.jsx';
import { CalendarDays, Lock } from 'lucide-react';

export default function Home({ setPage, notices = [], activities = [], user, banners = [] }) {
  const openActivities = activities.filter(a => a.status !== '완료' && (a.access === 'public' || user)).slice(0, 4)
    .map(a => ({ id: a.id, type: a.activity_type, title: a.title, desc: a.description, period: a.schedule, dday: a.status === '모집 중' ? dday(a.apply_end) : a.status, color: typeColor(a.activity_type) }));
  const defaultSlides = [
    { eyebrow: '2026 SECOND HALF', line1: '새로운 가능성은', line2: '함께할 때 시작돼요', text: 'SHIFT 2기 신입부원을 모집합니다.', cta: '모집 자세히 보기', link: '/more', art: 'cube' },
    { eyebrow: 'BUILD WITH SHIFT', line1: '아이디어를 세상에', line2: '실행으로 옮겨보세요', text: '2026 신규 프로젝트 팀 빌딩이 시작됩니다.', cta: '프로젝트 둘러보기', link: '/activities', art: 'rings' },
    { eyebrow: 'SHIFT CONNECT', line1: '배움과 경험이 만나는', line2: '커뮤니티의 하루', text: '9월, SHIFT 네트워킹 데이에 초대합니다.', cta: '행사 확인하기', link: '/activities', art: 'network' }
  ];
  const active = banners.filter(b => b.is_active);
  const slides = active.length
    ? active.map(b => ({ eyebrow: b.eyebrow, line1: b.title_line1, line2: b.title_line2, text: b.description, cta: b.cta_label, link: b.cta_url, art: b.art }))
    : defaultSlides;
  const go = link => {
    if (!link) return;
    if (/^https?:/.test(link)) window.open(link, '_blank', 'noopener');
    else setPage(link.replace(/^\//, '') || 'home');
  };
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
            <div className="hero-copy"><span className="eyebrow">{s.eyebrow}</span><h1>{s.line1}{s.line2 && <><br/><em>{s.line2}</em></>}</h1><p>{s.text}</p>{s.cta && <Button onClick={() => go(s.link)}>{s.cta}<ArrowRight size={17}/></Button>}</div>
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
          {!user
            ? <div className="notice-rail-empty"><Lock size={22}/><b>부원 전용 공지입니다</b><span>로그인 후 확인할 수 있어요.</span><button className="button secondary" onClick={() => setPage('login')} style={{marginTop:'12px'}}>로그인</button></div>
            : recentNotices.length
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
      {openActivities.length ? <div className="activity-grid">{openActivities.map(a => <ActivityCard key={a.id} item={a} onClick={() => setPage('activities')}/>)}</div> : <div className="board-empty"><CalendarDays/><h3>모집 중인 활동이 없습니다</h3><p>새 활동이 열리면 이곳에서 확인할 수 있어요.</p></div>}
    </section>
  </>;
}
