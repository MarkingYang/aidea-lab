---
title: LangChain：模型、工具、中间件与 Agent 装配
description: LangChain 的分析对象是高层 Agent 构建接口：模型、工具、消息和行为扩展如何接成一条循环。以下沿用 2026-09-05 核对的官方 Python 文档，以查错码的知识库助手说明装配方式和应用仍需承担的责任。
publishedAt: 2026-09-05
updatedAt: 2026-09-07
type: essay
status: growing
topics:
  - Agent Harness
  - AI 工程
  - LangChain
  - LangGraph
  - MCP
featured: false
readingTime: 7 min
---

<a id="langchain-langgraph-frameworks-and-protocols"></a>

LangChain 的分析对象是高层 Agent 构建接口：模型、工具、消息和行为扩展如何接成一条循环。以下沿用 2026-09-05 核对的官方 Python 文档，以查错码的知识库助手说明装配方式和应用仍需承担的责任。

## 先分清协议、框架和运行时

协议约定系统之间怎样交换信息。框架提供开发者使用的接口与组织方式。运行时负责把定义好的计算执行起来，管理状态与调度。

这几个概念可以同时出现在一个系统里：

| 对象 | 在知识库助手里的职责 | 开发者主要定义什么 |
| --- | --- | --- |
| LangChain | 连接模型和工具，建立常见 Agent 循环 | 模型、工具、指令、结构化输出及行为扩展 |
| LangGraph | 编排检索、审核、等待与提交步骤 | 状态、节点、转移条件和恢复位置 |
| MCP | 让助手访问另一个进程或服务提供的能力 | 客户端与服务端遵守的交互约定 |
| 业务后端 | 真正保存工单、检查权限、分配编号 | 业务规则、数据约束和写入接口 |

这里的 MCP 指 Model Context Protocol。其规范定义 host、client、server 等角色；它并不要求参与系统使用 LangChain 或 LangGraph。[MCP 架构规范，2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/architecture)

假设知识库已经提供 MCP 服务，Agent 应用可以通过适配层把服务端工具交给 LangChain，再在 LangGraph 编排的某个步骤里调用。也可以直接调用本地函数或 HTTP API。是否使用协议，与是否采用图编排，是两项独立选择。

一种组合方式。外层图负责业务步骤，内层 Agent 负责局部查询；这里的外层图由应用显式定义，不是在展开 LangChain Agent 自身的内部图。

## LangChain：把模型和工具组织成可用的 Agent

知识库助手的第一版，可以只有一个工具：根据错误码查文档。模型收到问题，决定是否调用工具；应用执行工具，把结果交回模型；模型根据结果继续查询或回答。

LangChain 的 `create_agent` 提供这类常见循环的入口。开发者可以传入模型、工具和系统指令，也可以用结构化输出约束最终返回值。需要改变调用前后的行为时，再通过 middleware 扩展。[Agents 官方文档](https://docs.langchain.com/oss/python/langchain/agents)

下面是一个最小装配示例。它需要安装 `langchain` 和 `langchain-openai`，配置 `OPENAI_API_KEY`，并把 `CHAT_MODEL` 设为账号可用且支持工具调用的模型名称。检索函数使用本地教学数据，不会访问真实知识库。

```python
import os

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def lookup_error(code: str) -> str:
    """按完整错误码查询教学知识库；没有记录时明确返回未找到。"""
    records = {
        "DEMO-429": "教学记录：请求频率超过限制。建议降低并发并检查重试策略。"
    }
    return records.get(code, "未找到对应记录，请补充日志或查阅原始文档。")

agent = create_agent(
    model=ChatOpenAI(model=os.environ["CHAT_MODEL"]),
    tools=[lookup_error],
    system_prompt="先查询知识库再解释错误。区分已知事实与推测，不编造工单编号。",
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "DEMO-429 是什么原因？"}]
})
print(result["messages"][-1].content)
```

这段代码展示的是接口装配，模型调用结果取决于所选模型与运行配置；本文没有对这一段执行真实模型请求。

值得注意的是，**工具描述帮助模型理解用途，工具实现决定实际发生什么。** “不编造工单编号”可以写进提示词，但真正的编号仍然必须来自业务系统。把类型标成 `str`，也不会自动检查调用者是否有权限读取某个项目。

随着需求增加，可以让助手输出 `summary`、`evidence`、`missing_fields` 等字段。字段结构通过校验，只说明数据符合预期形状；“证据确实支持结论”还需要另行验收。这是应用的责任，无法通过换一个 Agent 构造函数消除。

### 不要让旧教程决定今天的架构

LangChain 的名称容易让人联想到线性的“提示词 → 模型 → 解析器”。这样的组合仍然有用途，但不能据此推断它只能执行直线流程，也不能把旧示例里的 Agent 入口直接当成当前推荐写法。

官方 v1 迁移指南把 `create_agent` 作为新的 Agent 入口，并说明了旧功能向 `langchain-classic` 的迁移。阅读教程时，先核对包版本、导入路径和对应文档，再判断示例是否适用于项目。[LangChain v1 迁移指南](https://docs.langchain.com/oss/python/migrate/langchain-v1)

## MCP 如何接进来？

当知识库从本地函数变成独立服务，需要解决的是能力接入。MCP 适配层可以发现服务端工具，并将其转为 LangChain Agent 可使用的工具对象；LangGraph 则继续管理“何时查询、结果交给谁、下一步是什么”。官方文档提供了对应的 MCP 接入方式，具体导入路径应与项目锁定版本一致。[LangChain MCP 文档](https://docs.langchain.com/oss/python/langchain/mcp)

这里存在三种不同的约定：

| 约定 | 例子 | 出错时检查哪里 |
| --- | --- | --- |
| 通信协议 | 客户端发现并调用知识库工具 | 协议版本、连接、能力协商及返回消息 |
| 框架接口 | 工具接收 `code`，返回可交给模型的内容 | 参数定义、适配器和工具实现 |
| 业务契约 | 无权访问的项目不得读取，工单不可重复创建 | 身份、权限、后端约束和操作记录 |

三者都会影响系统能否完成任务，但修复方式不同。服务端工具调用成功，只能说明那次调用按接口返回；还需要检查结果是否属于当前项目、是否足够回答问题。相关握手与目录更新问题，可以阅读[MCP 生命周期](/writing/harness-foundations-mcp-lifecycle/)。

## 怎样选：让任务复杂度决定抽象层级

以下是基于本文场景的工程判断，并非性能基准或通用排名：

| 当前需求 | 合理起点 | 何时考虑进一步编排 |
| --- | --- | --- |
| 一次提取、分类或总结 | 模型 SDK 加输入输出校验 | 开始出现多步依赖和恢复要求 |
| 模型需要自行选择少量工具 | LangChain `create_agent` | 通用工具循环难以清楚表达业务阶段 |
| 有明确分支、人工等待和长任务 | 显式 LangGraph 工作流 | 按真实故障细化节点与存储设计 |
| 已有成熟业务工作流 | 保留现有编排，在局部接入模型 | 现有系统难以表达所需 Agent 行为时再评估 |
| 工具要被多个应用复用 | 评估 MCP 接口 | 与上述各项组合，不替代业务编排 |

LangChain Agent 本身已经构建在 LangGraph 上，因此不是遇到“需要状态”就必须重写成手工图。是否进一步显式定义外层流程，取决于哪些步骤需要由业务代码掌握，以及这些步骤是否需要独立检查和恢复。

对知识库助手，我会先做能验证价值的查询版本：它能否找到正确资料，能否承认证据不足？然后加入结构化提案；真正出现审核等待与跨步骤恢复需求时，再明确组织外层图。这样的演进有一个可以持续检查的标准：每增加一层结构，都应该让某个具体故障更容易定位、让某项业务责任更清楚。

需要进一步比较图式编排与其他运行方式时，使用[三种架构的同题实验](/writing/harness-architecture-selection/)。[LangGraph 运行时研究](/writing/langgraph-runtime-architecture/)给出暂停恢复实验；架构对照实验另行验证持久检查点与业务资源。

显式状态、Reducer、检查点和审核恢复的机制，见 [LangGraph：状态、节点、检查点与中断恢复](/writing/langgraph-runtime-architecture/)。
