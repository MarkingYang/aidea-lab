from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command
class State(TypedDict):
    draft: str
    approved: bool
def review(state: State):
    decision = interrupt(state["draft"])
    if type(decision) is not bool:
        raise ValueError("审核结果必须是布尔值")
    return {"approved": decision}
builder = StateGraph(State).add_node("review", review)
builder.add_edge(START, "review").add_edge("review", END)
graph = builder.compile(checkpointer=InMemorySaver())
config = {"configurable": {"thread_id": "demo"}}
print(graph.invoke({"draft": "将登录请求超时阈值从一秒提高到两秒", "approved": False}, config))
print(graph.invoke(Command(resume=True), config))
