if (location.hash!='#tasks' && location.hash!='#settings') {
    location.hash = 'tasks'
}

function getCurrentLesson(currentDate, timetable) {
    const timetableEntries = Object.entries(timetable);
    
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const currentWeekday = currentDate.getDay() - 1;
    if (currentWeekday < 0 || currentWeekday > 4) {
        return '(None)';
    }

    let previousLesson = null;
    for (const [timeRange, lessons] of timetableEntries) {
        const [start, end] = timeRange.split(',').map(time => {
            const [hour, minute] = time.split(':').map(Number);
            return hour * 60 + minute;
        });
        if (currentTotalMinutes >= start && currentTotalMinutes <= end) {
            return lessons[currentWeekday] || '(None)';
        }
        if (currentTotalMinutes < start) {
            break;
        }
        previousLesson = lessons;
    }

    if (previousLesson) {
        return previousLesson[currentWeekday] || '(None)';
    }

    return '(None)';
}

function updateLocalStorageItem(variableObj) {
    for (const key in variableObj) {
        if (variableObj.hasOwnProperty(key)) {
            localStorage.setItem(key, JSON.stringify(variableObj[key]))
            if (key === 'subjectsAndPresets') {
                let activeMenu = document.querySelector('#anchor-wrap mdui-menu')
                activeMenu.innerHTML = ''
                for (let subjectName in variableObj[key]) {
                    activeMenu.innerHTML += `<mdui-menu-item value="${subjectName}">${subjectName}</mdui-menu-item>`
                }
                activeMenu.innerHTML += `<mdui-menu-item value="(None)">(None)</mdui-menu-item>`
            }
            console.log([key, variableObj[key]]);
        }
    }
}

const initialSubjectsAndPresets = {
    'Biologie': ['Others'],
    'Deutsch': ['Schulbuch', 'Schreiben', 'Others'],
    'Englisch': ['Schulbuch', 'Vocabulary', 'Writing', 'Others'],
    'Französisch': ['Schulbuch', 'Vokabular', 'Arbeitsblatt', 'Ausspracheübung', 'Others'],
    'Geographie': ['Others'],
    'Geschichte': ['Others'],
    'Informatik': ['Others'],
    'Kunst': ['Others'],
    'KV': ['Others'],
    'Mathe': ['Schulbuch', 'Kompetenztraining', 'Others'],
    'Musik': ['Others'],
    'Physik': ['Others'],
    'Religion': ['Others'],
    'Sport': ['Others'],
    'Others': ['Others']
}

const initialTimetable = {
    "08:00,08:50": ['(None)', '(None)', 'Englisch', 'Biologie', 'Englisch'],
    "08:55,09:45": ['Französisch', 'Deutsch', 'Französisch', 'Religion', 'Französisch'],
    "09:55,10:45": ['Mathe', 'Französisch', 'Informatik', 'Mathe', 'Deutsch'],
    "10:55,11:45": ['Deutsch', 'Geschichte', 'Informatik', 'Musik', 'Physik'],
    "11:55,12:45": ['Kunst', 'Religion', 'Musik', 'Physik', 'Mathe'],
    "12:55,13:45": ['Kunst', 'Englisch', 'Biologie', 'Geographie', 'KV'],
    "14:40,16:20": ['(None)', 'Sport', '(None)', '(None)', '(None)']
};
  

function initializeInterface(addSubject, subjectsAndPresets, timetable_body, timetable) {
    for (let subjectName in subjectsAndPresets) {
        let subjectPresets = ''
        for (presetName of subjectsAndPresets[subjectName]) {
            subjectPresets += `<mdui-chip class="subject-preset" ondelete="console.log('1')" deletable>${presetName}</mdui-chip>`
        }
        addSubject.insertAdjacentHTML('beforebegin', `
            <mdui-list-item data-name="${subjectName}">
                <div class="subject-item">
                    <div class="subject-title">${subjectName}</div>
                    <div class="subject-presets-wrap">${subjectPresets}</div>
                </div>
                <mdui-checkbox slot="end-icon"></mdui-checkbox>
            </mdui-list-item>    
        `)
    }

    let activeMenu = document.querySelector('#anchor-wrap mdui-menu')
    activeMenu.innerHTML = ''
    for (let subjectName in subjectsAndPresets) {
        activeMenu.innerHTML += `<mdui-menu-item value="${subjectName}">${subjectName}</mdui-menu-item>`
    }
    activeMenu.innerHTML += `<mdui-menu-item value="(None)">(None)</mdui-menu-item>`

    for (let slot in timetable) {
        let startAndEndTime = slot.split(',')
        timetable_body.insertAdjacentHTML('beforeend', `
        <tr>
            <td class="row-title">
                <mdui-button-icon icon="delete--outlined"></mdui-button-icon><input type="time" value="${startAndEndTime[0]}"><span>-</span><input type="time" value="${startAndEndTime[1]}">
            </td>
            <td>
                <span class="lesson" data-selection="${timetable[slot][0]}">${timetable[slot][0]}</span>
            </td>
            <td>
                <span class="lesson" data-selection="${timetable[slot][1]}">${timetable[slot][1]}</span>
            </td>
            <td>
                <span class="lesson" data-selection="${timetable[slot][2]}">${timetable[slot][2]}</span>
            </td>
            <td>
                <span class="lesson" data-selection="${timetable[slot][3]}">${timetable[slot][3]}</span>
            </td>
            <td>
                <span class="lesson" data-selection="${timetable[slot][4]}">${timetable[slot][4]}</span>
            </td>
        </tr>    
        `)
    }
}

window.addEventListener('load', () => {
    document.querySelector('mdui-navigation-bar').value = location.hash.replace('#', '')
    document.querySelectorAll("mdui-list-item[end-icon='keyboard_arrow_down']").forEach((header) => {
		header.addEventListener("click", function () {
			if (this.getAttribute("end-icon") == "keyboard_arrow_down") {
				this.setAttribute("end-icon", "keyboard_arrow_up");
			} else {
				this.setAttribute("end-icon", "keyboard_arrow_down");
			}
		})
	})

    let subjectsAndPresets = JSON.parse(localStorage.getItem('subjectsAndPresets')) || initialSubjectsAndPresets
    let timetable = JSON.parse(localStorage.getItem('timetable')) || initialTimetable

    let new_task_window = document.querySelector('.new-task-window')
    let overlay = document.querySelector('.overlay')
    let autocompleteMenu = document.querySelector('#autocomplete')

    let isSingleColumnView = true
    let taskBlocksWrap = document.querySelector('.task-blocks-wrap')
    let timetable_body = document.querySelector('#timetable-body')
    let calendar_view = document.querySelector('#calendar-view')
    let all_tasks_view = document.querySelector('#all-tasks-view')

    let tasksEditor = document.querySelector('#tasks-editor')
    let activeTasksBlock;
    const animationDuration = 0.5;

    let addSubject = document.querySelector('#add-subject')
    let addPreset = document.querySelector('#add-preset')
    let deleteSubject = document.querySelector('#delete-subject')
    let subjectList = document.querySelector('#subject-list')
    let anchor = document.querySelector('#anchor')

    initializeInterface(addSubject, subjectsAndPresets, timetable_body, timetable)

    document.querySelector('#open-new-task-window').addEventListener('click', function() {
        new_task_window.classList.replace('hidden', 'show')
        overlay.classList.replace('hidden', 'show')
        const currentLesson = getCurrentLesson(new Date(), timetable)
        new_task_window.querySelector('#subject-field').value = currentLesson
    })
    document.querySelector('#close-new-task-window').addEventListener('click', function() {
        new_task_window.classList.replace('show', 'hidden')
        overlay.classList.replace('show', 'hidden')
    })
    document.querySelector('#confirm-new-task').addEventListener('click', function() {
        new_task_window.classList.replace('show', 'hidden')
        overlay.classList.replace('show', 'hidden')
    })
    overlay.addEventListener('click', function() {
        new_task_window.classList.replace('show', 'hidden')
        overlay.classList.replace('show', 'hidden')
    })

    function updateMenuPosition() {
        const rect = this.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        
        autocompleteMenu.style.position = 'fixed';
        autocompleteMenu.style.top = (rect.bottom + scrollY) + 'px';
        autocompleteMenu.style.left = rect.left + 'px';
        autocompleteMenu.style.maxHeight = Math.min(window.innerHeight, document.documentElement.clientHeight) - rect.bottom - 10 + 'px';
        autocompleteMenu.classList.replace('hidden', 'show');
    }
    function generateOptionList(input, orgList) {
        let newList = new Array()
        for (item of orgList) {
            if (item.toLowerCase().startsWith(input)) {
                newList.push(item)
            }
        }
        return newList
    }
    function refreshMenu(inputField, optionList) {
        console.log(optionList)
        autocompleteMenu.innerHTML = ''
        for (option of generateOptionList(inputField.value, optionList)) {
            autocompleteMenu.innerHTML += `<mdui-menu-item>${option}</mdui-menu-item>`
        }
    }
    new_task_window.querySelectorAll('mdui-text-field:not(.no-autocomplete)').forEach(textField => {
        textField.addEventListener('focus', function() {
            let optionList = new Array()
            if (this.label === 'Subject') {
                optionList = Object.keys(subjectsAndPresets)
            } else if (this.label === 'Title') {
                optionList = subjectsAndPresets[new_task_window.querySelector('#subject-field').value] || ['Others']
            } else {
                optionList = ['...']
            }
            console.log(optionList)
            refreshMenu(this, optionList)

            updateMenuPosition.bind(this);
            window.addEventListener('resize', updateMenuPosition.bind(this));

            this.addEventListener('input', refreshMenu.bind(this, this, optionList));

            this.addEventListener(
                'blur', 
                function() {
                    setTimeout(() => {
                        if (new_task_window.querySelectorAll('mdui-text-field:not(.no-autocomplete)[focused]').length === 0) {
                            autocompleteMenu.classList.replace('show', 'hidden')
                            this.removeEventListener('input', refreshMenu)
                        }
                    }, 100);
                },
                { once: true }
            )
        })
    })

    document.querySelector('#switch-view').addEventListener('click', function() {
        if (isSingleColumnView) {
            taskBlocksWrap.classList.replace('single-column', 'multi-column')
            this.icon = 'grid_view'
        } else {
            taskBlocksWrap.classList.replace('multi-column', 'single-column')
            this.icon = 'view_agenda--outlined'
        }
        isSingleColumnView = !isSingleColumnView
    })
    calendar_view.shadowRoot.querySelector('.panel').style.minWidth = 'unset'
    document.querySelector('#open-calendar-view').addEventListener('click', function() {
        calendar_view.open = true
    })
    document.querySelector('#close-calendar-view').addEventListener('click', function() {
        calendar_view.open = false
    })
    document.querySelector('#open-tasks-view').addEventListener('click', function() {
        all_tasks_view.open = true
    })
    document.querySelector('#close-tasks-view').addEventListener('click', function() {
        all_tasks_view.open = false
    })

    function initialTaskEditorSurface(date) {
        const formattedDate = new Intl.DateTimeFormat('de-DE').format(date)
        tasksEditor.querySelector('mdui-top-app-bar-title').innerText = formattedDate
    }

    document.querySelectorAll('.tasks-block').forEach(block => {
        block.addEventListener('click', function() {
            initialTaskEditorSurface(new Date(this.getAttribute('data-date')))

            activeTasksBlock = this;
            const rect = activeTasksBlock.getBoundingClientRect();
            const scale = rect.width / window.innerWidth;
            const translateX = rect.left;
            const translateY = rect.top;
    
            tasksEditor.classList.remove('hidden')
            tasksEditor.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            tasksEditor.style.height = `${rect.height / scale}px`;
            tasksEditor.style.opacity = '0.9';
    
            void tasksEditor.offsetHeight;
            tasksEditor.style.transition = `transform ${animationDuration}s ease, height ${animationDuration}s ease, opacity ${animationDuration}s ease-out`;
    
            requestAnimationFrame(() => {
                tasksEditor.classList.add("show");
                tasksEditor.style.transform = "translate(0, 0) scaleX(1)";
                tasksEditor.style.height = "100vh";
                tasksEditor.style.opacity = '1';
            });
        })
    })
    document.querySelector('#quit-tasks-editor').addEventListener('click', function() {
        const rect = activeTasksBlock.getBoundingClientRect();
        const scale = rect.width / window.innerWidth;
        const translateX = rect.left;
        const translateY = rect.top;
        
        tasksEditor.style.transition = `transform ${animationDuration}s ease, height ${animationDuration}s ease, opacity ${animationDuration}s cubic-bezier(0.95, 0.01, 0.93, 0.37)`;
        tasksEditor.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        tasksEditor.style.height = `${rect.height / scale}px`;
        tasksEditor.style.opacity = '0';

        tasksEditor.addEventListener(
            "transitionend",
            () => {
                tasksEditor.classList.replace('show', 'hidden');
            },
            { once: true }
        );
    })

    let selectedSubjects = new Array()
    document.querySelector('#subject-list').addEventListener('change', function(event) {
        if (event.target.tagName === 'MDUI-CHECKBOX') {
            let subjectName = event.target.parentNode.getAttribute('data-name')
            let selected = event.target.checked
            if (selected) {
                selectedSubjects.push(subjectName)
            } else if (selectedSubjects.indexOf(subjectName) != -1) {
                selectedSubjects.splice(selectedSubjects.indexOf(subjectName), 1)
            }
            console.log(selectedSubjects)
            if (selectedSubjects.length === 0 && subjectList.querySelectorAll('mdui-list-item[data-name]').length !== 0) {
                addSubject.removeAttribute('disabled')
                addPreset.setAttribute('disabled', '')
                deleteSubject.setAttribute('disabled', '')
            } else {
                addSubject.setAttribute('disabled', '')
                addPreset.removeAttribute('disabled')
                deleteSubject.removeAttribute('disabled')
            }
        }
    })
    document.querySelector('#select-all-subjects').addEventListener('click', function() {
        subjectList.querySelectorAll('mdui-list-item[data-name]').forEach(item => {
            if (item.querySelector('mdui-checkbox').checked === false) {
                item.querySelector('mdui-checkbox').setAttribute('checked', '')
                window.updateSelectedSubjects(item.getAttribute('data-name'), true)
            }
        })
    })
    document.querySelector('#invert-subjects-selection').addEventListener('click', function() {
        subjectList.querySelectorAll('mdui-list-item[data-name]').forEach(item => {
            let current_status = item.querySelector('mdui-checkbox').checked
            if (current_status) {
                item.querySelector('mdui-checkbox').removeAttribute('checked')
            } else {
                item.querySelector('mdui-checkbox').setAttribute('checked', '')
            }
            window.updateSelectedSubjects(item.getAttribute('data-name'), !current_status)
        })
    })
    document.querySelector('#deselect-all-subjects').addEventListener('click', function() {
        subjectList.querySelectorAll('mdui-list-item[data-name]').forEach(item => {
            if (item.querySelector('mdui-checkbox').checked === true) {
                item.querySelector('mdui-checkbox').removeAttribute('checked')
                window.updateSelectedSubjects(item.getAttribute('data-name'), false)
            }
        })
    })
    document.querySelector('#subject-list').addEventListener('delete', function(event) {
        console.log(event)
        if (event.target.tagName === 'MDUI-CHIP') {
            event.target.remove()
        }
    })
    addSubject.addEventListener('click', function() {
        // let subject_name = prompt('Name of the subject?')
        let subject_name = 'aaa'
        subjectsAndPresets[subject_name] = new Array
        updateLocalStorageItem({subjectsAndPresets})
        addSubject.insertAdjacentHTML('beforebegin', `
        <mdui-list-item data-name="${subject_name}">
            <div class="subject-item">
                <div class="subject-title">${subject_name}</div>
                <div class="subject-presets-wrap"></div>
            </div>
            <mdui-checkbox slot="end-icon"></mdui-checkbox>
        </mdui-list-item>    
        `)
    })
    addPreset.addEventListener('click', function() {
        // let subject_name = prompt('Name of the preset?')
        let preset_name = 'name'
        subjectList.querySelectorAll('mdui-list-item[data-name]').forEach(item => {
            if (selectedSubjects.includes(item.getAttribute('data-name'))) {
                subjectsAndPresets[item.getAttribute('data-name')].push(preset_name)
                item.querySelector('.subject-presets-wrap').insertAdjacentHTML('beforeend', `
                <mdui-chip class="subject-preset" deletable>${preset_name}</mdui-chip>
                `)
            }
        })
        updateLocalStorageItem({subjectsAndPresets})
    })
    deleteSubject.addEventListener('click', function() {
        subjectList.querySelectorAll('mdui-list-item[data-name]').forEach(item => {
            if (selectedSubjects.includes(item.getAttribute('data-name'))) {
                window.updateSelectedSubjects(item.getAttribute('data-name'), false)
                delete subjectsAndPresets[item.getAttribute('data-name')]
                item.remove()
            }
        })
        updateLocalStorageItem({subjectsAndPresets})
    })
    let activeMenu = document.querySelector('#anchor-wrap mdui-menu')
    let activeItem;
    activeMenu.addEventListener('click', function(event) {
        if (event.target.tagName === 'MDUI-MENU-ITEM') {
            activeItem.innerHTML = event.target.value
            activeItem.setAttribute('data-selection', event.target.value)
            console.log(event.target.value)
        }
    })
    function locateAnchor(rect) {
        anchor.style.top = rect.y + 'px'
        anchor.style.left = rect.x + 'px'
        anchor.style.width = rect.width + 'px'
        anchor.style.height = rect.height + 'px'
        anchor.parentNode.open = true
    }
    document.querySelector('#time-table').addEventListener('click', function(event) {
        let rect
        if (event.target.matches('#time-table td:has(span.lesson)')) {
            rect = event.target.querySelector('span.lesson').getBoundingClientRect()
            activeItem = event.target.querySelector('span.lesson')
            locateAnchor(rect)
        } else if (event.target.matches('#time-table td span.lesson')) {
            rect = event.target.getBoundingClientRect()
            activeItem = event.target
            locateAnchor(rect)
        } else if (event.target.matches('#time-table mdui-button-icon[icon^=delete]')) {
            event.target.parentNode.parentNode.remove()
        } else {
            return false
        }
    })
    document.querySelector('#add-timetable-row').addEventListener('click', function() {
        timetable_body.insertAdjacentHTML('beforeend', `
        <tr>
            <td class="row-title">
                <mdui-button-icon icon="delete--outlined"></mdui-button-icon><input type="time"><span>-</span><input type="time">
            </td>
            <td>
                <span class="lesson" data-selection="(None)">(None)</span>
            </td>
            <td>
                <span class="lesson" data-selection="(None)">(None)</span>
            </td>
            <td>
                <span class="lesson" data-selection="(None)">(None)</span>
            </td>
            <td>
                <span class="lesson" data-selection="(None)">(None)</span>
            </td>
            <td>
                <span class="lesson" data-selection="(None)">(None)</span>
            </td>
        </tr>
        `)
    })
    document.querySelector('#confirm-timetable').addEventListener('click', function() {
        timetable = new Object()
        timetable_body.querySelectorAll('tr').forEach(tr => {
            let startAndEndTime = tr.querySelectorAll('.row-title input[type=time]')
            let lessonsAtThisDay = new Array()
            tr.querySelectorAll('td:not(.row-title)').forEach(td => {
                lessonsAtThisDay.push(td.querySelector('span.lesson').getAttribute('data-selection'))
            })
            timetable[startAndEndTime[0].value + ',' + startAndEndTime[1].value] = lessonsAtThisDay
        })
        updateLocalStorageItem( {timetable} )
    })
})