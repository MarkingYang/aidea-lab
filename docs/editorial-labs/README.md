# 长文拆分系列：最小契约实验

这些示例服务于 Agent 评测、记忆与 AI 产品价值文章。仅使用 Python 标准库，不联网、不调用模型、不需要密钥、不写业务数据，也不安装第三方软件。

需要 Python 3.10 或以上。在仓库根目录运行：

```sh
python3 -m unittest discover -s docs/editorial-labs -p 'test_*.py' -v
python3 docs/editorial-labs/evaluation_lab.py
python3 docs/editorial-labs/memory_lab.py
```

## 评测实验

`evaluation_lab.py` 提供固定月报数据、候选结果与模拟审计记录。正常样本通过，月份错误、金额错误、未经授权外发、缺少审计、源文件变化等样本不通过。`pass_estimate` 实现 per-task 的 pass@k 与 pass^k 组合估计，测试与枚举结果逐项对照。

实验验证的是评分契约，不是 Agent 成功率。模拟审计由调用方传入；生产环境必须由独立可信采集器读取终态和事件，不能相信 Agent 自报的“未外发”。`artifact_readable` 只是模拟探针，不实际打开 PPT、PDF 或检查版式。示例没有真正的沙箱、服务端身份或防伪机制。

## 记忆实验

`memory_lab.py` 演示：先按可信身份范围过滤，再按有效时间选取事实，拒绝有歧义的重叠事实，排除失效或撤权记录，最后在字符预算内注入完整事实与来源。

一月读取上海、九月读取杭州；另一团队的同名用户不串记。杭州记录撤权后返回空值，不重新使用已经失效的上海记录。`active=False` 只模拟检索不可见，不是数据库物理删除，更没有覆盖缓存、备份或派生画像。

这不是向量检索性能测试，不实现 Mem0、OpenViking 或 TencentDB 的 SDK。身份参数必须由真实服务端认证注入。字符预算不是 Token 预算；生产环境应改用目标模型 tokenizer，并测试引用与摘要的完整性。

## 从教学走向实际项目

1. 保留固定任务、预期结果与反例；把模拟输入替换为脱敏的真实样本。
2. 加入执行适配器、隔离环境、可信身份、独立证据采集与状态重置。
3. 固定模型、工具、数据、评分器与预算版本；运行同任务多试次。
4. 分别记录覆盖率、完成率、人工投入、费用、延迟和安全门槛。
5. 验证删除传播、缓存失效、外部操作幂等与故障恢复；不要把此处单元测试当成生产验收。

## 文章与图表检查

`series.json` 记录本轮六个系列及阅读顺序。在仓库根目录运行：

```sh
node docs/editorial-labs/check-series.mjs
npm run build
```

前者检查 31 篇文章的前后导航、站内文章链接、图注、代码围栏与阅读时长标签。阅读时长为估计，不是读者实测：本轮采用正文汉字约 300 字/分钟、英文约 180 词/分钟，并计入图表和代码理解开销；实验时间另计。

浏览器 QA 需要已安装的 Playwright 和 Chrome，以及运行中的本地站点。设置 `EDITORIAL_PLAYWRIGHT_ROOT` 为本机现有 Playwright 所在的包目录再运行同一脚本；`EDITORIAL_BASE_URL` 默认 `http://localhost:4321`。脚本检查每篇图表与公式渲染，并检查六个入口的移动端页面溢出。可选 `EDITORIAL_SCREENSHOTS` 指向已存在的截图目录；不会自行安装浏览器或依赖。
