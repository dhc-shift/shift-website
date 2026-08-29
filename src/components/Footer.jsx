import React from 'react';
import { navItems } from '../data.js';
import { Logo } from './ui.jsx';

export default function Footer({setPage}){
  return <footer><div className="container footer-main"><div><Logo onClick={()=>setPage('home')}/><p>Ideas shift.<br/>Impact together.</p></div><div className="footer-links">{navItems.map(([id,label])=><button onClick={()=>setPage(id)} key={id}>{label}</button>)}</div><div><b>SHIFT</b><p>기술로 더 나은 변화를<br/>함께 만들어갑니다.</p></div></div><div className="container footer-bottom"><span>© 2026 SHIFT. All rights reserved.</span><span>Privacy · Terms</span></div></footer>;
}
