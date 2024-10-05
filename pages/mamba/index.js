function getOperatorsDepths(str, index) {
    let openCount = 0;
    for (let i = 0; i < index; i++) {
        if (str[i] === '(') {
            openCount++;
        } else if (str[i] === ')') {
            openCount--;
        }
    }

    return openCount;
}

function getMaxDepths(str) {
    let indices = [];
    let index = str.indexOf('(');
    let depth;
    while (index !== -1) {
        indices.push(index);
        index = str.indexOf('(', index + 1);
    }
    let max_depths = 0;
    indices.forEach(index => {
        depth = getOperatorsDepths(str, index+1);
        if (depth > max_depths) { max_depths = depth }
    });
    return max_depths;
}

function replaceAllFractions(str) {
    let fractions = [];

    function extractFractions(expr) {
        const fractionRegex = /([a-z\u0370-\u03FF0-9]\/[a-z\u0370-\u03FF0-9]|[a-z\u0370-\u03FF0-9]+|\((?:[^)(]|\((?:[^)(]|\((?:[^)(]|\([^)(]*\))*\))*\))*\))\/([a-z\u0370-\u03FF0-9]\/[a-z\u0370-\u03FF0-9]|[a-z\u0370-\u03FF0-9]+|\((?:[^)(]|\((?:[^)(]|\((?:[^)(]|\([^)(]*\))*\))*\))*\))/g;
        let match;
        while ((match = fractionRegex.exec(expr)) !== null) {
            // Recursively extract fractions from the numerator and denominator
            fractions.push({'numerator': match[1], 'denominator': match[2]});
            let newFraction = `
            <div class="frac">
                <span class="top">
                    ${extractFractions(match[1])}
                </span>
                <span class="symbol">/</span>
                <span class="bottom">
                    ${extractFractions(match[2])}
                </span>
            </div>
            `;
            expr = expr.substring(0, match.index) + newFraction + expr.substring(fractionRegex.lastIndex);
        }
        return expr;
    }

    let newExpr = extractFractions(str);
    return newExpr;
}

function replaceAllExponents(str) {
    const exponentsRegex = /\^([a-z0-9]+|\((?:[^)(]|\((?:[^)(]|\((?:[^)(]|\([^)(]*\))*\))*\))*\))/g;
    let exponents = [];
    let match;
    while ((match = exponentsRegex.exec(str)) !== null) {
        str = str.replace(match[0], `<sup>${match[1]}</sup>`);
        exponents.push(match);
    }
    // console.log(exponents);
    return str;
}

function removeExtraParentheses(str) {
    function removeExtraParentheses(expression) {
        let node = math.parse(expression);
        let simplifiedExpression = node.toString({parenthesis: 'auto'});
        return simplifiedExpression;
    }
    str = removeExtraParentheses(str);
    return str;
}

function replaceAllBrackets(str, max_depths) {
    let current_depth = 0;
    let i = 0;
    while (str[i]) {
        if (str[i] == "(") {
            str = str.slice(0, i) + `<div class="bracket s${max_depths-current_depth}"></div>` + str.slice(i + 1);
            current_depth++;
        } else if (str[i] == ")") {
            current_depth--;
            str = str.slice(0, i) + `<div class="bracket right s${max_depths-current_depth}"></div>` + str.slice(i + 1);
        }
        i++;
    };
    return str;
}

function render(source, result_elem) {
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    let max_depths = getMaxDepths(source);
    source = replaceAllFractions(source);
    source = replaceAllExponents(source);
    source = source.replaceAll("*", "×");
    source = replaceAllBrackets(source, max_depths);
    source = source.replaceAll(/\b(a)\b/g, '<img src="./kobe/2.webp">')
        .replaceAll(/\b(b)\b/g, '<img src="./kobe/4.webp">')
        .replaceAll(/\b(c)\b/g, '<img src="./kobe/8.webp">')
        .replaceAll(/\b(d)\b/g, '<img src="./kobe/24.webp">')
        .replaceAll(/\b(e)\b/g, '<img src="./kobe/24.webp">');
    result_elem.style.setProperty('--f-size', `${clamp(max_depths*1, 2, 5)}rem`);
    return source;
}

function copyExpressionToClickBoard(simplified_expr) {
    if (!navigator.clipboard) {
        document.querySelector('button.copy > .text-content').innerText = language_pack['clipboard_err_1'][current_lan];
    }
    if (simplified_expr) {
        navigator.clipboard.writeText(simplified_expr.replaceAll('a', 2).replaceAll('b', 4).replaceAll('c', 8).replaceAll('d', 24).replaceAll('e', 24).replaceAll('^', '**'))
        .then(() => { document.querySelector('button.copy > .text-content').innerText = language_pack['clipboard_success'][current_lan] })
        .catch(err => { document.querySelector('button.copy > .text-content').innerText = language_pack['clipboard_err_2'][current_lan] })
    }
}

var current_lan = ['zh', 'de'].includes(navigator.language) ? navigator.language : 'de';
var i18n;
const language_pack = {
    'clipboard_err_1': {'zh': '孩子，你的浏览器不支持Clipboard API', 'de': 'Ihr Browser unterstützt die Clipboard-API nicht.'},
    'clipboard_err_2': {'zh': 'Man！无法访问剪贴板！', 'de': 'Zugriff auf die Clipboard nicht möglich!'},
    'clipboard_success': {'zh': '已复制', 'de': 'Kopiert'},
    'invalid_input_warn': {'zh': '请输入一个整数！', 'de': 'Bitte geben Sie eine ganze Zahl ein!'},
    'copy': {'zh': '复制曼巴表达式', 'de': 'Mamba-Ausdruck Kopieren'},
    'prepared': {'zh': '孩子，你可以开始输入了', 'de': 'Sie können jetzt ein Zahl eingeben'}
}

document.addEventListener('DOMContentLoaded', (event) => {
    i18n = domI18n({
        selector: '[data-translatable]',
        languages: ['zh', 'de'],
        defaultLanguage: current_lan,
        enableLog: false
    });
    document.querySelector('.language-selector').value = current_lan;
    var simplified_expr;
    var result_elem = document.querySelector('.result');

    document.querySelectorAll("button").forEach((elem) => {
        elem.addEventListener("mousedown", (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            let ripples = document.createElement("span");
            ripples.className = 'ripples';
            ripples.style.left = x + "px";
            ripples.style.top = y + "px";
            elem.appendChild(ripples);
            setTimeout(() => {
                ripples.remove();
            }, 700);
        });
    });

    document.querySelector("#go").addEventListener('click', function() {
        let input_value = (document.querySelector('#num-input').value);
        if (input_value == '' || input_value.includes('.')) {
            result_elem.innerHTML = `
            <h2 style="margin: 0">Man!</h2><br>
            <p>${language_pack['invalid_input_warn'][current_lan]}</p>
            `
            return;
        }
        if (input_value.toString().length > 6) {
            document.querySelector('.warning').style.display = 'block';
        } else {
            document.querySelector('.warning').style.display = 'none';
        }
        let expr = mamba(input_value);
        console.log(expr.replaceAll('a', 2).replaceAll('b', 4).replaceAll('c', 8).replaceAll('d', 24).replaceAll('e', 24).replaceAll('^', '**'));
        simplified_expr = math.simplify(expr).toString();
        let unsolved_numbers = simplified_expr.match(/(?<!\^)\d+/g);
        if (unsolved_numbers) {
            unsolved_numbers.forEach(n => {
                simplified_expr = simplified_expr.replace(n, "(" + mamba(n) + ")");
            });
        }
        simplified_expr = removeExtraParentheses(simplified_expr);
        simplified_expr = simplified_expr.replaceAll(" ", "");
        console.log(simplified_expr.replaceAll('a', 2).replaceAll('b', 4).replaceAll('c', 8).replaceAll('d', 24).replaceAll('e', 24).replaceAll('^', '**'));
        result_elem.innerHTML = render(simplified_expr, result_elem);
    });

    document.querySelector('button.copy').addEventListener('click', function() {
        try {
            copyExpressionToClickBoard(simplified_expr);
        } catch { alert('Unknown Error!'); }
        setTimeout(() => {
            this.querySelector('.text-content').innerText = language_pack['copy'][current_lan];
        }, 1500);
    });

    let coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
            content.style.maxHeight = null;
            } else {
            content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    }

    document.querySelector('.dialog .close').addEventListener('click', function() {
        document.querySelector('.overlay').style.display = 'none';
    });
    document.querySelector('.about').addEventListener('click', function() {
        document.querySelector('.overlay').style.display = 'flex';
    });
    
    result_elem.innerHTML = `<p class="info">${language_pack['prepared'][current_lan]}</p>`
});
