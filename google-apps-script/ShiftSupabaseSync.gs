/**
 * SHIFT Google Sheets → Supabase 동기화
 *
 * 사전 설정:
 * Apps Script > 프로젝트 설정 > 스크립트 속성에 아래 두 값을 저장합니다.
 * SUPABASE_URL=https://ppqfzzhtirwzwmtnzoak.supabase.co
 * SUPABASE_SERVICE_ROLE_KEY=Supabase의 legacy service_role 키
 *
 * 주의: SERVICE_ROLE 키를 셀, 소스 코드, 웹사이트에 적지 마세요.
 */

const SHIFT_SHEETS = {
  MEMBERS: '인원 관리',
  ITEMS: '마일리지 항목',
  HISTORY: '활동 기록 DB'
};

function syncAllToSupabase() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const token = Utilities.getUuid();
    const members = readSheetObjects_(SHIFT_SHEETS.MEMBERS).filter(row => value_(row, '학번'));
    const items = readSheetObjects_(SHIFT_SHEETS.ITEMS).filter(row => value_(row, '활동항목'));
    const history = readSheetObjects_(SHIFT_SHEETS.HISTORY).filter(row => value_(row, '기록ID'));

    const memberRows = members.map(row => ({
      student_id: String(value_(row, '학번')).trim(),
      name: String(value_(row, '이름')).trim(),
      cohort: String(value_(row, '기수') || '').trim(),
      email: String(value_(row, '이메일')).trim().toLowerCase(),
      affiliation: String(value_(row, '소속') || '').trim(),
      total_mileage: number_(value_(row, '누적 마일리지')),
      current_tier: String(value_(row, '현재 등급') || '').trim(),
      current_rank: nullableNumber_(value_(row, '현재 순위')),
      sync_token: token,
      updated_at: new Date().toISOString()
    })).filter(row => row.email);

    const itemRows = items.map(row => ({
      item_number: String(value_(row, '번호') || '').trim(),
      category: String(value_(row, '분야') || '').trim(),
      activity_name: String(value_(row, '활동항목')).trim(),
      description: String(value_(row, '활동 설명') || '').trim(),
      base_score: number_(value_(row, '기본점수')),
      requires_manual_score: String(value_(row, '직접입력 여부')).trim() === '예',
      notes: String(value_(row, '비고') || '').trim(),
      sync_token: token,
      updated_at: new Date().toISOString()
    }));

    const historyRows = history.map(row => ({
      record_id: String(value_(row, '기록ID')).trim(),
      activity_date: dateString_(value_(row, '날짜')),
      student_id: String(value_(row, '학번')).trim(),
      member_name: String(value_(row, '이름')).trim(),
      activity_name: String(value_(row, '활동항목')).trim(),
      final_score: number_(value_(row, '최종점수')),
      reason: String(value_(row, '활동/사유') || '').trim(),
      notes: String(value_(row, '비고') || '').trim(),
      entered_by: String(value_(row, '입력자') || '').trim(),
      sync_token: token
    })).filter(row => row.activity_date && row.student_id);

    upsertInChunks_('member_stats', memberRows, 'student_id');
    upsertInChunks_('mileage_items', itemRows, 'activity_name');
    upsertInChunks_('mileage_history', historyRows, 'record_id');
    deleteStale_('mileage_history', token);
    deleteStale_('mileage_items', token);
    deleteStale_('member_stats', token);

    const totalMileage = memberRows.reduce((sum, row) => sum + row.total_mileage, 0);
    const tierCounts = memberRows.reduce((result, row) => {
      result[row.current_tier || '미정'] = (result[row.current_tier || '미정'] || 0) + 1;
      return result;
    }, {});
    const topThree = memberRows
      .slice().sort((a, b) => b.total_mileage - a.total_mileage).slice(0, 3)
      .map(row => ({ name: row.name, mileage: row.total_mileage, tier: row.current_tier }));

    upsert_('public_member_summary', [{
      id: 1,
      member_count: memberRows.length,
      total_mileage: totalMileage,
      average_mileage: memberRows.length ? Math.round(totalMileage / memberRows.length * 100) / 100 : 0,
      activity_count: historyRows.length,
      top_three: topThree,
      tier_counts: tierCounts,
      updated_at: new Date().toISOString()
    }], 'id');

    console.log(`SHIFT 동기화 완료: 회원 ${memberRows.length}명, 기록 ${historyRows.length}건`);
  } finally {
    lock.releaseLock();
  }
}

// 기존 registerMileage()의 활동 기록 DB 저장이 끝난 직후 이 함수를 호출하세요.
function syncAfterMileageRegistration() {
  SpreadsheetApp.flush();
  Utilities.sleep(500);
  syncAllToSupabase();
}

// 최초 한 번 직접 실행하면 5분 자동 동기화 트리거를 설치합니다.
function installShiftSyncTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'syncAllToSupabase')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('syncAllToSupabase').timeBased().everyMinutes(5).create();
}

function readSheetObjects_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const requiredHeaders = {
    '인원 관리': ['학번', '이름', '이메일'],
    '마일리지 항목': ['활동항목', '기본점수'],
    '활동 기록 DB': ['기록ID', '학번', '최종점수']
  }[sheetName] || [];

  const searchLimit = Math.min(values.length, 30);
  let headerRowIndex = -1;
  let headers = [];

  for (let rowIndex = 0; rowIndex < searchLimit; rowIndex++) {
    const candidate = values[rowIndex].map(normalizeHeader_);
    if (requiredHeaders.every(header => candidate.includes(normalizeHeader_(header)))) {
      headerRowIndex = rowIndex;
      headers = candidate;
      break;
    }
  }

  if (headerRowIndex < 0) {
    throw new Error(
      `'${sheetName}' 시트의 첫 30행에서 헤더를 찾지 못했습니다. ` +
      `필수 헤더: ${requiredHeaders.join(', ')}`
    );
  }

  const rows = values.slice(headerRowIndex + 1)
    .filter(row => row.some(cell => cell !== '' && cell != null))
    .map(row => Object.fromEntries(headers.map((header, index) => [header, row[index]])));

  console.log(`${sheetName}: 헤더 ${headerRowIndex + 1}행, 데이터 ${rows.length}행 감지`);
  return rows;
}

function normalizeHeader_(value) {
  return String(value == null ? '' : value).replace(/\s+/g, '').trim();
}
function value_(row, header) { return row[normalizeHeader_(header)]; }
function number_(value) { const parsed = Number(String(value ?? 0).replace(/,/g, '')); return Number.isFinite(parsed) ? parsed : 0; }
function nullableNumber_(value) { return value === '' || value == null ? null : number_(value); }
function dateString_(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function config_() {
  const properties = PropertiesService.getScriptProperties();
  const url = properties.getProperty('SUPABASE_URL');
  const key = properties.getProperty('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('스크립트 속성에 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.');
  return { url: url.replace(/\/$/, ''), key };
}

function request_(path, method, payload, extraHeaders) {
  const { url, key } = config_();
  const response = UrlFetchApp.fetch(`${url}/rest/v1/${path}`, {
    method,
    contentType: 'application/json',
    headers: Object.assign({ apikey: key, Authorization: `Bearer ${key}` }, extraHeaders || {}),
    payload: payload == null ? undefined : JSON.stringify(payload),
    muteHttpExceptions: true
  });
  if (response.getResponseCode() >= 300) {
    throw new Error(`Supabase 오류 ${response.getResponseCode()}: ${response.getContentText()}`);
  }
  return response;
}

function upsert_(table, rows, conflictColumn) {
  if (!rows.length) return;
  request_(`${table}?on_conflict=${encodeURIComponent(conflictColumn)}`, 'post', rows, {
    Prefer: 'resolution=merge-duplicates,return=minimal'
  });
}

function upsertInChunks_(table, rows, conflictColumn) {
  for (let index = 0; index < rows.length; index += 300) {
    upsert_(table, rows.slice(index, index + 300), conflictColumn);
  }
}

function deleteStale_(table, token) {
  request_(`${table}?sync_token=neq.${encodeURIComponent(token)}`, 'delete', null, { Prefer: 'return=minimal' });
}
