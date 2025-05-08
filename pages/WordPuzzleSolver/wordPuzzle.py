import time

def find_words_in_matrix(matrix, words):
    """
    在字母矩阵中查找给定的单词（仅搜索水平和垂直方向）。
    
    参数：
      matrix - 二维列表，每个元素为单个字母（如 [['J','E','S','U','S'], ...]）
      words  - 单词列表（均为大写、无空格），例如 ["JESUS", "JOEL", "DAVID", ...]
    
    返回：
      列表，每项为 (单词, (起始行, 起始列), (终止行, 终止列))
    """
    # 将单词列表转换为集合以便快速精确匹配，并生成所有单词所有可能前缀（用于剪枝）
    word_set = set(words)
    prefix_set = set()
    for word in words:
        for i in range(1, len(word) + 1):
            prefix_set.add(word[:i])
    
    results = []
    rows = len(matrix)
    cols = len(matrix[0]) if rows > 0 else 0

    # 定义上下左右四个方向 (行增量, 列增量)
    directions = {
        'up': (-1, 0),
        'down': (1, 0),
        'left': (0, -1),
        'right': (0, 1)
    }
    
    # 遍历每个起点
    for i in range(rows):
        for j in range(cols):
            for dr, dc in directions.values():
                current_str = ""
                x, y = i, j
                # 沿当前方向延伸，直到超出矩阵边界
                while 0 <= x < rows and 0 <= y < cols:
                    current_str += matrix[x][y]
                    # 当前字符串不再是任何单词的前缀，则剪枝退出
                    if current_str not in prefix_set:
                        break
                    # 如果恰好匹配一个完整单词，则记录结果
                    if current_str in word_set:
                        results.append((current_str, (i, j), (x, y)))
                    x += dr
                    y += dc
    return results

def mark_found_positions_with_colors(found_list, color_codes):
    """
    根据 found_list 中每个找到的单词的起止坐标，
    分配一个背景颜色，并返回一个字典：
      键为 (行, 列)，值为对应的背景颜色代码。
    如果同一坐标属于多个单词，则采用第一个赋予的颜色。
    """
    mapping = {}
    for index, (word, (r0, c0), (r1, c1)) in enumerate(found_list):
        # 为每个单词依次分配一个背景色（超出列表长度时循环使用）
        color = color_codes[index % len(color_codes)]
        if r0 == r1:
            # 水平单词
            step = 1 if c1 >= c0 else -1
            for c in range(c0, c1 + step, step):
                if (r0, c) not in mapping:
                    mapping[(r0, c)] = color
        elif c0 == c1:
            # 垂直单词
            step = 1 if r1 >= r0 else -1
            for r in range(r0, r1 + step, step):
                if (r, c0) not in mapping:
                    mapping[(r, c0)] = color
    return mapping

def print_colored_matrix_with_bg(matrix, mapping, reset_code="\033[0m"):
    """
    重新输出字母方阵，其中 mapping 字典中出现的坐标使用其对应的背景颜色显示。
    """
    rows = len(matrix)
    cols = len(matrix[0]) if rows > 0 else 0
    for i in range(rows):
        row_str = ""
        for j in range(cols):
            ch = matrix[i][j]
            if (i, j) in mapping:
                row_str += f"{mapping[(i, j)]}{ch}{reset_code} "
            else:
                row_str += ch + " "
        print(row_str.strip())

if __name__ == "__main__":
    # 将整个字母方阵以多行字符串保存（每行字母之间以空格分隔）
    grid_str = """
    J E S U S J O E L B H I O B T U M N
    O H R E C D A V I D L Ö N F S F A A
    N O R E D M O S E Ö H O S E A S T H
    A J A K O B U S U S F L U N C T E M
    G Z T X G A L A T H I R Z H V H M I
    K L A G E L I E D E R G S E A N A I
    L A M A G U S T E L O J F S R S U A
    U T I M O T H E U S B K S W I E S Z
    K Z S P R Ü H H E J E F G Z A S K E
    A B R A H A M T R O R J R H J T Z F
    S E I T E P D G S T A L L K H W A A
    N F A N T R V G U E Q E D F E Ü N T
    G K V M W R E S W A D E H J K R T I
    C J D O M K D A N A E M A R K U S A
    X H E S E K I E L Z H A G G A I J W
    V A T E R G G H R U T L D F G H E A
    K A I S E R E R U I L E W S P T S P
    E T G O T T R T L Ö S A H Z E G A O
    B I B E L F R T Z R A C P Ü T E J S
    J E R E M I A A S R M H S R R N A T
    K O R I N T H E R O U I S T U G R E
    A P I L A T U S P E E I T E S E T L
    I L I A S D A N I E L U F T T L H G
    N E R T W D J O H A N N E S R T E E
    R I C H T E R M L P K Ö N I G E S S
    E J O S E F E B A B Y L O N F R S C
    D W J D N H O H E S L I E D E R A H
    C H U F O Z R E D V B P A B S T L I
    H B D G A K J E P H E S E R K L O C
    R N A H H J T H H D N A H U M P N H
    O M S F Ö F G H I S F I S D F S I T
    N T H K L D F G L G N T I T U S C E
    I M O B A D J A I H G E H I D H H Y
    K I G H J K N F P T C R O M E R E H
    A C D F G H K L P J K T J Z T J R M
    N H A B A K U K E B D G H J K K O I
    A A U I O J K L R Q W R P A U L M R
    A E S R A H P H I L E M O N L T F J
    N L R T Z R E T Z A A R O N G H G A
    F D F A L L H E B R A E R H J E T M
    T H O M A S G N M J A K O T R G K J
    W A L T E R G B K O L O S S E R G O
    J O H A N N E S B R I E F Z U I B P
    O F F E N B A R U N G N U M I C H A
    """
    # 处理矩阵：去除每行多余空格，每行拼接后转换为列表
    grid = []
    for line in grid_str.strip().splitlines():
        row = "".join(line.strip().split())
        grid.append(list(row))
    
    # 名字列表，包含旧约、新约的书名（德语及变体）及部分著名圣经人物
    names = [
        # -- Alttestamentliche Bücher --
        "GENESIS", "1MOSE", "EXODUS", "2MOSE", "LEVIITIKUS", "LEVITIKUS", "NUMERI", "DEUTERONOMIUM",
        "JOSUA", "RICHTER", "RUT", "1SAMUEL", "2SAMUEL", "1KÖNIGE", "2KÖNIGE", "1CHRONIK", "2CHRONIK",
        "ESRA", "NEHEMIA", "NEHEMIAH", "ESTER", "HIOB", "PSALMEN", "SPRÜCHE", "SPRUECHE", "PREDIGER", "KOHELET",
        "HOHESLIED", "HOHELIED", "JESAJA", "JESAJ", "JEREMIA", "JEREMIAH", "KLAGELIEDER", "HESEKIEL", "DANIEL",
        "HOSEA", "HOSEAS", "JOEL", "AMOS", "OBADJA", "JONA", "JONAS", "MICHA", "NAHUM", "HABAKUK",
        "ZEFANJA", "ZEPHANJA", "HAGGAI", "SACHARJA", "SACHARIA", "MALEACHI", "MALEACHIA",
        # -- Neutestamentliche Bücher --
        "MATTHÄUS", "MATTHAEUS", "MARKUS", "MARCUS", "LUKAS", "LUCAS", "JOHANNES", "IOANNES",
        "APOSTELGESCHICHTE", "RÖMER", "ROMER", "1KORINTHER", "2KORINTHER", "GALATER", "EPHESER",
        "PHILIPPER", "KOLOSSER", "1THESSALONICHER", "2THESSALONICHER", "1TIMOTHEUS", "2TIMOTHEUS",
        "TITUS", "PHILEMON", "HEBRAER", "HEBRÄER", "JAKOBUS", "1PETRUS", "2PETRUS", "1JOHANNES",
        "2JOHANNES", "3JOHANNES", "JUDAS", "OFFENBARUNG", "APOKALYPSE",
        # -- Bedeutende biblische Figuren --
        "JESUS", "DAVID", "MOSE", "ABRAHAM", "ISAAC", "ISAAK", "JAKOB", "JOSEF", "AARON", "SALOMO",
        "PILATUS", "APILATUS", "THOMAS", "PHILIP", "PHILIPPE"
    ]
    
    # 定义一组背景颜色 ANSI 代码（红、黄、紫、绿、蓝、青……）
    fg_colors = [
        "\033[31m",  # 红色前景
        "\033[33m",  # 黄色前景
        "\033[35m",  # 紫色前景
        "\033[32m",  # 绿色前景
        "\033[34m",  # 蓝色前景
        "\033[36m"   # 青色前景
    ]
    
    # 开始计时
    start_time = time.time()
    found = find_words_in_matrix(grid, names)
    end_time = time.time()
    runtime = end_time - start_time

    # 输出运行时间（秒，保留3位小数）
    print(f"运行时间: {runtime:.3f} 秒\n")
    
    # 输出每个找到的名字的起始和终止坐标（同一名字多次出现则均输出）
    print("各单词的起始和终止坐标：")
    for word, start, end in found:
        print(f"{word}: {start} - {end}")
    print()

    
    # 根据 found 列表分配不同背景色，并生成一个坐标到背景色的映射字典
    mapping = mark_found_positions_with_colors(found, fg_colors)
    
    # 输出重新标记背景色的字母方阵
    print("标记后的字母方阵：")
    print_colored_matrix_with_bg(grid, mapping)
