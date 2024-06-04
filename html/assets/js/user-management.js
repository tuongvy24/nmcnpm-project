document
  .querySelector("#editUserModal")
  .addEventListener("shown.bs.modal", () => {
    document.querySelector("#firstNameEdit").focus();
  });

document
  .querySelector("#addUserModal")
  .addEventListener("shown.bs.modal", () => {
    document.querySelector("#firstName").focus();
  });

document.querySelectorAll(".delete-btn").forEach((btnConfirm) => {
  btnConfirm.addEventListener("click", (e) => {
    let id = e.target.dataset.id;

    const options = {
      title: "Are you sure?",
      type: "danger",
      btnOkText: "Yes",
      btnCancelText: "No",
      onConfirm: () => {
        // console.log("Confirm");
        deleteUser(id); // goi ham deleteUser o duoi 
      },
      onCancel: () => {
        console.log("Cancel");
      },
    };
    const {
      el,
      content,
      options: confirmedOptions,
    } = bs5dialog.confirm("Do you really want to delete this user?", options);
  });
});

async function deleteUser(id) {
  let res = await fetch(`/users/${id}`, { method: 'DELETE'});
  location.reload(); //reload lai trang sau khi t/hien xong
}

function showUserData(e) {
  document.querySelector("#id").value = e.target.dataset.id;
  document.querySelector("#firstNameEdit").value = e.target.dataset.firstName;
  document.querySelector("#lastNameEdit").value = e.target.dataset.lastName;
  document.querySelector("#usernameEdit").value = e.target.dataset.username;
  document.querySelector("#mobileEdit").value = e.target.dataset.mobile;
  document.querySelector("#isAdminEdit").checked = e.target.dataset.isAdmin == "true" ? true : false;

}

// phan sau khi edit thi submit len server
async function editUser(e) {
  e.preventDefault();
  let formData = new FormData(document.querySelector('#editUserForm'));
  let data = Object.fromEntries(formData.entries());
  console.log(data);

  let res = await fetch(`/users`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  location.reload();
}