# 零基础教程：用 Supabase 给网站加「免费数据库 + 后台」

> 面向**零基础小白**。Supabase 是一个**开源**的「数据库 + 后台 + 认证 + API」一体化平台，云端**全托管免费**，无需自己买服务器。
>
> ⭐ 本项目（booksway / NotionNext）**已经内置 `@supabase/supabase-js` 依赖**，并且已有真实使用范例：[lib/server/claude/contributionStore.js](lib/server/claude/contributionStore.js)。本教程的写法与该文件保持一致，可直接套用。

---

## 〇、Supabase 是什么？为什么选它？

| 你担心的问题 | Supabase 怎么解决 |
|-------------|------------------|
| 要不要自己买服务器跑数据库？ | ❌ 不用。数据库跑在 Supabase 云上，免费 |
| 要不要装 MySQL、配端口、做备份？ | ❌ 不用。点几下就建好一个 PostgreSQL |
| 没有后台管理界面怎么增删数据？ | ✅ 自带可视化表格后台，像 Excel 一样改数据 |
| 前端怎么连数据库？ | ✅ 一个 `createClient(url, key)` 就连上了 |
| 要不要写后端 API？ | ✅ 可不写，Supabase 自动生成 REST/SDK 接口 |

> 一句话：**Supabase = 免费的 Postgres 数据库 + 网页后台 + 自动 API**，特别适合「想要动态功能但不想运维服务器」的人。

### 免费额度（2026 年，上线前请再核实官网）
- 数据库：约 **500 MB**
- 文件存储：约 **1 GB**
- 月活用户认证：约 **5 万**
- ⚠️ 免费项目**长期无访问会被暂停**（再点一下可恢复），正式商用建议升级。

> 💡 注意：Supabase 的数据库是 **PostgreSQL**，不是 MySQL。但你之前确认「任何免费数据库都行」，而 Postgres 比免费 MySQL 选择更多、生态更好，所以是更优解。

---

## 一、注册并创建项目（5 分钟）

1. 打开 https://supabase.com/ → 点 **Start your project**，用 GitHub 账号登录（最方便）。
2. 进入后台点 **New project（新建项目）**。
3. 填写：
   - **Name**：项目名，如 `booksway-db`
   - **Database Password**：⭐ **数据库密码，务必复制保存到记事本**（之后连库会用到）
   - **Region（区域）**：选离你用户最近的，如 `Southeast Asia (Singapore)`
   - **Plan**：选 **Free**
4. 点 **Create new project**，等 1~2 分钟，项目就建好了。

---

## 二、⭐ 拿到连接密钥（最关键）

项目建好后，左侧菜单点 **Project Settings（齿轮图标）→ API**，你会看到三个关键信息，**全部复制到记事本**：

| 名称 | 在 Supabase 里叫 | 对应本项目环境变量 | 用途 |
|------|-----------------|-------------------|------|
| 项目地址 | **Project URL** | `SUPABASE_URL` | 数据库的网址 |
| 公开密钥 | **anon / public key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 前端用，安全可公开 |
| 服务密钥 | **service_role key** | `SUPABASE_SECRET_KEY`（或 `SUPABASE_SERVICE_ROLE_KEY`） | 后端用，**绝不能泄露** |

> ❗ **安全警告**：`service_role key` 拥有数据库全部权限，只能放在**服务端环境变量**里，**绝对不要**写进前端代码或提交到 GitHub。本项目正是用它做服务端读写（见 contributionStore.js）。

---

## 三、在 Supabase 后台建一张表（可视化，不用写 SQL）

以做一个「留言/评论」表为例：

1. 左侧菜单点 **Table Editor（表编辑器）→ New table**。
2. 填写：
   - **Name**：`messages`
   - 勾选 **Enable Row Level Security (RLS)**（行级安全，先勾上，第五章再讲）
3. 添加字段（Columns），点 **Add column**：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | `int8`（默认主键，自增） | 系统已自带 |
| `created_at` | `timestamptz`（默认） | 系统已自带，创建时间 |
| `name` | `text` | 留言人昵称 |
| `content` | `text` | 留言内容 |
| `page_slug` | `text` | 属于哪篇文章 |

4. 点 **Save**。一张表就建好了，像 Excel 一样能直接在后台看/改数据。

> 💡 也可以用 SQL：左侧 **SQL Editor** 粘贴下面语句一键建表：
> ```sql
> create table messages (
>   id bigint generated always as identity primary key,
>   created_at timestamptz default now(),
>   name text,
>   content text,
>   page_slug text
> );
> ```

---

## 四、把密钥填进项目（环境变量）

### 4.1 本地开发（在项目根目录建 `.env.local`）

在项目根目录下新建文件 `.env.local`，写入：

```bash
# 服务端读写用（私密，本项目 contributionStore.js 读取的就是这两个）
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SECRET_KEY=你的_service_role_key

# 前端读取用（可公开）
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
```

> ⚠️ `.env.local` 已被 `.gitignore` 忽略，不会上传到 GitHub，密钥安全。

### 4.2 线上部署（Cloudflare Pages / Vercel）

在托管平台的 **Settings → Environment variables** 里，把上面 4 个变量**逐条添加**（值一样）。改完后**重新部署**一次才会生效。

---

## 五、⭐ 必做：配置访问权限（RLS 行级安全）

刚才勾选了 RLS，意味着**默认任何人都读不到、写不进**这张表。你得显式开权限，否则前端会报「权限不足」。

进入 **Authentication → Policies**（或 Table Editor 里选表 → RLS Policies），按需求加策略。

**示例：允许所有人「读」留言，但只能用服务端密钥「写」**

左侧 SQL Editor 执行：
```sql
-- 允许任何人读取留言
create policy "anyone can read messages"
on messages for select
to anon
using (true);
```
- 读：用前端的 `anon key` 即可（上面这条策略放开了 select）。
- 写：用服务端的 `service_role key`，它**绕过 RLS**，所以无需额外写策略，但只能在服务端 API 里用（见下一章）。

> 🔒 安全原则：**前端只用 anon key 做受限操作，敏感写入一律走服务端 API + service_role key。** 本项目 contributionStore.js 就是这么做的。

---

## 六、在代码里读写数据（贴合本项目写法）

### 6.1 创建一个 Supabase 客户端（参照 contributionStore.js）

新建 `lib/server/supabaseClient.js`：
```js
import { createClient } from '@supabase/supabase-js'

let client = null

export const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) return null
  if (client) return client
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  return client
}
```
> 这段几乎照搬了项目里 [lib/server/claude/contributionStore.js:153-165](lib/server/claude/contributionStore.js#L153-L165) 的模式。

### 6.2 写一个 API：提交留言（服务端写）

新建 `pages/api/messages/create.js`：
```js
import { getSupabaseClient } from '@/lib/server/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, content, page_slug } = req.body || {}
  if (!content) return res.status(400).json({ error: 'content 必填' })

  const supabase = getSupabaseClient()
  if (!supabase) return res.status(500).json({ error: 'Supabase 未配置' })

  const { data, error } = await supabase
    .from('messages')
    .insert({ name, content, page_slug })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true, message: data })
}
```

### 6.3 读取留言

新建 `pages/api/messages/list.js`：
```js
import { getSupabaseClient } from '@/lib/server/supabaseClient'

export default async function handler(req, res) {
  const supabase = getSupabaseClient()
  if (!supabase) return res.status(500).json({ error: 'Supabase 未配置' })

  const { data, error } = await supabase
    .from('messages')
    .select('id, name, content, page_slug, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ messages: data || [] })
}
```

### 6.4 前端调用（任意组件里）
```js
// 提交
await fetch('/api/messages/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '小明', content: '沙发！', page_slug: '/hello' })
})

// 读取
const { messages } = await (await fetch('/api/messages/list')).json()
```

---

## 七、本地测试

```bash
yarn dev      # 启动本地服务 http://localhost:3000
```
触发提交/读取后，回到 Supabase 后台 **Table Editor → messages**，能看到新数据进来即成功。

---

## ⚠️ 八、和 Cloudflare 静态导出方案的冲突（重要）

你前面用的是 **Cloudflare Pages 静态导出（`yarn export`）**。静态导出会**把 `pages/api/*` 这些后端接口丢弃**——也就是说上面写的 API 在纯静态站上**跑不起来**。

解决办法二选一：

| 方案 | 做法 | 适合 |
|------|------|------|
| **A. 改用 Vercel 部署** | Vercel 支持 Next.js 的 API 路由和 SSR，Supabase API 直接能跑 | ⭐ 推荐，想要动态功能就别用纯静态 |
| **B. 前端直连 Supabase** | 不走 `/api`，前端用 `anon key` 直接调 Supabase，靠 RLS 策略保安全 | 想继续用 Cloudflare 静态 |

> 既然你要的是「动态功能」，**最顺的路径是换到 Vercel**（同样免费、同样连 GitHub 自动部署），让 Supabase 的服务端 API 正常工作。

---

## 九、速查表

| 项目 | 值 |
|------|-----|
| 平台 | Supabase（开源，云端免费托管） |
| 数据库 | PostgreSQL（免费约 500MB） |
| 必备密钥 | Project URL、anon key、service_role key |
| 本项目环境变量 | `SUPABASE_URL`、`SUPABASE_SECRET_KEY`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 现有参考代码 | lib/server/claude/contributionStore.js |
| 后台管理 | Table Editor（可视化增删改查） |
| 权限控制 | RLS 行级安全策略 |
| ⚠️ 与静态导出冲突 | API 路由在 `yarn export` 下失效，建议改 Vercel 或前端直连 |

---

> 📌 免费额度与政策（2026）变动较快，正式上线前请到 supabase.com/pricing 再核实一次。本教程代码写法基于项目已有的 `@supabase/supabase-js ^2.106.2` 及 contributionStore.js 实际用法整理。
