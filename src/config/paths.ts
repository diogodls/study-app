// ============================================================
// DevQuest — Learning Paths Configuration
// ============================================================
// To add a new path: create a new LearningPath object and
// append it to the LEARNING_PATHS array. No component changes needed.
// ============================================================

export type SkillNode = {
  id: string;
  pathId: string;
  title: string;
  description: string;
  icon: string;
  prerequisiteIds: string[]; // [] = first node (always unlocked)
  geminiTopic: string;       // sent verbatim to Gemini as lesson topic
  estimatedMinutes: number;
};

export type LearningPath = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string; // CSS color value
  cssVar: string; // references --path-* CSS variable name
  nodes: SkillNode[];
};

// ─────────────────────────────────────────────────────────────
// PATH: Data Structures & Algorithms
// ─────────────────────────────────────────────────────────────
const dataStructuresPath: LearningPath = {
  id: 'data-structures',
  title: 'Data Structures & Algorithms',
  shortTitle: 'DSA',
  description: 'Master the building blocks of efficient software.',
  icon: '🌲',
  color: 'hsl(200, 80%, 58%)',
  cssVar: '--path-data',
  nodes: [
    {
      id: 'dsa-bigo',
      pathId: 'data-structures',
      title: 'Big-O Notation',
      description: 'Analyze algorithm time & space complexity',
      icon: '📊',
      prerequisiteIds: [],
      geminiTopic: 'Big-O notation: time complexity, space complexity, O(1), O(n), O(n²), O(log n), O(n log n) with real code examples',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-arrays',
      pathId: 'data-structures',
      title: 'Arrays & Strings',
      description: 'The foundation of every data structure',
      icon: '📦',
      prerequisiteIds: ['dsa-bigo'],
      geminiTopic: 'Arrays and Strings in programming: indexing, slicing, two-pointer technique, sliding window, common interview problems',
      estimatedMinutes: 10,
    },
    {
      id: 'dsa-linked-lists',
      pathId: 'data-structures',
      title: 'Linked Lists',
      description: 'Singly, doubly, and circular lists',
      icon: '🔗',
      prerequisiteIds: ['dsa-arrays'],
      geminiTopic: 'Linked Lists: singly linked list, doubly linked list, circular linked list, insertion/deletion, fast-slow pointer technique',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-stacks-queues',
      pathId: 'data-structures',
      title: 'Stacks & Queues',
      description: 'LIFO and FIFO in action',
      icon: '📚',
      prerequisiteIds: ['dsa-linked-lists'],
      geminiTopic: 'Stacks (LIFO) and Queues (FIFO): implementation, use cases, monotonic stack, deque, priority queue basics',
      estimatedMinutes: 10,
    },
    {
      id: 'dsa-hashmaps',
      pathId: 'data-structures',
      title: 'Hash Maps & Sets',
      description: 'O(1) lookups and how they work',
      icon: '#️⃣',
      prerequisiteIds: ['dsa-stacks-queues'],
      geminiTopic: 'Hash Maps and Hash Sets: hash functions, collision resolution, O(1) average lookup, common patterns like frequency counting and two-sum',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-trees',
      pathId: 'data-structures',
      title: 'Trees & BSTs',
      description: 'Hierarchical data and traversal algorithms',
      icon: '🌳',
      prerequisiteIds: ['dsa-hashmaps'],
      geminiTopic: 'Binary Trees and Binary Search Trees: DFS (inorder, preorder, postorder), BFS, BST insert/delete/search, balanced trees concept',
      estimatedMinutes: 15,
    },
    {
      id: 'dsa-graphs',
      pathId: 'data-structures',
      title: 'Graphs',
      description: 'BFS, DFS, and real-world networks',
      icon: '🕸️',
      prerequisiteIds: ['dsa-trees'],
      geminiTopic: 'Graph theory: adjacency list vs matrix, BFS, DFS, cycle detection, topological sort, shortest path (Dijkstra intro)',
      estimatedMinutes: 18,
    },
    {
      id: 'dsa-dynamic',
      pathId: 'data-structures',
      title: 'Dynamic Programming',
      description: 'Break problems into overlapping subproblems',
      icon: '⚡',
      prerequisiteIds: ['dsa-graphs'],
      geminiTopic: 'Dynamic Programming fundamentals: memoization vs tabulation, overlapping subproblems, optimal substructure, classic problems (fibonacci, knapsack, LCS)',
      estimatedMinutes: 20,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH: Amazon Web Services
// ─────────────────────────────────────────────────────────────
const awsPath: LearningPath = {
  id: 'aws',
  title: 'Amazon Web Services',
  shortTitle: 'AWS',
  description: 'Build and deploy on the world\'s largest cloud.',
  icon: '☁️',
  color: 'hsl(30, 90%, 58%)',
  cssVar: '--path-aws',
  nodes: [
    {
      id: 'aws-iam',
      pathId: 'aws',
      title: 'IAM & Security',
      description: 'Identity, roles, policies, and best practices',
      icon: '🔐',
      prerequisiteIds: [],
      geminiTopic: 'AWS IAM: users, groups, roles, policies, least privilege principle, IAM best practices, STS and temporary credentials',
      estimatedMinutes: 12,
    },
    {
      id: 'aws-s3',
      pathId: 'aws',
      title: 'S3 Storage',
      description: 'Object storage, buckets, and lifecycle rules',
      icon: '🪣',
      prerequisiteIds: ['aws-iam'],
      geminiTopic: 'AWS S3: buckets, objects, storage classes, versioning, lifecycle policies, presigned URLs, static website hosting, S3 events',
      estimatedMinutes: 12,
    },
    {
      id: 'aws-ec2',
      pathId: 'aws',
      title: 'EC2 & Compute',
      description: 'Virtual machines, AMIs, and auto scaling',
      icon: '🖥️',
      prerequisiteIds: ['aws-iam'],
      geminiTopic: 'AWS EC2: instance types, AMIs, key pairs, security groups, elastic IPs, Auto Scaling Groups, load balancers, pricing models',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-lambda',
      pathId: 'aws',
      title: 'Lambda & Serverless',
      description: 'Event-driven functions without servers',
      icon: 'λ',
      prerequisiteIds: ['aws-s3', 'aws-ec2'],
      geminiTopic: 'AWS Lambda: function handlers, triggers, cold starts, execution context, Lambda layers, concurrency limits, Lambda with API Gateway',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-dynamo',
      pathId: 'aws',
      title: 'DynamoDB',
      description: 'Serverless NoSQL at any scale',
      icon: '⚡',
      prerequisiteIds: ['aws-lambda'],
      geminiTopic: 'AWS DynamoDB: tables, partition keys, sort keys, GSI, LSI, read/write capacity units vs on-demand, single-table design, DynamoDB Streams',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-sqs-sns',
      pathId: 'aws',
      title: 'SQS & SNS',
      description: 'Queues, topics, and async messaging',
      icon: '📨',
      prerequisiteIds: ['aws-lambda'],
      geminiTopic: 'AWS SQS vs SNS: standard vs FIFO queues, visibility timeout, dead-letter queues, fan-out pattern with SNS, SQS + Lambda integration',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-ecs',
      pathId: 'aws',
      title: 'ECS & Containers',
      description: 'Running Docker containers on AWS',
      icon: '🐳',
      prerequisiteIds: ['aws-sqs-sns', 'aws-dynamo'],
      geminiTopic: 'AWS ECS: task definitions, services, clusters, Fargate vs EC2 launch type, ECR for container registry, ECS vs EKS comparison',
      estimatedMinutes: 16,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH: Backend Development
// ─────────────────────────────────────────────────────────────
const backendPath: LearningPath = {
  id: 'backend',
  title: 'Backend Development',
  shortTitle: 'Backend',
  description: 'Build robust, scalable server-side applications.',
  icon: '⚙️',
  color: 'hsl(142, 60%, 52%)',
  cssVar: '--path-backend',
  nodes: [
    {
      id: 'be-nodejs',
      pathId: 'backend',
      title: 'Node.js Fundamentals',
      description: 'Event loop, async patterns, and the runtime',
      icon: '🟢',
      prerequisiteIds: [],
      geminiTopic: 'Node.js fundamentals: event loop, non-blocking I/O, CommonJS vs ESM modules, streams, Buffer, process object, npm ecosystem',
      estimatedMinutes: 14,
    },
    {
      id: 'be-rest',
      pathId: 'backend',
      title: 'REST APIs',
      description: 'Design and build RESTful services',
      icon: '🌐',
      prerequisiteIds: ['be-nodejs'],
      geminiTopic: 'REST API design: HTTP methods, status codes, resource naming conventions, pagination, versioning, authentication (JWT, API keys), OpenAPI spec',
      estimatedMinutes: 12,
    },
    {
      id: 'be-graphql',
      pathId: 'backend',
      title: 'GraphQL',
      description: 'Flexible querying with typed schemas',
      icon: '🔷',
      prerequisiteIds: ['be-rest'],
      geminiTopic: 'GraphQL: schema definition, queries, mutations, subscriptions, resolvers, N+1 problem and DataLoader, REST vs GraphQL tradeoffs',
      estimatedMinutes: 14,
    },
    {
      id: 'be-sql',
      pathId: 'backend',
      title: 'SQL & Relational DBs',
      description: 'Joins, indexes, and query optimization',
      icon: '🗃️',
      prerequisiteIds: ['be-rest'],
      geminiTopic: 'SQL and relational databases: joins (INNER, LEFT, RIGHT, FULL), indexes, transactions (ACID), normalization, query optimization, EXPLAIN',
      estimatedMinutes: 16,
    },
    {
      id: 'be-nosql',
      pathId: 'backend',
      title: 'NoSQL Databases',
      description: 'Document, key-value, and time-series stores',
      icon: '📄',
      prerequisiteIds: ['be-sql'],
      geminiTopic: 'NoSQL databases: document stores (MongoDB), key-value (Redis), column-family (Cassandra), when to use NoSQL vs SQL, data modeling patterns',
      estimatedMinutes: 14,
    },
    {
      id: 'be-clean-arch',
      pathId: 'backend',
      title: 'Clean Architecture',
      description: 'Layers, SOLID, and maintainable codebases',
      icon: '🏛️',
      prerequisiteIds: ['be-graphql', 'be-nosql'],
      geminiTopic: 'Clean Architecture and SOLID principles: layered architecture (domain, application, infrastructure), dependency inversion, repository pattern, use cases',
      estimatedMinutes: 16,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH: System Design
// Full curriculum: 19 modules (M1 intro → M17 mock interviews → Extra)
// ─────────────────────────────────────────────────────────────
const systemDesignPath: LearningPath = {
  id: 'system-design',
  title: 'System Design',
  shortTitle: 'Systems',
  description: 'Architect large-scale distributed systems — from SQL to interview frameworks.',
  icon: '🏗️',
  color: 'hsl(270, 65%, 65%)',
  cssVar: '--path-system',
  nodes: [
    // ── Module 1: Foundations ──────────────────────────────
    {
      id: 'sd-m1-foundations',
      pathId: 'system-design',
      title: 'M1 · Foundations',
      description: 'What is System Design, why it matters, how to think about systems',
      icon: '🏗️',
      prerequisiteIds: [],
      geminiTopic: 'System Design fundamentals: what is System Design and why it matters for software engineers, how to approach system design problems, key concepts (latency, throughput, availability, reliability, scalability), trade-offs mindset, vertical vs horizontal scaling, stateless vs stateful services, identifying bottlenecks, the System Design interview framework overview',
      estimatedMinutes: 18,
    },

    // ── Module 2: SQL Databases ────────────────────────────
    {
      id: 'sd-m2-sql',
      pathId: 'system-design',
      title: 'M2 · SQL Databases',
      description: 'Relational DBs, indexes, query plans, ACID, scaling strategies',
      icon: '🗃️',
      prerequisiteIds: ['sd-m1-foundations'],
      geminiTopic: 'SQL Databases for System Design: what are relational databases and when to use them, introduction to SQL (DDL/DML), indexes (B-tree, composite, covering), EXPLAIN and query plans, partitions (horizontal and vertical), database maintenance, ACID properties vs BASE, write path internals (WAL, write amplification), read path optimizations, scaling SQL (read replicas, connection pooling), federation and database separation by region, overview of major options (PostgreSQL, MySQL, MSSQL); supplements: Primary-Replica replication, Read Replicas, sharding strategies, CAP Theorem applied to SQL, consistency models (strong, eventual, read-your-writes, monotonic reads), Quorum Reads/Writes',
      estimatedMinutes: 30,
    },

    // ── Module 3: NoSQL ───────────────────────────────────
    {
      id: 'sd-m3-nosql',
      pathId: 'system-design',
      title: 'M3 · NoSQL',
      description: 'Document stores, Cassandra, DynamoDB, Vector DBs, distributed replication',
      icon: '📄',
      prerequisiteIds: ['sd-m2-sql'],
      geminiTopic: 'NoSQL databases for System Design: what are documents and document stores, use cases where NoSQL outperforms SQL, pros and cons of NoSQL, scaling NoSQL vs SQL, what to store (and NOT store) in modern databases, Vector Databases (embeddings, similarity search), GraphDB (use cases, traversal), Cassandra (wide-column, tunable consistency, ring topology), DynamoDB (partition key, sort key, GSI, on-demand), other options (MongoDB, Redis); supplements: Eventual Consistency, Tunable Consistency in Cassandra, distributed replication, Leaderless Replication, Anti-Entropy, Consistent Hashing',
      estimatedMinutes: 28,
    },

    // ── Module 4a: Queues (Part 1) ────────────────────────
    {
      id: 'sd-m4a-queues',
      pathId: 'system-design',
      title: 'M4a · Message Queues',
      description: 'What queues are, delivery semantics, Kafka, RabbitMQ, scaling',
      icon: '📬',
      prerequisiteIds: ['sd-m3-nosql'],
      geminiTopic: 'Message Queues Part 1: what are message queues, how queues differ from databases, when to use queues (decoupling, async processing, buffering), partitioning strategies, delivery semantics: At-Least-Once vs At-Most-Once vs Exactly-Once, major options (Kafka architecture, RabbitMQ exchange types, AWS SQS/SNS, Google Pub/Sub), how consumers/readers operate (consumer groups, polling vs push), horizontal scaling of consumers, scaling limitations and backpressure',
      estimatedMinutes: 25,
    },

    // ── Module 4b: Queues (Part 2) ────────────────────────
    {
      id: 'sd-m4b-queues-advanced',
      pathId: 'system-design',
      title: 'M4b · Queues Advanced',
      description: 'DLQs, idempotency, event streaming, Outbox Pattern',
      icon: '🔄',
      prerequisiteIds: ['sd-m4a-queues'],
      geminiTopic: 'Message Queues Part 2: operational complexity of async architectures, async response patterns (callbacks, polling, webhooks), Dead Letter Queues (DLQ) and retry strategies, idempotency (why it matters, how to implement it); supplements: Consumer Groups in Kafka, ordering guarantees (per-partition ordering), Event Streaming vs traditional queues, Event-Driven Architecture patterns, the Outbox Pattern for reliable message publishing with database transactions',
      estimatedMinutes: 22,
    },

    // ── Module 5: Load Balancers ──────────────────────────
    {
      id: 'sd-m5-load-balancers',
      pathId: 'system-design',
      title: 'M5 · Load Balancers',
      description: 'Types, algorithms, Layer 4 vs 7, sticky sessions, health checks',
      icon: '⚖️',
      prerequisiteIds: ['sd-m4b-queues-advanced'],
      geminiTopic: 'Load Balancers in System Design: types of load balancers (hardware, software, cloud-managed), load balancing algorithms (Round Robin, Least Connections, IP Hash, Weighted), trade-offs of each algorithm; supplements: Layer 4 vs Layer 7 load balancers (when each applies), Sticky Sessions (session affinity and its problems), Health Checks (active vs passive), Anycast routing for global load balancing',
      estimatedMinutes: 20,
    },

    // ── Module 6: Auth ────────────────────────────────────
    {
      id: 'sd-m6-auth',
      pathId: 'system-design',
      title: 'M6 · Authentication & Auth',
      description: 'OAuth 2.0, Keycloak, social login, JWT, RBAC, ABAC',
      icon: '🔐',
      prerequisiteIds: ['sd-m5-load-balancers'],
      geminiTopic: 'Authentication and Authorization in System Design: overview and abstraction via API Gateways, OAuth 2.0 (flows: authorization code, client credentials, implicit), Keycloak as identity provider, Social Login (Google/GitHub OAuth), how to design auth for microservices; supplements: OpenID Connect (OIDC) vs OAuth, JWT structure and validation (header, payload, signature), Refresh Tokens and token rotation, RBAC (Role-Based Access Control), ABAC (Attribute-Based Access Control)',
      estimatedMinutes: 22,
    },

    // ── Module 7: Architecture Patterns ──────────────────
    {
      id: 'sd-m7-patterns',
      pathId: 'system-design',
      title: 'M7 · Architecture Patterns',
      description: 'CQRS, SAGA, Event Sourcing, API Gateway, Circuit Breaker',
      icon: '🧩',
      prerequisiteIds: ['sd-m6-auth'],
      geminiTopic: 'Architecture Patterns for distributed systems: API Gateway (routing, rate limiting, auth at the edge), WAF (Web Application Firewall), Rate Limiting strategies (token bucket, sliding window, fixed window), Backend for Frontends (BFF) pattern, Service Mesh (sidecar proxy, mTLS, observability), CQRS (Command Query Responsibility Segregation — separating reads and writes), SAGA pattern (orchestration vs choreography for distributed transactions), Event Sourcing (storing events as source of truth); supplements: Circuit Breaker pattern, Retry Pattern with exponential backoff, Bulkhead Pattern, Strangler Fig Pattern for legacy migrations',
      estimatedMinutes: 28,
    },

    // ── Module 8: DNS ─────────────────────────────────────
    {
      id: 'sd-m8-dns',
      pathId: 'system-design',
      title: 'M8 · DNS',
      description: 'DNS internals, routing policies, GeoDNS, Anycast',
      icon: '🌐',
      prerequisiteIds: ['sd-m7-patterns'],
      geminiTopic: 'DNS (Domain Name System) for System Design: what DNS is and how resolution works (recursive resolver, authoritative server, root servers), DNS routing policies: Geolocation Routing, Failover Routing, Latency-Based Routing, IP-Based Routing, Weighted Routing, Multivalue Answer Routing; supplements: DNS TTL and its implications for failover speed, DNS Caching at multiple layers, GeoDNS for traffic steering, Anycast DNS for DDoS resilience',
      estimatedMinutes: 18,
    },

    // ── Module 9: Sequencer ───────────────────────────────
    {
      id: 'sd-m9-sequencer',
      pathId: 'system-design',
      title: 'M9 · Sequencer & Distributed IDs',
      description: 'Snowflake, UUID, ULID, distributed ID generation',
      icon: '🔢',
      prerequisiteIds: ['sd-m8-dns'],
      geminiTopic: 'Distributed ID Generation (Sequencer): why unique IDs are hard at scale (clock skew, race conditions), Snowflake ID (Twitter) — structure: timestamp + datacenter + machine + sequence, how to implement a Snowflake-like sequencer; supplements: UUID (v4 vs v7, pros/cons), ULID (Universally Unique Lexicographically Sortable Identifier), KSUID (K-Sortable Unique Identifier), comparison of approaches and when to use each, monotonic clock concerns',
      estimatedMinutes: 18,
    },

    // ── Module 10: Blob Store ─────────────────────────────
    {
      id: 'sd-m10-blob-store',
      pathId: 'system-design',
      title: 'M10 · Blob Store',
      description: 'Object storage: S3, GCS, R2 — presigned URLs, multipart, lifecycle',
      icon: '🪣',
      prerequisiteIds: ['sd-m9-sequencer'],
      geminiTopic: 'Blob Storage (Object Storage) in System Design: what blob stores are and how they differ from file systems and databases, how S3 internally stores objects, when to use object storage (images, videos, backups, data lakes), options: AWS S3, Google Cloud Storage, Cloudflare R2 (no egress fees); supplements: Presigned URLs (temporary access, upload/download), Multipart Upload (chunked uploads for large files), Lifecycle Policies (transition to Glacier, auto-delete), Versioning and its cost implications',
      estimatedMinutes: 18,
    },

    // ── Module 11: Cache ──────────────────────────────────
    {
      id: 'sd-m11-cache',
      pathId: 'system-design',
      title: 'M11 · Cache',
      description: 'Redis, Memcache, cache patterns, invalidation, stampede',
      icon: '⚡',
      prerequisiteIds: ['sd-m10-blob-store'],
      geminiTopic: 'Caching in System Design: what caching is and why it exists, how caches work (in-memory data structures, eviction policies LRU/LFU/TTL), when to use a cache, read speed comparison (cache ~0.1ms vs SSD ~100μs vs disk ~10ms), options: Redis (data structures, persistence, cluster), Memcache (pure cache, no persistence), in-memory application caches, stateful vs stateless caching; supplements: Cache-Aside (lazy loading), Write-Through, Write-Back (write-behind), Read-Through, Cache Invalidation strategies (TTL, event-driven, versioning keys), Cache Stampede (thundering herd) and solutions (mutex, probabilistic early expiry), Distributed Cache architecture',
      estimatedMinutes: 25,
    },

    // ── Module 12: CDN ────────────────────────────────────
    {
      id: 'sd-m12-cdn',
      pathId: 'system-design',
      title: 'M12 · CDN',
      description: 'Content delivery, edge caching, stale content, purge strategies',
      icon: '🌍',
      prerequisiteIds: ['sd-m11-cache'],
      geminiTopic: 'Content Delivery Networks (CDN): what a CDN is and how edge PoPs work, when to use a CDN (static assets, video streaming, API acceleration), how CDN caching works (Cache-Control headers, cache keys), stale content problem and cache invalidation strategies, risks of CDNs (stale deploys, origin cost, vendor lock-in); supplements: Edge Computing (running code at the CDN edge — Cloudflare Workers, Lambda@Edge), Cache-Control and Vary headers, CDN Purge strategies (instant purge, surrogate keys/cache tags), Origin Shield to protect origin from cache misses',
      estimatedMinutes: 20,
    },

    // ── Module 13: Requirements & Estimations ────────────
    {
      id: 'sd-m13-requirements',
      pathId: 'system-design',
      title: 'M13 · Requirements & Estimations',
      description: 'Availability SLAs, capacity planning, back-of-envelope math',
      icon: '📐',
      prerequisiteIds: ['sd-m12-cdn'],
      geminiTopic: 'Requirements and Estimations in System Design: availability requirements (99.9% vs 99.99% vs 99.999% and what downtime each allows), scalability and latency requirements gathering, Back of Envelope Calculations methodology (powers of 2, common byte sizes, request rates); supplements: QPS (Queries Per Second) estimation, Throughput calculation (bandwidth needs), Storage Estimation (daily data × retention × replication factor), Network Estimation (traffic shaping, peak vs average), Capacity Planning process',
      estimatedMinutes: 20,
    },

    // ── Module 14: Microservices & Monoliths ──────────────
    {
      id: 'sd-m14-microservices',
      pathId: 'system-design',
      title: 'M14 · Microservices & Monoliths',
      description: 'Trade-offs, DDD, bounded contexts, distributed transactions',
      icon: '🔷',
      prerequisiteIds: ['sd-m13-requirements'],
      geminiTopic: 'Microservices vs Monoliths in System Design: principles of microservices architecture, complexity comparison across dimensions — Features (faster in monolith initially), Scale (microservices scale independently), Onboarding (monolith simpler), Reusability (service contracts), Observability (distributed tracing needed); supplements: Domain Driven Design (DDD), Bounded Contexts and how to find them, synchronous vs asynchronous inter-service communication, Distributed Transactions (2PC, SAGA pattern revisited)',
      estimatedMinutes: 22,
    },

    // ── Module 15: Deploys & Scalability ─────────────────
    {
      id: 'sd-m15-deploys',
      pathId: 'system-design',
      title: 'M15 · Deploys & Scalability',
      description: 'Containers, Kubernetes, scaling strategies, Riot Games case study',
      icon: '🚀',
      prerequisiteIds: ['sd-m14-microservices'],
      geminiTopic: 'Deployments and Scalability: load balancer integration with deployment, IO-Bound vs CPU-Bound services and how each scales differently, containers (what Docker is, image layers, cold start problem), horizontal vs vertical scaling for CPU/Memory/IO/Requests/Queue consumers, real-world case study: Riot Games scaling (TFT global launch, LoL worlds, Valorant), deployment platform options: Kubernetes (pods, services, ingress, HPA), EC2 (raw VMs), ECS (AWS managed containers), Heroku-style (PaaS); supplements: Docker internals, Rolling Deployments, Blue-Green Deployments, Canary Releases, Auto Scaling, Horizontal Pod Autoscaler (HPA)',
      estimatedMinutes: 28,
    },

    // ── Module 16: Interview Prep ─────────────────────────
    {
      id: 'sd-m16-interview-prep',
      pathId: 'system-design',
      title: 'M16 · Interview Preparation',
      description: 'Framework, real Big Tech breakdowns, 10 canonical scenarios',
      icon: '🎯',
      prerequisiteIds: ['sd-m15-deploys'],
      geminiTopic: 'System Design Interview Preparation: how DSA knowledge affects System Design interviews, geolocation + Bloom Filter example, breaking down real Big Tech interview questions; Interview Framework — Clarify requirements, Constraints, Back-of-Envelope Math, High-Level design, Deep-Dive on critical components, Bottleneck identification, Trade-offs discussion, Risks, Evolution/future scale; Canonical scenarios to practice: URL Shortener (TinyURL), News Feed (Twitter/X), Chat System (WhatsApp), Notification Service, Ride-Hailing (Uber), Metrics Ingestion, Search Engine, Video Streaming (YouTube/Netflix), Ticketing System, Payment Processing; supplements: TinyURL deep dive, Twitter Feed ranking, WhatsApp message delivery, Uber geospatial matching, Netflix CDN strategy, Google Maps real-time, Dropbox sync, YouTube transcoding pipeline',
      estimatedMinutes: 35,
    },

    // ── Module 17: Mock Interviews ────────────────────────
    {
      id: 'sd-m17-mock',
      pathId: 'system-design',
      title: 'M17 · Mock Interviews',
      description: 'Junior, mid-level, and senior practice sessions with AI feedback',
      icon: '🎙️',
      prerequisiteIds: ['sd-m16-interview-prep'],
      geminiTopic: 'System Design Mock Interview Practice: simulate a complete System Design interview at three levels — Junior level (design a URL shortener: clarify, estimate, high-level only, 30 min), Mid-level / Pleno (design a notification system: clarify, estimate, deep-dive on delivery guarantees and fan-out, 45 min), Senior level (design a distributed metrics ingestion pipeline: clarify, estimate, high-level, deep-dive on storage engine and query layer, trade-offs of hot path vs cold path, 60 min). For each scenario: provide the problem statement, guide through the framework, highlight common mistakes and what top candidates do differently',
      estimatedMinutes: 40,
    },

    // ── Extra Module: Distributed Systems & Consistency ───
    {
      id: 'sd-extra-distributed',
      pathId: 'system-design',
      title: 'Extra · Distributed Systems',
      description: 'CAP, PACELC, consensus (Raft/Paxos), vector clocks, consistent hashing',
      icon: '🌐',
      prerequisiteIds: ['sd-m17-mock'],
      geminiTopic: 'Distributed Systems and Consistency deep dive: CAP Theorem (Consistency, Availability, Partition Tolerance — can only guarantee 2), PACELC extension (Partition: A vs C, Else: L vs C), Strong Consistency (linearizability), Eventual Consistency, Read-Your-Writes consistency, Monotonic Reads; Replication models: Leader-Follower Replication (primary-replica, failover), Multi-Leader Replication (conflict resolution, use cases), Leaderless Replication (Dynamo-style); Quorum Consensus (R + W > N, tuning for availability vs consistency); Distributed challenges: Split Brain problem and fencing, Distributed Locks (Redis Redlock, ZooKeeper), Raft consensus algorithm (leader election, log replication — intuitive explanation), Paxos (conceptual overview, why Raft is preferred), Vector Clocks (causality tracking, happened-before relationship), Conflict Resolution strategies (LWW, CRDT), Consistent Hashing (virtual nodes, why it minimizes resharding)',
      estimatedMinutes: 35,
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// PATH: Software Testing
// ─────────────────────────────────────────────────────────────
const testingPath: LearningPath = {
  id: 'testing',
  title: 'Software Testing',
  shortTitle: 'Testing',
  description: 'Write tests that give you confidence to ship.',
  icon: '🧪',
  color: 'hsl(330, 70%, 62%)',
  cssVar: '--path-testing',
  nodes: [
    {
      id: 'test-unit',
      pathId: 'testing',
      title: 'Unit Testing',
      description: 'Test functions in isolation',
      icon: '🔬',
      prerequisiteIds: [],
      geminiTopic: 'Unit testing fundamentals: what to test, test structure (AAA pattern), assertions, test isolation, Jest basics, writing effective unit tests with examples',
      estimatedMinutes: 12,
    },
    {
      id: 'test-mocking',
      pathId: 'testing',
      title: 'Mocking & Stubs',
      description: 'Isolate dependencies with test doubles',
      icon: '🎭',
      prerequisiteIds: ['test-unit'],
      geminiTopic: 'Mocking in tests: mocks vs stubs vs spies, when to mock, Jest mock functions, mocking modules, mocking HTTP calls, avoiding over-mocking',
      estimatedMinutes: 12,
    },
    {
      id: 'test-integration',
      pathId: 'testing',
      title: 'Integration Testing',
      description: 'Test component interactions together',
      icon: '🔌',
      prerequisiteIds: ['test-mocking'],
      geminiTopic: 'Integration testing: testing multiple units together, database integration tests, API integration tests, test containers, when integration tests add value over unit tests',
      estimatedMinutes: 14,
    },
    {
      id: 'test-e2e',
      pathId: 'testing',
      title: 'End-to-End Testing',
      description: 'Simulate real user flows with Playwright',
      icon: '🤖',
      prerequisiteIds: ['test-integration'],
      geminiTopic: 'End-to-end testing with Playwright: page object model, selectors, assertions, handling async actions, visual regression testing, E2E in CI pipelines',
      estimatedMinutes: 14,
    },
    {
      id: 'test-tdd',
      pathId: 'testing',
      title: 'TDD & Test Strategy',
      description: 'Red-green-refactor and test pyramid',
      icon: '♻️',
      prerequisiteIds: ['test-e2e'],
      geminiTopic: 'Test-Driven Development: red-green-refactor cycle, test pyramid (unit vs integration vs E2E), BDD, writing tests first, when TDD works and when it doesn\'t',
      estimatedMinutes: 14,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH: Performance & Optimization
// ─────────────────────────────────────────────────────────────
const performancePath: LearningPath = {
  id: 'performance',
  title: 'Performance & Optimization',
  shortTitle: 'Perf',
  description: 'Make your software faster, leaner, and more efficient.',
  icon: '🚀',
  color: 'hsl(50, 85%, 55%)',
  cssVar: '--path-perf',
  nodes: [
    {
      id: 'perf-profiling',
      pathId: 'performance',
      title: 'Profiling & Benchmarking',
      description: 'Find the real bottleneck before optimizing',
      icon: '🔍',
      prerequisiteIds: [],
      geminiTopic: 'Performance profiling: CPU profiling, memory profiling, flame graphs, Node.js profiling with --prof, Chrome DevTools Performance tab, benchmarking with autocannon',
      estimatedMinutes: 14,
    },
    {
      id: 'perf-algorithms',
      pathId: 'performance',
      title: 'Algorithm Optimization',
      description: 'Choose the right algorithm for the data size',
      icon: '🧮',
      prerequisiteIds: ['perf-profiling'],
      geminiTopic: 'Algorithm optimization: choosing algorithms by Big-O, avoiding premature optimization, sorting algorithm tradeoffs, spatial locality, loop optimization, bit manipulation tricks',
      estimatedMinutes: 14,
    },
    {
      id: 'perf-db',
      pathId: 'performance',
      title: 'Database Query Optimization',
      description: 'Indexes, query plans, and avoiding N+1',
      icon: '🗄️',
      prerequisiteIds: ['perf-algorithms'],
      geminiTopic: 'Database query optimization: using EXPLAIN, composite indexes, covering indexes, avoiding N+1 queries, connection pooling, query caching, materialized views',
      estimatedMinutes: 16,
    },
    {
      id: 'perf-concurrency',
      pathId: 'performance',
      title: 'Concurrency & Async',
      description: 'Threads, event loops, and parallel execution',
      icon: '⚙️',
      prerequisiteIds: ['perf-db'],
      geminiTopic: 'Concurrency and async patterns: threads vs async I/O, Node.js event loop deep dive, worker threads, Promise.all vs sequential awaits, race conditions and locks',
      estimatedMinutes: 16,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// MASTER EXPORT — add new paths here to register them globally
// ─────────────────────────────────────────────────────────────
export const LEARNING_PATHS: LearningPath[] = [
  dataStructuresPath,
  awsPath,
  backendPath,
  systemDesignPath,
  testingPath,
  performancePath,
];

// Helper: get a path by id
export function getPath(pathId: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === pathId);
}

// Helper: get a node by id (searches all paths)
export function getNode(nodeId: string): SkillNode | undefined {
  for (const path of LEARNING_PATHS) {
    const node = path.nodes.find((n) => n.id === nodeId);
    if (node) return node;
  }
  return undefined;
}

// Helper: get all nodes in a path
export function getPathNodes(pathId: string): SkillNode[] {
  return getPath(pathId)?.nodes ?? [];
}

// Helper: check if a node is unlocked given the set of completed node IDs
export function isNodeUnlocked(node: SkillNode, completedNodes: string[]): boolean {
  if (node.prerequisiteIds.length === 0) return true;
  return node.prerequisiteIds.every((id) => completedNodes.includes(id));
}

// Helper: get total node count across all paths
export function getTotalNodeCount(): number {
  return LEARNING_PATHS.reduce((acc, p) => acc + p.nodes.length, 0);
}
