---
title: LangGraph：状态、节点、检查点与中断恢复
description: LangGraph 将运行过程表达为状态、节点和转移。以下沿用 2026-09-05 核对的官方 Python 文档，用“起草工单—等待审核—提交”追踪合并规则和恢复位置，区分图状态恢复与外部业务事实。
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
readingTime: 6 min
---

LangGraph 将运行过程表达为状态、节点和转移。以下沿用 2026-09-05 核对的官方 Python 文档，用“起草工单—等待审核—提交”追踪合并规则和恢复位置，区分图状态恢复与外部业务事实。

## LangGraph：让运行过程成为显式的数据与结构

用户现在提出新要求：“证据足够就起草工单，缺字段就停下来；我确认后才能提交。”

这个需求有两种不同的判断。怎样从文档中解释故障，可以交给模型；缺少必填字段时能否提交，应由业务规则决定。把后者写成一个明确分支，往往比反复提醒模型更容易检查。

LangGraph 的 Graph API 用 State、Node 和 Edge 表达运行过程：状态承载当前信息，节点执行工作并返回更新，边决定下一步。节点可以调用模型，也可以只是普通函数。[Graph API 官方文档](https://docs.langchain.com/oss/python/langgraph/graph-api)

| 元素 | 本例中的设计 | 需要提前想清楚的问题 |
| --- | --- | --- |
| State | 问题、证据、缺失字段、提案、审核结果 | 哪些是已核验事实，哪些只是候选内容？ |
| Node | 检索、检查、起草、审核、提交 | 本步完成后有什么可检查的产物？ |
| Edge | 证据够则起草；确认通过则提交 | 判断条件由业务代码还是模型提供？ |
| Reducer | 合并多个来源返回的证据 | 追加、覆盖、去重分别适用于哪些字段？ |

Reducer 是字段更新的合并规则。例如多个检索分支都写入证据列表，应用需要定义怎样汇合；不应假定共享一个字段就会自动得到正确的并发结果。

对本例而言，可以给证据分配来源 ID，再按 ID 保留记录。重复检索同一段文档，不应该被汇总成“两份独立证据”。这个语义需要由数据设计表达，画出分支和汇合箭头还不够。

知识库助手的业务流程示意。等待补充与等待审核是两个不同出口；实际应用需要分别定义后续输入怎样重新进入流程。
选择图编排的价值，在于这些分支与交接能被独立观察、检查和恢复。它不要求一个节点对应一个 Agent，也不要求所有节点都调用模型。关于反馈循环与执行图的进一步关系，可以接续[Loop Engineering 与 Graph Engineering](/writing/harness-engineering-loop/#loop-graph-engineering)。

## 可运行实验：暂停后，究竟从哪里继续？

下面把复杂业务缩小为“起草 → 审核 → 模拟提交”。实验不调用模型、不连接外部系统，方便直接观察 LangGraph 的控制流。本文已在 Python 3.12.13、LangGraph 1.2.11 下实际运行，验证了通过与拒绝两条路径，以及暂停时尚未提交的状态。

先安装依赖，然后把 Python 代码保存为 `review_demo.py` 运行：

```bash
python -m pip install "langgraph==1.2.11"
python review_demo.py
```

```python
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

class State(TypedDict):
    question: str
    draft: str
    approved: bool
    outcome: str

def prepare(state: State):
    return {"draft": f"待核查：{state['question']}"}

def review(state: State):
    print("进入审核节点")  # 用日志观察：恢复时会再次执行这里
    decision = interrupt({"draft": state["draft"]})
    if type(decision) is not bool:
        raise ValueError("审核结果必须是布尔值")
    return {"approved": decision}

def route(state: State):
    return "submit" if state["approved"] else "reject"

def submit(state: State):
    # 只返回演示文本，没有创建真实工单。
    return {"outcome": "模拟提交完成：" + state["draft"]}

def reject(state: State):
    return {"outcome": "审核拒绝，未提交"}

builder = StateGraph(State)
builder.add_node("prepare", prepare)
builder.add_node("review", review)
builder.add_node("submit", submit)
builder.add_node("reject", reject)
builder.add_edge(START, "prepare")
builder.add_edge("prepare", "review")
builder.add_conditional_edges(
    "review", route, {"submit": "submit", "reject": "reject"}
)
builder.add_edge("submit", END)
builder.add_edge("reject", END)
graph = builder.compile(checkpointer=InMemorySaver())

for thread_id, decision in [("approved-demo", True), ("rejected-demo", False)]:
    config = {"configurable": {"thread_id": thread_id}}
    paused = graph.invoke({
        "question": "DEMO-429 是否由并发过高引起？",
        "draft": "", "approved": False, "outcome": "",
    }, config=config)
    assert paused["__interrupt__"] and paused["outcome"] == ""
    print("待审核：", paused["__interrupt__"][0].value)
    # 教学驱动器模拟外部审核结果；真实系统应接收已验证的审核输入。
    final = graph.invoke(Command(resume=decision), config=config)
    assert final["approved"] is decision
    assert final["outcome"].startswith("模拟提交完成" if decision else "审核拒绝")
    print(final["outcome"])
```

通过与拒绝两条路径各自使用独立的 `thread_id`。第一次调用在审核处暂停，`outcome` 仍为空；第二次调用带回布尔结果，选择对应分支。

运行时，每条路径都会打印两次“进入审核节点”。这是关键观察：**恢复会重新进入发生中断的节点，`interrupt()` 之前的代码会再次执行。** 恢复时传入的值成为该次 `interrupt()` 的返回值；调用需要沿用原来的线程 ID。[Interrupts 官方文档](https://docs.langchain.com/oss/python/langgraph/interrupts)

因此，如果把发送通知、创建工单等外部写入放在这行日志的位置，就必须处理重复执行的后果。这个实验把审核与提交分开，是为了让控制边界可见；真正的提交节点仍然需要自己的故障处理。

## 持久化保存运行进度，业务系统保存最终事实

在 LangGraph 中，checkpointer 保存线程范围的图状态，store 保存图状态之外、可以跨线程使用的数据。前者适合当前任务的进度与恢复，后者适合用户偏好等跨任务信息。实验里的 `InMemorySaver` 只保存在内存中，进程退出后数据就会丢失。[Persistence 官方文档](https://docs.langchain.com/oss/python/langgraph/persistence)

把示例接到真实工单系统时，还有一个单靠 checkpoint 解决不了的窗口：

1. 提交接口成功创建了工单。
2. 网络连接断开，应用没有收到成功响应。
3. 运行状态中还没有保存工单编号。
4. 恢复后的应用必须决定查询还是重做。

此时，“没有记录成功”不能推出“没有创建成功”。一种业务实现是，在提交前生成并保存稳定的操作键，后端以该键约束重复写入；遇到结果未知，先按原键查询已有工单，再决定后续处理。

这里的操作键、权限检查与回读验收是应用设计建议，不是声明 LangGraph 自带业务事务保证。即使任务状态完整恢复，外部系统是否发生过写入，仍然要以该系统的事实为准。更完整的处理见[副作用恢复与对账](/writing/harness-engineering-recovery/)。

审核记录也应与提案内容关联。如果用户批准的是“只提交故障摘要”，后来模型又添加了敏感日志，不能继续复用原来的批准结果。最简单的办法是让审核绑定提案版本或内容摘要，提案变化时重新判断授权是否有效。

模型与工具的高层装配，见 [LangChain：模型、工具、中间件与 Agent 装配](/writing/langchain-agent-architecture/)。
