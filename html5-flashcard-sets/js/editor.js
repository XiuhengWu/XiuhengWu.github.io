const elements = document.querySelectorAll("button, .dropdown-content a");
var content = document.getElementById("content");
var placeholder = document.createElement("p");
var set_name = document.querySelector(".set-name");

AddAnimationInBatches(elements);

if (localStorage.getItem("ToEdit") || localStorage.getItem(localStorage.getItem("ToEdit"))) {
    var pre_set_text = localStorage.getItem(localStorage.getItem("ToEdit"));
    console.log(localStorage.getItem("ToEdit"));
    console.log(pre_set_text);
} else {
    location.href("index.html");
}
set_name.innerText = localStorage.getItem("ToEdit").substring(12, localStorage.getItem("ToEdit").length);
content.innerText = pre_set_text;


/*
window.onbeforeunload = function () {
    return "Leave this page?";
}
*/

function AddAnimationInBatches(elements) {
    elements.forEach((elem) => {
        elem.addEventListener("click", (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            let ripples = document.createElement("span");
            ripples.style.left = x + "px";
            ripples.style.top = y + "px";
            elem.appendChild(ripples);
            setTimeout(() => {
                ripples.remove();
            }, 1000);
        });
    });
}

function Save() {
    window.onbeforeunload = null;
    localStorage.setItem(localStorage.getItem("ToEdit"), content.innerText);
    location.href = "index.html";
}
