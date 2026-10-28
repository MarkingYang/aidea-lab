# 逐点详解版：来源复核与证据范围

日期：2026-10-06。正文新增的是教学解释、假设案例与选型方法；没有运行模型、训练、机器人、真实 Agent 或业务服务。官方能力、本文推断和未运行的验证设计在正文分别表述。

## 本轮新增引用

| 官方来源或原论文 | 用于说明 |
| --- | --- |
| [Transformer](https://arxiv.org/abs/1706.03762) | 自回归模型计算路径中注意力与表示变换的教学解释 |
| [Generation](https://huggingface.co/docs/transformers/main_classes/text_generation) | 解码参数与输出随机性 |
| [Elasticsearch RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion) | 按排名组合异构检索结果 |
| [JSON Schema object](https://json-schema.org/understanding-json-schema/reference/object) | properties、required 与 additionalProperties 的结构边界 |
| [PEFT Quantization](https://huggingface.co/docs/peft/developer_guides/quantization) | 量化基座与适配器训练组合 |
| [vLLM Paged Attention](https://docs.vllm.ai/en/latest/design/paged_attention/) | KV 分块管理与执行机制 |
| [PPO](https://arxiv.org/abs/1707.06347) | 策略采样与代理目标优化；正文强调裁剪不构成硬性更新保证 |

## 本轮复核既有来源

- [LoRA](https://arxiv.org/abs/2106.09685)、[DPO](https://arxiv.org/abs/2305.18290)、[InstructGPT](https://arxiv.org/abs/2203.02155)、[Mixtral](https://arxiv.org/abs/2401.04088)：训练方法与模型机制。
- [TRL SFT](https://huggingface.co/docs/trl/sft_trainer)、[TRL DPO](https://huggingface.co/docs/trl/dpo_trainer)：损失、参考模型与样本组织。正文的 DPO 概率数字是自拟算例。
- [vLLM Prefix Caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/)：前缀缓存与生成阶段的区别。
- [Anthropic Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)、[Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)：评测对象与控制方式。正文的退款案例、样本分母与发布示例是教学设计。
- [OWASP Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)、[Temporal Activities](https://docs.temporal.io/activities)、[LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)：信任、执行与状态职责。没有实测隔离或恢复。
- [Dify Agent](https://docs.dify.ai/en/cloud/use-dify/nodes/agent)、[Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/generative-orchestration)、[Agentforce Actions](https://developer.salesforce.com/docs/ai/agentforce/guide/ascript-ref-actions.html)：产品公开抽象。Dify 页面区分经典节点与新节点，后者标注 Beta / Workflow；微软页面标注 standard harness 范围。选型分析不推断未公开的厂商内部动机。
- [Diffusion Policy](https://arxiv.org/abs/2303.04137)、[OpenVLA](https://arxiv.org/abs/2406.09246)、[π0](https://arxiv.org/abs/2410.24164)、[DreamerV3](https://arxiv.org/abs/2301.04104)：动作生成与世界模型。没有把各论文的不同任务成功率当作产品横向排名。

## 验证边界

检查了原有来源和代码示例保留、88 个小节的链接、16 张图片加载、26 道自测题、JSON 语法和教学算术；阅读预览检查桌面与手机排版。检查通过不代表所有候选平台已经实施，也不代表安全性、训练收益或机器人成功率得到实测验证。

## 后续逐点教学复核（2026-10-06）

再次读取上列 RRF、LangGraph Persistence、Anthropic Agent Evals、LoRA、Dify Agent、Copilot Studio 和 Agentforce Actions 官方页面，以及 [AutoGen 官方仓库](https://github.com/microsoft/autogen)。RRF 算例只沿用其排名贡献公式；k=10、候选排名及分数是自拟教学数字。LangGraph 的 checkpointer / store 职责不被扩写成业务幂等保证。Dify 新节点的 Beta / Workflow 范围、微软指导的 standard harness 范围及 AutoGen 维护模式表述继续保留；Agentforce 的 `require_user_confirmation` 是动作配置，不是对后端授权与幂等的保证。

新增前置词义、88 组逐点追问与解答及 11 段推演属于教学编写。注意力权重、业务分布、配对结果、训练批量、人工成本、产能与回收期均为假设或机制简化，没有据此宣称候选系统的实测表现。19 项算术检查见 `teaching-arithmetic.json`；页面折叠、图片与导航检查见 `validation.json`。

## 机制与完整讲述复核（2026-10-06）

- [Transformer 全文](https://arxiv.org/html/1706.03762v7)：核对注意力、因果掩码、表示与 softmax 的关系；正文使用自拟双候选与向量算例，并区分原论文架构与具体大模型实现。
- [Faiss 索引说明](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes)：补充精确／近似搜索的层次与索引取舍。正文没有实际创建索引或测量召回。
- [Sentence Transformers 检索与重排](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html)：核对双编码器独立表示与交叉编码器联合评分；候选规模是教学说明，不是性能承诺。
- 复核既有 [Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)、[TRL SFT](https://huggingface.co/docs/trl/sft_trainer)、[Temporal Activities](https://docs.temporal.io/activities)，支持任务证据、损失范围与执行职责。评测比例、裁判分布与期限冲突是自拟案例。
- 读取 [InstructGPT 全文](https://arxiv.org/html/2203.02155v1) 和 [π0 全文](https://arxiv.org/html/2410.24164v1)，补充奖励／参考策略的区别，以及动作生成过程与物理执行时钟的区别；不扩写为当前产品能力或独立实验结果。

新增八步案例、14 段章节承接和 26 份完整参考回答属于教学综合。来源链接仍放在正文机制段落，参考回答通过小节链接回到原理与出处。13 项新增计算只核对数学与分母，不验证系统可靠性或学习效果。

## 逐章完整推演复核（2026-10-07）

复核既有 [Anthropic Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)、[Temporal Activities](https://docs.temporal.io/activities)、[LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) 和 [Dify Knowledge Retrieval](https://docs.dify.ai/en/cloud/use-dify/nodes/knowledge-retrieval) 官方说明，保持任务/试次/轨迹/终态、持久化与业务效果、检索与生成的责任边界。

新增内容是作者设计的 14 个教学推演，不新增厂商实测、内部架构或竞争排名主张。模型甲乙、八任务账本、成本、回本量和机器人分层数据均为假设。同行产品的选型条件沿用正文来源；推演用于设计待执行验证，不能视为已经验证的产品结果。当前验证与哈希见 `workshop-review.json`、`workshop-arithmetic.json` 及当前结构/页面检查记录。
