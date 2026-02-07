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

    messageEl.textContent = '저장 준비 완료(테스트용 메세지)';
    messageEl.classList.remove('error');
    messageEl.classList.add('success');

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
  const checks = [
    {
      id: 1,
      equipment: '냉동기 1번',
      date: '2024-02-01',
      status: '정상',
    },
    {
      id: 2,
      equipment: '보일러 A',
      date: '2024-02-02',
      status: '이상',
    },
    {
      id: 3,
      equipment: '펌프실',
      date: '2024-02-03',
      status: '점검중',
    },
  ];
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
