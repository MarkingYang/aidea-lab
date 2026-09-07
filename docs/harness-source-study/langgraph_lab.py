"""No LLM: contrast joins, fan-out, and cross-process checkpoint recovery."""
import json
import operator
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Annotated, TypedDict

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send


class State(TypedDict):
    evidence: Annotated[list[str], operator.add]
    summaries: Annotated[list[list[str]], operator.add]


def join_case(explicit):
    graph = StateGraph(State)
    graph.add_node("a", lambda s: {"evidence": ["A"]})
    graph.add_node("b1", lambda s: {})
    graph.add_node("b2", lambda s: {"evidence": ["B"]})
    graph.add_node("merge", lambda s: {"summaries": [sorted(s["evidence"])]})
    graph.add_edge(START, "a")
    graph.add_edge(START, "b1")
    graph.add_edge("b1", "b2")
    if explicit:
        graph.add_edge(["a", "b2"], "merge")
    else:
        graph.add_edge("a", "merge")
        graph.add_edge("b2", "merge")
    graph.add_edge("merge", END)
    return graph.compile().invoke({"evidence": [], "summaries": []})["summaries"]


def fanout_case():
    graph = StateGraph(State)
    graph.add_node("read", lambda s: {"evidence": [s["source"]]})
    graph.add_node("merge", lambda s: {"summaries": [sorted(s["evidence"])]})
    graph.add_conditional_edges(START, lambda s: [Send("read", {"source": x}) for x in ["A", "B", "C"]])
    graph.add_edge("read", "merge")
    graph.add_edge("merge", END)
    return graph.compile().invoke({"evidence": [], "summaries": []})["summaries"]


def recovery_child(folder, phase):
    root = Path(folder)
    def record(name):
        with (root / (name + ".log")).open("a") as f:
            f.write("called\n")
    def a(state):
        record("a")
        return {"evidence": ["A"]}
    def b(state):
        record("b")
        if phase == "fail":
            time.sleep(0.1)  # allow A to finish and its pending write to be saved
            raise RuntimeError("injected B failure")
        return {"evidence": ["B"]}
    builder = StateGraph(State)
    builder.add_node("a", a)
    builder.add_node("b", b)
    builder.add_node("merge", lambda s: {"summaries": [sorted(s["evidence"])]})
    builder.add_edge(START, "a")
    builder.add_edge(START, "b")
    builder.add_edge(["a", "b"], "merge")
    builder.add_edge("merge", END)
    with SqliteSaver.from_conn_string(str(root / "checkpoints.sqlite")) as saver:
        graph = builder.compile(checkpointer=saver)
        cfg = {"configurable": {"thread_id": "recovery"}, "max_concurrency": 2}
        if phase == "fail":
            try:
                graph.invoke({"evidence": [], "summaries": []}, cfg, durability="sync")
            except RuntimeError as exc:
                assert str(exc) == "injected B failure"
            else:
                raise AssertionError("failure was not injected")
        else:
            result = graph.invoke(None, cfg, durability="sync")
            assert result["summaries"] == [["A", "B"]], result


def main():
    explicit = join_case(True)
    separate = join_case(False)
    fanout = fanout_case()
    assert explicit == [["A", "B"]], explicit
    assert separate == [["A"], ["A", "B"]], separate
    assert fanout == [["A", "B", "C"]], fanout
    with tempfile.TemporaryDirectory() as folder:
        for phase in ["fail", "resume"]:
            subprocess.run([sys.executable, __file__, folder, phase], check=True)
        calls = {x: len((Path(folder) / (x + ".log")).read_text().splitlines()) for x in ["a", "b"]}
        assert calls == {"a": 1, "b": 2}, calls
    result = {"explicit_barrier": explicit, "separate_edges": separate,
              "dynamic_send": fanout, "cross_process_calls": calls,
              "limitations": ["No LLM or external API", "Order is asserted only for this graph", "No multi-host or database-crash test"]}
    Path(__file__).with_name("langgraph-results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) == 3:
        recovery_child(*sys.argv[1:])
    else:
        main()
