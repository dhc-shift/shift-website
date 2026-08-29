import React from 'react';
import { CircleUserRound, HeartHandshake, Lightbulb } from 'lucide-react';
import { PageHero, SectionHead } from '../components/ui.jsx';

export default function About({ summary }) { return <>
  <PageHero eyebrow="WHO WE ARE" title={<>아이디어를 움직이는 사람들,<br/><em>우리는 SHIFT입니다.</em></>} description="IT와 디지털 헬스케어를 중심으로 배우고, 연결하고, 세상에 필요한 변화를 만듭니다."/>
  <section className="section container about-intro"><div><SectionHead eyebrow="ABOUT SHIFT" title="배움에서 멈추지 않고, 함께 실행합니다."/><p className="body-copy">SHIFT는 전공과 학년의 경계를 넘어 기술로 더 나은 일상을 고민하는 대학생 IT 동아리입니다. 스터디에서 쌓은 지식을 프로젝트로 확장하고, 세미나와 커뮤니티 활동을 통해 서로의 성장을 연결합니다.</p><div className="stats"><div><b>1</b><span>함께한 기수</span></div><div><b>{summary?.member_count ?? 41}</b><span>누적 멤버</span></div><div><b>4</b><span>완료 프로젝트</span></div></div></div><div className="brand-graphic"><div className="brand-ring one"/><div className="brand-ring two"/><strong>SHIFT</strong><span className="brand-dot d1"/><span className="brand-dot d2"/><span className="brand-dot d3"/><img src="/shift-about-logo.png" alt="SHIFT 로고" onError={event => event.currentTarget.classList.add('image-missing')}/></div></section>
  <section className="section soft-section"><div className="container"><SectionHead eyebrow="ORGANIZATION" title="각자의 전문성으로, 하나의 방향을 만듭니다." text="SHIFT는 두 본부가 유기적으로 협업하며 운영됩니다."/><OrgChart/></div></section>
  </>;
}

function OrgChart(){return <div className="org-chart"><div className="org-node chief"><span>LEADER</span><b>회장</b><small>유민준</small></div><div className="org-line vertical"/><div className="org-node vice"><span>VICE LEADER</span><b>부회장</b><small>최유진</small></div><div className="org-branches"><div className="org-branch"><div className="org-node division blue"><Lightbulb/><b>학술기획 본부</b><small>프로젝트 기획 · 운영 · 실행</small></div><div className="member-row">{['김대희','김지원'].map(x=><div className="member" key={x}><CircleUserRound/><span>{x}</span></div>)}</div></div><div className="org-branch"><div className="org-node division mint"><HeartHandshake/><b>인사시스템 본부</b><small>인사관리 · 뉴스레터</small></div><div className="member-row">{['김남훈','김시연','이남주'].map(x=><div className="member" key={x}><CircleUserRound/><span>{x}</span></div>)}</div></div></div></div>}
