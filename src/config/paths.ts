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
  description: 'Master the computational building blocks of efficient software — from memory to graphs.',
  icon: '🌲',
  color: 'hsl(200, 80%, 58%)',
  cssVar: '--path-data',
  nodes: [
    {
      id: 'dsa-bigo',
      pathId: 'data-structures',
      title: 'Big-O Notation',
      description: 'Time & space complexity, asymptotic analysis, Master Theorem',
      icon: '📊',
      prerequisiteIds: [],
      geminiTopic: 'Big-O Notation and Complexity Analysis: Time Complexity and Space Complexity concepts, worst-case vs average-case vs best-case analysis, asymptotic simplification (dropping constants and non-dominant terms), common complexity classes O(1) O(log n) O(n) O(n log n) O(n²) O(2^n) O(n!) with real code examples for each. Coding Lab focus: identify and calculate complexity of iterative and recursive algorithms. Supplements: Amortized Analysis (amortized cost of dynamic array push), Master Theorem for recurrence relations, space-time trade-offs when choosing data structures.',
      estimatedMinutes: 15,
    },
    {
      id: 'dsa-arrays',
      pathId: 'data-structures',
      title: 'Arrays & Matrices',
      description: 'Contiguous memory, two-pointer, sliding window, sparse matrices',
      icon: '📦',
      prerequisiteIds: ['dsa-bigo'],
      geminiTopic: 'Arrays and Matrices: contiguous memory allocation and indexing, static arrays vs dynamic arrays (resizable vectors), complexity of access/insert/delete/search operations, two-pointer technique and sliding window pattern with examples, in-place rotation and string reversal algorithms. Coding Lab focus: implement an in-place array rotation or string reversal without auxiliary memory. Supplements: resizing strategies (load factor and capacity doubling), memory alignment and cache locality, sparse matrix representations (COO, CSR).',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-linked-lists',
      pathId: 'data-structures',
      title: 'Linked Lists',
      description: 'Nodes & pointers, Floyd cycle detection, sentinel nodes',
      icon: '🔗',
      prerequisiteIds: ['dsa-arrays'],
      geminiTopic: 'Linked Lists: node and pointer structure, singly vs doubly linked lists, circular lists and sentinel nodes, classic algorithms: list reversal and cycle detection (Floyd Tortoise and Hare algorithm). Coding Lab focus: implement node deletion without head pointer access, or detect a cycle using fast/slow pointers. Supplements: Skip Lists for O(log n) search, array vs linked list cache miss comparison (memory locality impact on performance).',
      estimatedMinutes: 14,
    },
    {
      id: 'dsa-stacks',
      pathId: 'data-structures',
      title: 'Stacks',
      description: 'LIFO, call stack, monotonic stack, syntax validation',
      icon: '📚',
      prerequisiteIds: ['dsa-linked-lists'],
      geminiTopic: 'Stacks (LIFO — Last In First Out): push/pop/peek operations, array-based vs linked-list-based implementation, applications: call stack execution control, data reversal, bracket/parenthesis balancing. Coding Lab focus: build a syntax validator for strings containing brackets {[()]}. Supplements: Monotonic Stack for next-greater-element problems, infix to postfix/prefix notation conversion, undo/redo history mechanism.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-queues',
      pathId: 'data-structures',
      title: 'Queues',
      description: 'FIFO, circular queue, deque, priority queues',
      icon: '🔃',
      prerequisiteIds: ['dsa-stacks'],
      geminiTopic: 'Queues (FIFO — First In First Out): enqueue/dequeue operations, circular queue implementation with fixed-size array, double-ended queues (Deque), introduction to Priority Queues. Coding Lab focus: implement a Circular Queue using a static array. Supplements: Monotonic Queue for sliding window maximum, thread-safe concurrent queues and lock-free ring buffers for audio/video streaming.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-hashmaps',
      pathId: 'data-structures',
      title: 'Hash Maps',
      description: 'Hash functions, collision resolution, load factor, Two Sum',
      icon: '#️⃣',
      prerequisiteIds: ['dsa-queues'],
      geminiTopic: 'Hash Maps (Hash Tables): uniform hash functions, key-value structure and direct addressing, collision resolution strategies: Chaining vs Open Addressing (Linear Probing, Quadratic Probing, Double Hashing), load factor and rehashing process. Coding Lab focus: solve the classic Two Sum problem in O(n) time using a Hash Map. Supplements: Perfect Hashing, cryptographic vs non-cryptographic hash functions (MurmurHash, FNV-1a), Hash DoS collision attacks.',
      estimatedMinutes: 14,
    },
    {
      id: 'dsa-trees',
      pathId: 'data-structures',
      title: 'Trees & BSTs',
      description: 'DFS/BFS traversals, heaps, AVL trees, Trie, Segment Trees',
      icon: '🌳',
      prerequisiteIds: ['dsa-hashmaps'],
      geminiTopic: 'Trees and Binary Search Trees: terminology (root, leaf, parent, child, height, depth), binary trees and BST properties, tree traversals: preorder/inorder/postorder (DFS) and level-order (BFS), Min-Heap and Max-Heap properties. Coding Lab focus: implement BST search, insert, and in-order traversal. Supplements: self-balancing trees (AVL and Red-Black Trees), Trie (prefix tree) for autocomplete, Segment Trees and Fenwick Trees (Binary Indexed Trees) for range queries.',
      estimatedMinutes: 18,
    },
    {
      id: 'dsa-graphs',
      pathId: 'data-structures',
      title: 'Graphs',
      description: 'BFS/DFS, topological sort, Dijkstra, minimum spanning trees',
      icon: '🕸️',
      prerequisiteIds: ['dsa-trees'],
      geminiTopic: 'Graphs: vertices and edges, directed vs undirected, weighted vs unweighted, adjacency matrix vs adjacency list representations, BFS (shortest path in unweighted graphs) and DFS (cycle detection, connected components). Coding Lab focus: implement BFS to find the minimum number of hops between two nodes in an unweighted graph. Supplements: Dijkstra and Bellman-Ford for shortest paths in weighted graphs, Topological Sort (Kahn and DFS-based), Minimum Spanning Trees (Kruskal and Prim).',
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
  description: 'Build, secure, and deploy on the world\'s largest cloud platform.',
  icon: '☁️',
  color: 'hsl(30, 90%, 58%)',
  cssVar: '--path-aws',
  nodes: [
    {
      id: 'aws-iam',
      pathId: 'aws',
      title: 'IAM',
      description: 'Users, groups, roles, policies, least privilege, AssumeRole',
      icon: '🔐',
      prerequisiteIds: [],
      geminiTopic: 'AWS IAM (Identity and Access Management): users, groups, roles and policies; IAM policy JSON structure (Effect, Action, Resource, Condition); least privilege principle; MFA and root account security; IAM AssumeRole mechanism and STS temporary credentials. Coding Lab focus: write a restricted IAM policy that allows only GetObject on a specific S3 bucket. Supplements: IAM policy evaluation logic (explicit deny, implicit deny, allow), identity federation (OIDC and SAML 2.0), AWS Organizations and Service Control Policies (SCPs).',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-s3',
      pathId: 'aws',
      title: 'S3',
      description: 'Buckets, storage classes, versioning, lifecycle, encryption',
      icon: '🪣',
      prerequisiteIds: ['aws-iam'],
      geminiTopic: 'AWS S3: buckets, objects, keys and metadata; storage classes: Standard, Intelligent-Tiering, Standard-IA, Glacier Instant/Flexible/Deep Archive; security: Bucket Policies, ACLs, encryption at rest (SSE-S3, SSE-KMS); object versioning and Lifecycle Rules. Coding Lab focus: write an automation script that creates a lifecycle rule to transition files to Glacier after 30 days. Supplements: Presigned URLs for secure temporary uploads/downloads, S3 Transfer Acceleration and Multipart Uploads for large files, S3 Object Lock (WORM).',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-ec2',
      pathId: 'aws',
      title: 'EC2',
      description: 'Instance families, AMIs, security groups, EBS, pricing models',
      icon: '🖥️',
      prerequisiteIds: ['aws-iam'],
      geminiTopic: 'AWS EC2: instance families (General Purpose, Compute, Memory, Storage Optimized); AMIs and Key Pairs; Security Groups (stateful) vs Network ACLs (stateless); EBS (Elastic Block Store) vs Instance Store (ephemeral); pricing models: On-Demand, Reserved Instances, Savings Plans, Spot Instances. Coding Lab focus: write a Bash User Data script that automatically provisions an Nginx server on EC2 boot. Supplements: Placement Groups (Cluster, Spread, Partition), Elastic IP vs dynamic public IPs, AWS Nitro System architecture.',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-lambda',
      pathId: 'aws',
      title: 'Lambda & Serverless',
      description: 'FaaS, cold starts, Provisioned Concurrency, DLQs',
      icon: 'λ',
      prerequisiteIds: ['aws-s3', 'aws-ec2'],
      geminiTopic: 'AWS Lambda (Function as a Service): event-driven execution model, supported runtimes, execution limits (15 min max, memory, /tmp storage); lifecycle: cold starts vs warm starts and mitigation with Provisioned Concurrency; environment variables and Execution Role permissions. Coding Lab focus: code a Lambda function that processes a JSON payload and saves logs to CloudWatch. Supplements: Lambda Layers for shared dependencies, VPC integration and its cold-start impact, Destinations and DLQs for async failure handling.',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-ecs',
      pathId: 'aws',
      title: 'ECS & Fargate',
      description: 'Container orchestration, Task Definitions, EC2 vs Fargate',
      icon: '🐳',
      prerequisiteIds: ['aws-lambda'],
      geminiTopic: 'AWS ECS (Elastic Container Service) and Fargate: managed container orchestration, components: Task Definitions, Tasks, Services, Clusters; launch types: EC2 (self-managed servers) vs Fargate (serverless containers); deploy strategies and CPU/Memory limits per Task. Coding Lab focus: write a valid JSON Task Definition to run a Node.js Docker image on ECS. Supplements: ECR (Elastic Container Registry), awsvpc network mode, AWS App Mesh and Service Discovery integration.',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-sqs-sns',
      pathId: 'aws',
      title: 'SQS & SNS',
      description: 'Standard vs FIFO queues, pub/sub, fan-out, DLQ, filtering',
      icon: '📨',
      prerequisiteIds: ['aws-lambda'],
      geminiTopic: 'AWS SQS and SNS for microservice decoupling: SQS Standard vs FIFO queues, Visibility Timeout and Dead-Letter Queues (DLQ); SNS Pub/Sub model, Topics, Subscriptions and message filtering policies. Coding Lab focus: design a producer-consumer flow simulating SQS message send and visibility adjustment. Supplements: Fan-out pattern (SNS broadcasting to multiple SQS queues simultaneously), Long Polling vs Short Polling, FIFO deduplication strategies.',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-dynamo',
      pathId: 'aws',
      title: 'DynamoDB',
      description: 'Partition key, sort key, GSI, capacity modes, DAX, Streams',
      icon: '⚡',
      prerequisiteIds: ['aws-sqs-sns', 'aws-ecs'],
      geminiTopic: 'AWS DynamoDB (managed NoSQL): key-value and document table architecture; simple primary key (Partition Key) vs composite primary key (Partition Key + Sort Key); capacity modes: Provisioned Capacity with Auto Scaling vs On-Demand; read consistency: Eventual vs Strongly Consistent Reads. Coding Lab focus: model a DynamoDB table defining primary key attributes for an e-commerce entity. Supplements: GSIs (Global Secondary Indexes) and LSIs (Local Secondary Indexes), DynamoDB Streams for real-time event-driven architectures, DAX (DynamoDB Accelerator) for microsecond in-memory cache.',
      estimatedMinutes: 18,
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
  description: 'Build efficient servers, APIs, and data layers with clean architecture patterns.',
  icon: '⚙️',
  color: 'hsl(142, 60%, 52%)',
  cssVar: '--path-backend',
  nodes: [
    {
      id: 'be-nodejs',
      pathId: 'backend',
      title: 'Node.js',
      description: 'V8 engine, Event Loop phases, Streams, EventEmitters, Worker Threads',
      icon: '🟢',
      prerequisiteIds: [],
      geminiTopic: 'Node.js Runtime: V8 engine and libuv architecture, the Event Loop phases (Timers, Pending Callbacks, Poll, Check, Close Callbacks), non-blocking asynchronous I/O, EventEmitters, Streams (Readable, Writable, Transform) and Buffers. Coding Lab focus: create a script that consumes a massive log file using Streams to avoid Out-of-Memory errors. Supplements: Worker Threads for CPU-intensive processing, Cluster module for horizontal scaling on multi-core servers, memory leak diagnosis strategies.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-rest',
      pathId: 'backend',
      title: 'REST APIs',
      description: 'RESTful constraints, HTTP semantics, idempotency, versioning',
      icon: '🌐',
      prerequisiteIds: ['be-nodejs'],
      geminiTopic: 'REST (Representational State Transfer): architectural constraints (Client-Server, Statelessness, Cacheability, Layered System, Uniform Interface), HTTP methods (GET POST PUT DELETE PATCH) and idempotency semantics, HTTP status codes (2xx 3xx 4xx 5xx) applied correctly, clean URI design, query params vs path params. Coding Lab focus: design HTTP routes and complete JSON payloads for a full CRUD task management system. Supplements: HATEOAS (Hypermedia as the Engine of Application State), CORS and preflight requests, API versioning strategies (URI, custom headers, Accept header).',
      estimatedMinutes: 14,
    },
    {
      id: 'be-graphql',
      pathId: 'backend',
      title: 'GraphQL',
      description: 'SDL, resolvers, N+1 with DataLoader, Federation',
      icon: '🔷',
      prerequisiteIds: ['be-rest'],
      geminiTopic: 'GraphQL: the over-fetching and under-fetching problem in REST, Schema Definition Language (SDL), core types: Queries, Mutations and Subscriptions, Resolvers and graph-oriented execution. Coding Lab focus: write a basic GraphQL Schema with interconnected data types and a query. Supplements: N+1 query performance problem and DataLoader batching solution, GraphQL Federation (Gateway/Subgraph architecture for microservices), query complexity analysis to protect the server.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-sql',
      pathId: 'backend',
      title: 'SQL in Code',
      description: 'Relational model, joins, window functions, transaction isolation',
      icon: '🗃️',
      prerequisiteIds: ['be-rest'],
      geminiTopic: 'SQL for backend developers: relational model, tables, primary and foreign keys, DDL (Data Definition Language) and DML (Data Manipulation Language), JOIN operations (Inner, Left, Right, Full Outer), GROUP BY and aggregations with HAVING, ACID transactions from the application perspective (Commit, Rollback). Coding Lab focus: write a complex SQL query aggregating customer sales data using JOINs and advanced filters. Supplements: Window Functions (ROW_NUMBER, RANK, PARTITION BY), Common Table Expressions (CTEs), transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).',
      estimatedMinutes: 18,
    },
    {
      id: 'be-nosql',
      pathId: 'backend',
      title: 'NoSQL in Code',
      description: 'Document vs key-value vs column-family, MongoDB aggregation pipelines',
      icon: '📄',
      prerequisiteIds: ['be-sql'],
      geminiTopic: 'NoSQL databases for backend development: philosophies — Document (MongoDB), Key-Value, Column-Family and Graph databases, denormalized vs normalized modeling, MongoDB ecosystem: collections, BSON documents, indexing and dynamic queries, ideal use cases: audit logs, flexible catalogs, user session persistence. Coding Lab focus: create a MongoDB Aggregation Pipeline query to filter and group documents. Supplements: embedded documents vs references design patterns, replica sets and application-level sharding in NoSQL, time-series databases.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-clean-arch',
      pathId: 'backend',
      title: 'Clean Architecture',
      description: 'Separation of concerns, Use Cases, DI, DTOs, Hexagonal Architecture',
      icon: '🏛️',
      prerequisiteIds: ['be-graphql', 'be-nosql'],
      geminiTopic: 'Clean Architecture and Design Patterns: Separation of Concerns principle, Clean Architecture layers: Entities (global business rules), Use Cases (application rules), Interface Adapters (Controllers, Gateways), Frameworks & Drivers; Dependency Inversion (D of SOLID) as decoupling foundation, Data Transfer Objects (DTOs) and persistence layer isolation. Coding Lab focus: refactor a coupled monolithic endpoint by isolating business logic into a pure Use Case class. Supplements: Hexagonal Architecture (Ports & Adapters), common creational and structural patterns in backend (Factory, Strategy, Repository), Bounded Contexts from DDD.',
      estimatedMinutes: 18,
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
  description: 'Build confidence to ship with a layered testing strategy from unit to E2E.',
  icon: '🧪',
  color: 'hsl(330, 70%, 62%)',
  cssVar: '--path-testing',
  nodes: [
    {
      id: 'test-unit',
      pathId: 'testing',
      title: 'Unit Testing',
      description: 'AAA pattern, assertions, code coverage, mutation testing',
      icon: '🔬',
      prerequisiteIds: [],
      geminiTopic: 'Unit Testing: the concept of an isolated unit (pure functions, class methods), AAA pattern (Arrange, Act, Assert), assertion libraries and equality/exception/type matchers, code coverage metrics (line, branch, function coverage). Coding Lab focus: write a test suite covering all happy paths and error paths of a math/string utility function. Supplements: Mutation Testing to evaluate test suite quality, preventing flaky tests, handling non-deterministic behavior (date/time functions).',
      estimatedMinutes: 14,
    },
    {
      id: 'test-integration',
      pathId: 'testing',
      title: 'Integration Testing',
      description: 'Multi-module verification, DB seeding, Testcontainers, Contract Testing',
      icon: '🔌',
      prerequisiteIds: ['test-unit'],
      geminiTopic: 'Integration Testing: verifying communication between two or more modules or external dependencies, API integration tests (firing real HTTP requests against local endpoints), database strategies: isolated schemas, data seeding and post-test cleanup/truncation. Coding Lab focus: configure an integration test for an express/fastify route that performs a real insert into an in-memory database and validates the response. Supplements: Testcontainers for spinning up real databases via Docker during test runs, Contract Testing with Pact.',
      estimatedMinutes: 16,
    },
    {
      id: 'test-e2e',
      pathId: 'testing',
      title: 'End-to-End Testing',
      description: 'Playwright, Page Object Model, visual regression, CI pipelines',
      icon: '🤖',
      prerequisiteIds: ['test-integration'],
      geminiTopic: 'End-to-End Testing: validating the complete application flow from the user perspective (UI → Backend → Database), modern browser automation tools (Playwright, Cypress), Page Object Model (POM) for maintainable UI selector management, network interception, mobile device emulation and visual regression testing. Coding Lab focus: write a Playwright/Cypress script simulating a login form fill and verifying the redirect. Supplements: parallel test execution and shared state control in CI/CD pipelines, authentication bypass strategies to speed up protected-page tests.',
      estimatedMinutes: 16,
    },
    {
      id: 'test-mocking',
      pathId: 'testing',
      title: 'Test Doubles',
      description: 'Mocks vs stubs vs spies, over-mocking risks, MSW',
      icon: '🎭',
      prerequisiteIds: ['test-e2e'],
      geminiTopic: 'Test Doubles — Mocks, Stubs & Spies: isolating side effects and external dependencies (third-party API calls); precise definitions: Stubs (pre-programmed responses), Mocks (pre-configured with call expectations that form a spec), Spies (record how functions were called — arguments, invocation count); the danger of over-mocking (tests pass but system fails in production). Coding Lab focus: replace a real email-sending module with a Mock/Stub in a user-creation test, verifying the send method was called with correct parameters. Supplements: external service virtualization, MSW (Mock Service Worker) for HTTP-layer interception.',
      estimatedMinutes: 14,
    },
    {
      id: 'test-tdd',
      pathId: 'testing',
      title: 'TDD',
      description: 'Red-Green-Refactor cycle, BDD, Inside-Out vs Outside-In',
      icon: '♻️',
      prerequisiteIds: ['test-mocking'],
      geminiTopic: 'Test-Driven Development (TDD): design philosophy of code guided by tests, the Red-Green-Refactor cycle: Red (write a failing test for non-existent functionality), Green (write minimum code to make it pass), Refactor (clean up eliminating duplication, improving names and architecture, keeping test green); TDD benefits for software architecture (native testability). Coding Lab focus: develop a Roman numeral to integer converter using strictly the TDD cycle phases. Supplements: Inside-Out (Bottom-Up) vs Outside-In (Top-Down / London School) TDD strategies, Behavior-Driven Development (BDD) and Gherkin syntax (Given/When/Then).',
      estimatedMinutes: 16,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH: Performance & Optimization
// ─────────────────────────────────────────────────────────────
const performancePath: LearningPath = {
  id: 'performance',
  title: 'Application Performance',
  shortTitle: 'Perf',
  description: 'Profile, optimize, and scale — from flame graphs to lock-free concurrency.',
  icon: '🚀',
  color: 'hsl(50, 85%, 55%)',
  cssVar: '--path-perf',
  nodes: [
    {
      id: 'perf-profiling',
      pathId: 'performance',
      title: 'Profiling & Diagnostics',
      description: 'Flame graphs, heap snapshots, GC analysis, p50/p95/p99 latency',
      icon: '🔍',
      prerequisiteIds: [],
      geminiTopic: 'Performance Profiling and Diagnostics: quantitative measurement in running systems, CPU profiling and reading Flame Graphs, memory profiling: Heap Snapshots and Garbage Collector behavior patterns, latency metrics: understanding and monitoring response time percentiles (p50, p95, p99). Coding Lab focus: analyze a simulated Heap Snapshot or metrics log to identify which function is causing a memory leak. Supplements: APM tools (Datadog, New Relic, OpenTelemetry), Continuous Profiling in production environments.',
      estimatedMinutes: 16,
    },
    {
      id: 'perf-algorithms',
      pathId: 'performance',
      title: 'Algorithm Optimization',
      description: 'Big-O reduction, memoization, tabulation, in-place operations',
      icon: '🧮',
      prerequisiteIds: ['perf-profiling'],
      geminiTopic: 'Algorithm Optimization for production code: refactoring with focus on Big-O reduction, strategic use of Dynamic Programming (Memoization top-down and Tabulation bottom-up) to avoid recomputation, in-place operations for severe memory savings, loop optimizations (loop unrolling, eliminating redundant checks inside high-frequency loops). Coding Lab focus: optimize an O(n²) algorithm to an equivalent O(n log n) or O(n) version. Supplements: cache-conscious programming (spatial and temporal data locality on CPU), software-level SIMD (Single Instruction Multiple Data) instruction exploitation.',
      estimatedMinutes: 16,
    },
    {
      id: 'perf-db',
      pathId: 'performance',
      title: 'DB Query Optimization',
      description: 'EXPLAIN, composite & covering indexes, N+1, cursor pagination',
      icon: '🗄️',
      prerequisiteIds: ['perf-algorithms'],
      geminiTopic: 'Database Query Optimization: detailed query execution plan analysis (EXPLAIN), advanced indexing strategies: B-Tree vs Hash indexes, composite and covering indexes, eliminating N+1 query patterns in code, high-volume data pagination: Offset-based vs Cursor-based (Keyset) Pagination. Coding Lab focus: rewrite a slow query doing a Full Table Scan by creating the correct index and adjusting WHERE clauses. Supplements: connection pool sizing (ideal connection pool dimensions), index fragmentation and the impact of frequent writes on reads, Materialized Views for pre-computed aggregations.',
      estimatedMinutes: 18,
    },
    {
      id: 'perf-concurrency',
      pathId: 'performance',
      title: 'Concurrency & Parallelism',
      description: 'Race conditions, deadlocks, mutexes, Actor Model, lock-free structures',
      icon: '⚙️',
      prerequisiteIds: ['perf-db'],
      geminiTopic: 'Concurrency and Parallelism: architectural differences between Processes (memory isolation) and Threads (shared memory), concurrency problems: Race Conditions, Deadlocks, Livelocks and Starvation, synchronization primitives: Locks, Mutexes, Semaphores and atomic operations, concurrency models: async thread-based vs single-threaded Event Loop (Node.js/Python asyncio). Coding Lab focus: implement a mechanism that resolves a race condition on a shared variable using exclusive locks or semaphores. Supplements: Actor Model for fault-tolerant distributed concurrency (Erlang/Akka), lock-free and wait-free data structures, Green Threads, Goroutines and virtual fibers.',
      estimatedMinutes: 18,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// PATH: Frontend Architecture & Rendering
// ─────────────────────────────────────────────────────────────
const frontendRenderingPath: LearningPath = {
  id: 'frontend-rendering',
  title: 'Frontend Architecture & Rendering',
  shortTitle: 'Frontend',
  description: 'CSR, SSR, SSG, RSC, Edge Rendering and Core Web Vitals — understand every rendering paradigm.',
  icon: '🖥️',
  color: 'hsl(190, 75%, 55%)',
  cssVar: '--path-frontend',
  nodes: [
    {
      id: 'fe-csr',
      pathId: 'frontend-rendering',
      title: 'CSR & SPAs',
      description: 'Single Page Applications, bundle lifecycle, SEO challenges',
      icon: '🌐',
      prerequisiteIds: [],
      geminiTopic: 'Client-Side Rendering (CSR) and Single Page Applications (SPAs): the SPA paradigm and skeleton HTML (<div id="root">), client lifecycle: JS bundle download → parsing → execution → DOM injection → runtime data fetching; architectural impacts: slow initial load (White Screen Effect), excellent subsequent navigation, chronic SEO challenges. Coding Lab focus: implement a pure SPA client using history.pushState or hashchange event to manage routes dynamically without page reload. Supplements: Code-Splitting and Lazy Loading strategies, real cost of JS parsing and compilation on low-end mobile CPUs.',
      estimatedMinutes: 16,
    },
    {
      id: 'fe-ssr',
      pathId: 'frontend-rendering',
      title: 'SSR',
      description: 'Server-Side Rendering, hydration, FCP/LCP vs TTFB trade-offs',
      icon: '🖧',
      prerequisiteIds: ['fe-csr'],
      geminiTopic: 'Server-Side Rendering (SSR): dynamic HTML generation per request in modern frameworks (Next.js, Remix), data journey: Server receives request → fetches from DB/API → renders populated HTML → sends HTML string to browser; Hydration: the process of attaching event listeners to static HTML received from the server; metric trade-offs: dramatic improvement in FCP and LCP vs increase in TTFB. Coding Lab focus: create a mini Node.js/Express server that uses a template engine (or renderToString) to generate a dynamic HTML page injecting data from a simulated API. Supplements: serializing and deserializing shared state between server and client (avoiding hydration mismatch errors), HTTP Cache headers (Cache-Control, ETags) at the SSR server level.',
      estimatedMinutes: 18,
    },
    {
      id: 'fe-ssg',
      pathId: 'frontend-rendering',
      title: 'SSG & ISR',
      description: 'Static Site Generation, Incremental Static Regeneration, Jamstack',
      icon: '📄',
      prerequisiteIds: ['fe-ssr'],
      geminiTopic: 'Static Site Generation (SSG) and ISR: full pre-rendering at build time (npm run build), pure static files (HTML/CSS/JS) distributed globally via CDNs, Incremental Static Regeneration (ISR): updating specific static pages in the background without rebuilding the entire site; revalidation mechanisms: time-based (Stale-While-Revalidate) and on-demand (via Webhooks). Coding Lab focus: create a Node.js build script that scans a directory of Markdown blog posts, converts them to static HTML pages and generates a central index.html. Supplements: fallback strategies for dynamic routes not generated at build time (fallback: blocking vs true), Jamstack pattern and decoupled Headless CMS architectures.',
      estimatedMinutes: 16,
    },
    {
      id: 'fe-islands',
      pathId: 'frontend-rendering',
      title: 'Islands & Resumability',
      description: 'Partial hydration (Astro), Resumability (Qwik), TBT/INP impact',
      icon: '🏝️',
      prerequisiteIds: ['fe-ssg'],
      geminiTopic: 'Modern Hydration Paradigms: the core problem of modern web — Full Client Hydration creates terrible interactivity delay (negatively impacting TBT and INP); Islands Architecture: render 100% static HTML on server and inject isolated JavaScript "islands" only where needed (popularized by Astro); Resumability: completely eliminating hydration — the server serializes state and event listeners directly into HTML, allowing interactivity to be instantly "resumed" on the client without re-executing code (Qwik approach). Coding Lab focus: map and design the component structure of an e-commerce product detail page, graphically separating what should be pure static HTML and what needs to be treated as an isolated interactivity Island. Supplements: Partial Hydration and Progressive Hydration techniques, script loading strategies based on screen visibility (Intersection Observer).',
      estimatedMinutes: 20,
    },
    {
      id: 'fe-rsc',
      pathId: 'frontend-rendering',
      title: 'React Server Components',
      description: 'RSC vs Client Components, zero-bundle-size, HTML Streaming, Suspense',
      icon: '⚛️',
      prerequisiteIds: ['fe-islands'],
      geminiTopic: 'React Server Components (RSC) and HTML Streaming: native component distinction: Server Components (run exclusively on server, never send JS to client) vs Client Components (traditional, hydrated in browser); mental model shift: data fetching directly at component root using async server functions; HTTP Streaming: chunking the HTML response — using React Suspense the server sends the page skeleton immediately and streams heavy async components as their data becomes ready. Coding Lab focus: simulate a component tree architecture writing pseudocode that illustrates async data passing from a Server Component to an interactive Client Component, maintaining zero-bundle-size on the server. Supplements: Server Actions for safe data mutation and backend calls triggered directly from client forms, cache sub-tree revalidation and mutation management.',
      estimatedMinutes: 20,
    },
    {
      id: 'fe-edge',
      pathId: 'frontend-rendering',
      title: 'Edge Rendering & Core Web Vitals',
      description: 'V8 Isolates, Edge Middleware, LCP/CLS/INP, RUM vs Lighthouse',
      icon: '⚡',
      prerequisiteIds: ['fe-rsc'],
      geminiTopic: 'Edge Rendering and Core Web Vitals: migrating traditional SSR from centralized datacenters to the Edge via V8 Isolates (Cloudflare Workers, Vercel Edge Runtime); benefits: ridiculously low global TTFB and custom logic execution close to the user; Edge Middleware for instant A/B testing, geolocation and security before HTML is generated; Core Web Vitals audit: measuring each rendering strategy success through LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift) and INP (Interaction to Next Paint). Coding Lab focus: write a conceptual Edge Middleware script that intercepts an incoming request, analyzes geographic location metadata from headers and rewrites the destination route to serve a localized page version without visible client redirects. Supplements: network latency problem between Edge functions and centralized transactional databases (and the use of Edge Databases), Real User Monitoring (RUM) reports contrasted with lab data (Lighthouse).',
      estimatedMinutes: 20,
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
  frontendRenderingPath,
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
