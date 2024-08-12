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

function findAllFractions(str, depths) {
    let indices = [];
    let index = str.indexOf('/');
    while (index !== -1) {
        indices.push(index);
        index = str.indexOf('/', index + 1);
    }
    var fractions = []
    indices = indices.filter(i => getOperatorsDepths(str, i) == depths);
    indices.forEach(index => {
        var left_start; var right_end; 
        if (str[index-1] == ")") {
            let open_count = 0
            for (let i = index-1; i >= 0; i--) {
                if (str[i] == ")") {
                    open_count++;
                } else if (str[i] == "(") {
                    open_count--;
                }
                if (open_count == 0) {
                    left_start = i;
                    break;
                }
            }
        } else if (str[index-1] != ")") {
            for (let i = index-1; i >= 0; i--) {
                if (["(", ")", "+", "-", "*", "/"].includes(str[i])) {
                    left_start = i + 1;
                    break;
                }
            }
        }
        if (str[index+1] == "(") {
            let open_count = 0
            for (let i = index+1; i <= str.length; i++) {
                if (str[i] == "(") {
                    open_count++;
                } else if (str[i] == ")") {
                    open_count--;
                }
                if (open_count == 0) {
                    right_end = i + 1;
                    break;
                }
            }
        } else if (str[index+1] != "(") {
            for (let i = index+1; i <= str.length; i++) {
                if (["(", ")", "+", "-", "*", "/"].includes(str[i])) {
                    right_end = i;
                    break;
                }
            }
        }
        fractions.push({"left_start": left_start, "left_end": index, "right_start": index+1, "right_end": right_end})
    });
    return fractions;
}

function findAllExponent(str) {
    let indices = [];
    let index = str.indexOf('^');
    while (index !== -1) {
        indices.push(index);
        index = str.indexOf('^', index + 1);
    }
    let exponents = []
    indices.forEach(index => {
        for (let i = index+1; i < str.length; i++) {
            if (["(", ")", "<", ">", "+", "-", "*", "/"].includes(str[i])) {
                exponents.push(str.slice(index, i));
                break;
            }
        }
        exponents.push(str.slice(index, str.length));
    });
    return exponents;
}

function replaceBrackets(str, max_depths) {
    let current_depth = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == "(") {
            str = str.slice(0, i) + `<div class="bracket s${max_depths-current_depth}"></div>` + str.slice(i + 1);
            current_depth++;
        } else if (str[i] == ")") {
            current_depth--;
            str = str.slice(0, i) + `<div class="bracket right s${max_depths-current_depth}"></div>` + str.slice(i + 1);
        }
    }
    return str;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function render(source, result_elem) {
    let max_depths = getMaxDepths(source);
    for (let i = 0; i < 10; i++) {
        let fractions_obj = findAllFractions(source, i);
        var fractions = [];
        fractions_obj.forEach(fraction => {
            let numerator = source.slice(fraction.left_start, fraction.left_end);
            let denominator = source.slice(fraction.right_start, fraction.right_end);
            fractions.push({'numerator': numerator, 'denominator': denominator});
        });
        fractions.forEach(fraction => {
            let fraction_code = `<div class="frac"><span class="top">${fraction.numerator}</span><span class="symbol">/</span><span class="bottom">${fraction.denominator}</span></div>`;
            source = source.replace(fraction.numerator + '/' + fraction.denominator, fraction_code)
        })
    }
    const exponents = findAllExponent(source);
    exponents.forEach(exponent => {
        source = source.replace(exponent, `<sup>${exponent.slice(1)}</sup>`)
    })
    source = source.replaceAll("*", "×");
    source = replaceBrackets(source, max_depths);
    source = source.replaceAll('α', '<img src="https://vip.123pan.cn/1814216664/image/mamba/kobe/kobe_a.webp">')
        .replaceAll('β', '<img src="https://vip.123pan.cn/1814216664/image/mamba/kobe/kobe_b.webp">')
        .replaceAll('γ', '<img src="https://vip.123pan.cn/1814216664/image/mamba/kobe/kobe_c.webp">')
        .replaceAll('δ', '<img src="https://vip.123pan.cn/1814216664/image/mamba/kobe/kobe_d.webp">')
        .replaceAll('ε', '<img src="https://vip.123pan.cn/1814216664/image/mamba/kobe/kobe_d.webp">');
    result_elem.style.setProperty('--f-size', `${clamp(max_depths*1, 2, 5)}rem`);
    return source;
}

function copyExpressionToClickBoard() {
    if (!navigator.clipboard) {
        document.querySelector('button.copy').innerHTML = '孩子，你的浏览器不支持Clipboard API'
      }
    if (simplified_expr) {
        navigator.clipboard.writeText(simplified_expr.replaceAll('α', 2).replaceAll('β', 4).replaceAll('γ', 8).replaceAll('δ', 24).replaceAll('ε', 24).replaceAll('^', '**'))
        .then(() => { document.querySelector('button.copy').innerHTML = '已复制' })
        .catch(err => { document.querySelector('button.copy').innerHTML = 'Man！无法访问剪贴板！' })
    }
}

var simplified_expr;

document.addEventListener('DOMContentLoaded', (event) => {
    var result_elem = document.querySelector('.result');

    document.querySelectorAll("button").forEach((elem) => {
        elem.addEventListener("click", (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            let ripples = document.createElement("span");
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
            <p>请输入一个整数！</p>
            `
            return;
        }
        if (input_value.toString().length > 6) {
            document.querySelector('.warning').style.display = 'block';
        } else {
            document.querySelector('.warning').style.display = 'none';
        }
        let expr = mamba(input_value);
        // console.log(expr.replaceAll('a', 2).replaceAll('b', 4).replaceAll('c', 8).replaceAll('d', 24).replaceAll('e', 24).replaceAll('^', '**'))
        let simplified = math.simplify(expr);
        simplified_expr = simplified.toString()
            .replaceAll(" ", "")
            .replaceAll('a', 'α')
            .replaceAll('b', 'β')
            .replaceAll('c', 'γ')
            .replaceAll('d', 'δ')
            .replaceAll('e', 'ε');
        let unsolved_numbers = simplified_expr.match(/(?<!\^)\d+/g);
        if (unsolved_numbers) {
            unsolved_numbers.forEach(n => {
                simplified_expr = simplified_expr.replace(n, "(" + mamba(n).replaceAll('a', 'α').replaceAll('b', 'β').replaceAll('c', 'γ').replaceAll('d', 'δ').replaceAll('e', 'ε') + ")");
            })
        }
        // console.log(simplified_expr.replaceAll('α', 2).replaceAll('β', 4).replaceAll('γ', 8).replaceAll('δ', 24).replaceAll('ε', 24).replaceAll('^', '**'))
        result_elem.innerHTML = render(simplified_expr, result_elem);
    });

    document.querySelector('button.copy').addEventListener('click', function() {
        try {
            copyExpressionToClickBoard();
        } catch {

        }
        setTimeout(() => {
            this.innerHTML = '复制曼巴表达式';
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
    
    result_elem.innerHTML = '<p class="info">孩子，你可以开始输入了</p>'
});
