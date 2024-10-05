const url_mapping_table = {
	"/backrooms-level4294": "/articles/backrooms-level4294/index.html",
	"/pages/backrooms-level4294": "/articles/backrooms-level4294/index.html",
	"/HowToUseV2rayn": "/articles/how-to-use-v2rayn/index.html",
	"/HowToUseV2rayng": "/articles/how-to-use-v2rayng/index.html",
	"/html5-flashcard-sets": "/pages/html5-flashcard-sets/index.html",
	"/page/mamba": "/pages/mamba/index.html"
};
const mapped_url = url_mapping_table[location.pathname.replace(/index\.html$/, "").replace(/\/$/, "")];
if (mapped_url) {
	location.replace(mapped_url);
}

window.addEventListener("load", function () {
	var torch = document.querySelector(".torch");
	document.addEventListener("mousemove", function (event) {
		torch.style.top = event.pageY + "px";
		torch.style.left = event.pageX + "px";
	});
});
