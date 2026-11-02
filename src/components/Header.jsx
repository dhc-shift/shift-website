import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, CircleUserRound, KeyRound, LogIn, LogOut, Menu, Settings, Trophy, X } from 'lucide-react';
import { menuGroups, RECRUIT_OPEN, RECRUIT_SITE_URL } from '../data.js';
import { Logo } from './ui.jsx';

const tierClass = tier => /골드|gold/i.test(tier||'') ? 'gold' : /실버|silver/i.test(tier||'') ? 'silver' : /브론즈|bronze/i.test(tier||'') ? 'bronze' : 'none';

export default function Header({ page, setPage, user, profile, memberStats, signOut }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [group, setGroup] = useState(null); // 열려 있는 드롭다운의 최상위 이름
  const menuRef = useRef(null);
  const navRef = useRef(null);
  const closeTimer = useRef(null);
  const here = decodeURI(location.pathname.slice(1) + location.search + location.hash);
  const section = page.split('/')[0];
  const move = p => { setPage(p); setOpen(false); setMenuOpen(false); setGroup(null); if (!p.includes('#')) window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const showGroup = label => { clearTimeout(closeTimer.current); setGroup(label); };
  const hideGroupSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setGroup(null), 170); };
  const name = memberStats?.name || profile?.name || 'SHIFT 회원';
  const recruitTag = item => item.to === 'recruit' && RECRUIT_OPEN && <small>모집 중</small>;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  useEffect(() => {
    if (!group) return;
    const onDown = e => { if (navRef.current && !navRef.current.contains(e.target)) setGroup(null); };
    const onKey = e => { if (e.key === 'Escape') { navRef.current?.querySelector('.nav-group.open>button')?.focus(); setGroup(null); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [group]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return <header className="header">
    <div className="nav-shell">
      <Logo onClick={() => move('home')} />
      <nav className="nav-menu" ref={navRef}>
        {menuGroups.map(g => {
          const isOpen = group === g.label;
          return <div className={isOpen ? 'nav-group open' : 'nav-group'} key={g.label} onMouseEnter={() => showGroup(g.label)} onMouseLeave={hideGroupSoon} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) hideGroupSoon(); }}>
            <button className={g.sections.includes(section) ? 'active' : ''} onClick={() => showGroup(g.label)} aria-expanded={isOpen} aria-haspopup="true">{g.label}<ChevronDown size={14}/></button>
            {isOpen && <div className="nav-drop">{g.items.map(item => <button key={item.to} className={here === item.to ? 'current' : ''} onClick={() => move(item.to)}><span className="nav-drop-icon"><item.icon/></span><span><b>{item.label}{recruitTag(item)}</b><span>{item.desc}</span></span></button>)}</div>}
          </div>;
        })}
      </nav>
      <div className="header-actions">
        {RECRUIT_OPEN && <a className="apply-pill" href={RECRUIT_SITE_URL} target="_blank" rel="noreferrer">지원하기</a>}
        {profile?.role === 'admin' && <button className="admin-shortcut" onClick={() => move('admin')}><Settings/><span>관리</span></button>}
        {!user && <button className="profile-button" onClick={() => move('login')} aria-label="로그인">
          <span className="avatar-mini"><LogIn/></span><span>로그인</span>
        </button>}
        {user && <div className="profile-menu-wrap" ref={menuRef}>
          <button className="profile-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-haspopup="menu">
            <span className="avatar-mini">{profile?.avatar_url ? <img src={profile.avatar_url} alt=""/> : (name[0] || 'S')}</span>
            <span>{name} 님</span>
            <ChevronDown size={15} className={menuOpen ? 'pm-caret up' : 'pm-caret'}/>
          </button>
          {menuOpen && <div className="profile-menu" role="menu">
            <div className="pm-head">
              <span className="avatar-mini pm-avatar">{profile?.avatar_url ? <img src={profile.avatar_url} alt=""/> : (name[0] || 'S')}</span>
              <div><b>{name}</b><span>{profile?.email}</span></div>
            </div>
            <div className="pm-mileage">
              <div><span>내 마일리지</span><strong>{(memberStats?.total_mileage ?? 0).toLocaleString()}<small>P</small></strong></div>
              <span className={`pm-tier ${tierClass(memberStats?.current_tier)}`}><Trophy size={13}/>{memberStats?.current_tier || '등급 미정'}</span>
            </div>
            <div className="pm-items">
              <button role="menuitem" onClick={() => move('mypage')}><CircleUserRound size={16}/>마이페이지</button>
              <button role="menuitem" onClick={() => move('mileage')}><Trophy size={16}/>마일리지</button>
              <button role="menuitem" onClick={() => move('mypage?edit=1')}><KeyRound size={16}/>프로필 · 비밀번호 변경</button>
              <button role="menuitem" className="pm-logout" onClick={() => { setMenuOpen(false); signOut(); }}><LogOut size={16}/>로그아웃</button>
            </div>
          </div>}
        </div>}
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="메뉴" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    <div className={open ? 'mobile-nav open' : 'mobile-nav'}>
      {menuGroups.map(g => <div className="mobile-nav-group" key={g.label}><p>{g.label}</p><div>{g.items.map(item => <button key={item.to} className={here === item.to ? 'current' : ''} onClick={() => move(item.to)}>{item.label}{recruitTag(item)}</button>)}</div></div>)}
    </div>
  </header>;
}
