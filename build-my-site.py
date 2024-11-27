import os
import subprocess
from bs4 import BeautifulSoup, Comment
import re
import shutil
import time
from pathlib import Path
import copy
import uuid
import json
import hashlib

resubmit_all = False

class File:
    def __init__(self, path, title, data_id, creation_time = None, modification_time = None):
        self.path = path
        self.title = title
        self._id = data_id
        if isinstance(creation_time, str):
            creation_time = time.strptime(creation_time, "%Y-%m-%d %H:%M:%S")
        if isinstance(modification_time, str):
            modification_time = time.strptime(modification_time, "%Y-%m-%d %H:%M:%S")
        self.ctime = creation_time
        self.mtime = modification_time

    def getCreationTime(self):
        file_stat = Path(self.path).stat()
        return self.ctime or time.localtime(file_stat.st_ctime)
    
    def getModificationTime(self):
        file_stat = Path(self.path).stat()
        return self.mtime or time.localtime(file_stat.st_mtime)


def listAllFolders(path):
    return [(path + "/" + d) for d in os.listdir(root_folder) if (not d[0] in ["_", "."]) and (os.path.isdir(path + "/" + d))]


def getFileDetails(file_path : str):
    match_title_regex = r"^# (.+)$" if file_path.endswith("md") else r"<title>(.*?)</title>"
    file_dir = os.path.dirname(file_path)
    config = {}

    with open(file_path, "r", encoding="utf-8") as f:
        file_title = re.search(match_title_regex, f.read(), re.MULTILINE).group(1)
    
    try:
        with open(file_dir + "/build-config.json", "r", encoding="utf-8") as f:
            config = json.loads(f.read())
            file_id = config["data_id"]
    except FileNotFoundError:
        file_id = str(uuid.uuid4())
        with open(file_dir + "/build-config.json", "w", encoding="utf-8") as f:
            json.dump({'data_id': file_id}, f, ensure_ascii=False, indent=4)
    except KeyError:
        file_id = str(uuid.uuid4())
        with open(file_dir + "/build-config.json", "w", encoding="utf-8") as f:
            json.dump({**{'data_id': file_id}, **config}, f, ensure_ascii=False, indent=4)
    
    return File(file_path, file_title, file_id, config.get("creation_time", None), config.get("modification_time", None))



def filter(all_files : list, submitted_files : list):
    filtered_list = all_files.copy()

    for i in range(len(all_files)):
        if all_files[i]._id in submitted_files: del all_files[i]
    
    return filtered_list


def calculateFileSha256(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()

def calculateFolderSha256(folder_path):
    sha256 = hashlib.sha256()
    for root, dirs, files in os.walk(folder_path):
        for file in sorted(files):
            file_path = os.path.join(root, file)
            file_sha256 = calculateFileSha256(file_path)
            sha256.update(file_sha256.encode())
    return sha256.hexdigest()


def copyFiles(src_dir, dest_dir):
    for item in os.listdir(src_dir):
        src_path = src_dir + "/" + item
        dest_path = dest_dir + "/" + item
        if item in ["index.md", "index.html", "build-config.json"] or item[0] in ["_", "."]:
            continue
        if os.path.isdir(src_path):
            if os.path.exists(dest_path):
                input(f"[WARNING] `{dest_path}` already exits, press Enter to overwrite it.")
                shutil.rmtree(dest_path)
            shutil.copytree(src_path, dest_path)
        else:
            shutil.copy2(src_path, dest_path)


def formatListOutput(lst : list, start_index : int = 0):
    for i in range(len(lst)):
        print(f"[{i + start_index}] {lst[i]}")


def exceptSpecificListItem(lst : list, cmd : str):
    if cmd:
        excepted_items_index = cmd.replace(" ", "").split(",")
        for i in sorted(excepted_items_index, reverse=True):
            lst.pop(int(i))
    return lst


def addToRepositoryPage(index_page : BeautifulSoup, data_id : str, data_tags : str, dir : str, title : str, modification_time : time):
    tag_spans = [f"<span data-translatable>{tags_i18n[t]}</span>" for t in data_tags.split(" ")]
    card_template = f'''
    <mdui-card clickable data-id="{data_id}" data-tags="{data_tags}" href="{dir}/index.html" variant="filled">
        <div class="cover-wrapper">
            <div class="cover-container" style="background-image: url({dir}/cover.webp);"></div>
            <h3>{title}</h3>
            <div class="cover-content">
                <div class="meta-info">
                    <div>
                        <i class="material-icons" style="opacity: 0.4;">update</i>
                        <time datetime="{time.strftime("%Y-%m-%d", modification_time)}">
                            {time.strftime("%d.%m.%Y", modification_time)}
                        </time>
                    </div>
                </div>
                <div class="meta-tags">
                    {"".join(tag_spans)}
                </div>
            </div>
        </div>
    </mdui-card>
    '''
    card = BeautifulSoup(card_template, "html.parser")
    cards_to_overwrite = index_page.select(f'.cards-wrap mdui-card[data-id="{data_id}"]')
    if cards_to_overwrite:
        for card_to_overwrite in cards_to_overwrite: card_to_overwrite.replace_with(card)
    else:
        index_page.find("div", class_="cards-wrap").append(card)
    return index_page



def addToTimelinePage(index_page : BeautifulSoup, data_id : str, dir : str, title : str, modification_time : time, detail : str):
    timeline_item_template = f'''
    <li data-id="{data_id}" data-target="{dir}/index.html">
        <div class="date">{time.strftime("%d.%m.%Y", modification_time)}</div>
        <div class="title">{title}</div>
        <div class="descr">{detail}</div>
    </li>
    '''
    timeline_item = BeautifulSoup(timeline_item_template, "html.parser")
    items_to_overwrite = index_page.select(f'#timeline > .main li[data-id="{data_id}"]')
    if items_to_overwrite:
        for item_to_overwrite in items_to_overwrite: item_to_overwrite.replace_with(timeline_item)
    else:
        index_page.select("#timeline > .main")[0].insert(0, timeline_item)
    return index_page


# identify the files that has been modified

with open("./index.html", "r", encoding="utf-8") as f:
    index_page = BeautifulSoup(f.read(), "html.parser")

if resubmit_all:
    input("[WARNING] All articles and pages will be resubmitted, press Enter to proceed. ")
    # clear all entrances in homepage, if resubmitted_all is set to True
    index_page.select(".cards-wrap")[0].string = ""
    index_page.select("#timeline > .main")[0].string = ""

modified_articles = []
modified_pages = []
with open("./all-files-SHA.json", "r", encoding="utf-8") as f:
    all_files_sha = json.loads(f.read())

for root_folder in ["./_articles", "./pages"]:
    for folder_dir in listAllFolders(root_folder):
        sha = calculateFolderSha256(folder_dir)
        if root_folder == "./_articles": file_detail = getFileDetails(folder_dir + "/index.md")
        else: file_detail = getFileDetails(folder_dir + "/index.html")
        
        try:
            sha_in_last_submit = all_files_sha[file_detail._id]
            if resubmit_all: raise KeyError # enforce the code in the `except``
            if sha_in_last_submit != sha: raise KeyError # enforce the code in the `except``
        except KeyError:
            if root_folder == "./_articles": modified_articles.append(file_detail)
            else: modified_pages.append(file_detail)
            all_files_sha[file_detail._id] = sha

with open("./all-files-SHA.json", "w", encoding="utf-8") as f:
    all_files_sha = json.dump(all_files_sha, f, ensure_ascii=False, indent=4)

if not modified_pages and not modified_articles:
    print("Nothing to do..."); exit(0)

if modified_articles:
    print("These articles will be submitted: ")
    formatListOutput([a.path + ": " + a.title for a in modified_articles])
    cmd = input("Press Enter to proceed, or specific the files that don't need to be submitted (e.g. input: 2, 4, 5): ")
    modified_articles = exceptSpecificListItem(modified_articles, cmd)

if modified_pages:
    print("These pages will be submitted: ")
    formatListOutput([p.path + ": " + p.title for p in modified_pages])
    cmd = input("Press Enter to proceed, or specific the files that don't need to be submitted (e.g. input: 2, 4, 5): ")
    modified_pages = exceptSpecificListItem(modified_pages, cmd)


# get all tags from `/index.html`
tags_i18n = {}
for button in index_page.select("#repository mdui-segmented-button"):
    all_translation = button.text
    tags_i18n[button["value"]] = all_translation


timeline_page_items = []

print("----------Submitting articles----------")
for article in modified_articles:
    article_dir = os.path.dirname(article.path)
    folder_name = article_dir.split("/")[-1]
    # convert md to html
    converted_result = subprocess.run(["pandoc", article.path, "-t", "html"], capture_output=True, text=True, encoding="utf-8")
    article_content = BeautifulSoup(converted_result.stdout, "html.parser")

    # reset article template
    with open("./templates/article-template.html", "r", encoding="utf-8") as f:
        article_template = BeautifulSoup(f.read(), "html.parser")

    # fill in the title
    article_template.title.string = article.title
    article_template.select(".page-wrap .post-info > h1")[0].string = article.title

    # fill in the time
    creation_time_tag = article_template.select(".meta-info time[data-desc='creation']")[0]
    modification_time_tag = article_template.select(".meta-info time[data-desc='modification']")[0]
    creation_time_tag["datetime"] = time.strftime("%Y-%m-%d", article.getCreationTime())
    modification_time_tag["datetime"] = time.strftime("%Y-%m-%d", article.getModificationTime())
    creation_time_tag.string = time.strftime("%d.%m.%Y", article.getCreationTime())
    modification_time_tag.string = time.strftime("%d.%m.%Y", article.getModificationTime())

    # fill in the tags
    tags_line = article_content.find(lambda tag: tag.name == "blockquote" and tag.text.strip().startswith(("Tag:", "tag:")))
    if not tags_line:
        tags_line = "Tags: " + input(f'Please input the tags of {article.title} (e.g. a, b, c): ')
    tag_contents = [tag_content.strip() for tag_content in tags_line.replace("Tags:", "").replace("tags:", "").split(',')]
    # tags_line.decompose()
    tags_wrapper = article_template.select(".page-wrap .post-info > .meta-tags")[0]
    for tag_content in tag_contents:
        tag = article_template.new_tag("span")
        tag.string = tags_i18n[tag_content]
        tag["data-translatable"] = None
        tags_wrapper.append(tag)

    # fill in the article
    # After inserting a Beautifulsoup element into another element, the previous one will become empty. (Is this a bug ?!)
    article_content_copy = copy.copy(article_content)
    article_template.select(".article-wrap")[0].append(article_content_copy)

    # save to disk
    if not os.path.exists(f"./articles/{folder_name}"): os.mkdir(f"./articles/{folder_name}")
    with open(f"./articles/{folder_name}/index.html", "w", encoding="utf-8") as f:
        f.write(str(article_template))
    copyFiles(f"./_articles/{folder_name}", f"./articles/{folder_name}")

    # add to repository page
    index_page = addToRepositoryPage(index_page, article._id, " ".join(tag_contents), f"/articles/{folder_name}", article.title, article.getModificationTime())
    paragraphs = article_content.select("p, ol")
    detail = ""
    for paragraph in paragraphs:
        text_in_paragraph = paragraph.getText().replace("\n", " ")
        text_in_paragraph = re.sub(r'\s+', ' ', text_in_paragraph)
        if len(detail + text_in_paragraph) <= 100:
            detail += text_in_paragraph + " "
        else:
            detail += text_in_paragraph[:100 - len(detail)] + "..."
            break

    # add to timeline_page_items list
    timeline_page_items.append({
        "_id": article._id,
        "dir": f"/articles/{folder_name}",
        "title": article.title,
        "ctime": article.getCreationTime(),
        "detail": detail
    })

    print("Submitted: " + article.title)


print("----------Submitting HTML pages----------")

for page in modified_pages:
    page_dir = os.path.dirname(page.path)

    # read html
    with open(f"{page.path}", "r", encoding="utf-8") as f:
        page_content = BeautifulSoup(f.read(), "html.parser")
    
    for comment in page_content.find_all(string=lambda text: isinstance(text, Comment)):
        if comment.strip().startswith("Tag:") or comment.strip().startswith("tag:"):
            tags_line = comment
    if not tags_line:
        tags_line = "Tags: " + input(f'Please input the tags of {article.title} (e.g. a, b, c): ')
    tag_contents = [tag_content.strip() for tag_content in tags_line.replace("Tags:", "").replace("tags:", "").split(',')]

    # add to repository page
    index_page = addToRepositoryPage(index_page, page._id, " ".join(tag_contents), f"{page_dir}", page.title, page.getModificationTime())
    detail = f'''
    <img src="{page_dir}/cover.webp" alt="cover">
    '''

    # add to timeline_page_items list
    timeline_page_items.append({
        "_id": page._id,
        "dir": f"{page_dir}",
        "title": page.title,
        "ctime": page.getCreationTime(),
        "detail": detail
    })

    print("Submitted: " + page.title)


print("----------Adding items to Timeline page----------")

items_sort_by_creation_time = list(sorted(timeline_page_items, key=lambda item: item["ctime"]))

for item in items_sort_by_creation_time:
    index_page = addToTimelinePage(index_page, item["_id"], item["dir"], item["title"], item["ctime"], item["detail"])
    print("Added: " + item["title"])

with open("./index.html", "w", encoding="utf-8") as f:
    f.write(str(index_page.prettify()))
