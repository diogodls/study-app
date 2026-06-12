// ============================================================
// DevQuest â€” Learning Paths Configuration
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
  depthTopics?: {
    learn?: string;
    deepen?: string;
    master?: string;
  };
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PATH: Data Structures & Algorithms
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const dataStructuresPath: LearningPath = {
  id: 'data-structures',
  title: 'Data Structures & Algorithms',
  shortTitle: 'DSA',
  description: 'Master the computational building blocks of efficient software Ã¢â‚¬â€ from memory to graphs.',
  icon: 'Ã°Å¸Å’Â²',
  color: 'hsl(200, 80%, 58%)',
  cssVar: '--path-data',
  nodes: [
    {
      id: 'dsa-bigo-basics',
      pathId: 'data-structures',
      title: 'Big-O Basics',
      description: 'Time vs space, case analysis, asymptotic simplification',
      icon: 'Ã°Å¸â€œÅ ',
      prerequisiteIds: [],
      geminiTopic: 'Big-O Notation fundamentals: time complexity vs space complexity, worst-case vs average-case vs best-case analysis, asymptotic simplification by dropping constants and non-dominant terms, and how to read complexity notation from real code snippets. Coding Lab focus: classify small iterative examples into the right complexity bucket and justify the answer.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-bigo-patterns',
      pathId: 'data-structures',
      title: 'Complexity Patterns',
      description: 'Common classes, nested loops, logarithms, amortized analysis',
      icon: 'Ã°Å¸Â§Â ',
      prerequisiteIds: ['dsa-bigo-basics'],
      geminiTopic: 'Complexity pattern recognition: common complexity classes O(1), O(log n), O(n), O(n log n), O(nÃ‚Â²), O(2^n), O(n!), how nested loops affect growth, when logarithms appear, and amortized analysis with dynamic array push. Coding Lab focus: analyze code snippets with loops and resizing behavior, then explain the dominant term.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-bigo-recursion',
      pathId: 'data-structures',
      title: 'Recursive Analysis',
      description: 'Recurrences, recursion trees, Master Theorem, space trade-offs',
      icon: 'Ã°Å¸Å’Â¿',
      prerequisiteIds: ['dsa-bigo-patterns'],
      geminiTopic: 'Recursive complexity analysis: recurrence relations, recursion trees, Master Theorem intuition, stack-space cost of recursion, and trade-offs between recursive clarity and iterative performance. Coding Lab focus: compute the time and space complexity of recursive divide-and-conquer examples.',
      estimatedMinutes: 14,
    },
    {
      id: 'dsa-arrays',
      pathId: 'data-structures',
      title: 'Arrays & Matrices',
      description: 'Contiguous memory, indexing, resizing, cache locality',
      icon: 'Ã°Å¸â€œÂ¦',
      prerequisiteIds: ['dsa-bigo-recursion'],
      geminiTopic: 'Arrays and Matrices: contiguous memory allocation, indexing, static arrays vs dynamic arrays, complexity of access/insert/delete/search operations, resizing strategies, and cache locality. Coding Lab focus: implement an in-place array rotation or matrix traversal with careful index management.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-two-pointers',
      pathId: 'data-structures',
      title: 'Two Pointers & Sliding Window',
      description: 'Window movement, in-place scans, string/array patterns',
      icon: 'Ã°Å¸Å½Â¯',
      prerequisiteIds: ['dsa-arrays'],
      geminiTopic: 'Two-pointer and sliding window patterns: when to move left/right pointers, fixed vs variable windows, in-place array transforms, and common string/array interview patterns. Coding Lab focus: solve a longest-substring or minimum-window style problem and explain pointer movement clearly.',
      estimatedMinutes: 13,
    },
    {
      id: 'dsa-linked-lists',
      pathId: 'data-structures',
      title: 'Linked Lists',
      description: 'Nodes & pointers, reversal, Floyd cycle detection, sentinel nodes',
      icon: 'Ã°Å¸â€â€”',
      prerequisiteIds: ['dsa-two-pointers'],
      geminiTopic: 'Linked Lists: node and pointer structure, singly vs doubly linked lists, circular lists and sentinel nodes, list reversal, and cycle detection with Floyd Tortoise and Hare. Coding Lab focus: implement node deletion without head pointer access, or detect a cycle using fast/slow pointers.',
      estimatedMinutes: 14,
    },
    {
      id: 'dsa-stacks',
      pathId: 'data-structures',
      title: 'Stacks',
      description: 'LIFO, call stack, monotonic stack, syntax validation',
      icon: 'Ã°Å¸â€œÅ¡',
      prerequisiteIds: ['dsa-linked-lists'],
      geminiTopic: 'Stacks (LIFO Ã¢â‚¬â€ Last In First Out): push/pop/peek operations, array-based vs linked-list-based implementation, applications: call stack execution control, data reversal, bracket/parenthesis balancing. Coding Lab focus: build a syntax validator for strings containing brackets {[()]}. Supplements: Monotonic Stack for next-greater-element problems, infix to postfix/prefix notation conversion, undo/redo history mechanism.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-queues',
      pathId: 'data-structures',
      title: 'Queues',
      description: 'FIFO, circular queue, deque, priority queues',
      icon: 'Ã°Å¸â€Æ’',
      prerequisiteIds: ['dsa-stacks'],
      geminiTopic: 'Queues (FIFO Ã¢â‚¬â€ First In First Out): enqueue/dequeue operations, circular queue implementation with fixed-size array, double-ended queues (Deque), introduction to Priority Queues. Coding Lab focus: implement a Circular Queue using a static array. Supplements: Monotonic Queue for sliding window maximum, thread-safe concurrent queues and lock-free ring buffers for audio/video streaming.',
      estimatedMinutes: 12,
    },
    {
      id: 'dsa-hashmaps',
      pathId: 'data-structures',
      title: 'Hash Maps',
      description: 'Hash functions, collision resolution, load factor, Two Sum',
      icon: '#Ã¯Â¸ÂÃ¢Æ’Â£',
      prerequisiteIds: ['dsa-queues'],
      geminiTopic: 'Hash Maps (Hash Tables): uniform hash functions, key-value structure and direct addressing, collision resolution strategies: Chaining vs Open Addressing (Linear Probing, Quadratic Probing, Double Hashing), load factor and rehashing process. Coding Lab focus: solve the classic Two Sum problem in O(n) time using a Hash Map. Supplements: Perfect Hashing, cryptographic vs non-cryptographic hash functions (MurmurHash, FNV-1a), Hash DoS collision attacks.',
      estimatedMinutes: 14,
    },
    {
      id: 'dsa-trees-core',
      pathId: 'data-structures',
      title: 'Trees & BST Basics',
      description: 'Tree terminology, DFS/BFS traversals, BST search and insert',
      icon: 'Ã°Å¸Å’Â³',
      prerequisiteIds: ['dsa-hashmaps'],
      geminiTopic: 'Trees and Binary Search Trees fundamentals: terminology (root, leaf, parent, child, height, depth), binary tree and BST properties, traversals (preorder, inorder, postorder, level-order), and how recursion maps naturally onto trees. Coding Lab focus: implement BST search, insert, and in-order traversal.',
      estimatedMinutes: 16,
    },
    {
      id: 'dsa-heaps-tries',
      pathId: 'data-structures',
      title: 'Heaps, Tries & Range Trees',
      description: 'Priority queues, prefix trees, Segment/Fenwick Trees',
      icon: 'Ã°Å¸Å’Â²',
      prerequisiteIds: ['dsa-trees-core'],
      geminiTopic: 'Advanced tree-like structures: min-heaps and max-heaps for priority queues, tries for prefix search and autocomplete, and segment trees / Fenwick trees for range query problems. Coding Lab focus: choose the right tree structure for a concrete product scenario and implement one representative operation.',
      estimatedMinutes: 18,
    },
    {
      id: 'dsa-graphs-traversal',
      pathId: 'data-structures',
      title: 'Graph Traversal',
      description: 'Representations, BFS/DFS, components, cycle detection',
      icon: 'Ã°Å¸â€¢Â¸Ã¯Â¸Â',
      prerequisiteIds: ['dsa-heaps-tries'],
      geminiTopic: 'Graphs fundamentals: vertices and edges, directed vs undirected, weighted vs unweighted, adjacency matrix vs adjacency list, BFS for shortest paths in unweighted graphs, DFS for components and cycle detection. Coding Lab focus: implement BFS to find the minimum number of hops between two nodes.',
      estimatedMinutes: 16,
    },
    {
      id: 'dsa-graphs-advanced',
      pathId: 'data-structures',
      title: 'Advanced Graphs',
      description: 'Dijkstra, Bellman-Ford, topological sort, MSTs',
      icon: 'Ã°Å¸Â§Â­',
      prerequisiteIds: ['dsa-graphs-traversal'],
      geminiTopic: 'Advanced graph algorithms: Dijkstra and Bellman-Ford for weighted shortest paths, topological sort with Kahn and DFS-based approaches, and minimum spanning trees with Kruskal and Prim. Coding Lab focus: pick the correct graph algorithm for a scenario and implement one optimized solution.',
      estimatedMinutes: 20,
    },
  ],
};

const awsPath: LearningPath = {
  id: 'aws',
  title: 'Amazon Web Services',
  shortTitle: 'AWS',
  description: 'Build, secure, and deploy on the world\'s largest cloud platform.',
  icon: 'Ã¢ËœÂÃ¯Â¸Â',
  color: 'hsl(30, 90%, 58%)',
  cssVar: '--path-aws',
  nodes: [
    {
      id: 'aws-iam-core',
      pathId: 'aws',
      title: 'IAM Core',
      description: 'Users, groups, roles, policies, least privilege',
      icon: 'Ã°Å¸â€Â',
      prerequisiteIds: [],
      geminiTopic: 'AWS IAM fundamentals: users, groups, roles, policies, IAM policy JSON structure (Effect, Action, Resource, Condition), least privilege, MFA, and root-account safety. Coding Lab focus: write a minimal policy that allows only GetObject on a specific S3 bucket.',
      estimatedMinutes: 12,
    },
    {
      id: 'aws-iam-advanced',
      pathId: 'aws',
      title: 'IAM Roles & Federation',
      description: 'AssumeRole, STS, SCPs, policy evaluation, federation',
      icon: 'Ã°Å¸â€ºÂ¡Ã¯Â¸Â',
      prerequisiteIds: ['aws-iam-core'],
      geminiTopic: 'Advanced AWS IAM: AssumeRole, STS temporary credentials, explicit deny vs implicit deny evaluation, identity federation with OIDC and SAML, and Service Control Policies in AWS Organizations. Coding Lab focus: reason through a multi-account access flow and produce the right trust and permission policy pair.',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-s3-storage',
      pathId: 'aws',
      title: 'S3 Storage',
      description: 'Buckets, keys, classes, versioning, lifecycle',
      icon: 'Ã°Å¸ÂªÂ£',
      prerequisiteIds: ['aws-iam-advanced'],
      geminiTopic: 'AWS S3 storage foundations: buckets, objects, metadata, storage classes, versioning, and lifecycle rules for archival and cleanup. Coding Lab focus: create a lifecycle configuration that transitions cold files to Glacier after 30 days.',
      estimatedMinutes: 13,
    },
    {
      id: 'aws-s3-security',
      pathId: 'aws',
      title: 'S3 Security & Delivery',
      description: 'Bucket policies, ACLs, SSE, presigned URLs, multipart',
      icon: 'Ã°Å¸â€â€™',
      prerequisiteIds: ['aws-s3-storage'],
      geminiTopic: 'S3 security and delivery patterns: bucket policies vs ACLs, SSE-S3 vs SSE-KMS, presigned URLs for temporary access, multipart uploads, and object lock / WORM concepts. Coding Lab focus: design a secure browser-upload flow with presigned URLs and least-privilege access.',
      estimatedMinutes: 13,
    },
    {
      id: 'aws-ec2-core',
      pathId: 'aws',
      title: 'EC2 Core',
      description: 'Instance families, AMIs, key pairs, EBS, pricing models',
      icon: 'Ã°Å¸â€“Â¥Ã¯Â¸Â',
      prerequisiteIds: ['aws-iam-advanced'],
      geminiTopic: 'AWS EC2 basics: instance families, AMIs, key pairs, EBS vs instance store, and core pricing models such as On-Demand, Reserved, Savings Plans, and Spot. Coding Lab focus: write a User Data script that provisions an Nginx server on first boot.',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-ec2-networking',
      pathId: 'aws',
      title: 'EC2 Networking & Placement',
      description: 'Security Groups, NACLs, Elastic IPs, placement groups',
      icon: 'Ã°Å¸Å’Â',
      prerequisiteIds: ['aws-ec2-core'],
      geminiTopic: 'EC2 networking and placement: Security Groups vs Network ACLs, Elastic IP vs dynamic public IP, placement groups, and the Nitro architecture impact on networking and isolation. Coding Lab focus: choose the right network controls for a multi-tier EC2 deployment and justify the decision.',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-lambda',
      pathId: 'aws',
      title: 'Lambda & Serverless',
      description: 'FaaS, cold starts, Provisioned Concurrency, DLQs',
      icon: 'ÃŽÂ»',
      prerequisiteIds: ['aws-s3-security', 'aws-ec2-networking'],
      geminiTopic: 'AWS Lambda (Function as a Service): event-driven execution model, supported runtimes, execution limits (15 min max, memory, /tmp storage); lifecycle: cold starts vs warm starts and mitigation with Provisioned Concurrency; environment variables and Execution Role permissions. Coding Lab focus: code a Lambda function that processes a JSON payload and saves logs to CloudWatch. Supplements: Lambda Layers for shared dependencies, VPC integration and its cold-start impact, Destinations and DLQs for async failure handling.',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-ecs',
      pathId: 'aws',
      title: 'ECS & Fargate',
      description: 'Container orchestration, Task Definitions, EC2 vs Fargate',
      icon: 'Ã°Å¸ÂÂ³',
      prerequisiteIds: ['aws-lambda'],
      geminiTopic: 'AWS ECS (Elastic Container Service) and Fargate: managed container orchestration, components: Task Definitions, Tasks, Services, Clusters; launch types: EC2 (self-managed servers) vs Fargate (serverless containers); deploy strategies and CPU/Memory limits per Task. Coding Lab focus: write a valid JSON Task Definition to run a Node.js Docker image on ECS. Supplements: ECR (Elastic Container Registry), awsvpc network mode, AWS App Mesh and Service Discovery integration.',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-sqs-sns',
      pathId: 'aws',
      title: 'SQS & SNS',
      description: 'Standard vs FIFO queues, pub/sub, fan-out, DLQ, filtering',
      icon: 'Ã°Å¸â€œÂ¨',
      prerequisiteIds: ['aws-lambda'],
      geminiTopic: 'AWS SQS and SNS for microservice decoupling: SQS Standard vs FIFO queues, Visibility Timeout and Dead-Letter Queues (DLQ); SNS Pub/Sub model, Topics, Subscriptions and message filtering policies. Coding Lab focus: design a producer-consumer flow simulating SQS message send and visibility adjustment. Supplements: Fan-out pattern (SNS broadcasting to multiple SQS queues simultaneously), Long Polling vs Short Polling, FIFO deduplication strategies.',
      estimatedMinutes: 14,
    },
    {
      id: 'aws-dynamo-modeling',
      pathId: 'aws',
      title: 'DynamoDB Modeling',
      description: 'Partition key, sort key, access patterns, entity modeling',
      icon: 'Ã¢Å¡Â¡',
      prerequisiteIds: ['aws-sqs-sns', 'aws-ecs'],
      geminiTopic: 'DynamoDB data modeling: key-value and document basics, simple vs composite primary keys, access-pattern-first design, and how to shape entities around partition and sort keys. Coding Lab focus: model a DynamoDB table for an e-commerce domain with explicit access patterns.',
      estimatedMinutes: 16,
    },
    {
      id: 'aws-dynamo-scale',
      pathId: 'aws',
      title: 'DynamoDB Scaling',
      description: 'GSI/LSI, capacity modes, consistency, Streams, DAX',
      icon: 'Ã°Å¸â€œË†',
      prerequisiteIds: ['aws-dynamo-modeling'],
      geminiTopic: 'DynamoDB scaling and integration: GSIs, LSIs, provisioned vs on-demand capacity, eventual vs strong consistency, Streams for event-driven systems, and DAX for cached low-latency reads. Coding Lab focus: evolve a table design to support a new query without causing hot partitions.',
      estimatedMinutes: 18,
    },
  ],
};

const backendPath: LearningPath = {
  id: 'backend',
  title: 'Backend Development',
  shortTitle: 'Backend',
  description: 'Build efficient servers, APIs, and data layers with clean architecture patterns.',
  icon: 'Ã¢Å¡â„¢Ã¯Â¸Â',
  color: 'hsl(142, 60%, 52%)',
  cssVar: '--path-backend',
  nodes: [
    {
      id: 'be-node-runtime',
      pathId: 'backend',
      title: 'Node.js Runtime',
      description: 'V8, libuv, Event Loop phases, async I/O',
      icon: 'Ã°Å¸Å¸Â¢',
      prerequisiteIds: [],
      geminiTopic: 'Node.js runtime fundamentals: V8 and libuv roles, Event Loop phases, non-blocking I/O, and how async work flows through timers, poll, and check. Coding Lab focus: explain and fix a blocking Node script by moving work toward non-blocking patterns.',
      estimatedMinutes: 14,
    },
    {
      id: 'be-node-streams',
      pathId: 'backend',
      title: 'Streams & Workers',
      description: 'Buffers, Readable/Writable streams, EventEmitters, Worker Threads',
      icon: 'Ã°Å¸Å’Å ',
      prerequisiteIds: ['be-node-runtime'],
      geminiTopic: 'Node.js streams and concurrency helpers: Buffers, Readable/Writable/Transform streams, EventEmitters, Worker Threads, Cluster, and memory-leak diagnosis basics. Coding Lab focus: process a massive log file with streams and identify when a worker thread is the right choice.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-rest-http',
      pathId: 'backend',
      title: 'REST & HTTP Semantics',
      description: 'REST constraints, methods, idempotency, status codes',
      icon: 'Ã°Å¸Å’Â',
      prerequisiteIds: ['be-node-streams'],
      geminiTopic: 'REST and HTTP fundamentals: REST constraints, method semantics, idempotency, correct status-code usage, and clean URI design. Coding Lab focus: design a CRUD API contract with accurate routes, payloads, and response codes.',
      estimatedMinutes: 13,
    },
    {
      id: 'be-rest-design',
      pathId: 'backend',
      title: 'REST API Design',
      description: 'Versioning, caching, HATEOAS, CORS, resource modeling',
      icon: 'Ã°Å¸Â§Â±',
      prerequisiteIds: ['be-rest-http'],
      geminiTopic: 'Practical REST API design: query params vs path params, versioning strategies, HATEOAS, CORS and preflight, pagination, and cache-aware endpoint design. Coding Lab focus: refactor an inconsistent REST API into a cleaner resource model with versioning decisions.',
      estimatedMinutes: 14,
    },
    {
      id: 'be-graphql-core',
      pathId: 'backend',
      title: 'GraphQL Core',
      description: 'SDL, resolvers, queries, mutations, schema modeling',
      icon: 'Ã°Å¸â€Â·',
      prerequisiteIds: ['be-rest-design'],
      geminiTopic: 'GraphQL fundamentals: why it exists, SDL, queries, mutations, subscriptions, resolvers, and graph-oriented execution. Coding Lab focus: write a basic GraphQL schema with interconnected types and one meaningful query.',
      estimatedMinutes: 14,
    },
    {
      id: 'be-graphql-scale',
      pathId: 'backend',
      title: 'GraphQL at Scale',
      description: 'N+1, DataLoader, federation, query cost control',
      icon: 'Ã°Å¸â€œÂ¡',
      prerequisiteIds: ['be-graphql-core'],
      geminiTopic: 'Scaling GraphQL in production: N+1 query issues, DataLoader batching, Federation, gateway/subgraph patterns, and query complexity controls. Coding Lab focus: fix a GraphQL resolver flow suffering from N+1 and propose safe complexity limits.',
      estimatedMinutes: 15,
    },
    {
      id: 'be-sql-core',
      pathId: 'backend',
      title: 'SQL in Code',
      description: 'Relational model, joins, aggregations, transactions',
      icon: 'Ã°Å¸â€”Æ’Ã¯Â¸Â',
      prerequisiteIds: ['be-rest-design'],
      geminiTopic: 'SQL for backend developers: relational modeling, primary and foreign keys, DDL/DML, JOINs, GROUP BY, HAVING, and ACID transactions from application code. Coding Lab focus: write a query that aggregates sales data using joins and filters.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-sql-advanced',
      pathId: 'backend',
      title: 'Advanced SQL',
      description: 'Window functions, CTEs, isolation levels, query shaping',
      icon: 'Ã°Å¸â€œÅ¡',
      prerequisiteIds: ['be-sql-core'],
      geminiTopic: 'Advanced SQL in application code: window functions, CTEs, transaction isolation levels, and shaping queries for large-scale production reads and writes. Coding Lab focus: extend a working SQL query using window functions or a CTE to answer a richer business question.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-nosql-modeling',
      pathId: 'backend',
      title: 'NoSQL Modeling',
      description: 'Document vs key-value vs column-family, denormalization',
      icon: 'Ã°Å¸â€œâ€ž',
      prerequisiteIds: ['be-sql-advanced'],
      geminiTopic: 'NoSQL data modeling for backend services: document, key-value, column-family, and graph database trade-offs, denormalization, embedded documents vs references, and when flexibility beats rigid schemas. Coding Lab focus: model a MongoDB collection structure for a product or session domain.',
      estimatedMinutes: 15,
    },
    {
      id: 'be-nosql-scale',
      pathId: 'backend',
      title: 'NoSQL Queries & Scale',
      description: 'MongoDB aggregation, indexing, replica sets, sharding',
      icon: 'Ã°Å¸â€œË†',
      prerequisiteIds: ['be-nosql-modeling'],
      geminiTopic: 'NoSQL querying and scaling: MongoDB aggregation pipelines, indexing, replica sets, sharding patterns, and time-series style workloads. Coding Lab focus: build an aggregation pipeline and explain how it changes under scale pressure.',
      estimatedMinutes: 16,
    },
    {
      id: 'be-clean-arch',
      pathId: 'backend',
      title: 'Clean Architecture',
      description: 'Separation of concerns, Use Cases, DI, DTOs, Hexagonal Architecture',
      icon: 'Ã°Å¸Ââ€ºÃ¯Â¸Â',
      prerequisiteIds: ['be-graphql-scale', 'be-nosql-scale'],
      geminiTopic: 'Clean Architecture and Design Patterns: Separation of Concerns principle, Clean Architecture layers: Entities (global business rules), Use Cases (application rules), Interface Adapters (Controllers, Gateways), Frameworks & Drivers; Dependency Inversion (D of SOLID) as decoupling foundation, Data Transfer Objects (DTOs) and persistence layer isolation. Coding Lab focus: refactor a coupled monolithic endpoint by isolating business logic into a pure Use Case class. Supplements: Hexagonal Architecture (Ports & Adapters), common creational and structural patterns in backend (Factory, Strategy, Repository), Bounded Contexts from DDD.',
      estimatedMinutes: 18,
    },
  ],
};

const systemDesignPath: LearningPath = {
  id: 'system-design',
  title: 'System Design',
  shortTitle: 'Systems',
  description: 'Architect large-scale distributed systems â€” from SQL to interview frameworks.',
  icon: 'ðŸ—ï¸',
  color: 'hsl(270, 65%, 65%)',
  cssVar: '--path-system',
  nodes: [
    // â”€â”€ Module 1: Foundations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m1-foundations',
      pathId: 'system-design',
      title: 'M1 Â· Foundations',
      description: 'What is System Design, why it matters, how to think about systems',
      icon: 'ðŸ—ï¸',
      prerequisiteIds: [],
      geminiTopic: 'System Design fundamentals: what is System Design and why it matters for software engineers, how to approach system design problems, key concepts (latency, throughput, availability, reliability, scalability), trade-offs mindset, vertical vs horizontal scaling, stateless vs stateful services, identifying bottlenecks, the System Design interview framework overview',
      estimatedMinutes: 18,
    },

    // â”€â”€ Module 2: SQL Databases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m2-sql-core',
      pathId: 'system-design',
      title: 'M2a Ã‚Â· SQL Foundations',
      description: 'Relational DBs, SQL fit, ACID, write/read path basics',
      icon: 'Ã°Å¸â€”Æ’Ã¯Â¸Â',
      prerequisiteIds: ['sd-m1-foundations'],
      geminiTopic: 'SQL databases for system design fundamentals: when relational databases fit, relational modeling basics, ACID, write path internals like WAL, read path basics, and the major trade-offs between PostgreSQL, MySQL, and MSSQL. Coding Lab focus: justify a relational design for a product scenario and explain the transactional guarantees it needs.',
      estimatedMinutes: 18,
    },
    {
      id: 'sd-m2-sql-indexes',
      pathId: 'system-design',
      title: 'M2b Ã‚Â· Indexes & Query Plans',
      description: 'B-tree, covering indexes, EXPLAIN, partitions',
      icon: 'Ã°Å¸â€œÅ¡',
      prerequisiteIds: ['sd-m2-sql-core'],
      geminiTopic: 'SQL performance foundations: B-tree and composite indexes, covering indexes, EXPLAIN and query plans, partitions, and how query shape interacts with indexes. Coding Lab focus: choose an index strategy for a slow relational workload and explain the expected query-plan improvement.',
      estimatedMinutes: 16,
    },
    {
      id: 'sd-m2-sql-scaling',
      pathId: 'system-design',
      title: 'M2c Ã‚Â· SQL Scaling',
      description: 'Replicas, connection pooling, federation, regional separation',
      icon: 'Ã°Å¸â€œË†',
      prerequisiteIds: ['sd-m2-sql-indexes'],
      geminiTopic: 'SQL scaling in distributed systems: read replicas, connection pooling, regional database separation, federation, and early sharding trade-offs. Coding Lab focus: propose a relational scaling plan for a growing read-heavy application.',
      estimatedMinutes: 16,
    },
    {
      id: 'sd-m2-sql-consistency',
      pathId: 'system-design',
      title: 'M2d Ã‚Â· SQL Consistency Trade-offs',
      description: 'CAP on SQL, consistency models, quorum intuition',
      icon: 'Ã¢Å¡â€“Ã¯Â¸Â',
      prerequisiteIds: ['sd-m2-sql-scaling'],
      geminiTopic: 'Consistency trade-offs in relational systems: ACID vs BASE, CAP applied to SQL, strong vs eventual consistency, read-your-writes, monotonic reads, and quorum intuition. Coding Lab focus: reason about the right consistency model for a multi-region relational workload.',
      estimatedMinutes: 16,
    },

    // â”€â”€ Module 3: NoSQL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m3-nosql-models',
      pathId: 'system-design',
      title: 'M3a Ã‚Â· NoSQL Models',
      description: 'Document, graph, vector, wide-column, key-value trade-offs',
      icon: 'Ã°Å¸â€œâ€ž',
      prerequisiteIds: ['sd-m2-sql-consistency'],
      geminiTopic: 'NoSQL model selection: document stores, graph databases, vector databases, key-value systems, and wide-column systems; when NoSQL beats SQL and what should not be stored there. Coding Lab focus: select the right NoSQL family for several product scenarios and defend the choice.',
      estimatedMinutes: 16,
    },
    {
      id: 'sd-m3-nosql-distribution',
      pathId: 'system-design',
      title: 'M3b Ã‚Â· NoSQL Distribution',
      description: 'Cassandra, DynamoDB, leaderless replication, anti-entropy',
      icon: 'Ã°Å¸Å’Â',
      prerequisiteIds: ['sd-m3-nosql-models'],
      geminiTopic: 'Distributed NoSQL internals: Cassandra ring topology and tunable consistency, DynamoDB partitioning and GSIs, leaderless replication, anti-entropy, eventual consistency, and consistent hashing. Coding Lab focus: design a globally distributed NoSQL data layer and explain its failure behavior.',
      estimatedMinutes: 18,
    },

    // â”€â”€ Module 4a: Queues (Part 1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m4a-queues',
      pathId: 'system-design',
      title: 'M4a Â· Message Queues',
      description: 'What queues are, delivery semantics, Kafka, RabbitMQ, scaling',
      icon: 'ðŸ“¬',
      prerequisiteIds: ['sd-m3-nosql-distribution'],
      geminiTopic: 'Message Queues Part 1: what are message queues, how queues differ from databases, when to use queues (decoupling, async processing, buffering), partitioning strategies, delivery semantics: At-Least-Once vs At-Most-Once vs Exactly-Once, major options (Kafka architecture, RabbitMQ exchange types, AWS SQS/SNS, Google Pub/Sub), how consumers/readers operate (consumer groups, polling vs push), horizontal scaling of consumers, scaling limitations and backpressure',
      estimatedMinutes: 25,
    },

    // â”€â”€ Module 4b: Queues (Part 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m4b-queues-advanced',
      pathId: 'system-design',
      title: 'M4b Â· Queues Advanced',
      description: 'DLQs, idempotency, event streaming, Outbox Pattern',
      icon: 'ðŸ”„',
      prerequisiteIds: ['sd-m4a-queues'],
      geminiTopic: 'Message Queues Part 2: operational complexity of async architectures, async response patterns (callbacks, polling, webhooks), Dead Letter Queues (DLQ) and retry strategies, idempotency (why it matters, how to implement it); supplements: Consumer Groups in Kafka, ordering guarantees (per-partition ordering), Event Streaming vs traditional queues, Event-Driven Architecture patterns, the Outbox Pattern for reliable message publishing with database transactions',
      estimatedMinutes: 22,
    },

    // â”€â”€ Module 5: Load Balancers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m5-load-balancers',
      pathId: 'system-design',
      title: 'M5 Â· Load Balancers',
      description: 'Types, algorithms, Layer 4 vs 7, sticky sessions, health checks',
      icon: 'âš–ï¸',
      prerequisiteIds: ['sd-m4b-queues-advanced'],
      geminiTopic: 'Load Balancers in System Design: types of load balancers (hardware, software, cloud-managed), load balancing algorithms (Round Robin, Least Connections, IP Hash, Weighted), trade-offs of each algorithm; supplements: Layer 4 vs Layer 7 load balancers (when each applies), Sticky Sessions (session affinity and its problems), Health Checks (active vs passive), Anycast routing for global load balancing',
      estimatedMinutes: 20,
    },

    // â”€â”€ Module 6: Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m6-auth',
      pathId: 'system-design',
      title: 'M6 Â· Authentication & Auth',
      description: 'OAuth 2.0, Keycloak, social login, JWT, RBAC, ABAC',
      icon: 'ðŸ”',
      prerequisiteIds: ['sd-m5-load-balancers'],
      geminiTopic: 'Authentication and Authorization in System Design: overview and abstraction via API Gateways, OAuth 2.0 (flows: authorization code, client credentials, implicit), Keycloak as identity provider, Social Login (Google/GitHub OAuth), how to design auth for microservices; supplements: OpenID Connect (OIDC) vs OAuth, JWT structure and validation (header, payload, signature), Refresh Tokens and token rotation, RBAC (Role-Based Access Control), ABAC (Attribute-Based Access Control)',
      estimatedMinutes: 22,
    },

    // â”€â”€ Module 7: Architecture Patterns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m7-edge-patterns',
      pathId: 'system-design',
      title: 'M7a Ã‚Â· Edge & Platform Patterns',
      description: 'API Gateway, WAF, rate limiting, BFF, service mesh',
      icon: 'Ã°Å¸Â§Â©',
      prerequisiteIds: ['sd-m6-auth'],
      geminiTopic: 'Platform and edge patterns: API Gateway, WAF, rate limiting strategies, Backend for Frontends, and service mesh concepts such as sidecars, mTLS, and observability. Coding Lab focus: choose the right edge/platform patterns for a multi-client product.',
      estimatedMinutes: 16,
    },
    {
      id: 'sd-m7-data-patterns',
      pathId: 'system-design',
      title: 'M7b Ã‚Â· Data & Resilience Patterns',
      description: 'CQRS, SAGA, Event Sourcing, Circuit Breaker, retries',
      icon: 'Ã°Å¸Â§Â±',
      prerequisiteIds: ['sd-m7-edge-patterns'],
      geminiTopic: 'Distributed data and resilience patterns: CQRS, SAGA, Event Sourcing, Circuit Breaker, exponential backoff retries, bulkheads, and Strangler Fig migrations. Coding Lab focus: map the right coordination pattern to a distributed transaction or migration scenario.',
      estimatedMinutes: 18,
    },

    // â”€â”€ Module 8: DNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m8-dns',
      pathId: 'system-design',
      title: 'M8 Â· DNS',
      description: 'DNS internals, routing policies, GeoDNS, Anycast',
      icon: 'ðŸŒ',
      prerequisiteIds: ['sd-m7-data-patterns'],
      geminiTopic: 'DNS (Domain Name System) for System Design: what DNS is and how resolution works (recursive resolver, authoritative server, root servers), DNS routing policies: Geolocation Routing, Failover Routing, Latency-Based Routing, IP-Based Routing, Weighted Routing, Multivalue Answer Routing; supplements: DNS TTL and its implications for failover speed, DNS Caching at multiple layers, GeoDNS for traffic steering, Anycast DNS for DDoS resilience',
      estimatedMinutes: 18,
    },

    // â”€â”€ Module 9: Sequencer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m9-sequencer',
      pathId: 'system-design',
      title: 'M9 Â· Sequencer & Distributed IDs',
      description: 'Snowflake, UUID, ULID, distributed ID generation',
      icon: 'ðŸ”¢',
      prerequisiteIds: ['sd-m8-dns'],
      geminiTopic: 'Distributed ID Generation (Sequencer): why unique IDs are hard at scale (clock skew, race conditions), Snowflake ID (Twitter) â€” structure: timestamp + datacenter + machine + sequence, how to implement a Snowflake-like sequencer; supplements: UUID (v4 vs v7, pros/cons), ULID (Universally Unique Lexicographically Sortable Identifier), KSUID (K-Sortable Unique Identifier), comparison of approaches and when to use each, monotonic clock concerns',
      estimatedMinutes: 18,
    },

    // â”€â”€ Module 10: Blob Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m10-blob-store',
      pathId: 'system-design',
      title: 'M10 Â· Blob Store',
      description: 'Object storage: S3, GCS, R2 â€” presigned URLs, multipart, lifecycle',
      icon: 'ðŸª£',
      prerequisiteIds: ['sd-m9-sequencer'],
      geminiTopic: 'Blob Storage (Object Storage) in System Design: what blob stores are and how they differ from file systems and databases, how S3 internally stores objects, when to use object storage (images, videos, backups, data lakes), options: AWS S3, Google Cloud Storage, Cloudflare R2 (no egress fees); supplements: Presigned URLs (temporary access, upload/download), Multipart Upload (chunked uploads for large files), Lifecycle Policies (transition to Glacier, auto-delete), Versioning and its cost implications',
      estimatedMinutes: 18,
    },

    // â”€â”€ Module 11: Cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m11-cache',
      pathId: 'system-design',
      title: 'M11 Â· Cache',
      description: 'Redis, Memcache, cache patterns, invalidation, stampede',
      icon: 'âš¡',
      prerequisiteIds: ['sd-m10-blob-store'],
      geminiTopic: 'Caching in System Design: what caching is and why it exists, how caches work (in-memory data structures, eviction policies LRU/LFU/TTL), when to use a cache, read speed comparison (cache ~0.1ms vs SSD ~100Î¼s vs disk ~10ms), options: Redis (data structures, persistence, cluster), Memcache (pure cache, no persistence), in-memory application caches, stateful vs stateless caching; supplements: Cache-Aside (lazy loading), Write-Through, Write-Back (write-behind), Read-Through, Cache Invalidation strategies (TTL, event-driven, versioning keys), Cache Stampede (thundering herd) and solutions (mutex, probabilistic early expiry), Distributed Cache architecture',
      estimatedMinutes: 25,
    },

    // â”€â”€ Module 12: CDN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m12-cdn',
      pathId: 'system-design',
      title: 'M12 Â· CDN',
      description: 'Content delivery, edge caching, stale content, purge strategies',
      icon: 'ðŸŒ',
      prerequisiteIds: ['sd-m11-cache'],
      geminiTopic: 'Content Delivery Networks (CDN): what a CDN is and how edge PoPs work, when to use a CDN (static assets, video streaming, API acceleration), how CDN caching works (Cache-Control headers, cache keys), stale content problem and cache invalidation strategies, risks of CDNs (stale deploys, origin cost, vendor lock-in); supplements: Edge Computing (running code at the CDN edge â€” Cloudflare Workers, Lambda@Edge), Cache-Control and Vary headers, CDN Purge strategies (instant purge, surrogate keys/cache tags), Origin Shield to protect origin from cache misses',
      estimatedMinutes: 20,
    },

    // â”€â”€ Module 13: Requirements & Estimations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m13-requirements',
      pathId: 'system-design',
      title: 'M13 Â· Requirements & Estimations',
      description: 'Availability SLAs, capacity planning, back-of-envelope math',
      icon: 'ðŸ“',
      prerequisiteIds: ['sd-m12-cdn'],
      geminiTopic: 'Requirements and Estimations in System Design: availability requirements (99.9% vs 99.99% vs 99.999% and what downtime each allows), scalability and latency requirements gathering, Back of Envelope Calculations methodology (powers of 2, common byte sizes, request rates); supplements: QPS (Queries Per Second) estimation, Throughput calculation (bandwidth needs), Storage Estimation (daily data Ã— retention Ã— replication factor), Network Estimation (traffic shaping, peak vs average), Capacity Planning process',
      estimatedMinutes: 20,
    },

    // â”€â”€ Module 14: Microservices & Monoliths â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m14-microservices',
      pathId: 'system-design',
      title: 'M14 Â· Microservices & Monoliths',
      description: 'Trade-offs, DDD, bounded contexts, distributed transactions',
      icon: 'ðŸ”·',
      prerequisiteIds: ['sd-m13-requirements'],
      geminiTopic: 'Microservices vs Monoliths in System Design: principles of microservices architecture, complexity comparison across dimensions â€” Features (faster in monolith initially), Scale (microservices scale independently), Onboarding (monolith simpler), Reusability (service contracts), Observability (distributed tracing needed); supplements: Domain Driven Design (DDD), Bounded Contexts and how to find them, synchronous vs asynchronous inter-service communication, Distributed Transactions (2PC, SAGA pattern revisited)',
      estimatedMinutes: 22,
    },

    // â”€â”€ Module 15: Deploys & Scalability â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m15-deploys',
      pathId: 'system-design',
      title: 'M15 Â· Deploys & Scalability',
      description: 'Containers, Kubernetes, scaling strategies, Riot Games case study',
      icon: 'ðŸš€',
      prerequisiteIds: ['sd-m14-microservices'],
      geminiTopic: 'Deployments and Scalability: load balancer integration with deployment, IO-Bound vs CPU-Bound services and how each scales differently, containers (what Docker is, image layers, cold start problem), horizontal vs vertical scaling for CPU/Memory/IO/Requests/Queue consumers, real-world case study: Riot Games scaling (TFT global launch, LoL worlds, Valorant), deployment platform options: Kubernetes (pods, services, ingress, HPA), EC2 (raw VMs), ECS (AWS managed containers), Heroku-style (PaaS); supplements: Docker internals, Rolling Deployments, Blue-Green Deployments, Canary Releases, Auto Scaling, Horizontal Pod Autoscaler (HPA)',
      estimatedMinutes: 28,
    },

    // â”€â”€ Module 16: Interview Prep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m16-interview-prep',
      pathId: 'system-design',
      title: 'M16 Â· Interview Preparation',
      description: 'Framework, real Big Tech breakdowns, 10 canonical scenarios',
      icon: 'ðŸŽ¯',
      prerequisiteIds: ['sd-m15-deploys'],
      geminiTopic: 'System Design Interview Preparation: how DSA knowledge affects System Design interviews, geolocation + Bloom Filter example, breaking down real Big Tech interview questions; Interview Framework â€” Clarify requirements, Constraints, Back-of-Envelope Math, High-Level design, Deep-Dive on critical components, Bottleneck identification, Trade-offs discussion, Risks, Evolution/future scale; Canonical scenarios to practice: URL Shortener (TinyURL), News Feed (Twitter/X), Chat System (WhatsApp), Notification Service, Ride-Hailing (Uber), Metrics Ingestion, Search Engine, Video Streaming (YouTube/Netflix), Ticketing System, Payment Processing; supplements: TinyURL deep dive, Twitter Feed ranking, WhatsApp message delivery, Uber geospatial matching, Netflix CDN strategy, Google Maps real-time, Dropbox sync, YouTube transcoding pipeline',
      estimatedMinutes: 35,
    },

    // â”€â”€ Module 17: Mock Interviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'sd-m17-mock',
      pathId: 'system-design',
      title: 'M17 Â· Mock Interviews',
      description: 'Junior, mid-level, and senior practice sessions with AI feedback',
      icon: 'ðŸŽ™ï¸',
      prerequisiteIds: ['sd-m16-interview-prep'],
      geminiTopic: 'System Design Mock Interview Practice: simulate a complete System Design interview at three levels â€” Junior level (design a URL shortener: clarify, estimate, high-level only, 30 min), Mid-level / Pleno (design a notification system: clarify, estimate, deep-dive on delivery guarantees and fan-out, 45 min), Senior level (design a distributed metrics ingestion pipeline: clarify, estimate, high-level, deep-dive on storage engine and query layer, trade-offs of hot path vs cold path, 60 min). For each scenario: provide the problem statement, guide through the framework, highlight common mistakes and what top candidates do differently',
      estimatedMinutes: 40,
    },

    // â”€â”€ Extra Module: Distributed Systems & Consistency â”€â”€â”€
    {
      id: 'sd-extra-consistency',
      pathId: 'system-design',
      title: 'Extra Ã‚Â· Consistency Models',
      description: 'CAP, PACELC, linearizability, quorums, replication models',
      icon: 'Ã°Å¸Å’Â',
      prerequisiteIds: ['sd-m17-mock'],
      geminiTopic: 'Distributed consistency deep dive: CAP, PACELC, linearizability, eventual consistency, read-your-writes, monotonic reads, leader-follower, multi-leader, leaderless replication, and quorum reads/writes. Coding Lab focus: analyze the consistency profile of a distributed product requirement and defend the trade-off.',
      estimatedMinutes: 18,
    },
    {
      id: 'sd-extra-consensus',
      pathId: 'system-design',
      title: 'Extra Ã‚Â· Consensus & Coordination',
      description: 'Split brain, distributed locks, Raft, Paxos, fencing',
      icon: 'Ã°Å¸â€Â',
      prerequisiteIds: ['sd-extra-consistency'],
      geminiTopic: 'Distributed coordination and consensus: split brain, fencing tokens, distributed locks with Redis or ZooKeeper, Raft leader election and log replication, and a conceptual overview of Paxos. Coding Lab focus: compare coordination options for a critical shared resource workflow.',
      estimatedMinutes: 18,
    },
    {
      id: 'sd-extra-distribution-patterns',
      pathId: 'system-design',
      title: 'Extra Ã‚Â· Conflict & Partitioning',
      description: 'Vector clocks, CRDTs, LWW, consistent hashing',
      icon: 'Ã°Å¸Â§Â­',
      prerequisiteIds: ['sd-extra-consensus'],
      geminiTopic: 'Conflict resolution and distribution mechanics: vector clocks, happened-before reasoning, CRDTs, Last-Write-Wins, and consistent hashing with virtual nodes. Coding Lab focus: choose a conflict-resolution and partitioning approach for a globally distributed system.',
      estimatedMinutes: 18,
    },
  ],
};


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PATH: Software Testing
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const testingPath: LearningPath = {
  id: 'testing',
  title: 'Software Testing',
  shortTitle: 'Testing',
  description: 'Build confidence to ship with a layered testing strategy from unit to E2E.',
  icon: 'ðŸ§ª',
  color: 'hsl(330, 70%, 62%)',
  cssVar: '--path-testing',
  nodes: [
    {
      id: 'test-unit',
      pathId: 'testing',
      title: 'Unit Testing',
      description: 'AAA pattern, assertions, code coverage, mutation testing',
      icon: 'ðŸ”¬',
      prerequisiteIds: [],
      geminiTopic: 'Unit Testing: the concept of an isolated unit (pure functions, class methods), AAA pattern (Arrange, Act, Assert), assertion libraries and equality/exception/type matchers, code coverage metrics (line, branch, function coverage). Coding Lab focus: write a test suite covering all happy paths and error paths of a math/string utility function. Supplements: Mutation Testing to evaluate test suite quality, preventing flaky tests, handling non-deterministic behavior (date/time functions).',
      estimatedMinutes: 14,
    },
    {
      id: 'test-integration',
      pathId: 'testing',
      title: 'Integration Testing',
      description: 'Multi-module verification, DB seeding, Testcontainers, Contract Testing',
      icon: 'ðŸ”Œ',
      prerequisiteIds: ['test-unit'],
      geminiTopic: 'Integration Testing: verifying communication between two or more modules or external dependencies, API integration tests (firing real HTTP requests against local endpoints), database strategies: isolated schemas, data seeding and post-test cleanup/truncation. Coding Lab focus: configure an integration test for an express/fastify route that performs a real insert into an in-memory database and validates the response. Supplements: Testcontainers for spinning up real databases via Docker during test runs, Contract Testing with Pact.',
      estimatedMinutes: 16,
    },
    {
      id: 'test-e2e',
      pathId: 'testing',
      title: 'End-to-End Testing',
      description: 'Playwright, Page Object Model, visual regression, CI pipelines',
      icon: 'ðŸ¤–',
      prerequisiteIds: ['test-integration'],
      geminiTopic: 'End-to-End Testing: validating the complete application flow from the user perspective (UI â†’ Backend â†’ Database), modern browser automation tools (Playwright, Cypress), Page Object Model (POM) for maintainable UI selector management, network interception, mobile device emulation and visual regression testing. Coding Lab focus: write a Playwright/Cypress script simulating a login form fill and verifying the redirect. Supplements: parallel test execution and shared state control in CI/CD pipelines, authentication bypass strategies to speed up protected-page tests.',
      estimatedMinutes: 16,
    },
    {
      id: 'test-mocking',
      pathId: 'testing',
      title: 'Test Doubles',
      description: 'Mocks vs stubs vs spies, over-mocking risks, MSW',
      icon: 'ðŸŽ­',
      prerequisiteIds: ['test-e2e'],
      geminiTopic: 'Test Doubles â€” Mocks, Stubs & Spies: isolating side effects and external dependencies (third-party API calls); precise definitions: Stubs (pre-programmed responses), Mocks (pre-configured with call expectations that form a spec), Spies (record how functions were called â€” arguments, invocation count); the danger of over-mocking (tests pass but system fails in production). Coding Lab focus: replace a real email-sending module with a Mock/Stub in a user-creation test, verifying the send method was called with correct parameters. Supplements: external service virtualization, MSW (Mock Service Worker) for HTTP-layer interception.',
      estimatedMinutes: 14,
    },
    {
      id: 'test-tdd',
      pathId: 'testing',
      title: 'TDD',
      description: 'Red-Green-Refactor cycle, BDD, Inside-Out vs Outside-In',
      icon: 'â™»ï¸',
      prerequisiteIds: ['test-mocking'],
      geminiTopic: 'Test-Driven Development (TDD): design philosophy of code guided by tests, the Red-Green-Refactor cycle: Red (write a failing test for non-existent functionality), Green (write minimum code to make it pass), Refactor (clean up eliminating duplication, improving names and architecture, keeping test green); TDD benefits for software architecture (native testability). Coding Lab focus: develop a Roman numeral to integer converter using strictly the TDD cycle phases. Supplements: Inside-Out (Bottom-Up) vs Outside-In (Top-Down / London School) TDD strategies, Behavior-Driven Development (BDD) and Gherkin syntax (Given/When/Then).',
      estimatedMinutes: 16,
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PATH: Performance & Optimization
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const performancePath: LearningPath = {
  id: 'performance',
  title: 'Application Performance',
  shortTitle: 'Perf',
  description: 'Profile, optimize, and scale â€” from flame graphs to lock-free concurrency.',
  icon: 'ðŸš€',
  color: 'hsl(50, 85%, 55%)',
  cssVar: '--path-perf',
  nodes: [
    {
      id: 'perf-profiling',
      pathId: 'performance',
      title: 'Profiling & Diagnostics',
      description: 'Flame graphs, heap snapshots, GC analysis, p50/p95/p99 latency',
      icon: 'ðŸ”',
      prerequisiteIds: [],
      geminiTopic: 'Performance Profiling and Diagnostics: quantitative measurement in running systems, CPU profiling and reading Flame Graphs, memory profiling: Heap Snapshots and Garbage Collector behavior patterns, latency metrics: understanding and monitoring response time percentiles (p50, p95, p99). Coding Lab focus: analyze a simulated Heap Snapshot or metrics log to identify which function is causing a memory leak. Supplements: APM tools (Datadog, New Relic, OpenTelemetry), Continuous Profiling in production environments.',
      estimatedMinutes: 16,
    },
    {
      id: 'perf-algorithms',
      pathId: 'performance',
      title: 'Algorithm Optimization',
      description: 'Big-O reduction, memoization, tabulation, in-place operations',
      icon: 'ðŸ§®',
      prerequisiteIds: ['perf-profiling'],
      geminiTopic: 'Algorithm Optimization for production code: refactoring with focus on Big-O reduction, strategic use of Dynamic Programming (Memoization top-down and Tabulation bottom-up) to avoid recomputation, in-place operations for severe memory savings, loop optimizations (loop unrolling, eliminating redundant checks inside high-frequency loops). Coding Lab focus: optimize an O(nÂ²) algorithm to an equivalent O(n log n) or O(n) version. Supplements: cache-conscious programming (spatial and temporal data locality on CPU), software-level SIMD (Single Instruction Multiple Data) instruction exploitation.',
      estimatedMinutes: 16,
    },
    {
      id: 'perf-db',
      pathId: 'performance',
      title: 'DB Query Optimization',
      description: 'EXPLAIN, composite & covering indexes, N+1, cursor pagination',
      icon: 'ðŸ—„ï¸',
      prerequisiteIds: ['perf-algorithms'],
      geminiTopic: 'Database Query Optimization: detailed query execution plan analysis (EXPLAIN), advanced indexing strategies: B-Tree vs Hash indexes, composite and covering indexes, eliminating N+1 query patterns in code, high-volume data pagination: Offset-based vs Cursor-based (Keyset) Pagination. Coding Lab focus: rewrite a slow query doing a Full Table Scan by creating the correct index and adjusting WHERE clauses. Supplements: connection pool sizing (ideal connection pool dimensions), index fragmentation and the impact of frequent writes on reads, Materialized Views for pre-computed aggregations.',
      estimatedMinutes: 18,
    },
    {
      id: 'perf-concurrency',
      pathId: 'performance',
      title: 'Concurrency & Parallelism',
      description: 'Race conditions, deadlocks, mutexes, Actor Model, lock-free structures',
      icon: 'âš™ï¸',
      prerequisiteIds: ['perf-db'],
      geminiTopic: 'Concurrency and Parallelism: architectural differences between Processes (memory isolation) and Threads (shared memory), concurrency problems: Race Conditions, Deadlocks, Livelocks and Starvation, synchronization primitives: Locks, Mutexes, Semaphores and atomic operations, concurrency models: async thread-based vs single-threaded Event Loop (Node.js/Python asyncio). Coding Lab focus: implement a mechanism that resolves a race condition on a shared variable using exclusive locks or semaphores. Supplements: Actor Model for fault-tolerant distributed concurrency (Erlang/Akka), lock-free and wait-free data structures, Green Threads, Goroutines and virtual fibers.',
      estimatedMinutes: 18,
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PATH: Frontend Architecture & Rendering
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const frontendRenderingPath: LearningPath = {
  id: 'frontend-rendering',
  title: 'Frontend Architecture & Rendering',
  shortTitle: 'Frontend',
  description: 'CSR, SSR, SSG, RSC, Edge Rendering and Core Web Vitals â€” understand every rendering paradigm.',
  icon: 'ðŸ–¥ï¸',
  color: 'hsl(190, 75%, 55%)',
  cssVar: '--path-frontend',
  nodes: [
    {
      id: 'fe-csr',
      pathId: 'frontend-rendering',
      title: 'CSR & SPAs',
      description: 'Single Page Applications, bundle lifecycle, SEO challenges',
      icon: 'ðŸŒ',
      prerequisiteIds: [],
      geminiTopic: 'Client-Side Rendering (CSR) and Single Page Applications (SPAs): the SPA paradigm and skeleton HTML (<div id="root">), client lifecycle: JS bundle download â†’ parsing â†’ execution â†’ DOM injection â†’ runtime data fetching; architectural impacts: slow initial load (White Screen Effect), excellent subsequent navigation, chronic SEO challenges. Coding Lab focus: implement a pure SPA client using history.pushState or hashchange event to manage routes dynamically without page reload. Supplements: Code-Splitting and Lazy Loading strategies, real cost of JS parsing and compilation on low-end mobile CPUs.',
      estimatedMinutes: 16,
    },
    {
      id: 'fe-ssr',
      pathId: 'frontend-rendering',
      title: 'SSR',
      description: 'Server-Side Rendering, hydration, FCP/LCP vs TTFB trade-offs',
      icon: 'ðŸ–§',
      prerequisiteIds: ['fe-csr'],
      geminiTopic: 'Server-Side Rendering (SSR): dynamic HTML generation per request in modern frameworks (Next.js, Remix), data journey: Server receives request â†’ fetches from DB/API â†’ renders populated HTML â†’ sends HTML string to browser; Hydration: the process of attaching event listeners to static HTML received from the server; metric trade-offs: dramatic improvement in FCP and LCP vs increase in TTFB. Coding Lab focus: create a mini Node.js/Express server that uses a template engine (or renderToString) to generate a dynamic HTML page injecting data from a simulated API. Supplements: serializing and deserializing shared state between server and client (avoiding hydration mismatch errors), HTTP Cache headers (Cache-Control, ETags) at the SSR server level.',
      estimatedMinutes: 18,
    },
    {
      id: 'fe-ssg',
      pathId: 'frontend-rendering',
      title: 'SSG & ISR',
      description: 'Static Site Generation, Incremental Static Regeneration, Jamstack',
      icon: 'ðŸ“„',
      prerequisiteIds: ['fe-ssr'],
      geminiTopic: 'Static Site Generation (SSG) and ISR: full pre-rendering at build time (npm run build), pure static files (HTML/CSS/JS) distributed globally via CDNs, Incremental Static Regeneration (ISR): updating specific static pages in the background without rebuilding the entire site; revalidation mechanisms: time-based (Stale-While-Revalidate) and on-demand (via Webhooks). Coding Lab focus: create a Node.js build script that scans a directory of Markdown blog posts, converts them to static HTML pages and generates a central index.html. Supplements: fallback strategies for dynamic routes not generated at build time (fallback: blocking vs true), Jamstack pattern and decoupled Headless CMS architectures.',
      estimatedMinutes: 16,
    },
    {
      id: 'fe-islands',
      pathId: 'frontend-rendering',
      title: 'Islands & Resumability',
      description: 'Partial hydration (Astro), Resumability (Qwik), TBT/INP impact',
      icon: 'ðŸï¸',
      prerequisiteIds: ['fe-ssg'],
      geminiTopic: 'Modern Hydration Paradigms: the core problem of modern web â€” Full Client Hydration creates terrible interactivity delay (negatively impacting TBT and INP); Islands Architecture: render 100% static HTML on server and inject isolated JavaScript "islands" only where needed (popularized by Astro); Resumability: completely eliminating hydration â€” the server serializes state and event listeners directly into HTML, allowing interactivity to be instantly "resumed" on the client without re-executing code (Qwik approach). Coding Lab focus: map and design the component structure of an e-commerce product detail page, graphically separating what should be pure static HTML and what needs to be treated as an isolated interactivity Island. Supplements: Partial Hydration and Progressive Hydration techniques, script loading strategies based on screen visibility (Intersection Observer).',
      estimatedMinutes: 20,
    },
    {
      id: 'fe-rsc',
      pathId: 'frontend-rendering',
      title: 'React Server Components',
      description: 'RSC vs Client Components, zero-bundle-size, HTML Streaming, Suspense',
      icon: 'âš›ï¸',
      prerequisiteIds: ['fe-islands'],
      geminiTopic: 'React Server Components (RSC) and HTML Streaming: native component distinction: Server Components (run exclusively on server, never send JS to client) vs Client Components (traditional, hydrated in browser); mental model shift: data fetching directly at component root using async server functions; HTTP Streaming: chunking the HTML response â€” using React Suspense the server sends the page skeleton immediately and streams heavy async components as their data becomes ready. Coding Lab focus: simulate a component tree architecture writing pseudocode that illustrates async data passing from a Server Component to an interactive Client Component, maintaining zero-bundle-size on the server. Supplements: Server Actions for safe data mutation and backend calls triggered directly from client forms, cache sub-tree revalidation and mutation management.',
      estimatedMinutes: 20,
    },
    {
      id: 'fe-edge',
      pathId: 'frontend-rendering',
      title: 'Edge Rendering & Core Web Vitals',
      description: 'V8 Isolates, Edge Middleware, LCP/CLS/INP, RUM vs Lighthouse',
      icon: 'âš¡',
      prerequisiteIds: ['fe-rsc'],
      geminiTopic: 'Edge Rendering and Core Web Vitals: migrating traditional SSR from centralized datacenters to the Edge via V8 Isolates (Cloudflare Workers, Vercel Edge Runtime); benefits: ridiculously low global TTFB and custom logic execution close to the user; Edge Middleware for instant A/B testing, geolocation and security before HTML is generated; Core Web Vitals audit: measuring each rendering strategy success through LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift) and INP (Interaction to Next Paint). Coding Lab focus: write a conceptual Edge Middleware script that intercepts an incoming request, analyzes geographic location metadata from headers and rewrites the destination route to serve a localized page version without visible client redirects. Supplements: network latency problem between Edge functions and centralized transactional databases (and the use of Edge Databases), Real User Monitoring (RUM) reports contrasted with lab data (Lighthouse).',
      estimatedMinutes: 20,
    },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MASTER EXPORT â€” add new paths here to register them globally
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
export function getNodeTopic(node: SkillNode, depth: 'learn' | 'deepen' | 'master'): string {
  return node.depthTopics?.[depth] ?? node.geminiTopic;
}

export function getCompletedNodesFromDepths(nodeDepths: Record<string, 0 | 1 | 2 | 3>): string[] {
  return Object.entries(nodeDepths)
    .filter(([, depth]) => depth >= 1)
    .map(([nodeId]) => nodeId);
}

export function isNodeUnlocked(node: SkillNode, completedNodes: string[]): boolean {
  if (node.prerequisiteIds.length === 0) return true;
  return node.prerequisiteIds.every((id) => completedNodes.includes(id));
}

// Helper: get total node count across all paths
export function getTotalNodeCount(): number {
  return LEARNING_PATHS.reduce((acc, p) => acc + p.nodes.length, 0);
}
