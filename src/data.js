// 사이트 정적 데이터. DB로 옮기기 전까지 여기서 관리합니다.

export const navItems = [
  ['home', '홈'], ['about', '소개'], ['activities', '활동'], ['archive', '아카이브'],
  ['board', '게시판'], ['more', '더보기']
];

export const CONTACT_EMAIL = 'shiftysdh@gmail.com';
export const GITHUB_ORG_URL = 'https://github.com/dhc-shift';

export const archives = [
  { type: '세미나', title: '인사이트 세미나', period: '2026-1학기', desc: '개강총회와 함께 진행한 학부·업계 인사이트 공유 세미나', art: 'art-data' },
  { type: '세미나', title: 'IT 온보딩 세션 — 헬스케어 기술·동향', period: '2026-1학기', desc: '디지털 헬스케어 기술과 산업 동향을 소개한 온보딩 세션', art: 'art-care' },
  { type: '세미나', title: 'IT 온보딩 세션 — 취업 트렌드', period: '2026-1학기', desc: 'IT·헬스케어 분야 취업 트렌드를 다룬 온보딩 세션', art: 'art-note' },
  { type: '세미나', title: 'IT 온보딩 세션 — 협업 툴 교육', period: '2026-1학기', desc: '슬랙 등 협업 도구 사용법을 익힌 온보딩 세션', art: 'art-cloud' },
  { type: '스터디', title: '소모임 운영 (대외활동 · 영어 · 코딩)', period: '2026-1학기', desc: '관심 분야별 소모임 3개를 각 5~7명 규모로 운영', art: 'art-people' },
  { type: '행사', title: 'SHIFT 커피챗', period: '2026-1학기', desc: '소모임 주제 발굴을 위한 수요 파악 커피챗', art: 'art-event' },
  { type: '프로젝트', title: '신입부원 모집 웹사이트', period: '2026-1학기', desc: '지원서 접수와 이력서 자동 발송 기능을 갖춘 모집 웹 개발·운영', art: 'art-care' }
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
