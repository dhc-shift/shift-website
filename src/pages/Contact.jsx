import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { PageHero, SectionHead } from '../components/ui.jsx';

export default function Contact(){return <><PageHero eyebrow="CONTACT" title={<>SHIFT와 연결되는<br/><em>가장 쉬운 방법.</em></>} description="궁금한 점이 있다면 언제든 편하게 연락해주세요."/><section className="section container contact-grid"><div><SectionHead eyebrow="GET IN TOUCH" title="연락처"/><div className="contact-cards"><a href="mailto:shiftysdh@gmail.com"><Mail/><div><span>공식 이메일</span><b>shiftysdh@gmail.com</b></div><ArrowRight/></a></div></div></section></>}
