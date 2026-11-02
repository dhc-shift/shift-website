// 사이트 정적 데이터. DB로 옮기기 전까지 여기서 관리합니다.
import { Archive, Bell, CalendarDays, Coffee, FolderArchive, Lightbulb, Mail, MessageSquareText, Sparkles, UserPlus, Users } from 'lucide-react';

// 최상위 3개 + 부속 메뉴. to는 setPage에 넘기는 경로, sections는 활성 표시에 쓰는 첫 경로 조각.
export const menuGroups = [
  { label: '소개', sections: ['about', 'recruit'], items: [
    { label: 'SHIFT 소개', desc: '동아리와 하는 일', to: 'about', icon: Lightbulb },
    { label: '조직', desc: '회장단과 본부 구성', to: 'about#org', icon: Users },
    { label: '모집 안내', desc: '지원 방법과 다음 모집', to: 'recruit', icon: UserPlus }
  ] },
  { label: '활동', sections: ['activities', 'coffee-chat', 'archive'], items: [
    { label: '진행 중인 활동', desc: '지금 신청하거나 참여할 수 있어요', to: 'activities', icon: Sparkles },
    { label: '커피챗', desc: '선배에게 같이 물어보기', to: 'coffee-chat', icon: Coffee },
    { label: '일정', desc: '이번 달 활동 달력', to: 'activities#calendar', icon: CalendarDays },
    { label: '지난 활동', desc: '함께 만든 기록', to: 'archive', icon: Archive }
  ] },
  { label: '소식', sections: ['board', 'documents'], items: [
    { label: '공지사항', desc: '운영 안내', to: 'board?category=공지사항', icon: Bell },
    { label: '뉴스레터', desc: 'SHIFT 소식지', to: 'board?category=뉴스레터', icon: Mail },
    { label: '자료실', desc: '규칙과 공식 문서', to: 'board?category=자료실', icon: FolderArchive },
    { label: '건의함', desc: '운영진에게 의견 보내기', to: 'board?category=건의함', icon: MessageSquareText }
  ] }
];

// 모집 기간에만 true. 헤더에 지원하기 버튼과 모집 중 표시가 나타납니다.
export const RECRUIT_OPEN = false;

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

// 활동 시작일 기준 D-day 문자열 (시작일이 지나면 표시하지 않음)
export const dday = startDate => {
  if (!startDate) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(`${startDate}T00:00:00`);
  const diff = Math.round((start - today) / 86400000);
  return diff < 0 ? '' : diff === 0 ? 'D-DAY' : `D-${diff}`;
};

export const typeColor = type => ({프로젝트:'blue',스터디:'mint',세미나:'purple',행사:'yellow'}[type] || 'blue');
