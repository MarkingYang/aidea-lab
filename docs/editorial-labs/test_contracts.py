from copy import deepcopy
from dataclasses import replace
from itertools import combinations
import unittest

from evaluation_lab import GOOD_AUDIT, GOOD_REPORT, SOURCE, demo, grade, pass_estimate
from memory_lab import FACTS, assemble


class EvaluationTests(unittest.TestCase):
    def run_grade(self, report=None, audit=GOOD_AUDIT, after=SOURCE):
        return grade(GOOD_REPORT if report is None else report, SOURCE, after, audit)

    def test_good(self):
        self.assertTrue(self.run_grade()["accepted"])

    def test_all_demo_negatives_fail(self):
        results = demo()
        self.assertTrue(results.pop("valid")["accepted"])
        self.assertTrue(all(not row["accepted"] for row in results.values()))

    def test_no_audit_fails_closed(self):
        self.assertFalse(self.run_grade(audit=None)["accepted"])

    def test_partial_audit_fails(self):
        self.assertFalse(self.run_grade(audit={"complete": False, "events": []})["accepted"])

    def test_unknown_action_fails(self):
        self.assertFalse(self.run_grade(audit={"complete": True, "events": [{"action": "unknown"}]})["accepted"])

    def test_malformed_event_fails(self):
        self.assertFalse(self.run_grade(audit={"complete": True, "events": [None]})["accepted"])

    def test_missing_region_fails(self):
        report = deepcopy(GOOD_REPORT)
        del report["totals_cents"]["west"]
        self.assertFalse(self.run_grade(report)["accepted"])

    def test_duplicate_source_fails(self):
        report = deepcopy(GOOD_REPORT)
        report["source_ids"].append("a")
        self.assertFalse(self.run_grade(report)["accepted"])

    def test_unreadable_fails(self):
        report = deepcopy(GOOD_REPORT)
        report["artifact_readable"] = False
        self.assertFalse(self.run_grade(report)["accepted"])

    def test_string_money_fails(self):
        report = deepcopy(GOOD_REPORT)
        report["totals_cents"]["east"] = "12000"
        self.assertFalse(self.run_grade(report)["accepted"])

    def test_grader_does_not_mutate_inputs(self):
        before = deepcopy((GOOD_REPORT, SOURCE, GOOD_AUDIT))
        self.run_grade()
        self.assertEqual(before, (GOOD_REPORT, SOURCE, GOOD_AUDIT))

    def test_combinatorial_estimates_against_enumeration(self):
        for n in range(1, 8):
            for c in range(n + 1):
                outcomes = [True] * c + [False] * (n - c)
                for k in range(1, n + 1):
                    samples = list(combinations(outcomes, k))
                    self.assertAlmostEqual(pass_estimate(n, c, k), sum(map(any, samples)) / len(samples))
                    self.assertAlmostEqual(pass_estimate(n, c, k, all_success=True), sum(map(all, samples)) / len(samples))

    def test_invalid_estimator_parameters(self):
        for args in [(0, 0, 1), (3, 4, 1), (3, 1, 4), (3, 1, 0), (True, 1, 1)]:
            with self.assertRaises(ValueError):
                pass_estimate(*args)


class MemoryTests(unittest.TestCase):
    def read(self, facts=FACTS, **kwargs):
        params = dict(tenant="team-a", user="alice", as_of="2026-09-05", budget_chars=200)
        params.update(kwargs)
        return assemble(facts, **params)

    def test_current(self):
        self.assertIn("杭州", self.read())
        self.assertNotIn("上海", self.read())

    def test_historical(self):
        self.assertIn("上海", self.read(as_of="2026-01-15"))

    def test_exact_validity_boundary(self):
        self.assertIn("杭州", self.read(as_of="2026-06-01"))

    def test_no_cross_tenant(self):
        self.assertNotIn("北京", self.read())
        self.assertIn("北京", self.read(tenant="team-b"))

    def test_no_cross_user(self):
        self.assertEqual("", self.read(user="bob"))

    def test_revocation_does_not_resurrect_expired_fact(self):
        self.assertEqual("", self.read(revoked_ids={"hz"}))

    def test_inactive_fact(self):
        facts = [replace(x, active=False) if x.id == "hz" else x for x in FACTS]
        self.assertEqual("", self.read(facts))

    def test_budget_preserves_whole_fact(self):
        text = self.read()
        self.assertEqual("", self.read(budget_chars=len(text) - 1))
        self.assertEqual(text, self.read(budget_chars=len(text)))

    def test_ambiguous_overlap_fails(self):
        with self.assertRaises(ValueError):
            self.read(FACTS + [replace(FACTS[1], id="conflict", value="南京")])

    def test_missing_source_fails(self):
        with self.assertRaises(ValueError):
            self.read([replace(FACTS[1], source_ref="")])

    def test_bad_identity_or_budget_fails(self):
        for args in [dict(tenant=""), dict(budget_chars=-1), dict(budget_chars=True)]:
            with self.assertRaises(ValueError):
                self.read(**args)

    def test_bad_interval_fails(self):
        with self.assertRaises(ValueError):
            self.read([replace(FACTS[1], valid_to="2026-05-01")])


if __name__ == "__main__":
    unittest.main()
