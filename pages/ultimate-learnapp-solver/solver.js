const cards = document.querySelector('iframe[src^="https://learningapps.org/show.php"]').contentDocument.querySelectorAll('.cardOuter .card');
let guid_list = [];
let regex = /openApp\('https:\/\/learningapps\.org\/watch\?v=([^']+)/
cards.forEach(card => {
    guid_list.push({'elem': card, 'guid': card.getAttribute('onclick').match(regex)[1]});
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

function getElementViewportCoordinates(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top
    };
}

async function moveMagicStick(x_start, y_start, x_end, y_end) {
    let div = document.querySelector('#magic-stick');
    if (!div) {
        div = document.createElement('div');
        div.id = 'magic-stick';
        div.style.transform = `translate(${x_start}px, ${y_start}px)`;
        document.body.appendChild(div);
    }

    return new Promise((resolve) => {
        function animate() {
            // Force a reflow to ensure the initial position is applied
            div.getBoundingClientRect();
            
            div.style.transition = 'transform 2s ease-in-out'; // 添加 transition 属性
            div.style.transform = `translate(${x_end}px, ${y_end}px)`;
            
            // Listen for the end of the transition
            div.addEventListener('transitionend', function handler() {
                div.removeEventListener('transitionend', handler);
                resolve();
            });
        }
        animate();
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function playSpinAnimation(x, y) {
    let ripples = document.createElement("span");
    ripples.className = 'ripples';
    ripples.style.left = x + "px";
    ripples.style.top = y + "px";
    document.body.appendChild(ripples);
    setTimeout(() => {
        ripples.remove();
    }, 2000);
}

function playBellDing(name) {
    var audio = new Audio('https://xiuhengwu.github.io/src/file-stored/' + name);
    audio.play();
}


async function processGuids(guid_list) {
    let x_start = 500; let y_start = 500;

    const style_in_iframe = document.createElement('style');
    style_in_iframe.innerHTML = `
    .solvedCheckmark, .cardOuter {
        transition: opacity 1s;
    }
    .cardOuter {
        perspective: 100px;
    }
    .card {
        animation: point 1s cubic-bezier(0,-0.68, 1, 2.51);
        animation-play-state: paused;
    }
    @keyframes point {
        from {
            transform: rotateX(0deg) rotateY(0deg);
        }
        50% {
            transform: rotateX(1deg) rotateY(1deg);
        }
        to {
            transform: rotateX(0deg) rotateY(0deg);
        }
    }
    `
    const style_in_head = document.createElement('style');
    style_in_head.innerHTML = `
    #magic-stick {
        position: fixed;
        width: 100px;
        height: 100px;
        left: 0;
        top: 0;
        background-image: url(https://xiuhengwu.github.io/src/file-stored/magic-stick.webp);
        background-size: cover;
        transition: transform 0.7s;
    }
    body > span.ripples {
        background-color: yellow;
        border-radius: 50%;
        pointer-events: none;
        position: fixed;
        transform: translate(-50%, -50%);
        animation: animate 2s ease-out infinite;
    }
    @keyframes animate {
        from {
            width: 0;
            height: 0;
            opacity: 0.5;
        }

        to {
            width: 100vmin;
            height: 100vmin;
            opacity: 0;
        }
    }
    `

    document.querySelector('iframe[src^="https://learningapps.org/show.php"]').contentDocument.head.append(style_in_iframe);
    document.head.append(style_in_head);
    for (const item of guid_list) {
        console.log(item['guid']);
        
        // await fetch("https://learningapps.org/setAppSolved.php", {
        //     method: "POST",
        //     headers: headers,
        //     body: `guid=${item['guid']}&value=100&time=${time}&user=0`
        // })
        // .then(response => response.json())
        // .then(data => console.log(data))
        // .catch(error => console.error('Error:', error));
        
        // await fetch("https://learningapps.org/collection.php", {
        //     method: "POST",
        //     headers: headers,
        //     body: `u=${userName}&c=${t}`
        // })
        // .then(response => response.json())
        // .then(data => console.log(data))
        // .catch(error => console.error('Error:', error));
        
        // await fetch("https://learningapps.org/collection.php", {
        //     method: "POST",
        //     headers: headers,
        //     body: `u=${userName}&a=${item['guid']}&c=${t}&t=${time}`
        // })
        // .then(response => response.json())
        // .then(data => console.log(data))
        // .catch(error => console.error('Error:', error));

        
        let checkMark = document.createElement('div');
        checkMark.className = 'solvedCheckmark';
        checkMark.style.opacity = '0';
        checkMark.innerText = '✓';
        item['elem'].querySelector('.caption').appendChild(checkMark);

        let x_end = getElementViewportCoordinates(checkMark).x;
        let y_end = getElementViewportCoordinates(checkMark).y;
        await moveMagicStick(x_start, y_start, x_end, y_end);
        checkMark.style.opacity = '1';
        item['elem'].parentNode.classList.remove('disabledCard');
        item['elem']['style']['animation-play-state'] = 'running';
        playBellDing('copper-bell-ding.mp3');
        playSpinAnimation(x_end, y_end);
        x_start = x_end; y_start = y_end;
    }
    await sleep(500);
    document.querySelector('#magic-stick').style.display = 'none';
    playBellDing('ship-bell-two-chimes.mp3');
    playSpinAnimation(window.innerWidth / 2, window.innerHeight / 2);
}

processGuids(guid_list);

