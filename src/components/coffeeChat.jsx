import React from 'react';
import { Coffee } from 'lucide-react';
import { supabase } from '../supabase.js';
import { Badge } from './ui.jsx';
import '../coffee-chat.css';

export const COFFEE_STEPS = ['모집 중', '모집 완료', '연결 중', '일정 확정'];
export const COFFEE_STEPS_ALL = [...COFFEE_STEPS, '완료'];
export const COFFEE_TONE = { '모집 중': 'blue', '모집 완료': 'mint', '연결 중': 'purple', '일정 확정': 'lime', '완료': 'gray', '불발': 'gray' };

export const seatsLeft = chat => chat.seats - chat.applicant_count;
export const isClosed = chat => chat.status === '완료' || chat.status === '불발';
export const canCancel = chat => chat.status === '모집 중' || chat.status === '모집 완료';
export const hostLabel = chat => chat.host_name ? `${chat.host_name} ${chat.host_kind}` : chat.status === '불발' ? '상대 미정' : '상대 찾는 중';

export const nextStepText = chat => {
  if (chat.status === '모집 중') return `${seatsLeft(chat)}자리 더 차면 운영진이 카톡으로 연락드려요.`;
  if (chat.status === '모집 완료') return '인원이 다 모였어요. 운영진이 연결을 시작합니다.';
  if (chat.status === '연결 중') return '운영진이 상대방과 일정을 맞추고 있어요.';
  if (chat.status === '일정 확정') return `${chat.scheduled_label}에 만나요. 자세한 안내는 카톡으로 드려요.`;
  return '';
};

// DB 트리거가 보낸 한글 안내는 그대로 보여주고, 그 외 오류는 일반 문구로 바꾼다.
export const coffeeErrorText = (error, fallback) => error.code === '23505' ? '이미 신청한 커피챗이에요.' : /[가-힣]/.test(error.message || '') ? error.message : fallback;

export const cancelApplication = async applicationId => {
  const { error } = await supabase.from('coffee_chat_applications').delete().eq('id', applicationId);
  return error ? coffeeErrorText(error, '취소하지 못했어요. 네트워크를 확인한 뒤 다시 시도해주세요.') : null;
};

export function Seats({ chat, mine = false, extra = 0, pop = false }) {
  const filled = chat.applicant_count + extra;
  return <div className="cc-seats">{Array.from({ length: chat.seats }, (_, i) => {
    const me = mine && i === filled - 1;
    return <span className={`cc-seat${me ? ' me' : i < filled ? ' on' : ''}${me && pop ? ' pop' : ''}`} key={i}>{me ? '나' : i < filled ? <Coffee/> : null}</span>;
  })}</div>;
}

export function CoffeeTrack({ chat, steps = COFFEE_STEPS }) {
  const now = steps.indexOf(chat.status);
  return <ol className={steps.length === 5 ? 'cc-track five' : 'cc-track'}>{steps.map((step, i) => <li className={i < now ? 'done' : i === now ? 'now' : ''} key={step}><i/><span>{step}</span></li>)}</ol>;
}

export function MyCoffeeRow({ chat, showHost = false, onCancel }) {
  return <div className="cc-my-row">
    <div><b>{chat.title}</b>{showHost && <small className="who">{hostLabel(chat)}</small>}<small>{nextStepText(chat)}</small></div>
    <CoffeeTrack chat={chat}/>
    <div>{canCancel(chat) && <button className="cc-cancel" onClick={() => onCancel(chat)}>취소</button>}</div>
  </div>;
}

export function ClosedCoffeeRow({ chat }) {
  return <div className="cc-old"><Badge tone={COFFEE_TONE[chat.status]}>{chat.status}</Badge><b>{chat.title}</b><span className="m">{chat.status === '불발' ? '이번에는 연결되지 않았어요' : chat.scheduled_label}</span></div>;
}
