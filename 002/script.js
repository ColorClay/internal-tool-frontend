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

// 018 BLOCK : 상태 텍스트 → CSS 클래스
// statusText 안에 '정상' / '이상' / '점검중'이 들어있으면
// 각각 대응하는 배지 클래스 이름을 돌려준다.
function getStatusClass(statusText) {
  if (!statusText) return '';
  if (statusText.includes('정상')) return 'status-normal';
  if (statusText.includes('이상')) return 'status-error';
  if (statusText.includes('점검중')) return 'status-check';
  return '';
}

// 012 BLOCK : 점검 데이터 공통 불러오기
// localStorage에 아무 것도 없으면 SAMPLE_CHECKS를 대신 사용
function getChecksWithFallback() {
  const checks = loadChecks();
  return checks.length > 0 ? checks : SAMPLE_CHECKS;
}

// 015 BLOCK : 검색/상태 필터 상태값
let filterKeyword = ''; // 설비명 검색어
let filterStatus = 'all'; // 전체/정상/이상/점검중

// 016 BLOCK : 정렬 상태값
let sortOrder = 'date-desc'; // 날짜 최신순이 기본

// 019 BLOCK : 페이지네이션 상태값
let currentPage = 1; // 현재 페이지 번호 (1부터 시작)
const PAGE_SIZE = 5; // 한 페이지에 보여줄 개수

// 015/016/019 BLOCK : DOM 요소 모으기
const filterKeywordInput = document.getElementById('filterKeyword');
const filterStatusSelect = document.getElementById('filterStatus');
const sortOrderSelect = document.getElementById('sortOrder');
const checkCountEl = document.getElementById('checkCount');
const resetChecksBtn = document.getElementById('resetChecks');

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoEl = document.getElementById('pageInfo');

// 015 + 016 BLOCK : 검색/필터/정렬까지 적용한 최종 배열 만들기
function getFilteredChecks() {
  const baseChecks = getChecksWithFallback();
  const keyword = filterKeyword.trim().toLowerCase();

  // 1단계: 검색 + 상태 필터
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
    }
    // filterStatus === 'all' 이면 기본값 true 유지

    return matchKeyword && matchStatus;
  });

  // 2단계: 정렬
  const sorted = [...filtered].sort((a, b) => {
    // 날짜 최신순 (날짜 큰 값이 앞)
    if (sortOrder === 'date-desc') {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    }

    // 날짜 오래된 순 (날짜 작은 값이 앞)
    if (sortOrder === 'date-asc') {
      if (a.date > b.date) return 1;
      if (a.date < b.date) return -1;
      return 0;
    }

    // 설비명 가나다순
    if (sortOrder === 'name-asc') {
      const nameA = (a.equipment || '').toString();
      const nameB = (b.equipment || '').toString();
      return nameA.localeCompare(nameB);
    }

    return 0;
  });

  return sorted;
}
//020 현재 로컬스토리지에 실제 데이터 있는지 여부
function isUsingSampleChecks() {
  const stored = loadChecks();
  return stored.length === 0;
}

// 019 BLOCK : 페이지 정보/버튼 상태 업데이트
function updatePagination(totalItems, totalPages) {
  if (!pageInfoEl || !prevPageBtn || !nextPageBtn) return;

  // 예: "1 / 3 (총 12건)"
  pageInfoEl.textContent = `${currentPage} / ${totalPages} (총 ${totalItems}건)`;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

// 012 + 015 + 016 + 019 BLOCK : 점검 목록 렌더링
let selectedId = null; // 현재 선택된 점검의 id

// 021 점검 상세 패널 편집
let editMode = false;

function renderCheckList() {
  if (!checkListEl) return; // 다른 페이지에서 script.js 로딩될 때 방어

  // 1) 검색/필터/정렬이 모두 적용된 전체 목록
  const allChecks = getFilteredChecks();

  //022 ux개선 현재 필터 선택결과에 선택된 항목이 없으면 자동 선택 해제 +편집 종료
  if (selectedId !== null) {
    const stillExists = allChecks.some((c) => c.id === selectedId);
    if (!stillExists) {
      selectedId = null;
      editMode = false;
      currentPage = 1;
    } else {
      // 022-1 선택된 항목이 여전히 존재하면 해당 항목이 몇 번째인지 계산해서 그 페이지로 이동
      const idx = allChecks.findIndex((c) => c.id === selectedId);
      // idx는 0부터 시작하므로 +1 해주고, 페이지 번호는 1부터 시작하므로 +1 해줌
      currentPage = Math.floor(idx / PAGE_SIZE) + 1;
    }
  }

  // 2 + 020 개수표시 예시/실제 여부 라벨
  if (checkCountEl) {
    const dataLabel = isUsingSampleChecks()
      ? ' (예시 데이터)'
      : ' (저장 데이터)';

    checkCountEl.textContent = `현재 조건에 맞는 점검 ${allChecks.length}건${dataLabel}`;
  }

  // 3) 총 페이지 수 계산 (0건이어도 최소 1페이지)
  const totalPages = Math.max(1, Math.ceil(allChecks.length / PAGE_SIZE));

  // 4) currentPage 보정 (필터 변경 등으로 범위 벗어났을 때)
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // 5) 현재 페이지에 보여줄 구간 계산
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageChecks = allChecks.slice(startIndex, endIndex);

  // 6) 기존 목록 비우기
  checkListEl.innerHTML = '';

  // 7) 결과 0건일 때 안내 멘트
  if (pageChecks.length === 0) {
    const li = document.createElement('li');
    li.textContent = '조건에 맞는 점검이 없습니다.';
    li.classList.add('empty');
    checkListEl.appendChild(li);

    updatePagination(allChecks.length, totalPages);
    return;
  }

  // 8) 결과가 있을 때 li 생성
  pageChecks.forEach((check) => {
    const li = document.createElement('li');
    li.textContent = `${check.date} | ${check.equipment} (${check.status})`;

    if (check.id === selectedId) {
      li.classList.add('active');
    }

    li.addEventListener('click', () => {
      selectedId = check.id;
      //021 다른 항목 선택시 편집모드 종료
      editMode = false;
      renderCheckList();
      renderCheckDetail();
    });

    checkListEl.appendChild(li);
  });

  // 9) 페이지 정보/버튼 상태 갱신
  updatePagination(allChecks.length, totalPages);
}

// 013 BLOCK : 선택된 점검 상세 렌더링
function renderCheckDetail() {
  if (!checkDetailEl) return;

  // 021 예시데이터 수정/삭제 금지
  const usingSample = isUsingSampleChecks();

  // 저장데이터 없으면 예시데이터 반환
  const checks = getChecksWithFallback();
  const selectedCheck = checks.find((check) => check.id === selectedId);

  // 아무것도 선택 안 했을 때
  if (!selectedCheck) {
    editMode = false;
    checkDetailEl.innerHTML = `
      <h2 class="subtitle">점검 상세</h2>
      <p class="detail-empty">점검을 선택하세요.</p>
    `;
    return;
  }

  const statusClass = getStatusClass(selectedCheck.status);
  // 021 에딧모드 최소 방어용
  const escapeHtml = (text) =>
    String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const escapeAttr = (text) => escapeHtml(text).replaceAll('\n', ' ');

  // 021 edit 입력 폼 렌더
  if (editMode) {
    checkDetailEl.innerHTML = `
      <h2 class="subtitle">점검 상세 (수정)</h2>
      ${
        usingSample
          ? `<p class="detail-empty">예시 데이터는 수정할 수 없습니다.</p>`
          : ''
      }

      <div class="detail-item">
        <span class="detail-label">설비명:</span>
        <input
          id="editEquipment"
          type="text"
          value="${escapeAttr(selectedCheck.equipment || '')}"
          ${usingSample ? 'disabled' : ''}
        />
      </div>

      <div class="detail-item">
        <span class="detail-label">점검일:</span>
        <input
          id="editDate"
          type="date"
          value="${escapeAttr(selectedCheck.date || '')}"
          ${usingSample ? 'disabled' : ''}
        />
      </div>

      <div class="detail-item">
        <span class="detail-label">상태:</span>
        <select id="editStatus" ${usingSample ? 'disabled' : ''}>
          <option value="정상">정상</option>
          <option value="이상">이상</option>
          <option value="점검중">점검중</option>
        </select>
      </div>

      <div class="detail-item">
        <span class="detail-label">비고:</span>
        <textarea id="editMemo" rows="3" ${
          usingSample ? 'disabled' : ''
        }>${escapeHtml(selectedCheck.memo || '')}</textarea>
      </div>

      <div class="detail-actions">
        <button type="button" id="saveBtn" ${usingSample ? 'disabled' : ''}>
          저장
        </button>
        <button type="button" id="cancelBtn">취소</button>
      </div>
    `;

    // select 기본값 맞추기
    const editStatusEl = document.getElementById('editStatus');
    if (editStatusEl) {
      if ((selectedCheck.status || '').includes('정상'))
        editStatusEl.value = '정상';
      else if ((selectedCheck.status || '').includes('이상'))
        editStatusEl.value = '이상';
      else if ((selectedCheck.status || '').includes('점검중'))
        editStatusEl.value = '점검중';
      else editStatusEl.value = '정상';
    }

    // 021 버튼 이벤트(렌더 직후)
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        editMode = false;
        renderCheckDetail();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (usingSample) return;

        const equipmentEl = document.getElementById('editEquipment');
        const dateEl = document.getElementById('editDate');
        const statusEl = document.getElementById('editStatus');
        const memoEl = document.getElementById('editMemo');

        const equipment = equipmentEl ? equipmentEl.value.trim() : '';
        const date = dateEl ? dateEl.value : '';
        const status = statusEl ? statusEl.value : '';
        const memo = memoEl ? memoEl.value.trim() : '';

        if (equipment === '') {
          alert('설비명을 입력하세요.');
          return;
        }
        if (date === '') {
          alert('점검일을 선택하세요.');
          return;
        }
        //수정/삭제는 저장 데이터만 대상으로 해야함
        const stored = loadChecks();
        const next = stored.map((c) => {
          if (c.id !== selectedId) return c;
          return { ...c, equipment, date, status, memo };
        });
        saveChecks(next);

        editMode = false;
        renderCheckList();
        renderCheckDetail();
      });
    }

    return;
  }

  //021 보기 모드 렌더
  // 선택된 점검 상세 표시
  checkDetailEl.innerHTML = `
    <h2 class="subtitle">점검 상세</h2>
    ${usingSample ? `<p class="detail-empty">현재 예시 데이터 표시 중입니다.(수정/삭제 불가)</p>` : ''}
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
      <span class="status-badge ${statusClass}">${escapeHtml(selectedCheck.status)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">비고:</span>
      ${selectedCheck.memo || '-'}
    </div>
    <div class="detail-actions">
    <button type="button" id="editBtn" ${usingSample ? 'disabled' : ''}>수정</button>
    <button type="button" id="deleteBtn" ${usingSample ? 'disabled' : ''}>삭제</button>
    </div>
  `;

  // 021 보기 모드 버튼 이벤트
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (usingSample) return;
      editMode = true;
      renderCheckDetail();
    });
  }
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (usingSample) return;
      const ok = confirm('이 점검을 삭제할까요?');
      if (!ok) return;
      //저장 데이터에서만 삭제
      const stored = loadChecks();
      const next = stored.filter((c) => c.id !== selectedId);
      saveChecks(next);
      //선택 해제
      selectedId = null;
      editMode = false;

      //페이지 보정
      const allChecks = getFilteredChecks();
      const totalPages = Math.max(1, Math.ceil(allChecks.length / PAGE_SIZE));

      //페이지 보정 추가 현재 페이지가 삭제로 인해 총 페이지 수보다 커질 수 있으므로 보정
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      //현재 페이지가 비어버린 경우 (예 마지막 항목을 삭제한 경우) 다시 보정
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pageChecks = allChecks.slice(startIndex, endIndex);

      // 022 삭제 후 현재 페이지에 항목이 하나도 남지 않았을 때 이전 페이지로 이동 (단, 1페이지는 유지)
      if (pageChecks.length === 0) {
        currentPage = 1;
      }

      renderCheckList();
      renderCheckDetail();
    });
  }
}

// 015/016/019 BLOCK : 이벤트 바인딩 (checks.html에서만 동작)
if (checkListEl && checkDetailEl) {
  // 검색어 입력
  if (filterKeywordInput) {
    filterKeywordInput.addEventListener('input', () => {
      filterKeyword = filterKeywordInput.value;
      currentPage = 1; // 검색 바뀌면 1페이지로
      editMode = false;

      const allChecks = getFilteredChecks();

      //022-ux 선택된 항목이 필터 결과에 남아있으면 유지, 없으면 해제
      if (selectedId !== null) {
        const idx = allChecks.findIndex((c) => c.id === selectedId);

        if (idx === -1) {
          selectedId = null;
          currentPage = 1;
        } else {
          currentPage = Math.floor(idx / PAGE_SIZE) + 1;
        }
      } else {
        currentPage = 1;
      }

      renderCheckList();
      renderCheckDetail();
    });
  }

  // 상태 필터 변경
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', () => {
      filterStatus = filterStatusSelect.value;
      currentPage = 1;
      editMode = false;

      const allChecks = getFilteredChecks();

      //022-ux 선택된 항목이 필터 결과에 남아있으면 유지, 없으면 해제
      if (selectedId !== null) {
        const idx = allChecks.findIndex((c) => c.id === selectedId);
        if (idx === -1) {
          selectedId = null;
          currentPage = 1;
        } else {
          currentPage = Math.floor(idx / PAGE_SIZE) + 1;
        }
      } else {
        currentPage = 1;
      }

      renderCheckList();
      renderCheckDetail();
    });
  }

  // 정렬 기준 변경
  if (sortOrderSelect) {
    sortOrderSelect.addEventListener('change', () => {
      sortOrder = sortOrderSelect.value;
      currentPage = 1;
      editMode = false;

      const allChecks = getFilteredChecks();

      //022-ux 선택된 항목이 필터 결과에 남아있으면 유지, 없으면 해제
      if (selectedId !== null) {
        const idx = allChecks.findIndex((c) => c.id === selectedId);
        if (idx === -1) {
          selectedId = null;
          currentPage = 1;
        } else {
          currentPage = Math.floor(idx / PAGE_SIZE) + 1;
        }
      } else {
        currentPage = 1;
      }

      renderCheckList();
      renderCheckDetail();
    });
  }
  //020 데이터 초기화 버튼
  if (resetChecksBtn) {
    resetChecksBtn.addEventListener('click', () => {
      //confirm 브라우저 기본/확인 취소 팝업
      const ok = confirm(
        '저장된 점검 데이터를 모두 삭제하고 예시 데이터로 되돌릴까요?',
      );
      if (!ok) {
        return;
      }
      localStorage.removeItem(STORAGE_KEY_CHECKS);
      location.reload();
    });
  }
  // 이전 페이지
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        editMode = false;

        //022 페이지 이동후 현재 페이지 선택항목이 없으면 해제
        const allChecks = getFilteredChecks();
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const pageChecks = allChecks.slice(startIndex, endIndex);

        if (
          selectedId !== null &&
          !pageChecks.some((c) => c.id === selectedId)
        ) {
          selectedId = null;
          editMode = false;
        }
        renderCheckList();
        renderCheckDetail();
      }
    });
  }

  // 다음 페이지
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      currentPage += 1; // 범위는 renderCheckList()에서 보정
      editMode = false;

      //022 페이지 이동후 현재 페이지 선택항목이 없으면 해제
      const allChecks = getFilteredChecks();
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pageChecks = allChecks.slice(startIndex, endIndex);

      if (selectedId !== null && !pageChecks.some((c) => c.id === selectedId)) {
        selectedId = null;
        editMode = false;
      }
      renderCheckList();
      renderCheckDetail();
    });
  }

  // 초기 렌더링
  renderCheckList();
  renderCheckDetail();
}

// 014 BLOCK : 대시보드 요약 카드
const statTotalEl = document.getElementById('statTotal');
const statNormalEl = document.getElementById('statNormal');
const statErrorEl = document.getElementById('statError');

if (statTotalEl && statNormalEl && statErrorEl) {
  // 저장된 점검 데이터 불러오기
  const checks = getChecksWithFallback();

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
