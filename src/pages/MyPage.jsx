import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Bell, ChevronRight, Trophy, Upload, X } from 'lucide-react';
import { supabase } from '../supabase.js';
import { typeColor } from '../data.js';
import { ActivityIcon, Badge, Button, SectionHead } from '../components/ui.jsx';

export default function MyPage({setPage,profile,memberStats,activities=[],refresh}){
  const myActivities=memberStats?activities.filter(a=>a.activity_members?.some(m=>m.student_id===memberStats.student_id)):[];
  const [searchParams,setSearchParams]=useSearchParams();
  const [editOpen,setEditOpen]=useState(searchParams.get('edit')==='1');
  useEffect(()=>{ if(searchParams.get('edit')==='1'){ setEditOpen(true); setSearchParams({},{replace:true}); } },[searchParams]);
  const name=memberStats?.name||profile?.name||'SHIFT 회원';
  return <><section className="profile-hero"><div className="container profile-row"><div className="avatar-large">{profile?.avatar_url?<img src={profile.avatar_url} alt=""/>:name[0]}</div><div><span className="eyebrow">MY SHIFT</span><h1>안녕하세요, <em>{name}님</em></h1><p>{memberStats?`${memberStats.affiliation} · ${memberStats.cohort} · 학번 ${memberStats.student_id}`:(profile?.email||'회원 정보를 불러오는 중입니다.')}</p></div><button className="button secondary" onClick={()=>setEditOpen(true)}>프로필 수정</button></div></section><section className="section container">{!memberStats&&<div className="member-sync-notice"><Bell/><div><b>Google Sheets 회원 정보를 찾지 못했습니다.</b><span>로그인 이메일과 '인원 관리' 시트의 이메일이 정확히 같은지 확인해주세요.</span></div></div>}<div className="my-summary"><div className="my-card points"><span>현재 보유 마일리지</span><strong>{(memberStats?.total_mileage??0).toLocaleString()}<small>P</small></strong><button onClick={()=>setPage('more')}>마일리지 자세히 보기 <ArrowRight/></button></div><div className="my-card grade"><span>현재 등급</span><strong>{memberStats?.current_tier||'미정'}</strong><p>Google Sheets 기준 최신 등급</p></div><div className="my-card active-count"><span>현재 순위</span><strong>{memberStats?.current_rank?`${memberStats.current_rank}위`:'—'}</strong><div className="floating-calendar"><Trophy/></div></div></div><div className="panel participation"><SectionHead eyebrow="MY ACTIVITIES" title="참여 중인 활동" action={<button className="text-link" onClick={()=>setPage('activities')}>전체 보기 <ArrowRight/></button>}/>{myActivities.length?myActivities.map(a=><div className="participation-row" key={a.id}><div className={`mini-icon ${typeColor(a.activity_type)}`}><ActivityIcon type={a.activity_type}/></div><div><b>{a.title}</b><span>{a.activity_type}{a.schedule?` · ${a.schedule}`:''}</span></div><Badge tone={a.status==='완료'?'gray':typeColor(a.activity_type)}>{a.status}</Badge><ChevronRight/></div>):<div className="board-empty"><Bell/><p>참여 중인 활동이 아직 없습니다.</p></div>}</div></section>{editOpen&&<ProfileEditModal profile={profile} refresh={refresh} close={()=>setEditOpen(false)}/>}</>;
}

function ProfileEditModal({profile,refresh,close}){
  const [name,setName]=useState(profile?.name||'');
  const [password,setPassword]=useState('');
  const [avatarFile,setAvatarFile]=useState(null);
  const [preview,setPreview]=useState(profile?.avatar_url||null);
  const [removePhoto,setRemovePhoto]=useState(false);
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState(false);
  const pickFile=async e=>{
    const file=e.target.files[0];
    if(!file)return;
    if(file.size>2*1024*1024){setMessage('사진은 2MB 이하만 가능합니다.');return}
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setMessage('PNG, JPG, WEBP 형식만 가능합니다.');return}
    try{
      // 어떤 비율의 사진이든 중앙 기준 정사각형으로 잘라 512px로 정규화
      const bitmap=await createImageBitmap(file);
      const side=Math.min(bitmap.width,bitmap.height);
      const canvas=document.createElement('canvas');
      canvas.width=512;canvas.height=512;
      canvas.getContext('2d').drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,512,512);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.88));
      setMessage('');setAvatarFile(new File([blob],'avatar.jpg',{type:'image/jpeg'}));setRemovePhoto(false);setPreview(canvas.toDataURL('image/jpeg',0.88));
    }catch{
      setMessage('사진을 처리하지 못했습니다. 다른 이미지로 시도해주세요.');
    }
  };
  const save=async e=>{
    e.preventDefault();setSaving(true);setMessage('');
    try{
      let avatarUrl;
      if(avatarFile){
        const path=`${profile.id}/avatar`;
        const {error:uploadError}=await supabase.storage.from('avatars').upload(path,avatarFile,{upsert:true,contentType:avatarFile.type});
        if(uploadError)throw uploadError;
        avatarUrl=`${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      }
      if(removePhoto){
        await supabase.storage.from('avatars').remove([`${profile.id}/avatar`]);
        avatarUrl=null;
      }
      const updates={};
      if(name.trim()&&name.trim()!==profile?.name)updates.name=name.trim();
      if(avatarUrl!==undefined)updates.avatar_url=avatarUrl;
      if(Object.keys(updates).length){
        const {error}=await supabase.from('profiles').update(updates).eq('id',profile.id);
        if(error)throw error;
        if(updates.name)await supabase.auth.updateUser({data:{name:updates.name,display_name:updates.name}});
      }
      if(password){
        const {error}=await supabase.auth.updateUser({password});
        if(error)throw error;
      }
      setMessage('저장되었습니다.');
      refresh?.();
      setTimeout(close,800);
    }catch(err){
      setMessage(/permission denied|row-level security/i.test(err.message)?'프로필 수정 권한 설정이 아직 적용되지 않았습니다. 운영진에게 문의해주세요.':err.message);
    }finally{
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" onClick={close}><form className="auth-card" onClick={e=>e.stopPropagation()} onSubmit={save} style={{position:'relative'}}><button type="button" className="modal-close" onClick={close} aria-label="닫기"><X/></button><span className="eyebrow">PROFILE</span><h1>프로필 수정</h1>
  <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
    <div className="avatar-large" style={{width:'64px',height:'64px',fontSize:'24px'}}>{preview&&!removePhoto?<img src={preview} alt=""/>:(name[0]||'S')}</div>
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      <label className="button secondary" style={{cursor:'pointer',margin:0}}><Upload size={15}/> 사진 선택<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickFile} style={{display:'none'}}/></label>
      {(preview||profile?.avatar_url)&&!removePhoto&&<button type="button" className="auth-toggle" style={{margin:0,textAlign:'left'}} onClick={()=>{setRemovePhoto(true);setAvatarFile(null);setPreview(null)}}>사진 제거</button>}
    </div>
  </div>
  <label>이름<input value={name} onChange={e=>setName(e.target.value)} placeholder="이름"/></label>
  <label>새 비밀번호 (변경할 때만 입력)<input type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8자 이상"/></label>
  {message&&<div className="auth-message">{message}</div>}
  <Button>{saving?'저장 중...':'저장'}</Button></form></div>;
}
