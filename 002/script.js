console.log('003 JavaScript 연결완료');
const form = document.getElementById('checkForm');
const messageEl = document.getElementById('message');

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
