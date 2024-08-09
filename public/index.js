// public/index.js
window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.send-button').addEventListener('click', (event) => {
      const group = document.querySelector('.input-text-group').value;
      const name= document.querySelector('.input-text-name').value;
      if (!group || !name) {
        alert('グループ名と名前を入力してください。');
        }
      else if( group != 'A' && group != 'B' && group != 'C'){
        alert("無効なグループ名です。");
      }
      fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group: group, name: name }) })
    });
  });