// 사이트 정적 데이터. DB로 옮기기 전까지 여기서 관리합니다.

export const navItems = [
  ['home', '홈'], ['about', '소개'], ['activities', '활동'], ['archive', '아카이브'],
  ['board', '게시판'], ['more', '더보기']
];

export const CONTACT_EMAIL = 'shiftysdh@gmail.com';
export const GITHUB_ORG_URL = 'https://github.com/dhc-shift';

export const activityData = [
  { id: 1, type: '프로젝트', title: '헬스케어 데이터랩', desc: '건강 데이터를 더 유용하게 만드는 서비스 개발', period: '08.20 — 09.08', capacity: '12명', dday: 'D-6', access: 'public', color: 'blue', target: 'SHIFT 회원 및 대학생', schedule: '2026.09.22 — 2026.11.28', place: 'SHIFT 프로젝트룸 / 온라인' },
  { id: 2, type: '스터디', title: 'AWS 클라우드 3기', desc: '클라우드 인프라의 기초부터 배포까지', period: '08.24 — 09.12', capacity: '16명', dday: 'D-10', access: 'member', color: 'mint', target: 'SHIFT 회원', schedule: '2026.09.15 — 2026.12.10 (매주 화)', place: '컴퓨터실 302호 / 온라인 병행' },
  { id: 3, type: '세미나', title: 'AI Product Night', desc: '실무자가 들려주는 AI 프로덕트 이야기', period: '09.01 — 09.18', capacity: '40명', dday: 'D-16', access: 'public', color: 'purple', target: '관심 있는 누구나', schedule: '2026.09.19 (금) 18:00', place: 'IT관 101호' },
  { id: 4, type: '행사', title: 'SHIFT 네트워킹 데이', desc: '선배와 후배가 연결되는 커뮤니티 데이', period: '09.05 — 09.20', capacity: '60명', dday: 'D-18', access: 'member', color: 'yellow', target: 'SHIFT 회원 및 졸업생', schedule: '2026.09.26 (토) 17:00', place: '학생회관 라운지' }
];

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
