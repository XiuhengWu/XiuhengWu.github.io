import os
import subprocess
import re
import shutil
import time
import uuid
import json
import hashlib
import logging
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from copy import deepcopy

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("build.log"), logging.StreamHandler()],
)

# 全局配置
FORCE_REBUILD = False  # 是否强制重建所有内容
TEMPLATE_DIR = Path("templates")
HASH_FILE = Path("file_hashes.json")
CONTENT_SOURCES = ["_articles", "pages"]  # 内容源目录

class FileMetadata:
    """文件元数据容器"""

    def __init__(self, path, title, data_id, creation_time=None, modification_time=None):
        self.path = Path(path)
        self.title = title
        self.data_id = data_id
        self.creation_time = self._parse_time(creation_time)
        self.modification_time = self._parse_time(modification_time)

    def _parse_time(self, time_str):
        """解析时间字符串为struct_time"""
        if isinstance(time_str, str):
            try:
                return time.strptime(time_str, "%Y-%m-%d %H:%M:%S")
            except ValueError as e:
                logging.warning(f"时间格式错误: {time_str} - {str(e)}")
        return None

    @property
    def safe_ctime(self):
        """获取安全的创建时间（优先使用配置时间）"""
        return self.creation_time or time.localtime(self.path.stat().st_ctime)

    @property
    def safe_mtime(self):
        """获取安全的修改时间（优先使用配置时间）"""
        return self.modification_time or time.localtime(self.path.stat().st_mtime)

def list_content_directories(root_dir):
    """列出所有内容目录（排除隐藏目录）"""
    try:
        return [
            entry
            for entry in Path(root_dir).iterdir()
            if entry.is_dir() and not entry.name.startswith(("_", "."))
        ]
    except FileNotFoundError:
        logging.warning(f"源目录不存在: {root_dir}")
        return []

def scan_content_directory(content_dir, is_article=True):
    """扫描单个内容目录"""
    main_file = content_dir / ("index.md" if is_article else "index.html")
    if not main_file.exists():
        logging.warning(f"主文件不存在: {main_file}")
        return None

    try:
        return get_file_metadata(main_file)
    except Exception as e:
        logging.error(f"扫描目录失败: {content_dir} - {str(e)}")
        return None

def get_file_metadata(file_path):
    """获取文件元数据并维护build-config"""
    config_path = file_path.parent / "build-config.json"
    
    # 解析文件标题
    if file_path.suffix == ".md":
        with open(file_path, "r", encoding="utf-8") as f:
            first_line = f.readline().strip()
            title = (
                re.match(r"^#\s+(.+)$", first_line).group(1)
                if re.match(r"^#", first_line)
                else "Untitled"
            )
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")
            title_tag = soup.find("title")
            title = title_tag.text.strip() if title_tag else "Untitled"

    # 处理配置文件
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except FileNotFoundError:
        config = {}

    # 生成或获取data_id
    if "data_id" not in config:
        config["data_id"] = str(uuid.uuid4())
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4, ensure_ascii=False)

    return FileMetadata(
        path=file_path,
        title=title,
        data_id=config["data_id"],
        creation_time=config.get("creation_time"),
        modification_time=config.get("modification_time"),
    )

def calculate_directory_hash(directory):
    """计算目录内容的哈希值"""
    sha = hashlib.sha256()
    for root, _, files in os.walk(directory):
        for file in sorted(files):
            file_path = Path(root) / file
            if file_path.name in ["index.md", "index.html", "build-config.json"]:
                continue
            with open(file_path, "rb") as f:
                while chunk := f.read(4096):
                    sha.update(chunk)
    return sha.hexdigest()

def sync_assets(source_dir, target_dir):
    """同步资源文件"""
    target_dir.mkdir(parents=True, exist_ok=True)
    
    for item in source_dir.iterdir():
        target = target_dir / item.name
        if item.is_dir():
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(item, target)
        else:
            if item.suffix not in [".md", ".html"] and not item.name.startswith("."):
                shutil.copy2(item, target)

def extract_tags(content):
    """从内容中提取标签"""
    # 尝试从Markdown的blockquote提取
    tag_quote = content.find(
        lambda tag: tag.name == "blockquote" 
        and tag.text.strip().lower().startswith(("tag:", "tags:"))
    )
    
    if tag_quote:
        tag_line = tag_quote.get_text().strip()
        tag_quote.decompose()
        return [t.strip() for t in re.sub(r"^(tag:|tags:)\s*", "", tag_line, flags=re.I).split(",")]
    
    # 尝试从HTML注释提取
    for comment in content.find_all(string=lambda text: isinstance(text, Comment)):
        comment_text = comment.strip()
        if comment_text.lower().startswith(("tag:", "tags:")):
            return [t.strip() for t in re.sub(r"^(tag:|tags:)\s*", "", comment_text, flags=re.I).split(",")]
    
    # 手动输入作为保底
    manual_input = input(f"未找到标签，请输入以逗号分隔的标签: ")
    return [t.strip() for t in manual_input.split(",")]

def update_index_element(soup, selector, new_element, data_id):
    """更新索引页面中的元素"""
    existing = soup.select(f"{selector}[data-id='{data_id}']")
    if existing:
        for element in existing:
            element.replace_with(new_element)
        return False
    return True

def generate_repository_card(data_id, tags, path, title, modification_time, tags_i18n):
    """生成仓库卡片元素"""
    tag_spans = "".join(
        f'<span data-translatable>{tags_i18n.get(tag, tag)}</span>'
        for tag in tags
    )
    return BeautifulSoup(f'''
    <mdui-card clickable data-id="{data_id}" data-tags="{' '.join(tags)}" 
               href="{path}/index.html" variant="filled">
        <div class="cover-wrapper">
            <div class="cover-container" style="background-image: url({path}/cover.webp);"></div>
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
                    {tag_spans}
                </div>
            </div>
        </div>
    </mdui-card>
    ''', "html.parser")

def clean_orphaned_entries(index_soup, existing_ids):
    """清理首页中的孤立条目"""
    removed_count = 0
    
    # 清理仓库卡片
    for card in index_soup.select(".cards-wrap mdui-card"):
        data_id = card.attrs.get("data-id")
        if not data_id:
            logging.warning("发现无效卡片元素，无data-id属性")
            card.decompose()
            removed_count += 1
            continue
            
        if data_id not in existing_ids:
            logging.info(f"移除孤立卡片: {data_id}")
            card.decompose()
            removed_count += 1

    # 清理时间线条目
    for item in index_soup.select("#timeline > .main li"):
        data_id = item.attrs.get("data-id")
        if not data_id:
            logging.warning("发现无效时间线项，无data-id属性")
            item.decompose()
            removed_count += 1
            continue
            
        if data_id not in existing_ids:
            logging.info(f"移除时间线项: {data_id}")
            item.decompose()
            removed_count += 1

    logging.info(f"清理完成，共移除{removed_count}个孤立条目")

def process_article(article, tags_i18n):
    """处理文章转换"""
    output_dir = Path("articles") / article.path.parent.name
    output_dir.mkdir(parents=True, exist_ok=True)

    # Markdown转换
    result = subprocess.run(
        ["pandoc", str(article.path), "-t", "html"],
        capture_output=True, text=True, encoding="utf-8"
    )
    content = BeautifulSoup(result.stdout, "html.parser")

    # 加载模板
    template_file = TEMPLATE_DIR / "article-template.html"
    with open(template_file, "r", encoding="utf-8") as f:
        template = BeautifulSoup(f.read(), "html.parser")

    # 填充元数据
    template.title.string = article.title
    template.select_one(".post-info > h1").string = article.title

    # 时间处理
    for time_type, value in [("creation", article.safe_ctime),
                            ("modification", article.safe_mtime)]:
        element = template.select_one(f"time[data-desc='{time_type}']")
        element["datetime"] = time.strftime("%Y-%m-%d", value)
        element.string = time.strftime("%d.%m.%Y", value)

    # 标签处理
    tags = extract_tags(content)
    tags_wrapper = template.select_one(".meta-tags")
    tags_wrapper.clear()
    for tag in tags:
        span = template.new_tag("span", attrs={"data-translatable": True})
        span.string = tags_i18n.get(tag, tag)
        tags_wrapper.append(span)

    # 插入内容
    content_block = template.select_one(".article-wrap")
    content_block.append(deepcopy(content))

    # 保存文件
    output_file = output_dir / "index.html"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(str(template.prettify()))

    # 同步资源文件
    sync_assets(article.path.parent, output_dir)

    return {
        "data_id": article.data_id,
        "tags": tags,
        "path": f"/articles/{output_dir.name}",
        "title": article.title,
        "time": article.safe_mtime,
        "content": content.get_text(separator=" ", strip=True)[:200] + "..."
    }

def main():
    logging.info("开始构建流程")
    
    # 初始化索引页面
    index_file = Path("index.html")
    with open(index_file, "r", encoding="utf-8") as f:
        index_page = BeautifulSoup(f.read(), "html.parser")

    # 加载哈希记录
    try:
        file_hashes = json.loads(index_file.read_text(encoding="utf-8")) if HASH_FILE.exists() else {}
    except Exception as e:
        logging.error(f"加载哈希记录失败: {str(e)}")
        file_hashes = {}

    # 扫描所有现有内容
    all_content = []
    for source in CONTENT_SOURCES:
        for content_dir in list_content_directories(source):
            is_article = source == "_articles"
            metadata = scan_content_directory(content_dir, is_article)
            if metadata:
                all_content.append({
                    "metadata": metadata,
                    "source": source,
                    "content_dir": content_dir
                })

    # 生成有效ID集合
    valid_ids = {item["metadata"].data_id for item in all_content}
    logging.info(f"扫描到{len(valid_ids)}个有效内容项")

    # 检测需要更新的内容
    modified_content = []
    for item in all_content:
        content_hash = calculate_directory_hash(item["content_dir"])
        current_hash = file_hashes.get(item["metadata"].data_id, "")
        
        if FORCE_REBUILD or current_hash != content_hash:
            modified_content.append(item["metadata"])
            file_hashes[item["metadata"].data_id] = content_hash
            logging.info(f"检测到更新: {item['metadata'].title}")

    # 清理孤立条目
    clean_orphaned_entries(index_page, valid_ids)

    # 处理标签国际化
    tags_i18n = {btn["value"]: btn.text for btn in index_page.select("#repository mdui-segmented-button")}

    # 处理内容更新
    for item in modified_content:
        if item.path.suffix == ".md":
            article_data = process_article(item, tags_i18n)
            card = generate_repository_card(**article_data, tags_i18n=tags_i18n)
            update_index_element(index_page, ".cards-wrap mdui-card", card, article_data["data_id"])
        else:
            # 页面处理逻辑（与文章类似，根据需求实现）
            pass

    # 保存最终文件
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(str(index_page.prettify()))
    HASH_FILE.write_text(json.dumps(file_hashes, indent=4, ensure_ascii=False), encoding="utf-8")

    logging.info("构建流程完成")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logging.critical(f"构建过程发生严重错误: {str(e)}")
        raise