package pitfalls

# Intentionally incomplete decision contract, NOT a recommended policy.
default allow := false
allow if input.action == "read"
deny contains "subject_blocked" if input.subject.blocked == true

# A rule without a default can be undefined.
sometimes if input.special == true

# Complete documents cannot have two different values for the same input.
conflict := "a" if input.left == true
conflict := "b" if input.right == true
