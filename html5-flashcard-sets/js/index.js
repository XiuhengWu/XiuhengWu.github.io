const elements = document.querySelectorAll("button, .dropdown-content a");
var current_block_id = 0;
AddAnimationInBatches(elements);
LoadStoragedSets();

if (!localStorage.getItem("ToVisit")) {
    document.getElementById("go").style.disabled = true;
    ShowPrompt(true);
}

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

function ShowPrompt(arg) {
    var prompt = document.getElementById("prompt");
    var button_go = document.getElementById('go');
    if (arg) {
        button_go.disabled = true;
        prompt.style.display = "flex";
        setTimeout(() => {
            prompt.classList.remove("hide");
        }, 510);
    }
    else {
        button_go.disabled = false;
        prompt.classList.add("hide");
        prompt.addEventListener("transitionend", function () {
            if (!document.getElementById('go').disabled) {
                prompt.style.display = "none";
            }
        })
        
    }
}

function LoadStoragedSets() {
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key)
        console.log(key);
        console.log(value);
        console.log("--------------");
        if (key.substring(0, 12) == "FLASHCARDS: ") {
            AddNewBlock(key.substring(12, key.length))
        }
    }
}

function IsNameExist(name) {
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if ("FLASHCARDS: " + name  == key) {
            return true
        }
    }
}

function ConfirmName(request_name) {
    var new_name;
    if (IsNameExist(request_name)) {
        for (i=1;;i++) {
            new_name = request_name + " (" + i + ")"
            if (!IsNameExist(new_name)) {
                return new_name
            }
        }
    } else {
        return request_name
    }
}

function AddNewBlock(block_caption) {
    var temp = document.getElementById("card_set");
    var place_holder = document.getElementById("place_holder");
    var cardsets_area = document.getElementById("cardsets_area");
    var card_set = temp.content.cloneNode(true);
    card_set.querySelector(".card_set > .header > .display_name").innerText = block_caption;
    card_set.id = "block" + current_block_id;

    if (cardsets_area.querySelectorAll("#cardsets_area > .card_set").length == 0) {
        cardsets_area.removeChild(place_holder);
    }
    cardsets_area.appendChild(card_set);
    const elements = document.querySelectorAll(".card_set > .footer > button");
    AddAnimationInBatches(elements);
}

function RenameBlock(block_caption_elem) {
    document.getElementById("rename_dialog").showModal();
    var input = document.getElementById("user_input");
    var old_data_key = "FLASHCARDS: " + block_caption_elem.innerText;
    var ok = document.getElementById("ok");
    var cancel = document.getElementById("cancel");
    input.blur();
    input.value = block_caption_elem.innerText;
    ok.addEventListener("click", function () {
        let regex = new RegExp("[\\\\*]");
        if (regex.test(input.value) == true) {
            document.getElementById('error_info').innerText = "Name should not contain illegal characters.(\\, *)";
        } else if (input.value.length == 0) {
            document.getElementById('error_info').innerText = "No empty name allowed.";
        } else if (IsNameExist(input.value)) {
            document.getElementById('error_info').innerText = "Name already exit.";
        }
        else {
            document.getElementById('error_info').innerText = "";
            var old_data_value = localStorage.getItem(old_data_key)
            localStorage.removeItem(old_data_key);
            localStorage.setItem("FLASHCARDS: " + input.value, old_data_value)
            block_caption_elem.innerText = input.value;
            document.getElementById("rename_dialog").close();
        }
    })
    cancel.addEventListener("click", function () {
        document.getElementById('error_info').innerText = "";
        document.getElementById("rename_dialog").close();
    })
}

function EditBlock(display_name) {
    set_name = "FLASHCARDS: " + display_name;
    localStorage.setItem("ToEdit", set_name);
    location.href = "editor.html";
}

function DeleteBlock (block) {
    var key = "FLASHCARDS: " + block.getElementsByTagName("p")[0].innerText;
    localStorage.removeItem(key);
    block.animate(
        {opacity: [1, 0]},
        {duration: 300, fill: "forwards"}
    );
    setTimeout(() => {
        cardsets_area.removeChild(block);
    }, 310);
}

function NewSet() {
    let name = ConfirmName("New Flashcard Set");
    AddNewBlock(name);
    localStorage.setItem("FLASHCARDS: " + name, "");
    localStorage.setItem("ToEdit", "FLASHCARDS: " + name);
    location.href = "editor.html";
}

function ShowMenu() {
    var dropdown_content = document.getElementById("dropdown-content");
    dropdown_content.classList.add("show");
}

function HideMenu() {
    var dropdown_content = document.getElementById("dropdown-content");
    dropdown_content.classList.remove("show");
}

function ReadFile() {
    var file = document.getElementById("file-input").files[0];
    var name = file.name;
    var display_name = ConfirmName(name.substring(0, name.lastIndexOf(".")));
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (e) {
        var content = e.target.result;
        // console.log(content + "\n" + display_name);
        localStorage.setItem("FLASHCARDS: " + display_name, content);
        AddNewBlock(display_name);
    };
}

function Go() {
    location.href = "viewer.html";
}
