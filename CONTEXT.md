# PersonalWeb 项目上下文

## 项目目的

这是 George Li 的个人网站项目，与简历资料仓库 `CV_Editing` 分开存放。网站作为个人介绍、精选作品集和联系入口，采用轻量静态网页，不依赖框架或构建工具。

## 本次需求与资料

- 用户希望根据自己的简历制作个人网站，并参考其 Instagram 和 LinkedIn 资料。
- Instagram：<https://www.instagram.com/geoseanlee/?hl=en>
- LinkedIn：<https://www.linkedin.com/in/george-li-o4a0eo49b9/>
- Instagram 提供的简介要点：George Li；温州背景；个人简介中含中文名「子璽」、台湾与澳洲经历，以及信仰相关文字。
- LinkedIn 所提供的资料要点：目前在 Gold Coast；攻读 Southern Cross University 护理硕士（2026–2028）；University of Sydney 计算机科学硕士（Distinction，2024–2025）；Soochow University 经济学学士（High Distinction，2019–2023）；近期经历包括 Mable 支持工作和 Touch of Pawfection 宠物美容。
- 仓库简历文件覆盖科技、医疗支持、餐饮零售等不同岗位，也提供多个软件和数字健康项目。网站采用更适合个人主页的综合叙述，而非照搬某一个求职版本。
- 个人联络邮箱取自简历：`geoseanlee@gmail.com`。

## 已完成内容

- `index.html`：英文单页个人网站，含个人介绍、精选项目、教育与经历时间线、社交链接和邮件联系入口。
- `styles.css`：暖色纸张与橄榄绿视觉风格、项目图形、响应式布局、键盘焦点样式和减少动态效果偏好支持。
- `script.js`：手机导航菜单交互、Escape 关闭菜单、自动更新页脚年份。
- 页面突出“code & care”的跨领域个人定位；精选项目包括 Blotz Task App、RenoPilot、Global Youth SDGs Summit 和 AI Health Management System。
- LinkedIn、Instagram、GitHub 均以新标签页外链方式打开；项目卡片链接至相应 GitHub 仓库。
- 出于隐私考虑，页面未公开简历中的家庭住址、电话号码或推荐人联系方式。
- 三个网站文件最初误放在 `CV_Editing` 根目录，之后依用户要求移至同级 `PersonalWeb` 目录；今后对网站的改动应仅在本项目进行。

## 运行与验证

在 `PersonalWeb` 目录使用 Python 内置静态服务器预览：

```sh
python3 -m http.server 8000
```

然后打开 <http://localhost:8000>。网站不需要安装依赖或构建步骤。

初版完成时已验证 JavaScript 语法、HTML 唯一 ID 与页内链接、响应式样式存在，并用本地 HTTP 服务器确认 HTML、CSS 和 JavaScript 均可成功提供。移动到新目录后，页面引用的 CSS/JS 仍与 HTML 同目录，路径无须调整。

## 对话结果摘要

用户先要求参考个人简历、Instagram 与 LinkedIn 创建个人网站。根据资料制作了暖色系、响应式单页网站，并确认本地静态服务器可预览。用户随后说明应创建独立网站项目，请求在 `/Users/geoseanlee/Documents/Code` 下新建 `PersonalWeb` 并将网站文件和本次对话结果收录于本文档。现网站文件已移至该目录；本文档记录项目背景、资料、实现和预览方式。
