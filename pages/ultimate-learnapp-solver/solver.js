const cards = document.querySelector('iframe[src^="https://learningapps.org/show.php"]').contentDocument.querySelectorAll('.cardOuter .card');
let guid_list = [];
let regex = /openApp\('https:\/\/learningapps\.org\/watch\?v=([^']+)/
cards.forEach(card => {
    guid_list.push(card.getAttribute('onclick').match(regex)[1]);
});

const t = new URL(location.href).searchParams.get('v');
const time = 5;
const userName = document.querySelector('iframe[src^="https://learningapps.org/show.php"]').contentDocument.querySelector('#usernameDisplay').innerText;

const headers = {
    "accept": "*/*",
    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Microsoft Edge\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
};

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processGuids(guid_list) {
    for (const guid of guid_list) {
        console.log(guid);
        
        await fetch("https://learningapps.org/setAppSolved.php", {
            method: "POST",
            headers: headers,
            body: `guid=${guid}&value=100&time=${time}&user=0`
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
        
        await fetch("https://learningapps.org/collection.php", {
            method: "POST",
            headers: headers,
            body: `u=${userName}&c=${t}`
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
        
        await fetch("https://learningapps.org/collection.php", {
            method: "POST",
            headers: headers,
            body: `u=${userName}&a=${guid}&c=${t}&t=${time}`
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }
}

processGuids(guid_list);

