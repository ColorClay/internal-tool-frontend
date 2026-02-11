// 012 BLOCK 점검 데이터 저장 불러오기
const STORAGE_KEY_CHECKS = 'checks';
// 012-1 저장된 점검 리스트 불러오기
function loadChecks() {
  const raw = localStorage.getItem(STORAGE_KEY_CHECKS);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('점검 데이터 읽기 실패', e);
    return [];
  }
}
// 012-2 점검 리스트 전체 저장하기
function saveChecks(checks) {
  localStorage.setItem(STORAGE_KEY_CHECKS, JSON.stringify(checks));
}
// 012-3 새 점검 추가하기
function addCheck(newCheck) {
  const checks = loadChecks();
  const last = checks[checks.length - 1];
  const nextId = last ? last.id + 1 : 1;
  const checkWithId = {
    id: nextId,
    ...newCheck,
  };
  checks.push(checkWithId);
  saveChecks(checks);
  return checkWithId;
}

// index 전용 코드
const form = document.getElementById('checkForm');
const messageEl = document.getElementById('message');

if (form && messageEl) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const equipment = document.getElementById('equipment').value;
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;
    const memo = document.getElementById('memo').value;

    const statusLabelMap = {
      normal: '정상',
      error: '이상',
      check: '점검중',
    };

    const message = [];

    if (equipment.trim() === '') {
      message.push('설비명을 입력하세요.');
    }
    if (date.trim() === '') {
      message.push('점검일을 선택하세요.');
    }

    if (message.length > 0) {
      messageEl.textContent = message.join(' ');
      messageEl.classList.remove('success');
      messageEl.classList.add('error');
      return;
    }
    //012 실제 점검 데이터 저장
    const displayStatus = statusLabelMap[status] ?? status;

    addCheck({
      equipment,
      date,
      status: displayStatus,
      memo,
    });

    messageEl.textContent = '저장 준비 완료(테스트용 메세지)';
    messageEl.classList.remove('error');
    messageEl.classList.add('success');

    form.reset();

    console.log('설비명:', equipment);
    console.log('점검일:', date);
    console.log('상태:', statusLabelMap[status] ?? status);
    console.log('비고:', memo);
  });
}

// 작업 가능 여부 판단 함수 (재사용용 순수 함수)
function canUserStartWork({
  isAdmin = false,
  isApprovedUser = false,
  isWorkingTime = false,
  isBlockedUser = false,
} = {}) {
  const hasAuthority = isAdmin || isApprovedUser;
  return hasAuthority && isWorkingTime && !isBlockedUser;
}

// auth 전용 코드
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const btnOrCheck = document.getElementById('btnOrCheck');
const btnAndCheck = document.getElementById('btnAndCheck');
const loginResultBox = document.getElementById('loginResult');

function showLoginResult(message, isOk) {
  if (!loginResultBox) return;
  loginResultBox.textContent = message;
  loginResultBox.classList.remove('result-ok', 'result-error');
  loginResultBox.classList.add(isOk ? 'result-ok' : 'result-error');
}

if (
  btnOrCheck &&
  btnAndCheck &&
  userIdInput &&
  passwordInput &&
  loginResultBox
) {
  // OR: 잘못된 검증 예시
  btnOrCheck.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();

    if (userId || password) {
      showLoginResult(
        'OR 검증 : 아이디 또는 비밀번호 중 하나만 있어도 통과되었습니다. (보안상 매우 위험한 조건입니다.)',
        true,
      );
    } else {
      showLoginResult(
        'OR 검증 : 아이디와 비밀번호 둘 다 비어 있어서 거부되었습니다.',
        false,
      );
    }
  });

  // AND: 올바른 검증 + 작업 조건 가드
  btnAndCheck.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();

    // 현재 사용자 상태 스냅샷
    const userState = {
      isAdmin: true,
      isApprovedUser: false,
      isWorkingTime: true,
      isBlockedUser: false,
    };

    // 작업 가능 여부 계산
    const canStartWork = canUserStartWork(userState);

    // 가드 클로즈
    if (!canStartWork) {
      showLoginResult(
        '작업 조건을 만족하지 않아 접근이 제한되었습니다.',
        false,
      );
      return;
    }

    // AND 검증: 아이디 + 비밀번호 모두 필요
    if (userId && password) {
      showLoginResult(
        'AND 검증 : 아이디와 비밀번호가 모두 입력되어 통과되었습니다.(대시보드로 이동합니다.)',
        true,
      );
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } else {
      showLoginResult(
        'AND 검증 : 아이디와 비밀번호를 모두 입력해야 합니다.(하나라도 비어 있으면 실패)',
        false,
      );
    }
  });
}
// 011 BLOCK : 점검 목록
const checkListEl = document.getElementById('checkList');
const checkDetailEl = document.getElementById('checkDetail');
const SAMPLE_CHECKS = [
  {
    id: 1,
    equipment: '냉동기 1번',
    date: '2024-02-01',
    status: '정상(예시데이터)',
  },
  {
    id: 2,
    equipment: '보일러 A',
    date: '2024-02-02',
    status: '이상(예시데이터)',
  },
  {
    id: 3,
    equipment: '펌프실',
    date: '2024-02-03',
    status: '점검중(예시데이터)',
  },
];

//012 블럭 데이터 공통 함수 (어디서나 사용 가능하도록 if 밖에 배치)
function getChecksWithFallback() {
  const checks = loadChecks();
  return checks.length > 0 ? checks : SAMPLE_CHECKS;
}

// 015 블럭 필터 상태 요소
let filterKeyword = '';
let filterStatus = 'all';

const filterKeywordInput = document.getElementById('filterKeyword');
const filterStatusSelect = document.getElementById('filterStatus');
const checkCountEl = document.getElementById('checkCount');

//016 정렬 상태 요소
let sortOrder = 'date-desc';

const sortOrderSelect = document.getElementById('sortOrder');

// 015 검색/필터 적용된 점검 목록 가져오기 + 016
function getFilteredChecks() {
  const baseChecks = getChecksWithFallback();
  const keyword = filterKeyword.trim().toLowerCase();

  const filtered = baseChecks.filter((check) => {
    // 설비명 검색
    const equipmentText = (check.equipment || '').toLowerCase();
    const matchKeyword = keyword === '' || equipmentText.includes(keyword);

    // 상태 필터(전체/정상/이상/점검중)
    let matchStatus = true;
    if (filterStatus === 'normal') {
      matchStatus = check.status.includes('정상');
    } else if (filterStatus === 'error') {
      matchStatus = check.status.includes('이상');
    } else if (filterStatus === 'check') {
      matchStatus = check.status.includes('점검중');
    } else {
      matchStatus = true;
    }
    return matchKeyword && matchStatus;
  });

  //016 정렬단계
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'date-desc') {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    }
    if (sortOrder === 'date-asc') {
      if (a.date > b.date) return 1;
      if (a.date < b.date) return -1;
    }
    if (sortOrder === 'name-asc') {
      const nameA = (a.equipment || '').toString();
      const nameB = (b.equipment || '').toString();
      return nameA.localeCompare(nameB);
    }
    return 0;
  });
  return sorted;
}
// 012 점검 목록 상세
if (checkListEl && checkDetailEl) {
  let selectedId = null;

  function renderCheckList() {
    if (!checkListEl) return;

    //검색/필터/정렬/ 적용된 최종 목록 가져오기
    const checks = getFilteredChecks();

    //개수 표시 업데이트
    if (checkCountEl) {
      checkCountEl.textContent = `현재 조건에 맞는 점검 ${checks.length} 건`;
    }
    //기존 목록 비우기
    checkListEl.innerHTML = '';

    //결과 0건일때 안내 멘트
    if (checks.length === 0) {
      const li = document.createElement('li');
      li.textContent = '조건에 맞는 점검이 없습니다.';
      li.classList.add('empty');
      checkListEl.appendChild(li);
      return;
    }
    //결과가 있을때 li 생성
    checks.forEach((check) => {
      const li = document.createElement('li');
      li.textContent = `${check.date} | ${check.equipment} (${check.status})`;

      if (check.id === selectedId) {
        li.classList.add('active');
      }

      li.addEventListener('click', () => {
        selectedId = check.id;
        renderCheckList();
        renderCheckDetail();
      });

      checkListEl.appendChild(li);
    });
  }

  // 013 블럭 선택된 점검 상세 렌더링
  function renderCheckDetail() {
    if (!checkDetailEl) return;

    const checks = getChecksWithFallback();
    // 선택된 점검 찾기
    const selectedCheck = checks.find((check) => check.id === selectedId);

    // 아무것도 선택 안 했을때
    if (!selectedCheck) {
      checkDetailEl.innerHTML = `
  <h2 class="subtitle">점검 상세</h2>
  <p class="detail-empty">점검을 선택하세요.</p>`;
      return;
    }

    // 선택된 점검 상세 표시
    checkDetailEl.innerHTML = `
  <h2 class="subtitle">점검 상세</h2>
  <div class="detail-item">
  <span class="detail-label">설비명:</span>
  ${selectedCheck.equipment}
  </div>
  <div class="detail-item">
  <span class="detail-label">점검일:</span>
  ${selectedCheck.date}
  </div>
  <div class="detail-item">
  <span class="detail-label">상태:</span>
  ${selectedCheck.status}
  </div>
  <div class="detail-item">
  <span class="detail-label">비고:</span>
  ${selectedCheck.memo || '-'}
  </div>
  `;
  }

  // 015 검색/필터 입력 이벤트
  if (filterKeywordInput) {
    filterKeywordInput.addEventListener('input', () => {
      filterKeyword = filterKeywordInput.value;
      renderCheckList();
      renderCheckDetail();
    });
  }

  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', () => {
      filterStatus = filterStatusSelect.value;
      renderCheckList();
      renderCheckDetail();
    });
  }
  if (sortOrderSelect) {
    sortOrderSelect.addEventListener('change', () => {
      sortOrder = sortOrderSelect.value;
      renderCheckList();
      renderCheckDetail();
    });
  }
  renderCheckList();
  renderCheckDetail();
}

// 014 BLOCK : 대시보드 요약 카드
const statTotalEl = document.getElementById('statTotal');
const statNormalEl = document.getElementById('statNormal');
const statErrorEl = document.getElementById('statError');

if (statTotalEl && statNormalEl && statErrorEl) {
  // 저장된 점검 데이터 불러오기
  let checks = getChecksWithFallback();

  // 총 점검 건수
  const totalCount = checks.length;

  // '정상'이 들어간 상태만 카운트
  const normalCount = checks.filter((check) =>
    check.status.includes('정상'),
  ).length;

  // '이상'이 들어간 상태만 카운트
  const errorCount = checks.filter((check) =>
    check.status.includes('이상'),
  ).length;

  // 화면에 반영
  statTotalEl.textContent = totalCount;
  statNormalEl.textContent = normalCount;
  statErrorEl.textContent = errorCount;
}
