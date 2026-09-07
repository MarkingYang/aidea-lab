package harness.authz

# Teaching policy: the host authenticates these facts before asking OPA.
default allow := false

identity_ok if {
    input.subject.authenticated == true
    input.subject.tenant == input.resource.tenant
    input.task.tenant == input.resource.tenant
    input.resource.id in input.task.resources
}

allow if {
    identity_ok
    data.policy.read_enabled == true
    input.action == "read"
    "read" in input.task.actions
}

allow if {
    identity_ok
    input.action == "write"
    "write" in input.task.actions
    approval_ok
}

approval_ok if {
    input.approval.verified == true
    input.approval.approver != input.subject.id
    input.approval.expires_at > input.now
    input.approval.envelope == {
        "subject": input.subject.id,
        "task": input.task.id,
        "action": input.action,
        "resource": input.resource.id,
        "resource_version": input.resource.version,
        "arguments": input.arguments,
        "policy_revision": data.policy.revision,
    }
}
