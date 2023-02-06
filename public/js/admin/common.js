const sideIcon = document.querySelector(".close");
const navIcon = document.querySelector(".open");

console.log(sideIcon)
console.log(navIcon)

sideIcon.addEventListener("click", toggleSidebar);
navIcon.addEventListener("click", toggleSidebar);

function toggleSidebar() {
  console.log("s");
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("show-sidebar");
}
