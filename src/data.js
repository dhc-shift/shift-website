// 사이트 정적 데이터. DB로 옮기기 전까지 여기서 관리합니다.

export const navItems = [
  ['home', '홈'], ['about', '소개'], ['activities', '활동'], ['archive', '아카이브'],
  ['board', '게시판'], ['more', '더보기']
];

export const CONTACT_EMAIL = 'shiftysdh@gmail.com';
export const GITHUB_ORG_URL = 'https://github.com/dhc-shift';


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
