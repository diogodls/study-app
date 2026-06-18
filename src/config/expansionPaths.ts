import type { LearningPath, PathCategory, SkillNode } from '@/config/paths';

type Resource = NonNullable<SkillNode['resources']>[number];
type NodeSpec = {
  id: string;
  title: string;
  focus: string;
  applications: [string, string];
  lab: string;
  capstone?: boolean;
};

type PathSpec = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  cssVar: string;
  category: PathCategory;
  releaseWave: 1 | 2;
  recommendedPathIds: string[];
  masteryBadgeId: string;
  resources: Resource[];
  nodes: NodeSpec[];
};

function buildDepthTopics(spec: NodeSpec) {
  const applications = spec.applications.join(' and ');
  return {
    learn: `${spec.focus}. Build the mental model, essential vocabulary, and basic workflow. Use small TypeScript, shell, YAML, or protocol examples as appropriate. Connect the concept directly to ${applications}. Include common beginner misconceptions and practical recognition cues.`,
    deepen: `${spec.focus}. Explore internals, trade-offs, failure modes, security implications, and production troubleshooting. Applications: ${applications}. Coding Lab specification: ${spec.lab}. The lab must state its objective, production context, expected artifact, verification steps, and measurable success criteria.`,
    master: `${spec.focus}. Create senior-level incident and architecture scenarios involving ${applications}. The speed quiz must test diagnosis, edge cases, debugging, and trade-off selection. The teach-back must require the learner to defend a technical decision, explain risks, propose observability, and describe rollback or recovery.`,
  };
}

function buildPath(spec: PathSpec): LearningPath {
  return {
    id: spec.id,
    title: spec.title,
    shortTitle: spec.shortTitle,
    description: spec.description,
    icon: spec.icon,
    color: spec.color,
    cssVar: spec.cssVar,
    category: spec.category,
    releaseWave: spec.releaseWave,
    recommendedPathIds: spec.recommendedPathIds,
    masteryBadgeId: spec.masteryBadgeId,
    nodes: spec.nodes.map((node, index) => ({
      id: `${spec.id}-${node.id}`,
      pathId: spec.id,
      title: node.title,
      description: node.focus,
      icon: node.capstone ? '🏆' : spec.icon,
      prerequisiteIds: index === 0 ? [] : [`${spec.id}-${spec.nodes[index - 1].id}`],
      geminiTopic: buildDepthTopics(node).deepen,
      depthTopics: buildDepthTopics(node),
      applications: node.applications,
      resources: spec.resources,
      capstone: node.capstone,
      estimatedMinutes: node.capstone ? 35 : 20,
    })),
  };
}

const gitResources: Resource[] = [
  { title: 'Git Reference', url: 'https://git-scm.com/docs', type: 'docs' },
  { title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', type: 'reference' },
];

const linuxResources: Resource[] = [
  { title: 'Linux man-pages', url: 'https://man7.org/linux/man-pages/', type: 'docs' },
  { title: 'GNU Bash Manual', url: 'https://www.gnu.org/software/bash/manual/', type: 'reference' },
];

const networkingResources: Resource[] = [
  { title: 'MDN HTTP Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', type: 'docs' },
  { title: 'RFC Editor', url: 'https://www.rfc-editor.org/', type: 'reference' },
];

const securityResources: Resource[] = [
  { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/', type: 'docs' },
  { title: 'OWASP Web Security Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', type: 'reference' },
];

const devopsResources: Resource[] = [
  { title: 'Docker Documentation', url: 'https://docs.docker.com/', type: 'docs' },
  { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/', type: 'docs' },
  { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'docs' },
  { title: 'Terraform Documentation', url: 'https://developer.hashicorp.com/terraform/docs', type: 'reference' },
];

const typescriptResources: Resource[] = [
  { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'docs' },
  { title: 'TSConfig Reference', url: 'https://www.typescriptlang.org/tsconfig/', type: 'reference' },
];

const aiResources: Resource[] = [
  { title: 'Gemini API Documentation', url: 'https://ai.google.dev/gemini-api/docs', type: 'docs' },
  { title: 'Google AI Embeddings Guide', url: 'https://ai.google.dev/gemini-api/docs/embeddings', type: 'reference' },
];

const patternsResources: Resource[] = [
  { title: 'Microsoft Cloud Design Patterns', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/', type: 'docs' },
  { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'reference' },
];

const specs: PathSpec[] = [
  {
    id: 'git',
    title: 'Git & Version Control',
    shortTitle: 'Git',
    description: 'Control history, recover repositories, and collaborate safely in production teams.',
    icon: '🌿',
    color: '#f97316',
    cssVar: '--path-git',
    category: 'Foundations',
    releaseWave: 1,
    recommendedPathIds: [],
    masteryBadgeId: 'badge-git-master',
    resources: gitResources,
    nodes: [
      { id: 'mental-model', title: 'Git Mental Model', focus: 'Working tree, index, commits, refs, blobs, trees, and the object database', applications: ['explaining repository state before a risky operation', 'diagnosing why staged and committed content differ'], lab: 'Inspect a repository with plumbing commands and produce a state diagram for working tree, index, HEAD, and object relationships.' },
      { id: 'commits-branches', title: 'Commits & Branches', focus: 'Immutable commits, lightweight branches, HEAD movement, ancestry, and readable history', applications: ['organizing parallel feature development', 'reviewing and auditing release history'], lab: 'Create a branching history, inspect its graph, and rewrite only local commit messages into an auditable sequence.' },
      { id: 'merge-conflicts', title: 'Merge & Conflict Resolution', focus: 'Three-way merges, merge bases, conflict markers, semantic conflict resolution, and merge commits', applications: ['integrating concurrent team changes', 'resolving conflicts without silently dropping behavior'], lab: 'Resolve a multi-file conflict, run verification, and document why the final merge preserves both intended changes.' },
      { id: 'rebase', title: 'Rebase & History Editing', focus: 'Interactive rebase, squash, fixup, reorder, amend, and safe force pushing', applications: ['cleaning a pull request before review', 'updating a feature branch while preserving team safety'], lab: 'Transform a noisy local history into atomic commits and publish it using force-with-lease safeguards.' },
      { id: 'undo-recovery', title: 'Undo & Recovery', focus: 'Restore, reset modes, revert, reflog, detached HEAD, and recovery of lost commits', applications: ['reversing a production regression safely', 'recovering accidentally deleted local work'], lab: 'Recover an orphaned commit with reflog and compare revert versus reset for a shared release branch.' },
      { id: 'cherry-pick', title: 'Cherry-pick & Release Fixes', focus: 'Selective commit transfer, conflict handling, patch identity, and release backports', applications: ['backporting a security fix', 'moving an isolated hotfix across release lines'], lab: 'Backport two dependent fixes to a maintenance branch and verify the resulting patch without importing unrelated work.' },
      { id: 'bisect', title: 'Bisect & History Debugging', focus: 'Binary search across history, automated bisect scripts, blame limitations, and regression evidence', applications: ['locating the commit that introduced a failure', 'reducing debugging time in long-lived systems'], lab: 'Write a deterministic test script and use git bisect run to identify and explain a regression.' },
      { id: 'hooks-security', title: 'Hooks, Signing & Security', focus: 'Client and server hooks, commit and tag signing, secret prevention, and repository trust', applications: ['enforcing local quality checks', 'verifying release provenance and preventing credential leaks'], lab: 'Create a pre-commit secret check, sign a release tag, and document bypass and enforcement boundaries.' },
      { id: 'team-workflows', title: 'Team Workflows', focus: 'Trunk-based development, GitFlow, pull requests, branch protection, and release coordination', applications: ['choosing a workflow for deployment frequency', 'reducing merge queues and long-lived branch risk'], lab: 'Design a workflow policy for a team with weekly releases, emergency fixes, and required code review.' },
      { id: 'capstone', title: 'Capstone: Production Repository Rescue', focus: 'Integrated repository recovery involving conflicts, regression isolation, history repair, and hotfix delivery', applications: ['leading a repository incident', 'restoring a trustworthy release history under time pressure'], lab: 'Rescue a simulated repository by recovering lost work, locating a regression, resolving divergence, backporting the fix, and producing an incident report.', capstone: true },
    ],
  },
  {
    id: 'linux',
    title: 'Linux & Shell',
    shortTitle: 'Linux',
    description: 'Operate services, automate workflows, and troubleshoot Linux systems confidently.',
    icon: '🐧',
    color: '#eab308',
    cssVar: '--path-linux',
    category: 'Foundations',
    releaseWave: 1,
    recommendedPathIds: [],
    masteryBadgeId: 'badge-linux-master',
    resources: linuxResources,
    nodes: [
      { id: 'filesystem', title: 'Filesystem & Navigation', focus: 'Filesystem hierarchy, paths, mounts, links, metadata, discovery, and safe file operations', applications: ['navigating unfamiliar servers', 'locating configuration and runtime artifacts'], lab: 'Map an application installation, distinguish links and mounts, and produce safe cleanup commands with verification.' },
      { id: 'streams', title: 'Streams, Pipes & Text Processing', focus: 'Standard streams, redirection, pipes, grep, sed, awk, sort, cut, xargs, and exit codes', applications: ['building log-analysis pipelines', 'transforming operational data without custom programs'], lab: 'Build a resilient pipeline that extracts, aggregates, and ranks failures from structured application logs.' },
      { id: 'permissions', title: 'Users, Groups & Permissions', focus: 'Ownership, mode bits, umask, ACLs, sudo, capabilities, and least privilege', applications: ['securing service files', 'diagnosing permission-denied incidents'], lab: 'Configure a service account with minimum filesystem access and prove unauthorized writes are rejected.' },
      { id: 'processes', title: 'Processes, Signals & Jobs', focus: 'Process trees, foreground and background jobs, signals, priorities, descriptors, and resource limits', applications: ['terminating unhealthy processes safely', 'diagnosing stuck or resource-heavy workloads'], lab: 'Investigate a process tree, identify leaked children, apply signals in escalation order, and document impact.' },
      { id: 'scripting', title: 'Shell Scripting', focus: 'Bash variables, quoting, functions, strict mode, traps, argument parsing, and idempotency', applications: ['automating deployments', 'building repeatable maintenance tasks'], lab: 'Write an idempotent deployment script with validation, structured errors, cleanup traps, and dry-run support.' },
      { id: 'network-tools', title: 'Networking Tools', focus: 'curl, dig, ss, ip, traceroute, nc, lsof, and packet-level investigation workflow', applications: ['debugging unreachable dependencies', 'separating DNS, routing, TLS, and application failures'], lab: 'Diagnose a staged connectivity failure and produce evidence for each network layer checked.' },
      { id: 'runtime', title: 'Packages, Environment & Runtime', focus: 'Package managers, shared libraries, environment variables, PATH, shells, runtimes, and reproducibility', applications: ['repairing broken runtime environments', 'preventing environment drift across hosts'], lab: 'Diagnose a binary that works interactively but fails in automation, then create a reproducible environment contract.' },
      { id: 'services', title: 'Cron, systemd & Service Management', focus: 'Units, dependencies, restart policies, timers, cron environments, and service lifecycle', applications: ['running reliable background services', 'scheduling maintenance with observable failure handling'], lab: 'Create a hardened systemd unit and timer with restart limits, environment isolation, and operational checks.' },
      { id: 'troubleshooting', title: 'Logs & Performance Troubleshooting', focus: 'journald, log rotation, disk pressure, memory, CPU, load, I/O, and evidence-driven diagnosis', applications: ['triaging degraded hosts', 'identifying leaks and saturation before restart'], lab: 'Investigate a simulated slow service using logs and system metrics, then propose mitigation and follow-up monitoring.' },
      { id: 'capstone', title: 'Capstone: Operate a Linux Service', focus: 'End-to-end deployment, permissions, service management, logging, scheduling, and incident recovery', applications: ['operating a production daemon', 'handing over a service with a usable runbook'], lab: 'Deploy and operate a service under a dedicated user, configure systemd and logs, automate maintenance, inject a failure, and write a runbook.', capstone: true },
    ],
  },
  {
    id: 'networking',
    title: 'Networking',
    shortTitle: 'Network',
    description: 'Understand protocols deeply enough to diagnose latency, connectivity, and delivery failures.',
    icon: '🌐',
    color: '#06b6d4',
    cssVar: '--path-networking',
    category: 'Foundations',
    releaseWave: 1,
    recommendedPathIds: ['linux'],
    masteryBadgeId: 'badge-networking-master',
    resources: networkingResources,
    nodes: [
      { id: 'layers', title: 'Packets & Network Layers', focus: 'Encapsulation, frames, packets, segments, interfaces, MTU, and practical OSI/TCP-IP layering', applications: ['localizing failures to a network layer', 'reasoning about payload overhead and fragmentation'], lab: 'Trace an HTTP request through each layer and annotate addresses, headers, payloads, and likely failure points.' },
      { id: 'ip-routing', title: 'IP, Subnets, Routing & NAT', focus: 'IPv4 and IPv6 addressing, CIDR, subnets, gateways, route selection, NAT, and private networks', applications: ['designing service network boundaries', 'debugging routes and overlapping address spaces'], lab: 'Design subnets for a multi-tier environment, calculate ranges, and diagnose a broken route and NAT rule.' },
      { id: 'transport', title: 'TCP, UDP & Connection Lifecycle', focus: 'Handshakes, sequence numbers, flow control, congestion, retransmission, UDP semantics, and sockets', applications: ['diagnosing resets and timeouts', 'choosing transport behavior for real-time workloads'], lab: 'Analyze a connection timeline and distinguish application timeout, packet loss, backlog saturation, and graceful close.' },
      { id: 'dns', title: 'DNS Resolution', focus: 'Recursive and authoritative resolution, records, caching, TTL, negative caching, and DNSSEC basics', applications: ['operating domain migrations', 'diagnosing stale or geographically inconsistent resolution'], lab: 'Trace a DNS lookup, compare authoritative and cached answers, and design a low-risk record migration.' },
      { id: 'http', title: 'HTTP/1.1, HTTP/2 & HTTP/3', focus: 'Message semantics, connection reuse, multiplexing, head-of-line blocking, QUIC, caching, and negotiation', applications: ['optimizing API delivery', 'diagnosing protocol-specific latency and cache behavior'], lab: 'Compare request waterfalls across HTTP versions and propose protocol and caching changes with measurable outcomes.' },
      { id: 'tls', title: 'TLS, Certificates & PKI', focus: 'TLS handshake, certificate chains, SNI, ALPN, trust stores, cipher negotiation, and rotation', applications: ['debugging certificate failures', 'designing secure service-to-service communication'], lab: 'Inspect a TLS endpoint, identify a broken chain or hostname mismatch, and create a safe certificate rotation plan.' },
      { id: 'delivery', title: 'Proxies, Load Balancers & CDNs', focus: 'Forward and reverse proxies, L4 versus L7 balancing, health checks, affinity, edge caching, and origin protection', applications: ['scaling public APIs', 'isolating unhealthy instances and reducing global latency'], lab: 'Design a delivery path with proxy, load balancer, CDN, health checks, cache rules, and failure behavior.' },
      { id: 'realtime', title: 'WebSockets, SSE & gRPC', focus: 'Persistent connections, server push, streaming RPC, backpressure, intermediaries, and fallback choices', applications: ['building live user experiences', 'selecting communication patterns for internal services'], lab: 'Choose and prototype a communication contract for notifications, telemetry streaming, and bidirectional collaboration.' },
      { id: 'observability', title: 'Network Observability & Troubleshooting', focus: 'Latency budgets, packet capture, connection metrics, synthetic probes, distributed traces, and systematic isolation', applications: ['triaging intermittent production failures', 'proving whether the network or application is responsible'], lab: 'Investigate a multi-layer failure using curl, dig, traceroute, socket data, and a packet trace; produce a concise diagnosis.' },
      { id: 'capstone', title: 'Capstone: Diagnose a Failing Distributed API', focus: 'Integrated DNS, routing, TLS, proxy, transport, and application delivery diagnosis', applications: ['leading a cross-team outage investigation', 'building a reusable network troubleshooting runbook'], lab: 'Diagnose a distributed API with multiple injected faults, restore service in priority order, and defend the permanent fixes.', capstone: true },
    ],
  },
  {
    id: 'appsec',
    title: 'Application Security',
    shortTitle: 'AppSec',
    description: 'Design, test, and operate applications that resist realistic attacks and abuse.',
    icon: '🛡️',
    color: '#ef4444',
    cssVar: '--path-appsec',
    category: 'Specializations',
    releaseWave: 1,
    recommendedPathIds: ['networking', 'backend'],
    masteryBadgeId: 'badge-appsec-master',
    resources: securityResources,
    nodes: [
      { id: 'threat-modeling', title: 'Threat Modeling & Attack Surfaces', focus: 'Assets, actors, trust boundaries, data flows, STRIDE, abuse cases, and risk prioritization', applications: ['reviewing a new feature before implementation', 'prioritizing security work by realistic impact'], lab: 'Create a data-flow diagram and threat model for a multi-tenant API, including mitigations and residual risk.' },
      { id: 'authentication', title: 'Authentication & Session Security', focus: 'Password storage, MFA, session identifiers, cookies, token rotation, account recovery, and fixation prevention', applications: ['building secure login flows', 'responding to credential theft and session compromise'], lab: 'Harden an authentication flow with secure cookies, rotation, revocation, recovery controls, and test cases.' },
      { id: 'authorization', title: 'Authorization, RBAC & IDOR', focus: 'Object-level authorization, RBAC, ABAC, tenant boundaries, policy enforcement, and confused deputy risks', applications: ['preventing cross-user data access', 'centralizing authorization decisions across services'], lab: 'Exploit and fix an IDOR vulnerability, then define policy tests for roles and tenant isolation.' },
      { id: 'injection', title: 'Injection & Input Validation', focus: 'SQL, command, template, and path injection; parsing, allowlists, parameterization, and canonicalization', applications: ['protecting data access layers', 'securing automation that invokes system tools'], lab: 'Identify multiple injection paths in an API and replace unsafe composition with validated, parameterized boundaries.' },
      { id: 'browser-security', title: 'XSS, CSRF, CORS & CSP', focus: 'Browser trust model, origins, cookies, DOM and stored XSS, CSRF tokens, CORS policy, and CSP', applications: ['hardening browser applications', 'diagnosing cross-origin integration failures without weakening policy'], lab: 'Exploit a vulnerable frontend, then deploy contextual escaping, CSRF defenses, strict CORS, and a practical CSP.' },
      { id: 'crypto-secrets', title: 'Secrets, Encryption & Password Storage', focus: 'Encryption at rest and transit, hashing, KDFs, key management, envelope encryption, rotation, and secret exposure', applications: ['protecting credentials and regulated data', 'designing key rotation without downtime'], lab: 'Replace plaintext secrets and weak password hashing with managed keys, secure storage, rotation, and audit evidence.' },
      { id: 'api-security', title: 'API Security & Abuse Prevention', focus: 'Rate limiting, quotas, schema validation, replay prevention, idempotency, mass assignment, and resource exhaustion', applications: ['protecting public APIs from abuse', 'maintaining availability under malicious traffic'], lab: 'Add layered abuse controls to an API and verify legitimate retries, malicious bursts, and expensive payloads.' },
      { id: 'supply-chain', title: 'Dependencies & Supply Chain Security', focus: 'Dependency risk, lockfiles, provenance, malicious packages, SBOMs, signing, and CI isolation', applications: ['preventing compromised builds', 'responding to vulnerable or hijacked dependencies'], lab: 'Audit a dependency graph, produce an SBOM, pin trusted artifacts, and define a safe upgrade and emergency removal process.' },
      { id: 'incident-response', title: 'Security Logging & Incident Response', focus: 'Audit events, tamper resistance, alert design, evidence preservation, containment, eradication, and postmortems', applications: ['detecting account takeover', 'coordinating application-level incident response'], lab: 'Design security telemetry for a credential attack and execute a tabletop response with containment and recovery steps.' },
      { id: 'capstone', title: 'Capstone: Harden a Production API', focus: 'Integrated threat modeling, authentication, authorization, injection defense, abuse controls, supply chain, and response', applications: ['conducting a production security review', 'delivering a defensible remediation roadmap'], lab: 'Assess and harden a vulnerable API, demonstrate exploit prevention, add security telemetry, and present residual risks.', capstone: true },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & CI/CD',
    shortTitle: 'DevOps',
    description: 'Build secure delivery systems, infrastructure, observability, and reliable rollback paths.',
    icon: '🚢',
    color: '#3b82f6',
    cssVar: '--path-devops',
    category: 'Infrastructure',
    releaseWave: 2,
    recommendedPathIds: ['git', 'linux', 'networking'],
    masteryBadgeId: 'badge-devops-master',
    resources: devopsResources,
    nodes: [
      { id: 'containers', title: 'Container Fundamentals', focus: 'Images, containers, namespaces, cgroups, layers, registries, and container lifecycle', applications: ['packaging repeatable services', 'isolating deployment dependencies'], lab: 'Containerize a Node service and inspect its filesystem, process, network, resource, and lifecycle boundaries.' },
      { id: 'secure-builds', title: 'Docker Images & Secure Builds', focus: 'Dockerfile layers, build cache, multi-stage builds, non-root execution, scanning, provenance, and minimal images', applications: ['reducing image attack surface', 'creating fast reproducible builds'], lab: 'Refactor an insecure oversized image into a reproducible, scanned, non-root multi-stage build.' },
      { id: 'compose', title: 'Local Multi-Service Environments', focus: 'Compose services, networks, volumes, health checks, dependency readiness, and developer parity', applications: ['running integration environments', 'reproducing service interactions locally'], lab: 'Create a multi-service environment with database, queue, health checks, seeded data, and deterministic startup.' },
      { id: 'ci', title: 'Continuous Integration', focus: 'Pipeline triggers, jobs, caching, artifacts, matrices, secrets, test isolation, and quality gates', applications: ['validating every pull request', 'shortening feedback without sacrificing confidence'], lab: 'Build a GitHub Actions pipeline with lint, tests, build matrix, caching, artifacts, and protected secret usage.' },
      { id: 'delivery', title: 'Delivery Strategies', focus: 'Rolling, blue-green, canary, feature flags, migrations, rollback, and progressive verification', applications: ['deploying without downtime', 'limiting blast radius during risky releases'], lab: 'Design a canary release with health signals, automatic rollback, database compatibility, and operator checkpoints.' },
      { id: 'kubernetes-core', title: 'Kubernetes Fundamentals', focus: 'Pods, deployments, services, configuration, secrets, probes, scheduling, and desired state', applications: ['orchestrating replicated services', 'standardizing runtime configuration and health'], lab: 'Deploy a service with probes, configuration, resource requests, secrets, and stable service discovery.' },
      { id: 'kubernetes-ops', title: 'Kubernetes Operations', focus: 'Rollouts, autoscaling, disruption, networking, storage, RBAC, debugging, and cluster failure modes', applications: ['operating workloads under load', 'diagnosing failed scheduling and networking'], lab: 'Investigate a failing rollout, resource pressure, and network policy issue, then restore safe capacity.' },
      { id: 'terraform', title: 'Terraform & Infrastructure as Code', focus: 'Providers, state, modules, plans, drift, remote backends, imports, and safe change workflows', applications: ['provisioning repeatable environments', 'reviewing infrastructure changes before execution'], lab: 'Create modular infrastructure with remote state, validation, plan review, drift detection, and recovery documentation.' },
      { id: 'observability', title: 'Observability, SLOs & Incident Response', focus: 'Metrics, logs, traces, SLIs, SLOs, error budgets, alerts, runbooks, and incident command', applications: ['detecting customer-impacting failures', 'balancing reliability work and feature delivery'], lab: 'Instrument a service, define an SLO, create actionable alerts, inject a failure, and run an incident review.' },
      { id: 'capstone', title: 'Capstone: Production Delivery Pipeline', focus: 'Integrated build, test, image, infrastructure, deployment, observability, and rollback system', applications: ['shipping a service through a controlled platform', 'demonstrating an auditable release and recovery process'], lab: 'Deliver a service through CI, secure image build, infrastructure plan, progressive deployment, SLO checks, and tested rollback.', capstone: true },
    ],
  },
  {
    id: 'typescript-advanced',
    title: 'Advanced TypeScript',
    shortTitle: 'TypeScript',
    description: 'Design expressive type systems and safe boundaries for production TypeScript.',
    icon: '🔷',
    color: '#3178c6',
    cssVar: '--path-typescript',
    category: 'Development',
    releaseWave: 2,
    recommendedPathIds: ['backend'],
    masteryBadgeId: 'badge-typescript-master',
    resources: typescriptResources,
    nodes: [
      { id: 'mental-model', title: 'Type System Mental Model', focus: 'Structural typing, assignability, inference, widening, narrowing, unknown, never, and soundness boundaries', applications: ['modeling domain contracts', 'understanding why apparently compatible values fail or pass'], lab: 'Diagnose unsafe assignments in a domain model and replace any-based assumptions with explicit safe contracts.' },
      { id: 'generics', title: 'Generics & Constraints', focus: 'Generic functions and types, constraints, defaults, variance intuition, and inference preservation', applications: ['building reusable libraries', 'preserving type information through data transformations'], lab: 'Create a generic repository and pagination API that preserves entity and query types without assertions.' },
      { id: 'narrowing', title: 'Narrowing & Discriminated Unions', focus: 'Control-flow analysis, predicates, assertion functions, exhaustiveness, and state machines', applications: ['eliminating invalid UI and workflow states', 'handling external results safely'], lab: 'Refactor a boolean-heavy asynchronous workflow into an exhaustive discriminated state machine.' },
      { id: 'mapped-conditional', title: 'Mapped & Conditional Types', focus: 'Key remapping, modifiers, distributive conditionals, recursive transformations, and utility design', applications: ['deriving DTO and patch types', 'enforcing policy variations without duplication'], lab: 'Build typed create, update, and serialized variants from one domain model while preserving required invariants.' },
      { id: 'infer-templates', title: 'infer, Template Literals & Type Transformations', focus: 'Conditional inference, tuple decomposition, template literal parsing, branded strings, and compile-time protocols', applications: ['typing route parameters', 'validating event and configuration naming conventions'], lab: 'Implement a typed route and event contract that derives parameters and payloads from literal definitions.' },
      { id: 'async-apis', title: 'Typing APIs and Async Workflows', focus: 'Promise composition, result types, overloads, fetch contracts, errors, cancellation, and concurrency typing', applications: ['building safe API clients', 'representing partial failure in concurrent workflows'], lab: 'Create a typed API client with result-based errors, cancellation, retries, and bounded concurrent requests.' },
      { id: 'runtime-validation', title: 'Runtime Validation Boundaries', focus: 'Static versus runtime guarantees, schema parsing, type guards, unknown input, serialization, and versioning', applications: ['validating API and environment input', 'preventing trusted-type illusions at system boundaries'], lab: 'Add runtime validation to external JSON and derive a safe internal type with actionable validation errors.' },
      { id: 'modules-libraries', title: 'Modules, Libraries & Declaration Files', focus: 'ESM and CJS interop, package exports, declarations, module augmentation, public APIs, and semantic compatibility', applications: ['publishing reusable packages', 'integrating untyped or incorrectly typed libraries'], lab: 'Package a dual-target library with declarations, exports, type tests, and a safe augmentation for a dependency.' },
      { id: 'compiler', title: 'Compiler Configuration & Type Performance', focus: 'Strictness flags, module resolution, project references, incremental builds, diagnostics, and expensive type patterns', applications: ['scaling monorepo type checking', 'preventing configuration drift and slow editor feedback'], lab: 'Harden a tsconfig hierarchy and reduce a deliberately expensive type workload using compiler diagnostics.' },
      { id: 'capstone', title: 'Capstone: Type-safe SDK', focus: 'Integrated public API design, generics, validation, errors, modules, declarations, and compatibility', applications: ['shipping a trustworthy client SDK', 'maintaining type safety across versioned service contracts'], lab: 'Build and package a typed SDK from an API contract with validation, pagination, errors, tests, declarations, and migration notes.', capstone: true },
    ],
  },
  {
    id: 'applied-ai',
    title: 'Applied AI Engineering',
    shortTitle: 'AI Eng',
    description: 'Build measurable, secure, and cost-aware LLM systems for production.',
    icon: '🤖',
    color: '#a855f7',
    cssVar: '--path-ai',
    category: 'Specializations',
    releaseWave: 2,
    recommendedPathIds: ['backend', 'typescript-advanced'],
    masteryBadgeId: 'badge-ai-master',
    resources: aiResources,
    nodes: [
      { id: 'llm-foundations', title: 'LLM Foundations, Tokens & Context', focus: 'Tokenization, context windows, generation, temperature, latency, model limits, and failure characteristics', applications: ['selecting a model for a product constraint', 'estimating latency and context cost'], lab: 'Measure token use and response behavior across prompts, then create a model selection decision record.' },
      { id: 'prompting', title: 'Prompt Design & Structured Output', focus: 'Instructions, context separation, examples, schemas, constraints, retries, and deterministic parsing', applications: ['generating reliable application data', 'reducing malformed and instruction-violating responses'], lab: 'Design a versioned prompt and JSON schema pipeline with validation, retries, and regression examples.' },
      { id: 'embeddings', title: 'Embeddings & Semantic Search', focus: 'Vector representations, similarity, chunk meaning, dimensionality, retrieval quality, and hybrid search', applications: ['semantic document discovery', 'matching user intent beyond keyword overlap'], lab: 'Build an embedding index, evaluate retrieval examples, and compare semantic, keyword, and hybrid results.' },
      { id: 'vector-databases', title: 'Vector Databases', focus: 'Index structures, metadata filters, namespaces, updates, deletion, recall-latency trade-offs, and tenancy', applications: ['operating retrieval at scale', 'isolating customer knowledge bases'], lab: 'Design and query a multi-tenant vector store with filters, lifecycle operations, and performance measurements.' },
      { id: 'rag', title: 'RAG Ingestion & Retrieval', focus: 'Parsing, chunking, enrichment, retrieval, reranking, grounding, citations, freshness, and access control', applications: ['answering from private knowledge', 'keeping generated responses traceable and current'], lab: 'Create a RAG ingestion and query pipeline with citations, metadata security, reranking, and freshness handling.' },
      { id: 'evaluation', title: 'Evaluation & Observability', focus: 'Golden datasets, offline metrics, human review, LLM judges, tracing, feedback, drift, and release gates', applications: ['preventing silent quality regressions', 'comparing prompts and models with evidence'], lab: 'Build an evaluation set and dashboard that measures retrieval, groundedness, correctness, latency, and cost.' },
      { id: 'tools', title: 'Tool Calling & Structured Workflows', focus: 'Function schemas, orchestration, validation, retries, idempotency, permissions, and human approval', applications: ['connecting models to business actions', 'building reliable multi-step automations'], lab: 'Implement a tool-calling workflow with schema validation, idempotent actions, permission checks, and audit logs.' },
      { id: 'agents', title: 'Agents, Memory & Guardrails', focus: 'Planning loops, state, short and long-term memory, termination, sandboxing, policy, and failure containment', applications: ['building bounded task agents', 'preventing runaway actions and polluted memory'], lab: 'Create a bounded agent with explicit tools, budgets, memory rules, approval points, and termination tests.' },
      { id: 'production', title: 'Security, Cost & Production Scaling', focus: 'Prompt injection, data leakage, model abuse, caching, batching, fallbacks, quotas, cost controls, and reliability', applications: ['operating a public AI feature', 'containing attacks and unexpected spend'], lab: 'Threat-model and load-test an AI endpoint, then add defenses, budgets, fallback behavior, and incident alerts.' },
      { id: 'capstone', title: 'Capstone: Production RAG Assistant', focus: 'Integrated ingestion, retrieval, generation, evaluation, tools, guardrails, observability, and cost control', applications: ['shipping an internal knowledge assistant', 'defending quality and security decisions to stakeholders'], lab: 'Deliver a production RAG assistant with citations, evaluation gates, access control, injection defenses, telemetry, and cost report.', capstone: true },
    ],
  },
  {
    id: 'design-patterns',
    title: 'Applied Design Patterns',
    shortTitle: 'Patterns',
    description: 'Apply patterns deliberately, reject unnecessary abstraction, and refactor toward clear boundaries.',
    icon: '🧩',
    color: '#14b8a6',
    cssVar: '--path-patterns',
    category: 'Architecture',
    releaseWave: 2,
    recommendedPathIds: ['backend'],
    masteryBadgeId: 'badge-patterns-master',
    resources: patternsResources,
    nodes: [
      { id: 'solid', title: 'SOLID, Coupling & Cohesion', focus: 'Change boundaries, dependency direction, cohesion, coupling, interfaces, and practical SOLID trade-offs', applications: ['making business logic testable', 'reducing change propagation across modules'], lab: 'Analyze a coupled service and refactor only the boundaries justified by concrete change scenarios.' },
      { id: 'strategy-state', title: 'Strategy & State', focus: 'Interchangeable behavior, runtime selection, explicit state transitions, and alternatives to conditional explosions', applications: ['supporting multiple pricing or delivery policies', 'modeling lifecycle-dependent behavior'], lab: 'Replace branching policy logic with strategies and model a workflow as explicit state transitions with tests.' },
      { id: 'factory-builder', title: 'Factory & Builder', focus: 'Construction complexity, invariants, dependency assembly, fluent configuration, and when direct constructors are clearer', applications: ['creating configured integrations', 'preventing partially initialized domain objects'], lab: 'Design object creation for a notification provider while comparing factory, builder, and plain construction costs.' },
      { id: 'adapter-facade', title: 'Adapter & Facade', focus: 'Interface translation, anti-corruption layers, simplified subsystems, and dependency isolation', applications: ['integrating third-party providers', 'shielding application logic from legacy APIs'], lab: 'Wrap two incompatible vendor APIs behind a stable application interface and document information loss.' },
      { id: 'decorator-proxy', title: 'Decorator & Proxy', focus: 'Behavior composition, access mediation, caching, logging, retries, and hidden complexity risks', applications: ['adding cross-cutting behavior', 'controlling remote or expensive dependencies'], lab: 'Add telemetry, caching, and access control around a service while preserving its contract and error semantics.' },
      { id: 'observer-events', title: 'Observer & Event-driven Design', focus: 'Subscriptions, event contracts, ordering, failure isolation, memory leaks, and eventual consistency', applications: ['decoupling secondary reactions', 'building extensible domain event flows'], lab: 'Refactor synchronous side effects into events with explicit delivery, retry, observability, and unsubscribe behavior.' },
      { id: 'command-chain', title: 'Command & Chain of Responsibility', focus: 'Encapsulated requests, queues, undo, middleware chains, handlers, ordering, and short-circuit behavior', applications: ['building auditable workflows', 'composing request validation and processing pipelines'], lab: 'Create a command workflow with audit history and a middleware chain with deterministic failure handling.' },
      { id: 'repository-uow', title: 'Repository, Unit of Work & Boundaries', focus: 'Persistence abstraction, transaction boundaries, identity maps, testing seams, and leaky abstraction risks', applications: ['isolating domain logic from storage', 'coordinating multi-entity changes atomically'], lab: 'Implement a transactional use case and compare direct database access with repository and unit-of-work boundaries.' },
      { id: 'selection', title: 'Choosing and Rejecting Patterns', focus: 'Forces, consequences, pattern combinations, accidental complexity, overengineering, and refactoring timing', applications: ['reviewing architecture proposals', 'choosing the simplest design that supports known change'], lab: 'Evaluate several proposed patterns for a small system, reject unnecessary ones, and justify a minimal evolution path.' },
      { id: 'capstone', title: 'Capstone: Refactor a Coupled Notification Platform', focus: 'Integrated refactoring using deliberate patterns, boundaries, events, providers, policies, persistence, and observability', applications: ['modernizing a coupled service safely', 'defending which abstractions are valuable and which are not'], lab: 'Refactor a notification platform incrementally, preserve behavior with tests, add justified patterns, and present rejected alternatives.', capstone: true },
    ],
  },
];

export const EXPANSION_PATHS: LearningPath[] = specs.map(buildPath);
