document.addEventListener('DOMContentLoaded', () => {
  const btnCheck = document.querySelector('#btnCheck');
  if (!btnCheck) {
    console.warn('btnCheck is not found in the DOM');
    return;
  }

  btnCheck.addEventListener('click', () => {
    console.log('btnCheckPressed');
    alert('Button clicked');
  });
});
