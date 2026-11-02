import React, { useState } from 'react';
import { Archive, Check, ChevronDown, CircleX, Copy, Flag, Inbox, Pencil, Phone, Plus, RotateCcw, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { supabase } from '../supabase.js';
import { AdminList, Badge, Button, SectionHead } from '../components/ui.jsx';
import { COFFEE_STEPS_ALL, COFFEE_TONE, CoffeeTrack, hostLabel, isClosed } from '../components/coffeeChat.jsx';

const FAIL_REASONS = ['상대방 일정이 맞지 않았어요', '상대방이 어렵다고 답했어요', '맞는 상대를 찾지 못했어요', '신청자 사정으로 진행하지 않아요'];
const TODO_ORDER = { '모집 완료': 0, '연결 중': 1, '일정 확정': 2 };
const lines = text => text.split('\n').map(x => x.trim()).filter(Boolean);
const hostPublic = host => ({ host_id: host.id, host_name: host.name, host_kind: host.kind, path_from: host.path_from, path_to: host.path_to });

const messages = {
  host: (chat, apps, host) => {
    const questions = apps.filter(a => a.question).map(a => `- ${a.question}`).join('\n');
    return `안녕하세요, ${host ? `${host.name} ${host.kind}` : '선배'}님. SHIFT 운영진입니다.\n'${chat.title}' 커피챗에 부원 ${apps.length}명이 모였습니다.\n약 40분, 대면 또는 온라인으로 진행하려고 합니다. 가능하신 일정을 2~3개 알려주실 수 있을까요?${questions ? `\n\n미리 받은 질문입니다.\n${questions}` : ''}`;
  },
  members: chat => `안녕하세요, SHIFT 운영진입니다.\n'${chat.title}' 커피챗 인원이 모여 연결을 시작합니다.\n상대방 일정이 확인되는 대로 다시 연락드리겠습니다.`,
  schedule: (chat, place) => `'${chat.title}' 커피챗 일정이 확정되었습니다.\n일시: ${chat.scheduled_label}\n장소: ${place || '추후 안내'}\n사정이 생기면 미리 알려주세요.`,
  roster: apps => apps.map(a => `${a.member_name} (${a.student_id}) ${a.email}${a.question ? ` / ${a.question}` : ''}`).join('\n')
};

function CopyButton({ text, label }) {
  const [state, setState] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setState('복사됨'); }
    catch { setState('복사 실패'); }
    setTimeout(() => setState(''), 1500);
  };
  return <button type="button" className="cc-copy" onClick={copy}>{state === '복사됨' ? <Check/> : <Copy/>}{state || label}</button>;
}

function WorkCard({ chat, apps, host, privateInfo, hosts, hasNextRound, startOpen, onEdit, refresh, setNotice }) {
  const [open, setOpen] = useState(startOpen);
  const [when, setWhen] = useState('');
  const [place, setPlace] = useState('');
  const [review, setReview] = useState('');
  const [reviewBy, setReviewBy] = useState('');
  const [failing, setFailing] = useState(false);
  const [failReason, setFailReason] = useState(FAIL_REASONS[0]);
  const [busy, setBusy] = useState(false);

  const update = async (patch, done) => {
    setBusy(true);
    const { error } = await supabase.from('coffee_chats').update(patch).eq('id', chat.id);
    setBusy(false);
    setNotice(error ? error.message : done);
    if (!error) await refresh();
    return !error;
  };
  const savePrivate = async patch => {
    const { error } = await supabase.from('coffee_chat_private').upsert({ chat_id: chat.id, ...patch });
    if (error) setNotice(error.message);
    return !error;
  };
  const assignHost = async id => {
    const picked = hosts.find(h => String(h.id) === id);
    if (picked) await update(hostPublic(picked), '상대방을 지정했어요. 공개 페이지에 이름이 표시됩니다.');
  };
  const confirmSchedule = async () => {
    if (!when.trim()) { setNotice('일시를 입력해주세요.'); return; }
    if (place.trim() && !(await savePrivate({ place: place.trim() }))) return;
    await update({ scheduled_label: when.trim(), status: '일정 확정' }, '일정을 확정했어요. 안내 문구를 복사해 참여자에게 보내주세요.');
  };
  const finish = () => update({ review: review.trim(), review_by: reviewBy.trim(), status: '완료' }, '완료 처리했어요. 다음 회차를 열 수 있습니다.');
  const fail = async () => {
    if (!(await savePrivate({ fail_reason: failReason }))) return;
    if (await update({ status: '불발' }, '불발 처리했어요. 신청자 마이페이지에 표시됩니다.')) setFailing(false);
  };
  const nextRound = async () => {
    const { error } = await supabase.from('coffee_chats').insert({ title: chat.title, host_id: chat.host_id, host_name: chat.host_name, host_kind: chat.host_kind, path_from: chat.path_from, path_to: chat.path_to, topics: chat.topics, seek: chat.seek, note: chat.note, good_for: chat.good_for, asks: chat.asks, seats: chat.seats, round: chat.round + 1 });
    setNotice(error ? error.message : `${chat.round + 1}회차를 열었어요. 공개 페이지에 0명부터 표시됩니다.`);
    if (!error) await refresh();
  };
  const removeApplicant = async app => {
    if (!confirm(`${app.member_name} 님의 신청을 삭제할까요?`)) return;
    const { error } = await supabase.from('coffee_chat_applications').delete().eq('id', app.id);
    setNotice(error ? error.message : '신청을 삭제했어요.');
    if (!error) await refresh();
  };
  const removeChat = async () => {
    if (!confirm(`'${chat.title}' 카드를 삭제할까요?${apps.length ? ` 신청자 ${apps.length}명의 기록도 함께 삭제됩니다.` : ''}`)) return;
    const { error } = await supabase.from('coffee_chats').delete().eq('id', chat.id);
    setNotice(error ? error.message : '카드를 삭제했어요.');
    if (!error) await refresh();
  };

  const hostPicker = !chat.host_name && <label>상대방 지정<select value="" onChange={e => assignHost(e.target.value)}><option value="">상대방 풀에서 선택</option>{hosts.map(h => <option value={h.id} key={h.id}>{h.name} {h.kind}{h.path_to ? `, ${h.path_to}` : ''}</option>)}</select></label>;
  const failLink = <button type="button" className="cc-danger" onClick={() => setFailing(true)}>불발 처리</button>;

  const todo = () => {
    if (failing) return <div className="cc-todo"><h4><CircleX/>불발 처리</h4><p>신청자 마이페이지에 불발로 표시됩니다. 사유는 운영진만 봅니다.</p>
      <label>사유<select value={failReason} onChange={e => setFailReason(e.target.value)}>{FAIL_REASONS.map(r => <option key={r}>{r}</option>)}</select></label>
      <button type="button" className="button" onClick={fail} disabled={busy}>불발로 처리</button><button type="button" className="cc-cancel" onClick={() => setFailing(false)} style={{ justifySelf: 'start' }}>돌아가기</button></div>;
    if (chat.status === '모집 중') return <div className="cc-todo"><h4><Flag/>모집 중</h4><p>{chat.seats}명이 차면 자동으로 모집 완료로 바뀌고 운영진에게 메일이 갑니다. 인원이 덜 모여도 먼저 시작할 수 있어요.</p>{hostPicker}
      <button type="button" className="button secondary" disabled={busy || apps.length === 0 || !chat.host_name} onClick={() => update({ status: '연결 중' }, '연결을 시작했어요.')}>지금 연결 시작</button></div>;
    if (chat.status === '모집 완료') return <div className="cc-todo"><h4><Flag/>다음 할 일</h4><p>{chat.host_name ? '상대방에게 연락해 가능 여부와 일정을 물어보세요. 연락을 보냈다면 연결 시작을 눌러주세요.' : '먼저 상대방을 지정해주세요. 지정하면 연결을 시작할 수 있어요.'}</p>{hostPicker}
      <div className="cc-todo-copy"><CopyButton text={messages.host(chat, apps, host)} label="상대방 문구 복사"/><CopyButton text={messages.members(chat)} label="참여자 문구 복사"/></div>
      <button type="button" className="button" disabled={busy || !chat.host_name} onClick={() => update({ status: '연결 중' }, '연결을 시작했어요. 공개 페이지와 신청자 화면에 반영됩니다.')}>연결 시작</button>{failLink}</div>;
    if (chat.status === '연결 중') return <div className="cc-todo"><h4><Flag/>다음 할 일</h4><p>일정이 정해지면 입력해주세요. 일시는 공개 페이지에 표시되고, 장소는 운영진만 봅니다.</p>
      <label>일시<input value={when} onChange={e => setWhen(e.target.value)} placeholder="예: 11월 27일 (금) 18:00"/></label>
      <label><span>장소<small>선택</small></span><input value={place} onChange={e => setPlace(e.target.value)} placeholder="예: 미래관 카페"/></label>
      <button type="button" className="button" onClick={confirmSchedule} disabled={busy}>일정 확정</button>{failLink}</div>;
    if (chat.status === '일정 확정') return <div className="cc-todo"><h4><Flag/>다음 할 일</h4><p>참여자에게 안내를 보내고, 커피챗이 끝나면 완료 처리하세요. 후기 한 줄을 받으면 공개 페이지에 표시됩니다.</p>
      <div className="cc-todo-copy"><CopyButton text={messages.schedule(chat, privateInfo?.place)} label="일정 안내 문구 복사"/></div>
      <label><span>후기 한 줄<small>선택</small></span><textarea rows="2" value={review} onChange={e => setReview(e.target.value)} placeholder="참여자에게 받은 한 줄"/></label>
      <label><span>표기<small>선택</small></span><input value={reviewBy} onChange={e => setReviewBy(e.target.value)} placeholder="예: 25학번 부원"/></label>
      <button type="button" className="button" onClick={finish} disabled={busy}>완료 처리</button>{failLink}</div>;
    return <div className="cc-todo"><h4><Flag/>{chat.status === '완료' ? '끝난 커피챗' : '불발'}</h4><p>{chat.status === '완료' ? '같은 상대나 주제로 다시 열 수 있어요. 신청은 0명부터 시작합니다.' : `사유: ${privateInfo?.fail_reason || '기록 없음'}. 조건을 바꿔 다시 열 수 있어요.`}</p>
      {hasNextRound ? <p>다음 회차가 이미 열려 있어요.</p> : <button type="button" className="button secondary" onClick={nextRound}><RotateCcw size={15}/>다음 회차 열기</button>}</div>;
  };

  return <article className={`cc-wk${chat.status === '모집 완료' ? ' urgent' : ''}${open ? ' open' : ''}`}>
    <button className="cc-wk-head" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span><span className="cc-wk-title"><Badge tone={COFFEE_TONE[chat.status]}>{chat.status}</Badge><b>{chat.title}</b><small>{chat.round}회차</small></span><span className="cc-wk-sub">{hostLabel(chat)}, {chat.applicant_count} / {chat.seats}명{chat.scheduled_label ? `, ${chat.scheduled_label}` : ''}</span></span>
      <ChevronDown/>
    </button>
    {open && <div className="cc-wk-body">
      {chat.status !== '불발' && <CoffeeTrack chat={chat} steps={COFFEE_STEPS_ALL}/>}
      <div className="cc-wk-grid">
        <div>
          <p className="cc-sub-title"><span>신청자 {apps.length}명</span>{apps.length > 0 && <CopyButton text={messages.roster(apps)} label="명단 복사"/>}</p>
          <div className="cc-table">{apps.length ? apps.map(app => <div className="cc-table-row" key={app.id}><b>{app.member_name}</b><small>{app.student_id}, {app.email}</small><button type="button" onClick={() => removeApplicant(app)} aria-label={`${app.member_name} 신청 삭제`}><X/></button>{app.question && <em>“{app.question}”</em>}</div>) : <p className="cc-table-empty">아직 신청자가 없어요.</p>}</div>
          {host
            ? <div className="cc-host-box"><b><Phone/>{host.name} {host.kind}, {host.contact || '연락처 미입력'}</b><small>{host.consent_note}{host.memo ? ` ${host.memo}` : ''}</small></div>
            : <div className="cc-host-box"><b><Search/>{chat.host_name ? `${hostLabel(chat)} (상대방 풀에서 삭제됨)` : '상대가 아직 정해지지 않았어요'}</b>{chat.seek && <small>찾는 상대: {chat.seek}</small>}</div>}
          <div className="cc-wk-actions"><button type="button" className="cc-copy" onClick={() => onEdit(chat)}><Pencil/>카드 수정</button><button type="button" className="cc-danger" onClick={removeChat}>카드 삭제</button></div>
        </div>
        {todo()}
      </div>
    </div>}
  </article>;
}

const emptyChat = { kind: 'person', title: '', hostId: '', seats: 3, topics: '', seek: '', note: '', goodFor: '', asks: '' };

function ChatForm({ form, setForm, editing, hosts, onSubmit, onCancel, saving, goHosts }) {
  const isPerson = form.kind === 'person';
  return <form className="admin-form" onSubmit={onSubmit}>
    <div className="cc-kind"><label><input type="radio" checked={isPerson} onChange={() => setForm({ ...form, kind: 'person' })}/>사람 카드</label><label><input type="radio" checked={!isPerson} onChange={() => setForm({ ...form, kind: 'topic' })}/>주제 카드</label></div>
    <label className="wide">제목<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={isPerson ? '예: 대학원 진학, 어떻게 준비했나' : '예: 연구실 고르는 법'}/></label>
    {isPerson && <label>상대방<select required={!editing?.host_name} value={form.hostId} onChange={e => setForm({ ...form, hostId: e.target.value })}><option value="">{editing?.host_name ? `${hostLabel(editing)} (현재 표기 유지)` : '상대방 풀에서 선택'}</option>{hosts.map(h => <option value={h.id} key={h.id}>{h.name} {h.kind}</option>)}</select>{hosts.length === 0 && <span className="cc-field-help">등록된 상대방이 없어요. <button type="button" className="cc-copy" onClick={goHosts}>상대방 풀에 추가</button></span>}</label>}
    <label>자리 수<select value={form.seats} disabled={Boolean(editing?.applicant_count)} onChange={e => setForm({ ...form, seats: Number(e.target.value) })}><option value={3}>3명</option><option value={2}>2명</option></select></label>
    <label className="wide">주제 태그 (쉼표로 구분)<input value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })} placeholder="예: 대학원 진학, 연구실 선택"/></label>
    {!isPerson && <label className="wide">찾는 상대<input value={form.seek} onChange={e => setForm({ ...form, seek: e.target.value })} placeholder="예: 학부 연구생 경험자, 대학원 재학생"/></label>}
    {isPerson && <label className="wide">상대의 한마디 (선택)<input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="비우면 표시되지 않습니다"/></label>}
    <label>이런 분께 좋아요 (한 줄에 하나)<textarea rows="3" value={form.goodFor} onChange={e => setForm({ ...form, goodFor: e.target.value })}/></label>
    <label>물어볼 수 있는 질문 (한 줄에 하나)<textarea rows="3" value={form.asks} onChange={e => setForm({ ...form, asks: e.target.value })}/></label>
    <div className="form-actions"><Button>{saving ? '저장 중...' : editing ? '수정 저장' : '커피챗 열기'}</Button><button type="button" className="button secondary" onClick={onCancel}>취소</button></div>
  </form>;
}

const emptyHost = { name: '', kind: '선배', path_from: '', path_to: '', contact: '', consent_note: '', memo: '' };

function HostPool({ hosts, chats, refresh, setNotice }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyHost);
  const [saving, setSaving] = useState(false);
  const showForm = adding || editing;
  const close = () => { setAdding(false); setEditing(null); setForm(emptyHost); };
  const startEdit = host => { setAdding(false); setEditing(host); setForm({ name: host.name, kind: host.kind, path_from: host.path_from, path_to: host.path_to, contact: host.contact, consent_note: host.consent_note, memo: host.memo }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    let { error } = editing ? await supabase.from('coffee_chat_hosts').update(form).eq('id', editing.id) : await supabase.from('coffee_chat_hosts').insert(form);
    if (!error && editing) {
      // 진행 중인 카드의 공개 표기도 함께 맞춘다. 끝난 카드는 당시 기록으로 둔다.
      ({ error } = await supabase.from('coffee_chats').update(hostPublic({ ...form, id: editing.id })).eq('host_id', editing.id).not('status', 'in', '("완료","불발")'));
    }
    setSaving(false);
    setNotice(error ? error.message : editing ? '상대방 정보를 수정했어요.' : '상대방을 추가했어요.');
    if (!error) { close(); await refresh(); }
  };
  const remove = async host => {
    if (!confirm(`${host.name} ${host.kind} 님을 상대방 풀에서 삭제할까요? 연락처와 동의 기록이 지워집니다. 카드의 공개 표기는 남습니다.`)) return;
    const { error } = await supabase.from('coffee_chat_hosts').delete().eq('id', host.id);
    setNotice(error ? error.message : '상대방을 삭제했어요.');
    if (!error) await refresh();
  };
  return <>
    <div className="cc-privacy"><ShieldCheck/><span>이 목록은 운영진만 볼 수 있습니다. 공개 페이지 등록 전 본인 동의를 받고 동의 내용을 적어주세요. 이름은 동의받은 표기대로 입력하면 공개 페이지에 그대로 나옵니다.</span></div>
    {showForm
      ? <form className="admin-form" onSubmit={submit}>
        <label>이름 표기<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="예: 김OO"/></label>
        <label>구분<select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}><option>선배</option><option>대학원생</option><option>졸업생</option></select></label>
        <label>경로 시작<input value={form.path_from} onChange={e => setForm({ ...form, path_from: e.target.value })} placeholder="예: 디지털헬스케어"/></label>
        <label>경로 끝<input value={form.path_to} onChange={e => setForm({ ...form, path_to: e.target.value })} placeholder="예: 의료 AI 대학원"/></label>
        <label>연락처<input required value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="운영진만 볼 수 있어요"/></label>
        <label>동의 내용<input required value={form.consent_note} onChange={e => setForm({ ...form, consent_note: e.target.value })} placeholder="예: 11/2 카톡으로 동의, 이름 일부 공개"/></label>
        <label className="wide">메모 (선택)<input value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} placeholder="예: 평일 저녁 선호"/></label>
        <div className="form-actions"><Button>{saving ? '저장 중...' : editing ? '수정 저장' : '상대방 추가'}</Button><button type="button" className="button secondary" onClick={close}>취소</button></div>
      </form>
      : <div style={{ marginBottom: '16px' }}><Button onClick={() => setAdding(true)}><Plus size={16}/>상대방 추가</Button></div>}
    <AdminList>{hosts.map(host => <div className="admin-list-row edit-grid-row" key={host.id}><Users/><div><b>{host.name} {host.kind}{host.path_to ? `, ${[host.path_from, host.path_to].filter(Boolean).join(' → ')}` : ''}</b><span>{host.contact}. {host.consent_note}{host.memo ? ` ${host.memo}` : ''}</span></div><Badge tone="gray">카드 {chats.filter(c => c.host_id === host.id).length}개</Badge><button onClick={() => startEdit(host)} title="수정" aria-label="수정"><Pencil/></button><button onClick={() => remove(host)} aria-label="삭제"><Trash2/></button></div>)}</AdminList>
  </>;
}

export default function CoffeeChatAdmin({ chats = [], applications = [], hosts = [], privates = [], refresh, setNotice }) {
  const [view, setView] = useState('flow');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyChat);
  const [saving, setSaving] = useState(false);
  const showForm = adding || editing;

  const closeForm = () => { setAdding(false); setEditing(null); setForm(emptyChat); };
  const startEdit = chat => {
    setAdding(false);
    setEditing(chat);
    setForm({ kind: chat.host_name ? 'person' : 'topic', title: chat.title, hostId: chat.host_id ? String(chat.host_id) : '', seats: chat.seats, topics: chat.topics.join(', '), seek: chat.seek, note: chat.note, goodFor: chat.good_for.join('\n'), asks: chat.asks.join('\n') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const submit = async e => {
    e.preventDefault();
    const host = form.kind === 'person' ? hosts.find(h => String(h.id) === form.hostId) : null;
    // 수정 중인 카드의 상대가 풀에서 삭제됐다면 기존 공개 표기를 유지한다.
    const hostFields = host ? hostPublic(host) : form.kind === 'person' && editing?.host_name ? {} : { host_id: null, host_name: '', host_kind: '', path_from: '', path_to: '' };
    const payload = { title: form.title.trim(), seats: form.seats, topics: form.topics.split(',').map(x => x.trim()).filter(Boolean), seek: form.kind === 'topic' ? form.seek.trim() : '', note: form.kind === 'person' ? form.note.trim() : '', good_for: lines(form.goodFor), asks: lines(form.asks), ...hostFields };
    setSaving(true);
    const { error } = editing ? await supabase.from('coffee_chats').update(payload).eq('id', editing.id) : await supabase.from('coffee_chats').insert(payload);
    setSaving(false);
    setNotice(error ? error.message : editing ? '카드를 수정했어요.' : '커피챗을 열었어요. 공개 페이지에 바로 표시됩니다.');
    if (!error) { closeForm(); await refresh(); }
  };

  const appsOf = chat => applications.filter(a => a.chat_id === chat.id);
  const hostOf = chat => hosts.find(h => h.id === chat.host_id);
  const privateOf = chat => privates.find(p => p.chat_id === chat.id);
  const hasNextRound = chat => chats.some(c => c.id !== chat.id && c.title === chat.title && c.round > chat.round);
  const toDo = chats.filter(c => c.status in TODO_ORDER).sort((a, b) => TODO_ORDER[a.status] - TODO_ORDER[b.status]);
  const recruiting = chats.filter(c => c.status === '모집 중').sort((a, b) => (a.seats - a.applicant_count) - (b.seats - b.applicant_count));
  const ended = chats.filter(isClosed);
  const waiting = chats.filter(c => c.status === '모집 완료').length;
  const card = (chat, startOpen = false) => <WorkCard chat={chat} apps={appsOf(chat)} host={hostOf(chat)} privateInfo={privateOf(chat)} hosts={hosts} hasNextRound={hasNextRound(chat)} startOpen={startOpen} onEdit={startEdit} refresh={refresh} setNotice={setNotice} key={chat.id}/>;

  return <>
    <SectionHead eyebrow="COFFEE CHAT" title={editing ? `카드 수정 — ${editing.title}` : '커피챗 운영'} text="상시 커피챗 카드와 상대방을 관리합니다." action={view === 'flow' && !showForm ? <Button onClick={() => setAdding(true)}><Plus size={16}/>새 커피챗</Button> : null}/>
    <div className="filter-row"><button className={view === 'flow' ? 'active' : ''} onClick={() => setView('flow')}>진행 관리{waiting > 0 ? ` ${waiting}` : ''}</button><button className={view === 'hosts' ? 'active' : ''} onClick={() => { setView('hosts'); closeForm(); }}>상대방 풀 {hosts.length}</button></div>
    {view === 'hosts'
      ? <HostPool hosts={hosts} chats={chats} refresh={refresh} setNotice={setNotice}/>
      : <>
        {showForm && <ChatForm form={form} setForm={setForm} editing={editing} hosts={hosts} onSubmit={submit} onCancel={closeForm} saving={saving} goHosts={() => { setView('hosts'); closeForm(); }}/>}
        <p className="cc-admin-group" style={{ marginTop: 0 }}><Inbox/>처리 필요 {toDo.length}건</p>
        {toDo.length ? toDo.map((chat, i) => card(chat, i === 0)) : <div className="board-empty" style={{ minHeight: '110px' }}><p>지금 처리할 일이 없어요.</p></div>}
        <p className="cc-admin-group"><Users/>모집 중 {recruiting.length}건</p>
        {recruiting.length ? recruiting.map(chat => card(chat)) : <div className="board-empty" style={{ minHeight: '110px' }}><p>열린 커피챗이 없어요. 새 커피챗을 열어주세요.</p></div>}
        {ended.length > 0 && <><p className="cc-admin-group"><Archive/>끝난 커피챗 {ended.length}건</p>{ended.map(chat => card(chat))}</>}
      </>}
  </>;
}
