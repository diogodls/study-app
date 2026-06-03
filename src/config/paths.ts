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
// ─────────────────────────────────────────────────────────────
const systemDesignPath: LearningPath = {
  id: 'system-design',
  title: 'System Design',
  shortTitle: 'Systems',
  description: 'Architect large-scale distributed systems.',
  icon: '🏗️',
  color: 'hsl(270, 65%, 65%)',
  cssVar: '--path-system',
  nodes: [
    {
      id: 'sd-scalability',
      pathId: 'system-design',
      title: 'Scalability Basics',
      description: 'Vertical vs horizontal scaling and bottlenecks',
      icon: '📈',
      prerequisiteIds: [],
      geminiTopic: 'Scalability fundamentals: vertical vs horizontal scaling, stateless vs stateful services, database sharding, read replicas, identifying bottlenecks',
      estimatedMinutes: 14,
    },
    {
      id: 'sd-caching',
      pathId: 'system-design',
      title: 'Caching Strategies',
      description: 'Redis, CDN, and cache invalidation patterns',
      icon: '⚡',
      prerequisiteIds: ['sd-scalability'],
      geminiTopic: 'Caching strategies: cache-aside, write-through, write-behind, TTL, Redis data structures, CDN caching, cache invalidation challenges, eviction policies',
      estimatedMinutes: 14,
    },
    {
      id: 'sd-load-balancing',
      pathId: 'system-design',
      title: 'Load Balancing',
      description: 'Distribute traffic and ensure high availability',
      icon: '⚖️',
      prerequisiteIds: ['sd-caching'],
      geminiTopic: 'Load balancing: round-robin, least connections, IP hashing, Layer 4 vs Layer 7 load balancers, health checks, sticky sessions, active-passive vs active-active',
      estimatedMinutes: 12,
    },
    {
      id: 'sd-message-queues',
      pathId: 'system-design',
      title: 'Message Queues',
      description: 'Async communication and event-driven design',
      icon: '📬',
      prerequisiteIds: ['sd-load-balancing'],
      geminiTopic: 'Message queues in system design: pub/sub pattern, at-least-once vs exactly-once delivery, Kafka vs RabbitMQ, backpressure, dead letter queues',
      estimatedMinutes: 14,
    },
    {
      id: 'sd-cap',
      pathId: 'system-design',
      title: 'CAP Theorem & Consistency',
      description: 'Consistency, availability, and partition tolerance',
      icon: '🔺',
      prerequisiteIds: ['sd-message-queues'],
      geminiTopic: 'CAP theorem: consistency vs availability vs partition tolerance, eventual consistency, strong consistency, BASE vs ACID, real-world database choices explained by CAP',
      estimatedMinutes: 14,
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
