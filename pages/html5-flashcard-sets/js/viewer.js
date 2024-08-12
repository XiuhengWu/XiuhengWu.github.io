const elements = document.querySelectorAll("button");
var is_card_switching = false;
var progress = document.getElementById("progress");
var card_area = document.getElementById("card_area");
var next = document.getElementById("next");
var previous = document.getElementById("previous");

let to_view_str = localStorage.getItem("ToView");
if (!to_view_str) {location.href = "index.html"}
let to_view_list = to_view_str.substring(0, to_view_str.length-1).split("*")
var database_str = "";
console.log(to_view_list)
for (i=0; i<to_view_list.length; i++) {
    item_to_add = localStorage.getItem("FLASHCARDS: " + to_view_list[i]).trim();
    if (item_to_add) {
        database_str += item_to_add;
    }
}
console.log(database_str)
if (!database_str) {location.href = "index.html"}
var database = randArr(database_str.trim().split("\n"));

var current_index = 0;
AddAnimationInBatches(elements);

let temp = document.getElementsByTagName("template")[0].content.cloneNode(true);
let sides = database[current_index].split("*");
temp.querySelector(".card .front").innerText = sides[0];
temp.querySelector(".card .back").innerText = sides[1];
card_area.appendChild(temp);

/*
for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var value = localStorage.getItem(key)
    console.log(key);
    console.log(value);
    console.log("--------------");
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

function randArr(arr) {
    for (var i = 0; i < arr.length; i++) {
        var iRand = parseInt(arr.length * Math.random());
        var temp = arr[i];
        arr[i] = arr[iRand];
        arr[iRand] = temp;
    }
    return arr;
}

function ShowMenu() {
    var dropdown_content = document.getElementById("dropdown-content");
    dropdown_content.classList.add("show");
}

function HideMenu() {
    var dropdown_content = document.getElementById("dropdown-content");
    dropdown_content.classList.remove("show");
}

function PreviousCard() {
    if (!is_card_switching) {
        is_card_switching = true;
        current_index--;
        progress.innerText = current_index+1 + " of " + database.length;
        previous.disabled = current_index==0 ? true : false;
        next.disabled = current_index==database.length-1 ? true : false;
        current_card = document.querySelector(".card");
        current_card.classList.add("after");
        current_card.addEventListener("transitionend", function () {
            card_area.removeChild(current_card);
            var temp = document.getElementsByTagName("template")[0].content.cloneNode(true);
            var card = temp.querySelector(".card");
            let sides = database[current_index].split("*");
            temp.querySelector(".card .front").innerText = sides[0];
            temp.querySelector(".card .back").innerText = sides[1];
            card.classList.add("before");
            card_area.appendChild(temp);
            var card_now = card_area.getElementsByClassName("card")[0];
            setTimeout(() => {
                card_now.classList.remove("before");
                card_now.addEventListener("transitionend", function () {
                    is_card_switching = false;
                })
            }, 50);
        })
    }
}

function FlipCard() {
    if (!is_card_switching) {
        current_card = document.querySelector(".card");
        if (current_card.classList.contains("flipped")) {
            current_card.classList.remove("flipped");
        }
        else {
            current_card.classList.add("flipped");
        }
    }
}

function NextCard() {
    if (!is_card_switching) {
        is_card_switching = true;
        current_index++;
        progress.innerText = current_index+1 + " of " + database.length;
        previous.disabled = current_index==0 ? true : false;
        next.disabled = current_index==database.length-1 ? true : false;
        current_card = document.querySelector(".card");
        current_card.classList.add("before");
        current_card.addEventListener("transitionend", function () {
            card_area.removeChild(current_card);
            var temp = document.getElementsByTagName("template")[0].content.cloneNode(true);
            var card = temp.querySelector(".card");
            card.classList.add("after");
            let sides = database[current_index].split("*");
            temp.querySelector(".card .front").innerText = sides[0];
            temp.querySelector(".card .back").innerText = sides[1];
            card_area.appendChild(temp);
            var card_now = card_area.getElementsByClassName("card")[0];
            setTimeout(() => {
                card_now.classList.remove("after");
                card_now.addEventListener("transitionend", function () {
                    is_card_switching = false;
                })
            }, 50);
        })
    }
}
