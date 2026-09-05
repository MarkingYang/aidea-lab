import unittest
from lab import (CATALOG, body_rerank, evaluate, execute,
                 retrieve, rrf, scale, select)


class RoutingContracts(unittest.TestCase):
    def test_basic_selection(self):
        self.assertEqual(select(retrieve("会议 纪要"))["id"], "summary.skill")

    def test_forbidden_effect_is_filtered(self):
        self.assertNotIn("summary-send.skill",
                         [item["id"] for item in retrieve("会议 纪要")])

    def test_no_match(self):
        self.assertEqual(select(retrieve("烹饪"))["status"], "NO_MATCH")

    def test_empty_request(self):
        self.assertEqual(select(retrieve("  "))["status"], "NO_MATCH")

    def test_tenant_isolation(self):
        self.assertEqual(retrieve("秘密", use_body=True), [])

    def test_body_adds_information(self):
        self.assertEqual(retrieve("讨论 结论"), [])
        self.assertEqual(select(retrieve("讨论 结论", use_body=True))["id"],
                         "summary.skill")

    def test_ties_request_clarification(self):
        self.assertEqual(select(retrieve("会议"))["status"], "CLARIFY")

    def test_rrf_deduplicates_per_ranking(self):
        self.assertEqual(rrf([["b", "b", "a"], ["a"]]),
                         rrf([["b", "a"], ["a"]]))

    def test_reranker_cannot_restore_missing_candidate(self):
        self.assertNotIn("summary.skill", body_rerank(
            "讨论 结论", ["code.review"], CATALOG))

    def test_three_execution_semantics(self):
        traces = []
        for path in ("skill", "mcp", "agent"):
            result = execute(path)
            self.assertEqual(result["status"], "DONE")
            self.assertEqual(result["mode"], "simulation")
            self.assertEqual(result["artifact"]["acl"], "private")
            self.assertNotIn("message.send", result["artifact"]["effects"])
            traces.append(result["trace"])
        self.assertNotEqual(traces[0], traces[1])
        self.assertNotEqual(traces[1], traces[2])

    def test_authorization_stops_all_paths(self):
        for path in ("skill", "mcp", "agent"):
            result = execute(path, authorized=False)
            self.assertEqual(result["status"], "NEEDS_AUTH")
            self.assertNotIn("artifact", result)

    def test_version_change_blocks(self):
        self.assertEqual(execute("skill", stale=True)["status"], "BLOCKED")

    def test_missing_dependency(self):
        result = execute("skill", available={"meeting.read"})
        self.assertEqual(result["missing"], ["document.create"])
        self.assertEqual(result["status"], "BLOCKED")

    def test_final_policy_recheck(self):
        # Simulates a policy change after discovery.
        self.assertTrue(retrieve("文档 创建"))
        result = execute("mcp", forbidden={"document.create"})
        self.assertEqual(result["status"], "BLOCKED")
        self.assertNotIn("artifact", result)

    def test_contract_report(self):
        result = evaluate()
        self.assertEqual(result["passed"], result["total"])

    def test_synthetic_count(self):
        self.assertEqual(scale(10000)["catalog_entries"], 10000)

    def test_scale_rejects_invalid_count(self):
        with self.assertRaises(ValueError):
            scale(0)


if __name__ == "__main__":
    unittest.main()
