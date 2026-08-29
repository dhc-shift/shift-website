import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, CircleUserRound, KeyRound, LogIn, LogOut, Menu, Settings, Trophy, X } from 'lucide-react';
import { navItems } from '../data.js';
import { Logo } from './ui.jsx';

const tierClass = tier => /골드|gold/i.test(tier||'') ? 'gold' : /실버|silver/i.test(tier||'') ? 'silver' : /브론즈|bronze/i.test(tier||'') ? 'bronze' : 'none';

export default function Header({ page, setPage, user, profile, memberStats, signOut }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const move = p => { setPage(p); setOpen(false); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const name = memberStats?.name || profile?.name || 'SHIFT 회원';

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  return <header className="header">
    <div className="nav-shell">
      <Logo onClick={() => move('home')} />
      <nav className={open ? 'nav-menu open' : 'nav-menu'}>
        {navItems.map(([id, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => move(id)}>{label}</button>)}
      </nav>
      <div className="header-actions">
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
              <button role="menuitem" onClick={() => move('mypage?edit=1')}><KeyRound size={16}/>프로필 · 비밀번호 변경</button>
              <button role="menuitem" className="pm-logout" onClick={() => { setMenuOpen(false); signOut(); }}><LogOut size={16}/>로그아웃</button>
            </div>
          </div>}
        </div>}
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="메뉴">{open ? <X /> : <Menu />}</button>
      </div>
    </div>
  </header>;
}
