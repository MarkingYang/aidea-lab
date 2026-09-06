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
    return {"draft": f"待审核修复：{state['question']}"}


def review(state: State):
    print("进入审核节点")  # 用日志观察：恢复时会再次执行这里
    decision = interrupt({"draft": state["draft"]})
    if type(decision) is not bool:
        raise ValueError("审核结果必须是布尔值")
    return {"approved": decision}


def route(state: State):
    return "apply_plan" if state["approved"] else "reject"


def apply_plan(state: State):
    # 只返回演示文本，没有修改任何真实代码或配置。
    return {"outcome": "模拟执行修复：" + state["draft"]}


def reject(state: State):
    return {"outcome": "审核拒绝，未执行修复"}


builder = StateGraph(State)
builder.add_node("prepare", prepare)
builder.add_node("review", review)
builder.add_node("apply_plan", apply_plan)
builder.add_node("reject", reject)
builder.add_edge(START, "prepare")
builder.add_edge("prepare", "review")
builder.add_conditional_edges(
    "review", route, {"apply_plan": "apply_plan", "reject": "reject"}
)
builder.add_edge("apply_plan", END)
builder.add_edge("reject", END)
graph = builder.compile(checkpointer=InMemorySaver())

for thread_id, decision in [("approved-demo", True), ("rejected-demo", False)]:
    config = {"configurable": {"thread_id": thread_id}}
    paused = graph.invoke({
        "question": "将登录请求超时阈值从一秒提高到两秒",
        "draft": "", "approved": False, "outcome": "",
    }, config=config)
    assert paused["__interrupt__"] and paused["outcome"] == ""
    print("待审核：", paused["__interrupt__"][0].value)
    # 教学驱动器模拟外部审核结果；真实系统应接收已验证的审核输入。
    final = graph.invoke(Command(resume=decision), config=config)
    assert final["approved"] is decision
    assert final["outcome"].startswith("模拟执行修复" if decision else "审核拒绝")
    print(final["outcome"])
