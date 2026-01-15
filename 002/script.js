console.log('003 JavaScript 연결완료');
const form = document.getElementById('checkForm');
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

  console.log('설비명:', equipment);
  console.log('점검일:', date);
  console.log('상태:', statusLabelMap[status] ?? status);
  console.log('비고:', memo);
});
