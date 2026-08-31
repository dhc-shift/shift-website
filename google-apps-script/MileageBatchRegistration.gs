/**
 * SHIFT 마일리지 일괄 등록
 *
 * 사용 전 설정:
 * 1. '마일리지 입력'!B4의 드롭다운 표시 스타일을 '칩'으로 변경합니다.
 * 2. 데이터 유효성 검사에서 '여러 항목 선택 허용'을 켭니다.
 * 3. 기존 registerMileage() 함수를 이 파일의 함수로 교체합니다.
 *
 * 선택된 회원마다 '활동 기록 DB'에 한 행씩 저장하고,
 * 모든 저장이 끝난 뒤 Supabase 동기화를 한 번만 실행합니다.
 */
function registerMileage() {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inputSheet = ss.getSheetByName('마일리지 입력');
    const dbSheet = ss.getSheetByName('활동 기록 DB');

    if (!inputSheet || !dbSheet) {
      SpreadsheetApp.getUi().alert('마일리지 입력 또는 활동 기록 DB 시트를 찾을 수 없습니다.');
      return;
    }

    const date = inputSheet.getRange('B3').getValue();
    const selectedValue = inputSheet.getRange('B4').getDisplayValue();
    const activityItem = inputSheet.getRange('B6').getValue();
    const finalScore = inputSheet.getRange('B9').getValue();
    const activityReason = inputSheet.getRange('B10').getValue();
    const note = inputSheet.getRange('B11').getValue();
    const inputter = inputSheet.getRange('B12').getValue();

    if (!date) return showMileageAlert_('날짜를 입력해주세요.');
    if (!selectedValue) return showMileageAlert_('학번을 한 명 이상 선택해주세요.');
    if (!activityItem) return showMileageAlert_('마일리지 항목을 선택해주세요.');
    if (finalScore === '' || finalScore === null) return showMileageAlert_('최종점수를 확인해주세요.');
    if (!inputter) return showMileageAlert_('입력자를 입력해주세요.');

    const studentIds = [...new Set(
      selectedValue.split(',').map(value => value.trim()).filter(Boolean)
    )];
    const memberNames = getMileageMemberNames_(ss);
    const missingIds = studentIds.filter(studentId => !memberNames.has(studentId));

    if (missingIds.length) {
      return showMileageAlert_(`인원 관리에서 찾을 수 없는 학번입니다: ${missingIds.join(', ')}`);
    }

    const maxId = getMileageMaxRecordId_(dbSheet);
    const rows = studentIds.map((studentId, index) => [
      `R${String(maxId + index + 1).padStart(6, '0')}`,
      date,
      studentId,
      memberNames.get(studentId),
      activityItem,
      finalScore,
      activityReason,
      note,
      inputter
    ]);

    dbSheet.getRange(dbSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    SpreadsheetApp.flush();

    // ShiftSupabaseSync.gs가 같은 Apps Script 프로젝트에 있을 때 즉시 한 번 동기화합니다.
    let syncWarning = '';
    if (typeof syncAfterMileageRegistration === 'function') {
      try {
        syncAfterMileageRegistration();
      } catch (error) {
        console.error(error);
        syncWarning = '\nSupabase 즉시 동기화는 실패했지만 기록은 저장되었습니다. 5분 자동 동기화를 기다려주세요.';
      }
    }

    SpreadsheetApp.getUi().alert(
      `${studentIds.length}명의 마일리지 ${finalScore}점이 일괄 등록되었습니다.${syncWarning}`
    );

    inputSheet.getRangeList(['B3', 'B4', 'B6', 'B8', 'B9', 'B10', 'B11', 'B12']).clearContent();
  } finally {
    lock.releaseLock();
  }
}

function getMileageMemberNames_(ss) {
  const sheet = ss.getSheetByName('인원 관리');
  if (!sheet) throw new Error('인원 관리 시트를 찾을 수 없습니다.');

  const values = sheet.getDataRange().getDisplayValues();
  const searchLimit = Math.min(values.length, 30);
  let headerIndex = -1;
  let studentIdColumn = -1;
  let nameColumn = -1;

  for (let rowIndex = 0; rowIndex < searchLimit; rowIndex++) {
    const headers = values[rowIndex].map(normalizeMileageHeader_);
    studentIdColumn = headers.indexOf('학번');
    nameColumn = headers.indexOf('이름');
    if (studentIdColumn >= 0 && nameColumn >= 0) {
      headerIndex = rowIndex;
      break;
    }
  }

  if (headerIndex < 0) throw new Error('인원 관리 시트에서 학번/이름 헤더를 찾을 수 없습니다.');

  return new Map(
    values.slice(headerIndex + 1)
      .map(row => [String(row[studentIdColumn]).trim(), String(row[nameColumn]).trim()])
      .filter(([studentId, name]) => studentId && name)
  );
}

function getMileageMaxRecordId_(dbSheet) {
  const lastRow = dbSheet.getLastRow();
  if (lastRow < 3) return 0;

  return dbSheet.getRange(3, 1, lastRow - 2, 1).getDisplayValues().flat()
    .reduce((maxId, id) => {
      const number = parseInt(String(id).replace(/^R/i, ''), 10);
      return Number.isNaN(number) ? maxId : Math.max(maxId, number);
    }, 0);
}

function normalizeMileageHeader_(value) {
  return String(value == null ? '' : value).replace(/\s+/g, '').trim();
}

function showMileageAlert_(message) {
  SpreadsheetApp.getUi().alert(message);
}
