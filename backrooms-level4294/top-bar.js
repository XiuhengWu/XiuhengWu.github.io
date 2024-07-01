function writeTopBar(additionalContent) {
	const topBarContent = `
		<header class="nav-top">
			<a class="material-icons" style="margin-right: 15px;" href="javascript:void(0);" onclick="
	window.history.back();">arrow_back</a>
			<a href="javascript:void(0);" onclick="location.reload()">${document.title}</a>
			<span onclick="document.body.classList.toggle('nav-is-toggled');" class="hamburger material-icons">menu</span>
		</header>
		<nav class="nav-drill">
			<ul id="nav-items">
				<li class="nav-item">
					<a class="nav-link" href="javascript:void(0);" onclick="collapsibleExpand(this.nextElementSibling)">
						<i class="material-icons">sort</i> 目录
					</a>
					<div class="collapsible-menu">
						<ul id="catalog" style="margin: 0;"></ul>
					</div>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="javascript:void(0);" onclick="collapsibleExpand(this.nextElementSibling)">
						<i class="material-icons">format_size</i> 文本大小
					</a>
					<div class="collapsible-menu">
						<ul style="margin: 0;">
							<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='13px'">13px</a></li>
							<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='14px'">14px</a></li>
							<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='15px'">15px</a></li>
							<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='16px'">16px</a></li>
							<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='17px'">17px</a></li>
							<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='18px'">18px</a></li>
									<li><a href="javascript:void(0);"
									onclick="document.getElementById('page-content').style.fontSize='19px'">19px</a></li>
						</ul>
					</div>
				</li>
				${additionalContent || ''}
			</ul>
		</nav>
	`
	document.getElementsByTagName("body")[0].insertAdjacentHTML("afterbegin", topBarContent)
	
	const article_content = document.getElementById('page-content');
	const titleTag = [ "H1", "H2", "H3", "H4", "H5" ];
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
}

function collapsibleExpand(elem) {
	elem.classList.toggle("expand");
}
