// 사이트 정적 데이터. DB로 옮기기 전까지 여기서 관리합니다.

export const navItems = [
  ['home', '홈'], ['about', '소개'], ['activities', '활동'], ['archive', '아카이브'],
  ['board', '게시판'], ['more', '더보기']
];

export const CONTACT_EMAIL = 'shiftysdh@gmail.com';
export const GITHUB_ORG_URL = 'https://github.com/dhc-shift';

export const archives = [
  { type: '프로젝트', title: 'CareLink', period: '2026.03 — 2026.07', desc: '보호자와 가족을 잇는 디지털 헬스케어 서비스', art: 'art-care' },
  { type: '스터디', title: 'AWS 스터디 2기', period: '2026.03 — 2026.06', desc: '함께 배우고 직접 배포하며 익힌 클라우드', art: 'art-cloud' },
  { type: '세미나', title: '데이터 분석 세미나', period: '2026.05.18', desc: '데이터로 문제를 정의하는 실전 세션', art: 'art-data' },
  { type: '행사', title: '2026 SHIFT OT', period: '2026.03.08', desc: '새로운 시작을 함께한 첫 번째 만남', art: 'art-people' },
  { type: '프로젝트', title: 'Medi Note', period: '2025.09 — 2026.01', desc: '진료 기록을 쉽고 안전하게 정리하는 경험', art: 'art-note' },
  { type: '행사', title: 'Homecoming Day', period: '2025.11.22', desc: 'SHIFT의 선후배가 한자리에 모인 밤', art: 'art-event' }
];

export const boardDescriptions = {
  공지사항: 'SHIFT 운영과 활동에 관한 중요한 안내입니다.',
  뉴스레터: '우리가 만든 변화와 동료들의 이야기를 전합니다.',
  건의함: '더 나은 SHIFT를 위한 의견을 들려주세요.',
  자료실: '동아리 규칙을 포함한 공식 문서와 자료를 확인하세요.'
};

export const RECRUIT_SITE_URL = 'https://dhc-shift.github.io';

export const eventTone = type => ({프로젝트:'blue',스터디:'mint',세미나:'purple',행사:'lime'}[type] || 'blue');

// 신청 마감일 기준 D-day 문자열
export const dday = applyEnd => {
  if (!applyEnd) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(`${applyEnd}T00:00:00`);
  const diff = Math.round((end - today) / 86400000);
  return diff < 0 ? '마감' : diff === 0 ? 'D-DAY' : `D-${diff}`;
};

export const typeColor = type => ({프로젝트:'blue',스터디:'mint',세미나:'purple',행사:'yellow'}[type] || 'blue');
