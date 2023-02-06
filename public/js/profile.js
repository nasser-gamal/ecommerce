const input = document.querySelector("#file");

input.addEventListener("change", previewFile);

function previewFile() {
  const preview = document.querySelector(".profile-img");
  const file = document.querySelector("input[type=file]").files[0];
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      // convert image file to base64 string
      preview.src = reader.result;
    },
    false
  );

  if (file) {
    reader.readAsDataURL(file);
    document.querySelector(".file-label").innerHTML = "Change";
    document.querySelector(".btn-change").classList.remove("d-none");
  }
}

// show And Hide Edit Form

const urlParams = new URLSearchParams(window.location.search);
const edit = urlParams.get("edit");

if (edit) {
  showEditForm();
}

const updateBtn = document.querySelector(".update-data");

updateBtn.addEventListener("click", showEditForm);

function showEditForm() {
  document.querySelector(".user-info").classList.add("d-none");
  document.querySelector(".user-form").classList.remove("d-none");
}
