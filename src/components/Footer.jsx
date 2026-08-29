import React from 'react';
import { Mail } from 'lucide-react';
import { CONTACT_EMAIL, GITHUB_ORG_URL, navItems } from '../data.js';
import { Logo } from './ui.jsx';

export default function Footer({setPage}){
  return <footer><div className="container footer-main">
    <div><Logo onClick={()=>setPage('home')}/><p>Ideas shift.<br/>Impact together.</p></div>
    <div className="footer-links">{navItems.map(([id,label])=><button onClick={()=>setPage(id)} key={id}>{label}</button>)}</div>
    <div className="footer-contact">
      <b>Contact</b>
      <a href={`mailto:${CONTACT_EMAIL}`}><Mail size={15}/>{CONTACT_EMAIL}</a>
      <a href={GITHUB_ORG_URL} target="_blank" rel="noreferrer"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>github.com/dhc-shift</a>
    </div>
  </div>
  <div className="container footer-bottom"><span>© 2026 SHIFT. All rights reserved.</span><span>디지털헬스케어학부 학술동아리 SHIFT</span></div></footer>;
}
