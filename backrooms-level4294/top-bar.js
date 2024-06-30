const navExpand = [].slice.call(document.querySelectorAll('.nav-expand'));
const ham = document.getElementById('ham');
ham.addEventListener('click', function () {
	document.body.classList.toggle('nav-is-toggled');
});

function expandTabContent(elem, symbol) {
	var i,
		contents,
		links;

	contents = elem.parentNode.parentNode.getElementsByClassName("content");
	for (i = 0; i < contents.length; i++) {
		contents[i].style.display = "none";
	}
	links = elem.parentNode.parentNode.getElementsByClassName("links");
	for (i = 0; i < links.length; i++) {
		links[i].classList.remove("active");
	}

	document.getElementById(symbol || elem.innerText).style.display = "block";
	elem.classList.add("active");
}

const article_content = document.getElementById('page-content');
const titleTag = [
	"H1",
	"H2",
	"H3",
	"H4",
	"H5"
];
let titles = [];
article_content.childNodes.forEach((e, index) => {
	if (titleTag.includes(e.nodeName)) {
		titles.push({
			id: e.id,
			title: e.innerHTML,
			level: Number(e.nodeName.substring(1, 2))
		});
	}
});
const catalog = titles;
for (index in catalog) {
	document.getElementById('catalog').innerHTML += "<li style='padding-left: " + (
		catalog[index].level * 22 - 22
	) + "px;'>" + "<a href='javascript:void(0);' onclick='location.replace(\"#" + catalog[index].id + "\")'>" + catalog[index].title + "</a>"
};

function collapsibleExpand(elem) {
	elem.classList.toggle("expand");
}
