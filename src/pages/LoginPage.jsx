import React, { useState } from 'react';
import { Check, CircleUserRound, KeyRound } from 'lucide-react';
import { supabase } from '../supabase.js';
import { Button } from '../components/ui.jsx';

export default function LoginPage({ user, profile, setPage }) {
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({email:'',password:'',name:''});
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  if(user) return <section className="auth-page container"><div className="auth-card"><div className="auth-icon"><Check/></div><h1>로그인되어 있습니다</h1><p>{profile?.email}</p><Button onClick={()=>setPage(profile?.role==='admin'?'admin':'mypage')}>{profile?.role==='admin'?'관리자 페이지':'마이페이지'}로 이동</Button></div></section>;
  const submit=async e=>{
    e.preventDefault();setLoading(true);setMessage('');
    if(mode==='reset'){
      const {error}=await supabase.auth.resetPasswordForEmail(form.email,{redirectTo:window.location.origin});
      setLoading(false);setMessage(error?error.message:'재설정 링크를 이메일로 보냈습니다. 메일함을 확인해주세요.');return;
    }
    const options=mode==='signup'?{data:{name:form.name}}:undefined;
    const {error}=mode==='signup'?await supabase.auth.signUp({email:form.email,password:form.password,options}):await supabase.auth.signInWithPassword({email:form.email,password:form.password});
    setLoading(false);const friendly=error&&/Database error saving new user/i.test(error.message)?'SHIFT 부원 명단에 등록된 이메일만 가입할 수 있습니다. 운영진에게 문의해주세요.':error?.message;setMessage(error?friendly:mode==='signup'?'가입 확인 이메일을 확인해주세요.':'로그인되었습니다.');
  };
  return <section className="auth-page container"><form className="auth-card" onSubmit={submit}><div className="auth-icon"><CircleUserRound/></div><span className="eyebrow">SHIFT ACCOUNT</span><h1>{mode==='login'?'로그인':mode==='signup'?'회원가입':'비밀번호 재설정'}</h1><p>{mode==='reset'?'가입한 이메일로 재설정 링크를 보내드립니다.':'SHIFT 부원 명단에 등록된 이메일로만 가입할 수 있습니다.'}</p>{mode==='signup'&&<label>이름<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="이름"/></label>}<label>이메일<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@example.com"/></label>{mode!=='reset'&&<label>비밀번호<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="8자 이상"/></label>}{message&&<div className="auth-message">{message}</div>}<Button>{loading?'처리 중...':mode==='login'?'로그인':mode==='signup'?'가입하기':'재설정 링크 보내기'}</Button><button type="button" className="auth-toggle" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'계정이 없나요? 회원가입':'이미 계정이 있나요? 로그인'}</button>{mode==='login'&&<button type="button" className="auth-toggle" onClick={()=>{setMode('reset');setMessage('')}}>비밀번호를 잊으셨나요?</button>}</form></section>;
}

export function UpdatePasswordPage({ setPage }) {
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const submit=async e=>{
    e.preventDefault();setLoading(true);setMessage('');
    const {error}=await supabase.auth.updateUser({password});
    setLoading(false);
    if(error)setMessage(error.message);
    else{setMessage('비밀번호가 변경되었습니다.');setTimeout(()=>setPage('mypage'),800);}
  };
  return <section className="auth-page container"><form className="auth-card" onSubmit={submit}><div className="auth-icon"><KeyRound/></div><span className="eyebrow">SHIFT ACCOUNT</span><h1>새 비밀번호 설정</h1><p>사용할 새 비밀번호를 입력해주세요.</p><label>새 비밀번호<input required minLength="8" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8자 이상"/></label>{message&&<div className="auth-message">{message}</div>}<Button>{loading?'변경 중...':'비밀번호 변경'}</Button></form></section>;
}
