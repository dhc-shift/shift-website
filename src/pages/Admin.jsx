import React, { useState } from 'react';
import { Archive as ArchiveIcon, Bell, CalendarDays, ExternalLink, FileText, FolderArchive, Image as ImageIcon, Lightbulb, Mail, MessageSquareText, Pencil, Pin, Plus, Trash2, Upload, UserPlus, Users, X } from 'lucide-react';
import { eventTone, typeColor } from '../data.js';
import { supabase } from '../supabase.js';
import { ActivityIcon, AdminList, Badge, Button, SectionHead } from '../components/ui.jsx';

export default function AdminPage({ profile, newsletters, events, members, notices, documents, suggestions, activities, roster, refresh }) {
  const [tab,setTab]=useState('activities');
  const [notice,setNotice]=useState('');
  if(profile?.role!=='admin')return <section className="auth-page container"><div className="auth-card"><h1>접근 권한이 없습니다</h1><p>관리자 계정으로 로그인해주세요.</p></div></section>;
  return <><section className="admin-hero"><div className="container"><span className="eyebrow">SHIFT ADMIN</span><h1>콘텐츠 관리</h1><p>웹사이트의 운영 데이터를 코드 수정 없이 관리합니다.</p></div></section><section className="admin-layout container"><aside className="admin-nav">{[['activities','활동',Lightbulb],['archive','아카이브',ArchiveIcon],['newsletters','뉴스레터',Mail],['events','일정',CalendarDays],['notices','공지사항',Bell],['documents','자료실',FolderArchive],['suggestions','건의함',MessageSquareText],['members','회원 권한',Users]].map(([id,label,I])=><button className={tab===id?'active':''} onClick={()=>{setTab(id);setNotice('')}} key={id}><I/>{label}</button>)}</aside><div className="admin-main">{notice&&<div className="admin-notice">{notice}</div>}{tab==='activities'&&<ActivityAdmin items={activities} roster={roster} refresh={refresh} setNotice={setNotice} mode="active"/>} {tab==='archive'&&<ActivityAdmin items={activities} roster={roster} refresh={refresh} setNotice={setNotice} mode="archive"/>} {tab==='newsletters'&&<NewsletterAdmin items={newsletters} refresh={refresh} setNotice={setNotice}/>} {tab==='events'&&<EventAdmin items={events} refresh={refresh} setNotice={setNotice}/>} {tab==='notices'&&<NoticeAdmin items={notices} refresh={refresh} setNotice={setNotice}/>} {tab==='documents'&&<DocumentAdmin items={documents} refresh={refresh} setNotice={setNotice}/>} {tab==='suggestions'&&<SuggestionAdmin items={suggestions} refresh={refresh} setNotice={setNotice}/>} {tab==='members'&&<MemberAdmin items={members} currentId={profile.id} refresh={refresh} setNotice={setNotice}/>}</div></section></>;
}


function ActivityAdmin({items,roster,refresh,setNotice,mode='active'}){
  const isArchive=mode==='archive';
  const list=items.filter(i=>isArchive?i.status==='완료':i.status!=='완료');
  const empty={title:'',activity_type:'프로젝트',description:'',target:'',schedule:'',place:'',capacity:'',apply_start:'',apply_end:'',apply_url:'',apply_note:'',access:'public',status:isArchive?'완료':'모집 중',result_note:''};
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null); // 수정 중인 활동 (원본 객체)
  const [poster,setPoster]=useState(null);
  const [saving,setSaving]=useState(false);
  const [memberEdit,setMemberEdit]=useState(null); // 참여자 편집 중인 활동 id
  const [pick,setPick]=useState('');
  const [photoEdit,setPhotoEdit]=useState(null); // 사진 편집 중인 활동 id
  const [photoBusy,setPhotoBusy]=useState(false);
  const startEdit=item=>{
    setEditing(item);setPoster(null);
    setForm({title:item.title,activity_type:item.activity_type,description:item.description,target:item.target,schedule:item.schedule,place:item.place,capacity:item.capacity,apply_start:item.apply_start||'',apply_end:item.apply_end||'',apply_url:item.apply_url,apply_note:item.apply_note||'',access:item.access,status:item.status,result_note:item.result_note||''});
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const cancelEdit=()=>{setEditing(null);setForm(empty);setPoster(null)};
  const submit=async e=>{
    e.preventDefault();setSaving(true);
    let poster_path=editing?editing.poster_path:'';
    if(poster){
      const safeName=`${Date.now()}-${poster.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;
      const {error:uploadError}=await supabase.storage.from('posters').upload(safeName,poster,{contentType:poster.type});
      if(uploadError){setNotice(uploadError.message);setSaving(false);return}
      if(editing?.poster_path)await supabase.storage.from('posters').remove([editing.poster_path]);
      poster_path=safeName;
    }
    const payload={...form,poster_path,apply_start:form.apply_start||null,apply_end:form.apply_end||null};
    const {error}=editing
      ?await supabase.from('activities').update(payload).eq('id',editing.id)
      :await supabase.from('activities').insert(payload);
    setSaving(false);
    setNotice(error?error.message:editing?'활동이 수정되었습니다.':'활동이 등록되었습니다.');
    if(!error){cancelEdit();refresh();}
  };
  const setStatus=async(item,status)=>{
    const {error}=await supabase.from('activities').update({status}).eq('id',item.id);
    setNotice(error?error.message:status==='완료'?'활동이 완료 처리되어 아카이브로 이동했습니다.':'상태가 변경되었습니다.');
    refresh();
  };
  const remove=async item=>{
    if(!confirm(`'${item.title}' 활동을 삭제할까요? 참여자 기록도 함께 삭제됩니다.`))return;
    if(item.poster_path)await supabase.storage.from('posters').remove([item.poster_path]);
    const {error}=await supabase.from('activities').delete().eq('id',item.id);
    setNotice(error?error.message:'활동이 삭제되었습니다.');
    if(editing?.id===item.id)cancelEdit();
    refresh();
  };
  const addMember=async item=>{
    if(!pick)return;
    const member=roster.find(r=>r.student_id===pick);
    if(!member)return;
    const {error}=await supabase.from('activity_members').insert({activity_id:item.id,student_id:member.student_id,member_name:member.name});
    setNotice(error?(error.code==='23505'?'이미 추가된 부원입니다.':error.message):'참여자가 추가되었습니다.');
    setPick('');refresh();
  };
  const removeMember=async m=>{
    const {error}=await supabase.from('activity_members').delete().eq('id',m.id);
    setNotice(error?error.message:'참여자가 제외되었습니다.');refresh();
  };
  const compressPhoto=async file=>{
    // 서버 용량·전송량 절약: 최대 1600px JPEG로 압축
    const bitmap=await createImageBitmap(file);
    const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    return new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.85));
  };
  const addPhotos=async(item,files)=>{
    if(!files.length)return;
    setPhotoBusy(true);
    for(const file of files){
      if(!/^image\//.test(file.type))continue;
      try{
        const blob=await compressPhoto(file);
        const path=`gallery/${item.id}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
        const {error:uploadError}=await supabase.storage.from('posters').upload(path,blob,{contentType:'image/jpeg'});
        if(uploadError){setNotice(uploadError.message);continue}
        const {error}=await supabase.from('activity_photos').insert({activity_id:item.id,photo_path:path});
        if(error)setNotice(error.message);
      }catch{setNotice('사진 처리에 실패했습니다.')}
    }
    setPhotoBusy(false);setNotice('사진이 업로드되었습니다.');refresh();
  };
  const removePhoto=async ph=>{
    await supabase.storage.from('posters').remove([ph.photo_path]);
    const {error}=await supabase.from('activity_photos').delete().eq('id',ph.id);
    setNotice(error?error.message:'사진이 삭제되었습니다.');refresh();
  };
  return <><SectionHead eyebrow={isArchive?'ARCHIVE':'ACTIVITIES'} title={editing?`${isArchive?'아카이브':'활동'} 수정 — ${editing.title}`:isArchive?'아카이브 관리':'활동 관리'} text={isArchive?'완료된 활동 기록을 등록·관리합니다. 참여 부원과 활동 사진을 붙이면 아카이브 페이지에 표시됩니다.':"진행할 활동을 등록하고 참여 부원을 지정합니다. 상태를 '완료'로 바꾸면 아카이브 탭으로 이동합니다."}/>
  <form className="admin-form" onSubmit={submit}>
    <label>활동명<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
    <label>유형<select value={form.activity_type} onChange={e=>setForm({...form,activity_type:e.target.value})}>{['프로젝트','스터디','세미나','행사'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>대상<input value={form.target} onChange={e=>setForm({...form,target:e.target.value})} placeholder="SHIFT 회원 및 대학생"/></label>
    <label>모집 인원<input value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} placeholder="12명"/></label>
    <label>일정<input value={form.schedule} onChange={e=>setForm({...form,schedule:e.target.value})} placeholder="2026.09 — 2026.11 (매주 화)"/></label>
    <label>장소<input value={form.place} onChange={e=>setForm({...form,place:e.target.value})}/></label>
    {!isArchive&&<><label>신청 시작일<input type="date" value={form.apply_start} onChange={e=>setForm({...form,apply_start:e.target.value})}/></label>
    <label>신청 마감일<input type="date" min={form.apply_start||undefined} value={form.apply_end} onChange={e=>setForm({...form,apply_end:e.target.value})}/></label>
    <label>신청 링크 (구글폼 등)<input type="url" value={form.apply_url} onChange={e=>setForm({...form,apply_url:e.target.value})} placeholder="https://forms.gle/..."/></label>
    <label>신청 방법 안내 (링크가 없을 때 표시)<input value={form.apply_note} onChange={e=>setForm({...form,apply_note:e.target.value})} placeholder="회장에게 카톡으로 연락해주세요"/></label></>}
    {isArchive&&<label className="wide">활동 결과 요약<input value={form.result_note} onChange={e=>setForm({...form,result_note:e.target.value})} placeholder="최종 결과물 발표와 회고 완료"/></label>}
    <label>공개 대상<select value={form.access} onChange={e=>setForm({...form,access:e.target.value})}><option value="public">전체 공개</option><option value="member">회원 전용</option></select></label>
    {!isArchive&&<label>상태<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>모집 중</option><option>진행 중</option></select></label>}
    <label className="wide">설명<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
    <label className="wide upload-label"><Upload/>홍보 포스터 (선택, 5MB 이하)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setPoster(e.target.files[0]||null)}/><span>{poster?.name||(editing?.poster_path?'기존 포스터 유지 (새 이미지를 선택하면 교체)':'이미지를 선택해주세요')}</span></label>
    <div className="form-actions"><Button>{saving?'저장 중...':editing?'수정 저장':isArchive?'아카이브 등록':'활동 등록'}</Button>{editing&&<button type="button" className="button secondary" onClick={cancelEdit}>취소</button>}</div>
  </form>
  <AdminList>{list.map(item=><div className="admin-activity-row" key={item.id}>
    <div className="admin-list-row activity-grid-row">
      <div className={`mini-icon ${typeColor(item.activity_type)}`}><ActivityIcon type={item.activity_type}/></div>
      <div><b>{item.title}</b><span>{item.activity_type} · 참여 {item.activity_members?.length||0}명{item.apply_end?` · 마감 ${item.apply_end}`:''}</span></div>
      <select value={item.status} onChange={e=>setStatus(item,e.target.value)}><option>모집 중</option><option>진행 중</option><option>완료</option></select>
      <button onClick={()=>startEdit(item)} title="수정" aria-label="수정"><Pencil/></button>
      {isArchive&&<button onClick={()=>setPhotoEdit(photoEdit===item.id?null:item.id)} title="활동 사진" aria-label="활동 사진"><ImageIcon/></button>}<button onClick={()=>{setMemberEdit(memberEdit===item.id?null:item.id);setPick('')}} title="참여자 관리" aria-label="참여자 관리"><UserPlus/></button>
      <button onClick={()=>remove(item)}><Trash2/></button>
    </div>
    {isArchive&&photoEdit===item.id&&<div className="member-editor">
      <div className="photo-grid">{item.photos?.length?item.photos.map(ph=><div className="photo-thumb" key={ph.id}><img src={ph.url} alt=""/><button onClick={()=>removePhoto(ph)} aria-label="사진 삭제"><X size={13}/></button></div>):<span className="chips-label">등록된 사진이 없습니다</span>}</div>
      <label className="button secondary photo-add">{photoBusy?'업로드 중...':'사진 추가 (여러 장 가능)'}<input type="file" accept="image/*" multiple disabled={photoBusy} onChange={e=>{addPhotos(item,[...e.target.files]);e.target.value=''}} style={{display:'none'}}/></label>
    </div>}
    {memberEdit===item.id&&<div className="member-editor">
      <div className="member-chips">{item.activity_members?.length?item.activity_members.map(m=><span className="member-chip" key={m.id}>{m.member_name}<button onClick={()=>removeMember(m)} aria-label={`${m.member_name} 제외`}><X size={12}/></button></span>):<span className="chips-label">아직 참여자가 없습니다</span>}</div>
      <div className="member-picker">
        <select value={pick} onChange={e=>setPick(e.target.value)}>
          <option value="">부원 선택...</option>
          {roster.filter(r=>!item.activity_members?.some(m=>m.student_id===r.student_id)).map(r=><option key={r.student_id} value={r.student_id}>{r.name}{r.cohort?` (${r.cohort})`:''}</option>)}
        </select>
        <button type="button" className="button secondary" onClick={()=>addMember(item)}>추가</button>
      </div>
    </div>}
  </div>)}</AdminList></>}

function NewsletterAdmin({items,refresh,setNotice}){
  const empty={title:'',description:'',published_at:''};
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);
  const [file,setFile]=useState(null);
  const [saving,setSaving]=useState(false);
  const startEdit=item=>{setEditing(item);setFile(null);setForm({title:item.title,description:item.description,published_at:item.published_at});};
  const cancelEdit=()=>{setEditing(null);setForm(empty);setFile(null)};
  const submit=async e=>{
    e.preventDefault();
    if(!editing&&!file)return;
    setSaving(true);
    let file_path=editing?editing.file_path:'';
    if(file){
      const safeName=`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;
      const {error:uploadError}=await supabase.storage.from('newsletters').upload(safeName,file,{contentType:'application/pdf'});
      if(uploadError){setNotice(uploadError.message);setSaving(false);return}
      if(editing?.file_path)await supabase.storage.from('newsletters').remove([editing.file_path]);
      file_path=safeName;
    }
    const payload={...form,file_path};
    const {error}=editing?await supabase.from('newsletters').update(payload).eq('id',editing.id):await supabase.from('newsletters').insert(payload);
    setSaving(false);
    setNotice(error?error.message:editing?'뉴스레터가 수정되었습니다.':'뉴스레터가 등록되었습니다.');
    if(!error){cancelEdit();refresh();}
  };
  const remove=async item=>{if(!confirm(`'${item.title}'을 삭제할까요?`))return;await supabase.storage.from('newsletters').remove([item.file_path]);const {error}=await supabase.from('newsletters').delete().eq('id',item.id);setNotice(error?error.message:'뉴스레터가 삭제되었습니다.');if(editing?.id===item.id)cancelEdit();refresh();};
  return <><SectionHead eyebrow="NEWSLETTER" title={editing?`뉴스레터 수정 — ${editing.title}`:'뉴스레터 관리'} text="PDF를 업로드하면 게시판에 자동으로 공개됩니다."/><form className="admin-form" onSubmit={submit}><label>제목<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="2026년 6월 뉴스레터"/></label><label>발행일<input required type="date" value={form.published_at} onChange={e=>setForm({...form,published_at:e.target.value})}/></label><label className="wide">설명<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="뉴스레터 소개"/></label><label className="wide upload-label"><Upload/>PDF 파일<input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0]||null)}/><span>{file?.name||(editing?'기존 파일 유지 (새 파일 선택 시 교체)':'파일을 선택해주세요')}</span></label><div className="form-actions"><Button>{saving?'저장 중...':editing?'수정 저장':'뉴스레터 등록'}</Button>{editing&&<button type="button" className="button secondary" onClick={cancelEdit}>취소</button>}</div></form><AdminList>{items.map(item=><div className="admin-list-row edit-grid-row" key={item.id}><FileText/><div><b>{item.title}</b><span>{item.published_at}</span></div><a href={item.file_url} target="_blank" rel="noreferrer"><ExternalLink/></a><button onClick={()=>startEdit(item)} title="수정" aria-label="수정"><Pencil/></button><button onClick={()=>remove(item)}><Trash2/></button></div>)}</AdminList></>}

function EventAdmin({items,refresh,setNotice}){
  const empty={title:'',event_type:'프로젝트',event_date:new Date().toISOString().slice(0,10),end_date:new Date().toISOString().slice(0,10),start_time:'14:00',place:'',visibility:'public'};
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);
  const startEdit=item=>{setEditing(item);setForm({title:item.title,event_type:item.event_type,event_date:item.event_date,end_date:item.end_date||item.event_date,start_time:item.start_time?.slice(0,5)||'14:00',place:item.place,visibility:item.visibility});};
  const cancelEdit=()=>{setEditing(null);setForm(empty)};
  const submit=async e=>{
    e.preventDefault();
    if(form.end_date<form.event_date){setNotice('종료일은 시작일보다 빠를 수 없습니다.');return}
    const {error}=editing?await supabase.from('calendar_events').update(form).eq('id',editing.id):await supabase.from('calendar_events').insert(form);
    setNotice(error?error.message:editing?'일정이 수정되었습니다.':'일정이 등록되었습니다.');
    if(!error){cancelEdit();refresh();}
  };
  const changeStartDate=value=>setForm({...form,event_date:value,end_date:form.end_date<value?value:form.end_date});
  const remove=async item=>{if(!confirm(`'${item.title}' 일정을 삭제할까요?`))return;const {error}=await supabase.from('calendar_events').delete().eq('id',item.id);setNotice(error?error.message:'일정이 삭제되었습니다.');if(editing?.id===item.id)cancelEdit();refresh();};
  return <><SectionHead eyebrow="CALENDAR" title={editing?`일정 수정 — ${editing.title}`:'일정 관리'} text="시작일과 종료일 사이의 모든 날짜에 프로그램이 표시됩니다."/><form className="admin-form" onSubmit={submit}><label>일정명<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>활동 종류<select value={form.event_type} onChange={e=>setForm({...form,event_type:e.target.value})}>{['프로젝트','스터디','세미나','행사'].map(x=><option key={x}>{x}</option>)}</select></label><label>시작일<input required type="date" value={form.event_date} onChange={e=>changeStartDate(e.target.value)}/></label><label>종료일<input required type="date" min={form.event_date} value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></label><label>시작 시간<input required type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})}/></label><label>장소<input value={form.place} onChange={e=>setForm({...form,place:e.target.value})}/></label><label>공개 대상<select value={form.visibility} onChange={e=>setForm({...form,visibility:e.target.value})}><option value="public">전체 공개</option><option value="member">회원 전용</option></select></label><div className="form-actions"><Button>{editing?'수정 저장':'일정 등록'}</Button>{editing&&<button type="button" className="button secondary" onClick={cancelEdit}>취소</button>}</div></form><AdminList>{items.map(item=><div className="admin-list-row edit-grid-row" key={item.id}><div className={`mini-dot ${eventTone(item.event_type)}`}/><div><b>{item.title}</b><span>{item.event_date}{item.end_date&&item.end_date!==item.event_date?` — ${item.end_date}`:''} · {item.start_time?.slice(0,5)} · {item.place}</span></div><Badge tone={eventTone(item.event_type)}>{item.event_type}</Badge><button onClick={()=>startEdit(item)} title="수정" aria-label="수정"><Pencil/></button><button onClick={()=>remove(item)}><Trash2/></button></div>)}</AdminList></>}

function NoticeAdmin({items,refresh,setNotice}){
  const empty={title:'',content:'',author_name:'운영진',published_at:new Date().toISOString().slice(0,10),is_pinned:false};
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);
  const startEdit=item=>{setEditing(item);setForm({title:item.title,content:item.content,author_name:item.author_name,published_at:item.published_at,is_pinned:item.is_pinned});};
  const cancelEdit=()=>{setEditing(null);setForm(empty)};
  const submit=async e=>{
    e.preventDefault();
    const {error}=editing?await supabase.from('notices').update(form).eq('id',editing.id):await supabase.from('notices').insert(form);
    setNotice(error?error.message:editing?'공지사항이 수정되었습니다.':'공지사항이 등록되었습니다.');
    if(!error){cancelEdit();refresh();}
  };
  const remove=async item=>{if(!confirm(`'${item.title}' 공지를 삭제할까요?`))return;const {error}=await supabase.from('notices').delete().eq('id',item.id);setNotice(error?error.message:'공지사항이 삭제되었습니다.');if(editing?.id===item.id)cancelEdit();refresh();};
  const togglePin=async item=>{const {error}=await supabase.from('notices').update({is_pinned:!item.is_pinned}).eq('id',item.id);setNotice(error?error.message:item.is_pinned?'상단 고정이 해제되었습니다.':'공지가 상단에 고정되었습니다.');refresh();};
  return <><SectionHead eyebrow="NOTICE" title={editing?`공지 수정 — ${editing.title}`:'공지사항 관리'} text="등록한 글은 게시판 공지사항에 바로 공개됩니다. 핀 아이콘으로 상단 고정을 켜고 끌 수 있습니다."/><form className="admin-form" onSubmit={submit}><label>제목<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>작성자 표시<input required value={form.author_name} onChange={e=>setForm({...form,author_name:e.target.value})}/></label><label>게시일<input required type="date" value={form.published_at} onChange={e=>setForm({...form,published_at:e.target.value})}/></label><label className="check-label"><input type="checkbox" checked={form.is_pinned} onChange={e=>setForm({...form,is_pinned:e.target.checked})}/> 필독 공지로 표시</label><label className="wide">내용<textarea required rows="7" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></label><div className="form-actions"><Button>{editing?'수정 저장':'공지 등록'}</Button>{editing&&<button type="button" className="button secondary" onClick={cancelEdit}>취소</button>}</div></form><AdminList>{items.map(item=><div className="admin-list-row notice-grid-row" key={item.id}><Bell/><div><b>{item.title}</b><span>{item.published_at} · {item.author_name}</span></div>{item.is_pinned?<Badge>필독</Badge>:<span/>}<button onClick={()=>togglePin(item)} className={item.is_pinned?'pin-toggle on':'pin-toggle'} title={item.is_pinned?'상단 고정 해제':'상단 고정'} aria-label={item.is_pinned?'상단 고정 해제':'상단 고정'}><Pin/></button><button onClick={()=>startEdit(item)} title="수정" aria-label="수정"><Pencil/></button><button onClick={()=>remove(item)}><Trash2/></button></div>)}</AdminList></>}

function DocumentAdmin({items,refresh,setNotice}){
  const empty={title:'',description:'',category:'동아리 규칙'};
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);
  const [file,setFile]=useState(null);
  const [saving,setSaving]=useState(false);
  const startEdit=item=>{setEditing(item);setFile(null);setForm({title:item.title,description:item.description,category:item.category});};
  const cancelEdit=()=>{setEditing(null);setForm(empty);setFile(null)};
  const submit=async e=>{
    e.preventDefault();
    if(!editing&&!file)return;
    setSaving(true);
    let file_path=editing?editing.file_path:'';
    if(file){
      const safeName=`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`;
      const {error:uploadError}=await supabase.storage.from('documents').upload(safeName,file,{contentType:file.type});
      if(uploadError){setNotice(uploadError.message);setSaving(false);return}
      if(editing?.file_path)await supabase.storage.from('documents').remove([editing.file_path]);
      file_path=safeName;
    }
    const payload={...form,file_path};
    const {error}=editing?await supabase.from('documents').update(payload).eq('id',editing.id):await supabase.from('documents').insert(payload);
    setSaving(false);
    setNotice(error?error.message:editing?'자료가 수정되었습니다.':'자료가 등록되었습니다.');
    if(!error){cancelEdit();refresh();}
  };
  const remove=async item=>{if(!confirm(`'${item.title}' 자료를 삭제할까요?`))return;await supabase.storage.from('documents').remove([item.file_path]);const {error}=await supabase.from('documents').delete().eq('id',item.id);setNotice(error?error.message:'자료가 삭제되었습니다.');if(editing?.id===item.id)cancelEdit();refresh();};
  return <><SectionHead eyebrow="DOCUMENTS" title={editing?`자료 수정 — ${editing.title}`:'자료실 관리'} text="동아리 규칙을 포함한 공식 문서를 업로드합니다."/><form className="admin-form" onSubmit={submit}><label>자료명<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>분류<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['동아리 규칙','공식 문서','활동 양식','브랜드 자료','기타'].map(x=><option key={x}>{x}</option>)}</select></label><label className="wide">설명<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide upload-label"><Upload/>문서 파일<input type="file" onChange={e=>setFile(e.target.files[0]||null)}/><span>{file?.name||(editing?'기존 파일 유지 (새 파일 선택 시 교체)':'파일을 선택해주세요')}</span></label><div className="form-actions"><Button>{saving?'저장 중...':editing?'수정 저장':'자료 등록'}</Button>{editing&&<button type="button" className="button secondary" onClick={cancelEdit}>취소</button>}</div></form><AdminList>{items.map(item=><div className="admin-list-row edit-grid-row" key={item.id}><FileText/><div><b>{item.title}</b><span>{item.category} · {item.description}</span></div><a href={item.file_url} target="_blank" rel="noreferrer"><ExternalLink/></a><button onClick={()=>startEdit(item)} title="수정" aria-label="수정"><Pencil/></button><button onClick={()=>remove(item)}><Trash2/></button></div>)}</AdminList></>}

function SuggestionAdmin({items,refresh,setNotice}){const update=async(item,status)=>{const {error}=await supabase.from('suggestions').update({status}).eq('id',item.id);setNotice(error?error.message:'처리 상태가 변경되었습니다.');refresh()};const remove=async item=>{if(!confirm('이 건의를 삭제할까요?'))return;const {error}=await supabase.from('suggestions').delete().eq('id',item.id);setNotice(error?error.message:'건의가 삭제되었습니다.');refresh()};return <><SectionHead eyebrow="SUGGESTIONS" title="접수된 건의" text="이 내용은 관리자 계정에서만 확인할 수 있습니다."/><div className="suggestion-admin-list">{items.length?items.map(item=><article key={item.id}><div className="suggestion-head"><Badge tone={item.status==='완료'?'mint':'blue'}>{item.status}</Badge><b>{item.suggestion_type}</b><time>{new Date(item.created_at).toLocaleString('ko-KR')}</time></div><p>{item.content}</p><div className="suggestion-foot"><span>{`${item.profiles?.name||'회원'} · ${item.profiles?.email||''}`}{item.is_anonymous?' (익명 접수)':''}</span><select value={item.status} onChange={e=>update(item,e.target.value)}><option>접수</option><option>검토 중</option><option>완료</option></select><button onClick={()=>remove(item)}><Trash2/></button></div></article>):<div className="board-empty"><MessageSquareText/><p>접수된 건의가 없습니다.</p></div>}</div></>}

function MemberAdmin({items,currentId,refresh,setNotice}){const change=async(item,role)=>{if(item.id===currentId&&role==='member'){setNotice('현재 로그인한 관리자의 권한은 직접 해제할 수 없습니다.');return}const {error}=await supabase.from('profiles').update({role}).eq('id',item.id);setNotice(error?error.message:'회원 권한이 변경되었습니다.');refresh();};return <><SectionHead eyebrow="MEMBERS" title="회원 권한 관리" text="가입한 회원에게 관리자 권한을 부여하거나 해제합니다."/><AdminList>{items.map(item=><div className="admin-list-row member-admin-row" key={item.id}><span className="avatar-mini">{item.name?.[0]||item.email[0].toUpperCase()}</span><div><b>{item.name||'이름 미입력'}</b><span>{item.email}</span></div><select value={item.role} onChange={e=>change(item,e.target.value)} disabled={item.id===currentId}><option value="member">일반 회원</option><option value="admin">관리자</option></select></div>)}</AdminList></>}
