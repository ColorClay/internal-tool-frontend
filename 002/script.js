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
//011 BLOCK : 점검 목록
const checkListEl = document.getElementById('checkList');

if (checkListEl) {
  let checks = loadChecks();
  //저장된 데이터 없을떄 보여주는 예시 데이터
  if (checks.length === 0) {
    checks = [
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
  }

  let selectedId = null;

  function renderCheckList() {
    checkListEl.innerHTML = '';

    checks.forEach((check) => {
      const li = document.createElement('li');

      li.textContent = `${check.date} | ${check.equipment} (${check.status})`;

      if (check.id === selectedId) {
        li.classList.add('active');
      }

      li.addEventListener('click', () => {
        selectedId = check.id;
        renderCheckList();
      });

      checkListEl.appendChild(li);
    });
  }
  renderCheckList();
}
