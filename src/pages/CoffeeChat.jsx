import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronDown, ChevronRight, CircleCheck, Clock3, Coffee, EyeOff, Lightbulb, Lock, MapPin, MessageCircle, MousePointerClick, Search, TriangleAlert, Users, X } from 'lucide-react';
import { supabase } from '../supabase.js';
import { CONTACT_EMAIL } from '../data.js';
import { cancelApplication, coffeeErrorText, CoffeeTrack, hostLabel, isClosed, MyCoffeeRow, Seats, seatsLeft } from '../components/coffeeChat.jsx';

const FAQS = [
  ['신청하면 꼭 참여해야 하나요?', '연결이 시작되기 전까지는 이 페이지에서 바로 취소할 수 있어요. 연결이 시작된 뒤에는 운영진에게 카톡으로 알려주세요.'],
  ['제 이름이 공개되나요?', '아니요. 화면에는 인원수만 보여요. 이름은 운영진이 관리하고, 연결이 시작되면 커피챗 상대에게만 전달됩니다.'],
  ['뭘 물어봐야 할지 모르겠어요.', '카드를 펼치면 질문 예시가 있어요. 2~3명이 함께라서 듣기만 해도 괜찮습니다.'],
  ['여러 개 신청해도 되나요?', '네. 일정이 겹치면 운영진과 조율합니다.'],
  ['커피값은 어떻게 하나요?', '각자 계산하는 것이 원칙이에요. 상대방이 사주고 싶다고 하시면 감사히 받아도 괜찮습니다.']
];

const avatarClass = kind => kind === '졸업생' ? 'alum' : kind === '선배' ? 'senior' : '';
const Tags = ({ chat }) => chat.topics.length > 0 && <div className="cc-tags">{chat.topics.map(topic => <span key={topic}>#{topic}</span>)}</div>;
const Count = ({ chat }) => <strong className="cc-count">{chat.applicant_count}<small> / {chat.seats}명</small></strong>;

function Hero({ soon, others, goTo }) {
  return <section className="cc-hero"><div className="container cc-hero-in">
    <div><span className="cc-eyebrow">COFFEE CHAT</span><h1>듣고 싶은 이야기가 있다면,<br/><em>같이 들어요.</em></h1><p>사람이나 주제를 골라 신청하세요. 2~3명이 모이면 연락과 일정 조율은 SHIFT가 맡습니다.</p></div>
    <div className="cc-art">
      <span className="cc-ring big"/><span className="cc-ring small"/>
      {soon
        ? <button className="cc-live" onClick={() => goTo(soon.id)}><span className="cc-live-cup"><Coffee/></span><span className="cc-live-label">{soon.applicant_count > 0 ? '곧 모여요' : '새로 열렸어요'}</span><strong>{soon.title}</strong><small>{hostLabel(soon)}</small><span className="cc-live-seats"><Seats chat={soon}/><b>{seatsLeft(soon)}자리 남음</b></span></button>
        : <div className="cc-cup"><Coffee/></div>}
      {others.map((chat, i) => <button className={`cc-chip p${i}`} onClick={() => goTo(chat.id)} key={chat.id}>{chat.topics[0] || chat.title}</button>)}
    </div>
  </div></section>;
}

function How() {
  return <div className="container"><div className="cc-how">
    <div><span className="cc-how-icon"><MousePointerClick/></span><div><b>고르기</b><small>듣고 싶은 사람이나 주제에 신청해요</small></div></div>
    <div><span className="cc-how-arrow"><ChevronRight/></span><span className="cc-how-icon"><Users/></span><div><b>모이기</b><small>같은 관심사의 부원이 2~3명 모이면</small></div></div>
    <div><span className="cc-how-arrow"><ChevronRight/></span><span className="cc-how-icon"><Coffee/></span><div><b>만나기</b><small>연락과 일정 조율은 SHIFT가 맡아요</small></div></div>
  </div></div>;
}

function Detail({ chat }) {
  return <div className="cc-detail"><div className="cc-detail-clip"><div className="cc-detail-in">
    <div>
      {chat.note && <blockquote className="cc-quote">“{chat.note}”<cite>{hostLabel(chat)}</cite></blockquote>}
      <div className="cc-facts"><span><Clock3/>약 40분</span><span><MapPin/>대면 또는 온라인</span><span><Users/>2~3명이 함께</span></div>
    </div>
    {chat.good_for.length > 0 && <div><h4>이런 분께 좋아요</h4><ul>{chat.good_for.map(x => <li key={x}>{x}</li>)}</ul></div>}
    {chat.asks.length > 0 && <div><h4>이렇게 물어볼 수 있어요</h4><ul>{chat.asks.map(x => <li key={x}>{x}</li>)}</ul></div>}
  </div></div></div>;
}

function ApplyModal({ chat, onClose, onDone }) {
  const [question, setQuestion] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const left = seatsLeft(chat) - 1;
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: applyError } = await supabase.from('coffee_chat_applications').insert({ chat_id: chat.id, question: question.trim() });
    setSaving(false);
    if (applyError) { setError(coffeeErrorText(applyError, '신청을 저장하지 못했어요. 네트워크를 확인한 뒤 다시 시도해주세요.')); return; }
    onDone(chat, left);
  };
  return <div className="cc-modal-back" onClick={onClose}><form className="cc-modal" role="dialog" aria-modal="true" aria-label={chat.title} onClick={e => e.stopPropagation()} onSubmit={submit}>
    <button type="button" className="cc-modal-x" onClick={onClose} aria-label="닫기"><X size={19}/></button>
    <span className="cc-eyebrow">참여 신청</span>
    <h2>{chat.title}</h2>
    <div className="cc-modal-seat"><Seats chat={chat} mine extra={1}/><span>이 자리에 앉게 돼요.<br/>{left > 0 ? `${left}자리 더 차면 연결이 시작돼요.` : '내가 마지막 자리예요. 바로 연결을 시작해요.'}</span></div>
    <label><span>미리 묻고 싶은 것<small>선택</small></span><textarea autoFocus rows="3" value={question} onChange={e => setQuestion(e.target.value)} placeholder="예: 학부 연구생 경험이 꼭 필요한가요?"/></label>
    <ul className="cc-modal-notes"><li><EyeOff/>신청자 이름은 화면에 공개되지 않아요.</li><li><MessageCircle/>인원이 모이면 운영진이 카톡으로 연락드려요.</li></ul>
    {error && <div className="cc-error" role="alert"><TriangleAlert/><span>{error}</span></div>}
    <button className="cc-btn wide" disabled={saving}>{saving ? '신청 중...' : '신청하기'}</button>
  </form></div>;
}

export default function CoffeeChat({ chats = [], myApps = [], user, setPage, refresh }) {
  const [openId, setOpenId] = useState(null);
  const [applying, setApplying] = useState(null);
  const [toast, setToast] = useState('');
  const [poppedId, setPoppedId] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.body.classList.add('theme-latte');
    return () => document.body.classList.remove('theme-latte');
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = text => { setToast(text); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3400); };
  const appOf = chat => myApps.find(app => app.chat_id === chat.id);
  const isMine = chat => Boolean(user && appOf(chat));

  const people = chats.filter(c => c.status === '모집 중' && c.host_name).sort((a, b) => seatsLeft(a) - seatsLeft(b));
  const topics = chats.filter(c => c.status === '모집 중' && !c.host_name);
  const gathered = chats.filter(c => ['모집 완료', '연결 중', '일정 확정'].includes(c.status));
  const finished = chats.filter(c => c.status === '완료');
  const reviews = finished.filter(c => c.review).slice(0, 2);
  const mine = chats.filter(c => isMine(c) && !isClosed(c));
  const soon = people[0];
  const others = [...people, ...topics].filter(c => c.id !== soon?.id).slice(0, 4);

  const goTo = id => {
    const el = document.getElementById(`cc-chat-${id}`);
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
    el.classList.add('cc-flash');
    setTimeout(() => el.classList.remove('cc-flash'), 1700);
  };
  const cancel = async chat => {
    const app = appOf(chat);
    if (!app) return;
    const message = await cancelApplication(app.id);
    if (message) { showToast(message); return; }
    await refresh();
    showToast('신청을 취소했어요.');
  };
  const applied = async (chat, left) => {
    setApplying(null);
    setPoppedId(chat.id);
    await refresh();
    showToast(left > 0 ? `신청 완료. ${left}자리 더 차면 연결이 시작돼요.` : '신청 완료. 인원이 다 모였어요. 운영진이 연결을 시작합니다.');
  };

  const cta = (chat, light) => {
    if (isMine(chat)) return <div className="cc-mine"><span className="cc-applied"><Check/>신청 완료</span><button className="cc-cancel" onClick={() => cancel(chat)}>취소</button></div>;
    if (!user) return <button className={`cc-btn ${light ? 'light' : 'sec'}`} onClick={() => setPage('login')}>로그인 후 신청</button>;
    return <button className={`cc-btn${light ? ' light' : ''}`} onClick={() => setApplying(chat)}>참여 신청</button>;
  };

  const personRow = chat => {
    const left = seatsLeft(chat);
    const open = openId === chat.id;
    const hasDetail = chat.note || chat.good_for.length > 0 || chat.asks.length > 0;
    const path = [chat.path_from, chat.path_to].filter(Boolean);
    return <article className={`cc-row${left === 1 ? ' hot' : ''}${open ? ' open' : ''}`} id={`cc-chat-${chat.id}`} key={chat.id}>
      <div className="cc-row-main">
        <div className={`cc-avatar ${avatarClass(chat.host_kind)}`}>{chat.host_name[0]}</div>
        <div className="cc-row-text">
          <h3>{chat.title}</h3>
          <div className="cc-route"><span className="cc-who"><b>{chat.host_name}</b>{chat.host_kind}</span>{path.length > 0 && <ol className="cc-path">{path.map(p => <li key={p}>{p}</li>)}</ol>}</div>
          <Tags chat={chat}/>
          {hasDetail && <button className="cc-more" onClick={() => setOpenId(open ? null : chat.id)} aria-expanded={open}>{open ? '접기' : '자세히 보기'}<ChevronDown/></button>}
        </div>
        <div className="cc-apply">
          <div className="cc-apply-top"><Seats chat={chat} mine={isMine(chat)} pop={poppedId === chat.id}/><Count chat={chat}/></div>
          <p className="cc-hint">{left === chat.seats ? `${chat.seats}명이 모이면 연결이 시작돼요` : left === 1 ? '1자리 남음, 곧 연결돼요' : `${left}자리 남음`}</p>
          {cta(chat)}
        </div>
      </div>
      {hasDetail && <Detail chat={chat}/>}
    </article>;
  };

  const topicTile = (chat, i) => {
    const left = seatsLeft(chat);
    return <article className={`cc-tile t${i % 2 + 1}${left === 1 ? ' hot' : ''}`} id={`cc-chat-${chat.id}`} key={chat.id}>
      <span className="cc-tile-tag">주제로 모이기</span>
      <h3>{chat.title}</h3>
      {chat.seek && <div className="cc-seek"><Search/><span>이런 분을 찾아볼게요: {chat.seek}</span></div>}
      <Tags chat={chat}/>
      <div className="cc-tile-foot">
        <div><Seats chat={chat} mine={isMine(chat)} pop={poppedId === chat.id}/><Count chat={chat}/><p className="cc-hint">{left === chat.seats ? `${chat.seats}명이 모이면 상대를 찾아요` : left === 1 ? '1자리 남음, 곧 상대를 찾아요' : `${left}자리 남음`}</p></div>
        {cta(chat, true)}
      </div>
    </article>;
  };

  return <div className="cc">
    <Hero soon={soon} others={others} goTo={goTo}/>
    <How/>
    <div className="cc-sec"><div className="container">
      {user && mine.length > 0 && <section className="cc-mine-panel">
        <div className="cc-mine-head"><h3><CircleCheck/>내 커피챗 {mine.length}개</h3><button className="cc-link" onClick={() => setPage('mypage')}>마이페이지 <ArrowRight size={14}/></button></div>
        {mine.map(chat => <MyCoffeeRow chat={chat} onCancel={cancel} key={chat.id}/>)}
      </section>}
      <div className="cc-head"><h2>이야기 나눌 사람</h2><p>신청자 이름은 공개되지 않고, 인원수만 보여요.</p></div>
      {!user && <div className="cc-notice"><Lock/><span>신청은 SHIFT 부원만 할 수 있어요. 목록은 누구나 볼 수 있습니다.</span><button className="cc-link" onClick={() => setPage('recruit')}>모집 안내 <ArrowRight size={14}/></button></div>}
      {people.length > 0
        ? <div className="cc-list">{people.map(personRow)}</div>
        : <div className="cc-empty"><Coffee/><h3>{topics.length ? '아직 정해진 상대가 없어요' : '지금 열린 커피챗이 없어요'}</h3><p>{topics.length ? '아래 주제에 먼저 신청해보세요.' : '새 커피챗이 열리면 이곳에 표시됩니다.'}</p></div>}

      <div className="cc-blk">
        <div className="cc-head"><h2>아직 정해진 상대가 없어도 괜찮아요</h2><p>주제로 먼저 모이면, 맞는 선배는 SHIFT가 찾아드립니다.</p></div>
        <div className={`cc-tiles${topics.length === 1 ? ' one' : topics.length === 0 ? ' none' : ''}`}>
          {topics.map(topicTile)}
          <article className="cc-tile ghost"><span className="cc-ghost-icon"><Lightbulb/></span><div><h3>듣고 싶은 주제가 없나요?</h3><p>주제를 제안하면 운영진이 검토해 새 카드로 열어요.</p></div><button className="cc-link" onClick={() => setPage('board?category=건의함')}>건의함에 제안 <ArrowRight size={14}/></button></article>
        </div>
      </div>

      {gathered.length > 0 && <div className="cc-blk">
        <div className="cc-head"><h2>이미 모인 커피챗</h2></div>
        <div className="cc-gathered">{gathered.map(chat => <div className="cc-gathered-row" id={`cc-chat-${chat.id}`} key={chat.id}>
          <div className={`cc-avatar ${chat.host_name ? avatarClass(chat.host_kind) : 'topic'}`}>{chat.host_name ? chat.host_name[0] : <Search/>}</div>
          <div><b>{chat.title}</b><div className="cc-gathered-meta"><span>{hostLabel(chat)}</span>{chat.scheduled_label && <span className="cc-when"><CalendarDays/>{chat.scheduled_label}</span>}</div></div>
          <CoffeeTrack chat={chat}/>
        </div>)}</div>
      </div>}
    </div></div>

    {finished.length > 0 && <section className="cc-past"><div className="container cc-past-grid">
      <div className="cc-past-count"><strong>{finished.length}<small>번</small></strong><h2>지금까지 연결된 커피챗</h2></div>
      {reviews.map(chat => <figure className="cc-review" key={chat.id}><p>“{chat.review}”</p><figcaption>{chat.review_by || 'SHIFT 부원'}, {chat.title}</figcaption></figure>)}
    </div></section>}

    <section className="container cc-faq-sec"><div className="cc-faq-grid">
      <div><h2>자주 묻는 질문</h2><p>다른 궁금한 점은 운영진에게 편하게 물어보세요.</p><a className="cc-link" href={`mailto:${CONTACT_EMAIL}`}>메일 보내기 <ArrowRight size={14}/></a></div>
      <div className="cc-faq">{FAQS.map(([q, a], i) => <details open={i === 0} key={q}><summary>{q}<ChevronDown/></summary><p>{a}</p></details>)}</div>
    </div></section>

    {applying && <ApplyModal chat={applying} onClose={() => setApplying(null)} onDone={applied}/>}
    {toast && <div className="cc-toast" role="status">{toast}</div>}
  </div>;
}
