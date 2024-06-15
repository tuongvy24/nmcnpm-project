// moi them vao
'use strict';

function checkPasswordConfirm(formId) {
    let password = document.querySelector(`#${formId} [name=password]`);
    let confirmPassword = document.querySelector(`#${formId} [name=confirmPassword]`);
  
    if (password.value != confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords not match!');
        confirmPassword.reportValidity(); //hien thi thong bao loi
    } else {
        confirmPassword.setCustomValidity(''); //xoa thong bao loi
    }
  }