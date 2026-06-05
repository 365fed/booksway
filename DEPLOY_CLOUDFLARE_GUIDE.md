# 零基础小白：把 Booksway（NotionNext）部署到 Cloudflare Pages 全流程教程

> 本教程面向**完全没有编程基础**的小白，每一步都尽量写清楚「点哪里、填什么、为什么」。照着做即可上线一个属于你自己的网站。
>
> 本项目本质是 **NotionNext**（一个用 Notion 写文章、自动生成网站的开源系统）。Cloudflare 走的是 **静态导出（Static Export）** 方案，构建命令为 `yarn export`，输出目录为 `out`。

---

## 〇、先理解 5 个名词（1 分钟）

| 名词 | 大白话解释 |
|------|-----------|
| **Notion** | 一个在线笔记软件。你的网站文章就写在这里。 |
| **GitHub** | 存放网站源代码的「云端仓库」。Cloudflare 从这里读代码来建站。 |
| **Cloudflare Pages** | 免费的网站托管平台。它把代码变成能访问的网站。 |
| **静态导出** | 把网站提前「拍成照片」存起来，访问快、免费，但**改了 Notion 不会自动更新**，需要手动点一下重新部署。 |
| **环境变量** | 一堆「配置项」，比如告诉系统「我的 Notion 页面 ID 是多少」。 |

整体流程就一句话：
**Notion 写内容 → 代码放 GitHub → Cloudflare 读代码生成网站 → 绑定域名访问。**

---

## ⚠️ 一、动手前必须知道的 4 个限制

Cloudflare 用的是「静态导出」方案，所以有以下限制（很重要，先看）：

1. **不会自动更新**：你在 Notion 改了文章后，网站不会自动变。需要手动重新部署（后面有「自动更新」的进阶方法）。
2. **自带搜索功能用不了**：必须额外接入 **Algolia** 才有全文搜索。
3. **多语言功能不支持**：静态导出模式下多语言会失效。
4. **适用场景**：适合「访问量大、但更新不频繁」的网站。如果你需要**实时更新**，建议改用 Vercel 部署。

> 如果以上限制你不能接受，去看项目里的 Vercel 部署文档（`docs/user-guide/deploy-vercel.md`），那个支持实时更新。

---

## 二、准备工作（注册 3 个账号 + 准备 Notion 模板）

请先注册好以下三个账号（都免费，建议都用同一个邮箱）：

1. **Notion 账号** → https://www.notion.so/
2. **GitHub 账号** → https://github.com/
3. **Cloudflare 账号** → https://dash.cloudflare.com/sign-up

### 2.1 准备 Notion 内容模板

1. 打开作者提供的 NotionNext 模板页面（在项目 README 或官方文档里有模板链接），点右上角 **Duplicate / 复制** 按钮，把模板复制到你自己的 Notion 里。
2. 复制成功后，这个页面就是你网站的「内容数据库」。你以后写文章就在这里写。

### 2.2 ⭐ 拿到你的 NOTION_PAGE_ID（最关键的一步）

1. 在浏览器里打开你刚复制的那个 Notion 页面。
2. 看浏览器地址栏，网址长这样：
   ```
   https://www.notion.so/yourname/Booksway-02ab3b8678004aa69e9e415905ef32a5
   ```
3. 最后那一长串**没有连字符的 32 位字符**（`02ab3b8678004aa69e9e415905ef32a5`）就是你的 **NOTION_PAGE_ID**。
4. 把它**复制下来存到记事本**，后面要用。

> ❗ 注意：要把整个 Notion 页面设为「公开分享」。点页面右上角 **Share / 分享 → Publish / 发布到网络**，确保任何人可访问，否则网站读不到内容。

---

## 三、把代码复制到你自己的 GitHub（Fork）

Cloudflare 需要从 GitHub 读代码，所以先把项目「复制一份」到你的 GitHub 账号下。

### 方式 A：项目已在 GitHub 上（推荐）

1. 打开本项目的 GitHub 地址（即 booksway / NotionNext 仓库页面）。
2. 点击页面**右上角的 `Fork` 按钮**。
3. 在弹出页面点 **Create fork**，等几秒。
4. 完成后，浏览器地址会变成 `https://github.com/你的用户名/booksway`，说明代码已经在你账号下了。

### 方式 B：本地代码上传到 GitHub（如果项目只在你电脑里）

> 这一步需要在「终端 / 命令行」里操作。Mac 打开「终端」，Windows 用「Git Bash」。

```bash
# 1. 在 GitHub 网页上先点右上角 + → New repository，建一个空仓库，名字叫 booksway，
#    建完后复制它的地址，例如 https://github.com/你的用户名/booksway.git

# 2. 进入你的项目文件夹
cd /Users/jianghaihui/Desktop/work/github/booksway

# 3. 关联到你的 GitHub 仓库（把下面网址换成你自己的）
git remote add origin https://github.com/你的用户名/booksway.git

# 4. 推送代码上去
git push -u origin main
```

> 推送时若要求登录，用 GitHub 用户名 + **Personal Access Token**（在 GitHub → Settings → Developer settings → Tokens 里生成），不是登录密码。

---

## 四、在 Cloudflare 创建 Pages 项目（核心步骤）

### 4.1 进入 Pages

1. 登录 Cloudflare → https://dash.cloudflare.com/
2. 左侧菜单点 **Workers 和 Pages（Workers & Pages）**。
3. 点 **创建（Create）**。

> ⚠️ **特别注意（2026 新版界面）**：新版 Cloudflare 默认引导你部署 **Workers**，但本项目**不支持 Workers**，必须用 **Pages**。
> 在创建页面，往下找到不起眼的 **Pages** 选项卡 → 选择 **连接到 Git（Connect to Git）**。

### 4.2 连接 GitHub 并选择仓库

1. 点 **连接 GitHub（Connect GitHub）**，授权 Cloudflare 访问你的 GitHub。
2. 在仓库列表里选中你刚 Fork 的 **booksway** 仓库。
3. 点 **开始设置（Begin setup）**。

### 4.3 选择分支

- **生产分支（Production branch）** 选 `main` 即可。
  （NotionNext 4.0.9 之后的版本直接用 `main` 分支，无需切换到特殊分支。）

### 4.4 ⭐ 填写构建设置（最容易填错，仔细看）

往下滑到 **构建设置（Build settings）**，按下表填写：

| 设置项 | 填写内容 |
|--------|---------|
| 框架预设（Framework preset） | **None / 无**（不要选 Next.js！选了反而会报错） |
| 构建命令（Build command） | `yarn export` |
| 构建输出目录（Build output directory） | `out` |
| 根目录（Root directory） | 留空（默认） |

> 📌 记牢这三个：**命令 `yarn export`、输出目录 `out`、框架预设 None**。

### 4.5 ⭐ 配置环境变量（Environment variables）

在构建设置下方找到 **环境变量（Environment variables）**，点 **添加变量（Add variable）**，逐条加入：

| 变量名（Variable name） | 值（Value） | 说明 |
|------------------------|------------|------|
| `NOTION_PAGE_ID` | 你第 2.2 步复制的 32 位 ID | **必填**，你的内容来源 |
| `NODE_VERSION` | `20` | **必填**，新版 NotionNext 要求 Node 20 |
| `NEXT_PUBLIC_THEME` | `simple` | 主题名，可后续换 |
| `NEXT_PUBLIC_AUTHOR` | 你的名字 | 显示的作者名 |
| `NEXT_PUBLIC_LINK` | `https://你的项目名.pages.dev` | 站点网址，先随便填，部署后再回来改成真实域名 |

> 只有前两个（`NOTION_PAGE_ID`、`NODE_VERSION`）是**必填**，其余可选。变量名要**一字不差**，全大写、下划线不能错。

### 4.6 保存并部署

点击 **保存并部署（Save and Deploy）**。

接下来 Cloudflare 会自动开始构建，屏幕上会滚动一堆日志（这是正常的）。**首次构建约需 2~5 分钟**，耐心等待。

- ✅ 出现**绿色对勾** + 一个 `https://xxx.pages.dev` 网址 = 部署成功！点开就能看到你的网站。
- ❌ 出现**红色叉**或报错 = 看下面第六章 FAQ 排查。

---

## 五、绑定自定义域名（可选，让网址更好看）

默认网址是 `xxx.pages.dev`。如果你有自己的域名（如 `myblog.com`），可以绑定：

1. 进入你的 Pages 项目 → 顶部点 **自定义域（Custom domains）**。
2. 点 **设置自定义域（Set up a custom domain）**，输入你的域名 → 继续。
3. 按提示去你的**域名服务商后台**配置一条 **CNAME 记录**，指向 Cloudflare 给的地址。
4. 回到 Cloudflare 点 **激活域（Activate domain）**。
   - 如果你的域名本来就托管在 Cloudflare，几秒即可生效；其他服务商可能要等几分钟到几小时。
5. 生效后，记得回到 **第 4.5 步的环境变量**，把 `NEXT_PUBLIC_LINK` 改成你的真实域名，再重新部署一次。

---

## 六、常见报错排查（FAQ）

### Q1：构建失败，日志里出现 Yarn 迁移警告
日志里看到类似：
```
YN0070: Migrating from Yarn 1; automatically enabling the compatibility node-modules linker
```
**原因**：Cloudflare 升级了构建环境导致不兼容。
**解决**：在项目设置里把 **构建环境降级为旧版（Build system version → 切换到 v1/旧版）**，然后点 **重试部署（Retry deployment）**。

### Q2：网站打开是空白 / 读不到文章
- 检查 `NOTION_PAGE_ID` 是否填对（32 位、无连字符）。
- 检查 Notion 页面是否已 **Publish 发布到网络**（任何人可访问）。

### Q3：构建报错说找不到命令或 Node 版本问题
- 确认 `NODE_VERSION` 环境变量 = `20`。
- 确认构建命令是 `yarn export`，**不是** `npm run build`。

### Q4：搜索框点了没反应
- 静态导出**默认不支持自带搜索**，需接入 Algolia。参考项目文档 `docs/user-guide/config/algolia` 配置。

### Q5：怎么看详细错误日志？
进入 Pages 项目 → 找到失败的那次部署 → 点 **查看详情（View details）→ 构建日志（Build log）**，红色行就是错误原因。看不懂可以把日志复制下来求助。

---

## 七、⭐ 让网站「半自动更新」（进阶但推荐）

静态导出默认改了 Notion 不会更新。用 **Deploy Hook（部署挂钩）** 可以一键触发更新：

### 7.1 创建 Deploy Hook
1. 进入 Pages 项目 → **设置（Settings）→ 构建（Builds）→ 部署挂钩（Deploy hooks）**。
2. 点 **+ 添加部署挂钩**：
   - **挂钩名称**：随便起，如 `update-site`
   - **分支**：选 `main`
3. 创建后会生成一个网址（Webhook URL），**复制保存**。

### 7.2 触发更新（改完 Notion 后执行一次）

> ⚠️ Cloudflare 的 Hook **只接受 POST 请求**，直接在浏览器打开会提示 `method_not_allowed`，这是正常的防护。

在电脑「终端 / 命令行」里执行（把网址换成你自己的）：
```bash
curl -X POST https://你的hook地址
```
看到下面这样的返回，说明已成功触发重新部署：
```json
{
  "result": { "id": "64b89b29-..." },
  "success": true,
  "errors": [],
  "messages": []
}
```
等 2~5 分钟，网站就会更新成最新的 Notion 内容了。

> 💡 进阶玩法：可以把这个 Hook 链接做成手机快捷指令、或用定时任务每天自动 POST 一次，实现「定时更新」。

---

## 八、日常使用流程总结

```
① 在 Notion 里写 / 改文章
        ↓
② 执行一次 Deploy Hook（curl -X POST ...）触发部署
        ↓
③ 等 2~5 分钟，访问你的网址，内容已更新 ✅
```

如果你换了主题、改了配置（环境变量），同样需要在 Cloudflare 后台改完后点 **重新部署（Retry deployment / Redeploy）**。

---

## 九、关键信息速查表（建议贴在记事本）

| 项目 | 值 |
|------|-----|
| 部署平台 | Cloudflare **Pages**（不是 Workers！） |
| 框架预设 | None / 无 |
| 构建命令 | `yarn export` |
| 输出目录 | `out` |
| 必填环境变量 | `NOTION_PAGE_ID`、`NODE_VERSION=20` |
| 生产分支 | `main` |
| 默认网址 | `https://项目名.pages.dev` |
| 触发更新 | `curl -X POST <Deploy Hook 地址>` |
| 静态方案限制 | 不自动更新、不支持自带搜索（需 Algolia）、不支持多语言 |

---

## 十、还想要实时更新怎么办？

如果手动触发太麻烦，想要「改完 Notion 网站自动更新」，请改用 **Vercel 部署**（支持 ISR 实时更新，对小白同样友好）：参考项目内文档 `docs/user-guide/deploy-vercel.md`。

---

> 📚 本教程基于项目实际配置整理（`next.config.js` 的 export 模式、`package.json` 的 `yarn export` 脚本、官方 `docs/user-guide/deploy/cloudflare-pages.md`）。如官方文档有更新，以官方为准。


