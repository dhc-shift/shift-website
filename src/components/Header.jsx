import React, { useState } from 'react';
import { LogIn, LogOut, Menu, Settings, X } from 'lucide-react';
import { navItems } from '../data.js';
import { Logo } from './ui.jsx';

export default function Header({ page, setPage, user, profile, signOut }) {
  const [open, setOpen] = useState(false);
  const move = p => { setPage(p); setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <header className="header">
    <div className="nav-shell">
      <Logo onClick={() => move('home')} />
      <nav className={open ? 'nav-menu open' : 'nav-menu'}>
        {navItems.map(([id, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => move(id)}>{label}</button>)}
      </nav>
      <div className="header-actions">
        {profile?.role === 'admin' && <button className="admin-shortcut" onClick={() => move('admin')}><Settings/><span>관리</span></button>}
        <button className="profile-button" onClick={() => move(user ? 'mypage' : 'login')} aria-label={user ? '마이페이지' : '로그인'}>
          <span className="avatar-mini">{user ? (profile?.name?.[0] || 'S') : <LogIn/>}</span><span>{user ? '마이페이지' : '로그인'}</span>
        </button>
        {user && <button className="logout-button" onClick={signOut} aria-label="로그아웃"><LogOut/></button>}
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="메뉴">{open ? <X /> : <Menu />}</button>
      </div>
    </div>
  </header>;
}
