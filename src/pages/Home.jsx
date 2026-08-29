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
  useEffect(() => { const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5500); return () => clearInterval(t); }, []);
  const s = slides[slide];
  const recentNotices = notices.slice(0, 4);
  return <>
    <section className="hero container">
      <div className="hero-panel">
        <div className="hero-copy"><span className="eyebrow">{s.eyebrow}</span><h1>{s.title}</h1><p>{s.text}</p><Button onClick={() => setPage(slide === 1 ? 'activities' : slide === 2 ? 'activities' : 'more')}>{s.cta}<ArrowRight size={17}/></Button></div>
        <HeroArt variant={s.art}/>
        <button className="slider-arrow left" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}><ChevronLeft/></button>
        <button className="slider-arrow right" onClick={() => setSlide((slide + 1) % slides.length)}><ChevronRight/></button>
        <div className="slider-dots">{slides.map((_, i) => <button key={i} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)}/>)}</div>
      </div>
    </section>
    <section className="section container">
      <SectionHead eyebrow="NOW OPEN" title="지금, 함께할 수 있는 활동" text="관심 있는 활동을 발견하고 새로운 동료를 만나보세요." action={<button className="text-link" onClick={() => setPage('activities')}>전체 보기 <ArrowRight size={15}/></button>}/>
      <div className="activity-grid">{activityData.map(a => <ActivityCard key={a.id} item={a} onClick={() => setPage('activities')}/>)}</div>
    </section>
    <section className="section notices-section"><div className="container">
      <SectionHead eyebrow="NOTICE" title="SHIFT의 새로운 소식" action={<button className="text-link" onClick={() => setPage('board')}>전체 보기 <ArrowRight size={15}/></button>}/>
      <div className="notice-list">
        {recentNotices.length
          ? recentNotices.map(n => <button key={n.id} onClick={() => setPage('board')}><Badge tone={n.is_pinned ? 'blue' : 'gray'}>{n.is_pinned ? '필독' : '공지'}</Badge><strong>{n.title}</strong><time>{n.published_at}</time><ChevronRight size={17}/></button>)
          : <button onClick={() => setPage('board')}><Badge tone="gray">안내</Badge><strong>등록된 소식이 아직 없습니다</strong><time/><ChevronRight size={17}/></button>}
      </div>
    </div></section>
  </>;
}
