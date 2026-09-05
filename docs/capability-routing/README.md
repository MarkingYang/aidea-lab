# 能力路由：架构、发现、执行与评测

路由文章归入“Agent Harness → 工具、协议与执行边界”。四篇分别处理架构、发现、执行与评测，复杂度取舍已合入评测篇。

## 阅读路线

| 篇章 | 阅读重点 | 配套图 |
| --- | --- | --- |
| [① 系统全景](../../src/content/writing/capability-routing-at-scale.md) | 能力类型、模块职责、离线与在线边界 | Mermaid 全景流程图 |
| [② 发现与检索](../../src/content/writing/capability-routing-discovery.md) | 描述、召回、正文与精排 | Mermaid 检索流程图 |
| [③ 方案与执行](../../src/content/writing/capability-routing-execution.md) | Skill / MCP / Agent 不同执行语义 | Mermaid 时序图 |
| [④ 评测与治理](../../src/content/writing/capability-routing-evaluation.md) | 失败定位、授权、状态与测量 | Mermaid 诊断流程图、状态图 |

图示源码直接保存在文章的 Mermaid 代码块中。每幅图包含图例或读图说明，站点已有缩放、复制、SVG 导出与全屏功能，不需要额外图表服务。公式使用站点现有 KaTeX。

阅读时间是含图表的估计，不包含动手时间；实验约需 10–20 分钟，真实服务接入时间另计。

## 环境与运行

需要 Python 3.9 或更高版本，仅使用标准库。以下命令在仓库根目录执行：

```bash
python3 docs/capability-routing/lab.py retrieve --query "会议 纪要"
python3 docs/capability-routing/lab.py retrieve --query "讨论 结论"
python3 docs/capability-routing/lab.py retrieve --query "讨论 结论" --body
python3 docs/capability-routing/lab.py fusion

python3 docs/capability-routing/lab.py execute --path skill
python3 docs/capability-routing/lab.py execute --path mcp
python3 docs/capability-routing/lab.py execute --path agent
python3 docs/capability-routing/lab.py execute --path skill --no-auth
python3 docs/capability-routing/lab.py execute --path skill --stale

python3 docs/capability-routing/lab.py evaluate
python3 -m unittest discover -s docs/capability-routing -p 'test_*.py'
python3 docs/capability-routing/lab.py scale --count 10000
```

## 应看到什么

- `会议 纪要`：选中 `summary.skill`，带群发效果的能力被过滤。
- `讨论 结论`：摘要匹配无结果；加 `--body` 后可找到摘要未包含的词项。
- `fusion`：融合两组固定排名，没有向量模型推理。
- 三种 `execute`：不同的模拟 trace，返回 `mode: simulation` 和私有模拟文档，效果不含消息发送。
- `--no-auth`：`NEEDS_AUTH`，不生成模拟产物。
- `--stale`：`BLOCKED`，不继续使用过期定义。
- `evaluate`：六条手写契约样本全部通过；不是六条真实业务成功案例。
- 单元测试：17 项，包括不可见目录、并列候选、缺依赖、最终策略复检和重排无法恢复漏召回。
- `scale`：准确构造指定数量的合成条目，输出一次线性扫描的耗时。这个数随机器和负载变化，不是 SLA、P95 或并发吞吐。

## 实验边界

本实验不访问网络，不读取凭证，不发送消息，不创建真实文档。Python 可能生成自身的字节码缓存；实验业务结果只打印到终端。

- 查询按空格分词，不实现通用中文分词、意图理解或否定约束解析。
- 使用词项重合度，不实现 Embedding、BM25 或 Cross-encoder。
- `body_rerank` 只是正文词项重排，用于说明信息与候选范围，不是 SkillRouter 模型。
- 限制来自显式结构化参数；目录中的副作用在这个受控样例中已知，不代表真实第三方自报字段可信。
- `execute --path` 显式选路径，不实现跨类型自主规划。
- MCP 与 Agent 路径均为模拟，不是 SDK / 协议集成测试。模拟 Agent 的效果约束并不能自动约束远程 Agent。
- 摘要是固定教学产物，不是 LLM 总结质量测试。
- 未实现写入超时核对、真实幂等、取消或异步重试；文章讨论它们的设计边界，不能据此宣称代码已经具备这些能力。
- 合成目录用于容量冒烟；效果需要真实目录和独立人工标注任务验证。

## 如何继续接到真实系统

1. 保持测试输入与结果契约，替换词项检索器；为实际 Embedding / 精排固定模型、版本及截断策略。
2. 将能力目录字段映射到真实来源，独立维护准入、权限和内容版本。
3. 在测试空间用真实 MCP 客户端替换模拟适配器，验证参数定义、授权与资源查询。
4. 为实际 Agent 建立最小输入和交付契约，验证其状态与结果接口；不要假设都支持取消。
5. 增加副作用、授权撤销、版本漂移与写入结果不确定的集成测试。
6. 再做离线回放、影子选择和低风险灰度，不把教学测试通过当成上线许可。
