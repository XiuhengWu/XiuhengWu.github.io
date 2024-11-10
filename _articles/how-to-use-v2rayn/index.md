# 详细介绍Windows端的免费翻墙方式——v2rayN

Tag: tutorial, article, chinese

## 0. 确保位于正确环境

1. 如果你在微信内部打开了该链接，请点击窗口标题栏的 **Internet标识** 以切换至系统默认浏览器。如果你未发现类似标识，请忽略此步。 
   ![img](./assets/img14.jpg)

## 1. 基本使用

1. 你可以使用以下方式来下载软件的自解压程序：
   访问网址：https://www.123pan.com/s/ArpbVv-7K3xh.html，点击**下载文件**，等待下载完成。（假如链接失效请通知作者）
   ![img](./assets/img0.jpg)
2. 打开下载的自解压程序，点击 **Extract**，等待解压完成。
   ![img](./assets/img1.jpg)
3. 进入解压目录下的 **v2rayN-With-Core-SelfContained** 文件夹，打开其中的 **v2rayN** 或 **v2rayN.exe**。
   ![img](./assets/img2.jpg)
4. 任意用鼠标右键一行，点击 **全选** 选中全部节点，再任意用鼠标右键一行，点击 **测试服务器真连接延迟(多选) (Ctrl + R)**。
   ![img](./assets/img3.jpg)
5. 将下方X轴滚动条向右拖动，查看测试结果。鼠标右键延迟最小的一行，点击 **设置为活动服务器**。（-1表示暂时无法连接该服务器）（不一定是图示的一栏，以实际情况为准）
   ![img](./assets/img4.jpg)
6. 然后 关闭当前v2rayN窗口，展开系统托盘区，右键v2rayN图标，点击 **自动配置系统代理**。
   ![img](./assets/img5.jpg)
7. 恭喜，现在自由互联网的大门才真正向你敞开！
   ![img](./assets/img6.jpg)

## 2. 其它设置

### 2.1 基本

#### 2.1.1 电脑重启后，如何再次启动v2rayN

1. 进入系统下载文件夹，执行 *第一部分 步骤3-步骤7*。
   ![img](./assets/img13.jpg)

#### 2.1.2 如何断开与服务器的连接，如何退出v2rayN

1. 打开托盘区，右键v2rayN图标展开快速设置菜单，点击**清除系统代理**。
   ![img](./assets/img7.jpg)
2. 同样是这个菜单，点击退出即可完全退出v2rayN程序。
   ![img](./assets/img8.jpg)

### 2.2 轻松使用

#### 2.2.1 显示与隐藏v2rayN主窗口

1. 当你关掉v2rayN的窗口时，其进程实际仍在后台运行。你可以通过单击托盘区的v2rayN图标重新召唤主窗口。
   ![img](./assets/img9.jpg)

#### 2.2.2 使用快捷键以更方便地 连接/断开 VPN

1. 打开v2rayN主窗口，点击设置图标，再点击 **全局热键设置**。
   ![img](./assets/img10.jpg)
2. 用鼠标在**自动配置系统代理**输入框内单击，然后按下你想要使用的快捷键（注意不是输入），最后点击 **确定**。
   ![img](./assets/img11.jpg)

### 2.3 问题排查

#### 2.3.1 修复 连接后仍然不起作用的问题

1. 由于我们使用的都是免费节点，所以难免出现连接不稳定的现象，这时可能需要重新切换VPN服务器：打开v2rayN，重复 *第一部分 步骤3-步骤7* ，来选择最当前最适合的服务器。
   ![img](./assets/img12.jpg)

## 3. 附录

- v2rayN是开源软件，其仓库位于https://github.com/2dust/v2rayN，目前我所提供的版本是截至2023.10.14的最新Windows x64 release 正式版本，[你可以参见此处](https://github.com/2dust/v2rayN/releases/)。
- 目前我提供的免费节点都来源于互联网，你也可以[通过谷歌搜索获取更多免费节点](https://www.google.com/search?q=v2ray免费节点&newwindow=1&sca_esv=573435106&sxsrf=AM9HkKkiRQspuzMvNTAGT6xmQP7AnqBjoQ%3A1697284699528&ei=W4IqZd_bH8Xn2roPsbad2AQ&ved=0ahUKEwif9eOcvvWBAxXFs1YBHTFbB0sQ4dUDCBA&uact=5&oq=v2ray免费节点&gs_lp=Egxnd3Mtd2l6LXNlcnAiEXYycmF55YWN6LS56IqC54K5MgQQABhHMgQQABhHMgQQABhHMgQQABhHMgQQABhHMgQQABhHMgQQABhHMgQQABhHMgQQABhHMgQQABhHSIsJUIMHWIMHcAF4ApABAJgBAKABAKoBALgBA8gBAPgBAcICChAAGEcY1gQYsAPiAwQYACBBiAYBkAYK&sclient=gws-wiz-serp)，但请注意并非每个来源于互联网的节点都免费、安全、可靠。
- 免费的节点可能只在一段时间内可用，如果希望连接更加稳定快速，推荐一个付费的VPN客户端：[Express VPN](https://www.expressvpn.com/)。