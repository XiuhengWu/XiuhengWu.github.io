// MDUI
import 'mdui/mdui.css';
import 'mdui/components/segmented-button-group.js';
import 'mdui/components/segmented-button.js';
import 'mdui/components/button.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/dropdown.js';
import 'mdui/components/menu-item.js';
import 'mdui/components/divider.js';
import 'mdui/components/list.js';
import 'mdui/components/list-item.js';
import 'mdui/components/card.js';
import 'mdui/components/fab.js';
import 'mdui/components/collapse.js';
import 'mdui/components/collapse-item.js';
import 'mdui/components/select.js';
import 'mdui/components/avatar.js';
import '@mdui/icons/book--outlined.js';
import '@mdui/icons/info--outlined.js';
import '@mdui/icons/format-list-bulleted--outlined.js';
import '@mdui/icons/inbox--outlined.js';

// dom-i18n
import domI18n from 'dom-i18n/dist/dom-i18n.min.js';

// date-fns
import { formatDistanceToNow } from 'date-fns';
import { en, zhCN, de } from 'date-fns/locale';


// time

function formatTime(lang) {
	document.querySelectorAll('.meta-info time').forEach(tag => {
		const result = formatDistanceToNow (
			tag.dateTime,
			{ addSuffix: true, locale: lang } 
		)
		tag.innerText = result;
	})
}


// internationalization

const supported_languages = ['en', 'zh-CN', 'de'];
const locales = [ en, zhCN, de ];
var i18n = domI18n({
	languages: supported_languages,
	defaultLanguage: supported_languages.includes(navigator.language) ? navigator.language : 'en',
	enableLog: false
});

function setLanguage(language, save_settings) {
	if (language == 'auto') {
		setLanguage(supported_languages.includes(navigator.language) ? navigator.language : 'en', false);
	} else {
		if (save_settings != false) { localStorage.setItem('language', language); }
		else { localStorage.removeItem('language') }
		i18n.changeLanguage(language);
		formatTime(locales[supported_languages.indexOf(language)]);
	}
}


// color theme

function changeTheme(theme, save_settings) {
	const page = document.getElementsByTagName('html')[0];
	const theme_buttons = document.querySelectorAll('.theme-button');
	if (theme == 'auto') {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
			changeTheme('light', false);
		} else {
			changeTheme('dark', false);
		}
	} else {
		if (! theme) { theme = Array.from(page.classList).includes('mdui-theme-dark') ? 'light' : 'dark' }
		if (theme == 'light') {
			if (save_settings != false) { sessionStorage.setItem('theme', theme) }
			theme_buttons.forEach(button => { button.icon='light_mode' });
			page.classList.remove('mdui-theme-dark');
		} else if (theme == 'dark') {
			if (save_settings != false) { sessionStorage.setItem('theme', theme) }
			theme_buttons.forEach(button => { button.icon='dark_mode' });
			page.classList.add('mdui-theme-dark');
		}
	}
}

// navigation drawer

var drawer;
var body_elem;
var drawer_status_changing = false;

function toggleDrawer(arg) {
	if (!drawer_status_changing) {
		drawer_status_changing = true;
		setTimeout(() => {
			drawer_status_changing = false;
		}, 402);

		if (arg == 'open') {
			drawer.style.display = 'block';
            void drawer.offsetWidth; // Trigger reflow to ensure the transition starts
			drawer.classList.add('drawer-opened');
			var overlay = document.createElement('div');
			overlay.className = 'overlay hidden';
			overlay.addEventListener('click', function() {
				toggleDrawer('close')
			});
			document.body.appendChild(overlay);
			void drawer.offsetWidth; // Trigger reflow to ensure the transition starts
			overlay.classList.remove('hidden');
			body_elem.style.overflowY = 'hidden';
		} else if (arg == 'close') {
			drawer.classList.remove('drawer-opened');
			const overlay = document.querySelector('.overlay');
			overlay.classList.add('hidden');
			setTimeout(() => {
				document.querySelector('.overlay').remove();
				drawer.style.display = 'none';
			}, 400);
			body_elem.style.overflowY = 'unset';
		}
	}
}


// article filter
var filter_settings = [];
var no_result_div;

function applyFilterSettings() {
	let required_tags_group = filter_settings;
	let all_cards = Array.from(document.getElementsByTagName('mdui-card'));
	let cards_to_display = [];
	all_cards.forEach(card => {
		const card_tags = card.dataset.tags.split(' ');
		let needs_to_hide = false;
		for (let required_tags of required_tags_group) {
			if (required_tags.split(' ').filter(t => card_tags.includes(t)).length == 0) {
				needs_to_hide = true; break;
			}
		}
		if (! needs_to_hide) { cards_to_display.push(card) }
	});
	all_cards.forEach(card => {
		card.classList.add('hidden');
		setTimeout(() => {
			card.style.display = 'none';
		}, 200);
	});
	setTimeout(() => {
		if (cards_to_display.length == 0) {
			no_result_div.style.display = 'block';
			void no_result_div.offsetWidth;
			no_result_div.classList.remove('hidden');
		} else {
			no_result_div.style.display = 'none';
			cards_to_display.forEach(card => {
				card.style.display = 'inline-block';
				void card.offsetWidth;
				card.classList.remove('hidden');
			});
		}
	}, 200);
}

function changeFilterSettings(num, value) {
	filter_settings[num] = value;
	applyFilterSettings();
}

window.addEventListener('load', (event) => {
	no_result_div = document.createElement('div');
	no_result_div.className = 'no-result-div hidden';
	no_result_div.innerHTML = `
	<mdui-icon-inbox--outlined></mdui-icon-inbox--outlined>
	<p data-translatable>Nothing under the current filter... // 当前过滤器下没有任何内容... // Unter dem aktuellen Filter befindet sich nichts...</p>
	`;
	document.querySelector('.cards-wrap').appendChild(no_result_div);

	const config = {'theme': sessionStorage.getItem('theme') || 'auto', 'language': localStorage.getItem('language') || 'auto'};
	// appearance
	changeTheme(config['theme']);
	setLanguage(config['language']);
	// navigation
	drawer = document.getElementById('navigation');
	body_elem = document.querySelector('body');
	document.querySelector('.app').classList.add('ready'); // page is now ready to display
	const loading_dialog = document.querySelector('.show-box');
	if (loading_dialog.style.display == 'none') {
		clearTimeout(loading_animation); // if loading animation has not started, then cancel it
	} else {
		loading_dialog.classList.add('hidden'); // else, hide the loading dialog
		setTimeout(() => {
			loading_dialog.remove();
		}, 500);
	}
	// article filter
	document.querySelectorAll('#repository mdui-segmented-button-group').forEach(button_group => {
		filter_settings.push(button_group.value);
	});
	// blind elements with target functions
	document.querySelector(`.navigation-rail .selection mdui-button[href="${location.hash}"]`).classList.add('select');
	document.querySelector(`.navigation-drawer mdui-list-item[href="${location.hash}"]`).classList.add('select');
	document.getElementById('open-navigation').addEventListener('click', function() {
		toggleDrawer('open');
	});
	document.getElementById('close-navigation').addEventListener('click', function() {
		toggleDrawer('close');
	});
	document.querySelectorAll('#language-select, #language-select-left').forEach(menu => {
		menu.value = config['language'];
		menu.addEventListener('click', function() {
			setLanguage(this.value);
		})
	});
	document.querySelectorAll('.theme-button').forEach(button => {
		if (config['theme'] != 'auto') { button.icon = config['theme'] + '_mode'; }
		button.addEventListener('click', function() {
			changeTheme();
		})
	});
	let filters = document.querySelectorAll('mdui-segmented-button-group');
	for (let i = 0; i < filters.length; i++) {
		filters[i].addEventListener('change', function() {
			changeFilterSettings(i, this.value);
		});
	}
	document.querySelectorAll('#navigation mdui-list-item').forEach(item => 
		item.addEventListener('click', function() {
			toggleDrawer('close');
		})
	);
	document.querySelectorAll("mdui-list-item[end-icon='keyboard_arrow_down']").forEach(header => {
		header.addEventListener('click', function() {
			if (this.getAttribute('end-icon') == 'keyboard_arrow_down') {
				this.setAttribute('end-icon', 'keyboard_arrow_up');
			} else {
				this.setAttribute('end-icon', 'keyboard_arrow_down');
			}
		})
	});
	document.querySelectorAll('#timeline .main li').forEach(card => 
		card.addEventListener('click', function() {
			location.href = this.getAttribute('data-target');
		})
	);
	const navigation_buttons = document.querySelectorAll('.navigation-drawer mdui-list-item');
    navigation_buttons.forEach(button => {
        button.addEventListener('click', function() {
            navigation_buttons.forEach(button => {
                if (button.classList.contains('select')) { button.classList.remove('select') }
            });
            if (!this.classList.contains('select')) { this.classList.add('select') }
        })
    });
	const navigation_buttons_left = document.querySelectorAll('.navigation-rail mdui-button');
    navigation_buttons_left.forEach(button => {
        button.addEventListener('click', function() {
            navigation_buttons_left.forEach(button => {
                if (button.classList.contains('select')) { button.classList.remove('select') }
            });
            if (!this.classList.contains('select')) { this.classList.add('select') }
        })
    });
});
