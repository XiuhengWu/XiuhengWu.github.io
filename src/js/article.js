// MDUI
import "mdui/mdui.css";
import "mdui/components/button.js";
import "mdui/components/button-icon.js";
import "mdui/components/fab.js";
import "mdui/components/list.js";
import "mdui/components/list-item.js";
import "mdui/components/collapse.js";
import "mdui/components/collapse-item.js";
import "mdui/components/dropdown.js";
import "mdui/components/avatar.js";
import "mdui/components/snackbar.js";
import "mdui/components/select.js";
import "mdui/components/menu-item.js";
import "mdui/components/switch.js";
import "mdui/components/divider.js";
import {alert} from "mdui/functions/alert.js";

// dom-i18n
import domI18n from "dom-i18n/dist/dom-i18n.min.js";

// date-fns
import {formatDistanceToNow} from "date-fns";
import {en, zhCN, de} from "date-fns/locale";

// fancybox
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import {Fancybox} from "@fancyapps/ui";

// particlesJS
import Particles from "particlesjs/dist/particles.min.js";

// time

function formatTime(lang) {
	document.querySelectorAll(".meta-info time").forEach((tag) => {
		const result = formatDistanceToNow(tag.dateTime, {
			addSuffix: true,
			locale: lang
		});
		tag.innerText = result;
	});
}

// internationalization

const supported_languages = ["en", "zh-CN", "de"];
const locales = [en, zhCN, de];
var i18n = domI18n({
	languages: supported_languages,
	defaultLanguage: supported_languages.includes(navigator.language) ? navigator.language : "en",
	enableLog: false
});

function setLanguage(language, save_settings) {
	if (language == "auto") {
		setLanguage(supported_languages.includes(navigator.language) ? navigator.language : "en", false);
	} else {
		if (save_settings != false) {
			localStorage.setItem("language", language);
		} else {
			localStorage.removeItem("language");
		} i18n.changeLanguage(language);
		formatTime(locales[supported_languages.indexOf(language)]);
	}
}

// color theme

function changeTheme(theme, save_settings) {
	const page = document.getElementsByTagName("html")[0];
	const theme_buttons = document.querySelectorAll(".theme-button");
	if (theme == "auto") {
		if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
			changeTheme("light", false);
		} else {
			changeTheme("dark", false);
		}
	} else {
		if (! theme) {
			theme = Array.from(page.classList).includes("mdui-theme-dark") ? "light" : "dark";
		}
		if (theme == "light") {
			if (save_settings != false) {
				sessionStorage.setItem("theme", theme);
			}
			theme_buttons.forEach((button) => {
				button.icon = "light_mode";
			});
			page.classList.remove("mdui-theme-dark");
		} else if (theme == "dark") {
			if (save_settings != false) {
				sessionStorage.setItem("theme", theme);
			}
			theme_buttons.forEach((button) => {
				button.icon = "dark_mode";
			});
			page.classList.add("mdui-theme-dark");
		}
	}
}

// toc

var article_content;
var titles = [];
var catalogs;
var need_to_update = false;
const observer = new IntersectionObserver((entries) => {
	if (need_to_update) {
		for (let i = 0; i < entries.length; i++) {
			const current_heading = getReadingProgress();
			document.querySelectorAll(".catalog").forEach((catalog_elem) => {
				updateReadingProgress(catalog_elem, current_heading);
			});
		}
	}
});

function getReadingProgress() {
	let current_heading = null;
	for (let i = 0; i < titles.length; i++) {
		const rect = titles[i].elem.getBoundingClientRect();
		if (rect.bottom > window.innerHeight) { // below viewport
			current_heading = titles[i - 1].elem.id;
			break;
		} else if (rect.bottom >= 0) { // in viewport
			current_heading = titles[i].elem.id;
			break;
		}
	}
	if (! current_heading) {
		current_heading = titles[titles.length - 1].elem.id;
	}
	return current_heading;
}

function updateReadingProgress(catalog_elem, current_heading) {
	Array.from(catalog_elem.getElementsByTagName("a")).forEach((link) => {
		if (link.dataset.match == current_heading) {
			if (!link.className.includes("reading")) {
				link.classList.add("reading");
			}
		} else if (link.className.includes("reading")) {
			link.classList.remove("reading");
		}
	});
}

// navigation drawer

var drawer;
var body_elem;
var drawer_status_changing = false;

function toggleDrawer(arg) {
	if (! drawer_status_changing) {
		drawer_status_changing = true;
		setTimeout(() => {
			drawer_status_changing = false;
		}, 402);

		if (arg == "open") {
			drawer.style.display = "block";
			void drawer.offsetWidth; // Trigger reflow to ensure the transition starts
			drawer.classList.add("drawer-opened");
			var overlay = document.createElement("div");
			overlay.className = "overlay hidden";
			overlay.addEventListener("click", function () {
				toggleDrawer("close");
			});
			document.body.appendChild(overlay);
			void overlay.offsetWidth; // Trigger reflow to ensure the transition starts
			overlay.classList.remove("hidden");
			body_elem.style.overflowY = "hidden";
		} else if (arg == "close") {
			drawer.classList.remove("drawer-opened");
			const overlay = document.querySelector(".overlay");
			overlay.classList.add("hidden");
			setTimeout(() => {
				document.querySelector(".overlay").remove();
				drawer.style.display = "none";
			}, 400);
			body_elem.style.overflowY = "unset";
		}
	}
}

// dynamic background

var particles;

// blinding

window.addEventListener("load", (event) => {
	const config = {
		theme: sessionStorage.getItem("theme") || "auto",
		language: localStorage.getItem("language") || "auto",
		font_size: localStorage.getItem("font_size") || "1.15rem",
		dynamic_background: true
	};
	if (localStorage.getItem("dynamic_background")) {
		config["dynamic_background"] = localStorage.getItem("dynamic_background") == "true";
	}
	// appearance
	changeTheme(config["theme"]);
	setLanguage(config["language"]);
	// navigation drawer
	drawer = document.getElementById("reader");
	body_elem = document.querySelector("body");
	document.querySelector(".app").classList.add("ready"); // page is now ready to display
	const loading_dialog = document.querySelector(".show-box");
	if (loading_dialog.style.display == "none") {
		clearTimeout(loading_animation); // if loading animation has not started, then cancel it
	} else {
		loading_dialog.classList.add("hidden"); // else, hide the loading dialog
		setTimeout(() => {
			loading_dialog.remove();
		}, 500);
	}

	// toc
	catalogs = document.querySelectorAll(".catalog");
	article_content = document.getElementsByClassName("article-wrap")[0];
	article_content.querySelectorAll("h1, h2, h3, h4, h5").forEach((e) => {
		titles.push({
			elem: e,
			level: Number(e.nodeName.substring(1, 2))
		});
	});
	titles.forEach((title) => {
		catalogs.forEach((elem) => {
			elem.innerHTML += `
			<li style='padding-left: ${
				title.level * 1
			}rem'>
				<a class="t${
				title.level
			}" href="javascript:void(0);" onclick="location.replace('#${
				title.elem.id
			}');" data-match="${
				title.elem.id
			}">${
				title.elem.innerHTML
			}</a>
			</li>
			`;
		});
		observer.observe(title.elem);
	});
	document.querySelectorAll(".toc-button").forEach((button) => {
		button.addEventListener("open", function () {
			need_to_update = true;
			const current_heading = getReadingProgress();
			document.querySelectorAll(".catalog").forEach((catalog_elem) => {
				updateReadingProgress(catalog_elem, current_heading);
			});
		});
		button.addEventListener("close", function () {
			need_to_update = false;
		});
	});
	// blind image with Fancybox
	Fancybox.bind(".article-wrap img", {
		hideScrollbar: false,
		caption: function (fancybox, slide) {
			return slide.thumbEl ?. alt || "";
		}
	});
	// show a message after clicking an anchor link
	document.querySelectorAll(".article-wrap a[href^='#']").forEach((link) => {
		link.addEventListener("click", function () {
			document.getElementById("snackbar").open = true;
		});
	});
	// blind elements with target functions
	document.getElementById("open-reader").addEventListener("click", function () {
		toggleDrawer("open");
	});
	document.getElementById("open-reader-fab").addEventListener("click", function () {
		toggleDrawer("open");
	});
	document.getElementById("close-reader").addEventListener("click", function () {
		toggleDrawer("close");
	});
	document.querySelectorAll("#language-select, #language-select-left").forEach((menu) => menu.addEventListener("click", function () {
		setLanguage(this.value);
	}));
	document.querySelectorAll("#font-size, #font-size-right").forEach((menu) => {
		menu.value = config["font_size"];
		menu.addEventListener("change", function () {
			document.getElementsByClassName("article-wrap")[0]["style"]["font-size"] = this.value;
			localStorage.setItem("font_size", this.value);
		});
	});
	document.querySelectorAll(".theme-button").forEach((button) => button.addEventListener("click", function () {
		changeTheme();
	}));
	document.querySelectorAll("#animation-switch, #animation-switch-right").forEach((s) => {
		s.checked = config["dynamic_background"];
		s.addEventListener("change", function () {
			this.checked ? particles.resumeAnimation() : particles.pauseAnimation();
			localStorage.setItem("dynamic_background", this.checked);
		});
	});
	document.querySelectorAll('mdui-list-item[end-icon="keyboard_arrow_down"]').forEach((header) => {
		header.addEventListener("click", function () {
			if (this.getAttribute("end-icon") == "keyboard_arrow_down") {
				this.setAttribute("end-icon", "keyboard_arrow_up");
			} else {
				this.setAttribute("end-icon", "keyboard_arrow_down");
			}
		});
	});

	function checkFileExists(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(true);
				} else {
					callback(false);
				}
			}
		};
		xhr.send();
	}
	const pdf_path = "./article.pdf";
	document.querySelectorAll(".download-pdf").forEach((button) => {
		button.addEventListener("click", function () {
			checkFileExists(pdf_path, function (exists) {
				if (exists) {
					const link = document.createElement("a");
					link.href = pdf_path;
					link.download = document.title + ".pdf";
					link.click();
				} else {
					alert({headline: "Error", description: "There is no PDF for this article", confirmText: "OK"});
				}
			});
		});
	});
	if (document.querySelector("template.about-this-article-content")) {
		const about_this_article = document.createElement("div");
		about_this_article.innerHTML = document.querySelector("template.about-this-article-content").innerHTML;
		document.querySelectorAll(".about-this-article").forEach((button) => {
			button.addEventListener("click", function () {
				alert({headline: "About", description: about_this_article, confirmText: "OK"});
			});
		});
	}
	// dynamic background
	particles = Particles.init({
		selector: ".background",
		color: [
			"#FF5733", "#5733FF"
		],
		sizeVariations: 10,
		maxParticles: 50,
		speed: 0.2
	});
	if (! config["dynamic_background"]) {
		particles.pauseAnimation();
	}
});
