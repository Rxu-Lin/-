# 百库内容智能工具汇集

静态单页工具汇集网站，包含设计、推广、内容和 Photoshop 脚本分类入口。

## 文件

- `index.html`: 新版工具汇集首页。
- `path-converter.html`: 路径互换工具，可从首页“路径互换”卡片进入。
- `AI周报.html`: AI 周报页面，可从首页“AI周报”卡片进入。
- `legacy-kol-portal.html`: 旧版达人管理库页面备份，可从首页“达人管理库”卡片进入。

## 部署

可直接使用 GitHub Pages 从仓库根目录发布：

1. 推送 `index.html`、`path-converter.html`、`AI周报.html`、`legacy-kol-portal.html` 和 `.nojekyll`。
2. 在 GitHub 打开 **Settings > Pages**。
3. 将 **Source** 设置为 **Deploy from a branch**。
4. 选择默认分支和 `/ (root)`。

## 发布加固

运行以下命令可以重新生成更难阅读的发布版 HTML：

```powershell
npm.cmd run harden
```

该命令会压缩 HTML/CSS/JS、删除注释和多余空白、添加搜索引擎 noindex 标记，并加入轻量的右键/查看源码快捷键拦截。注意：公开网页无法真正防止复制，核心保护仍应依赖私有仓库和访问权限。
