// Sample work items for testing progress bar functionality
export const sampleWorkItems = [
  {
    id: 'work-1',
    title: 'Implement OAuth 2.0 authentication',
    description: 'Add OAuth 2.0 flow to auth service',
    systemId: 'auth-service',
    assignee: 'Mike Rodriguez',
    status: 'done' as const,
    type: 'feature' as const,
    priority: 'high' as const,
    effort: { unit: 'points' as const, original: 8, completed: 8 },
    areaPath: 'Authentication',
    tags: ['security', 'oauth'],
    dueDate: '2024-01-15',
    progress: 100
  },
  {
    id: 'work-2',
    title: 'JWT token validation',
    description: 'Validate JWT tokens in middleware',
    systemId: 'auth-service',
    assignee: 'Mike Rodriguez',
    status: 'done' as const,
    type: 'task' as const,
    priority: 'high' as const,
    effort: { unit: 'points' as const, original: 5, completed: 5 },
    areaPath: 'Authentication',
    tags: ['security', 'jwt'],
    dueDate: '2024-01-20',
    progress: 100
  },
  {
    id: 'work-3',
    title: 'User session management',
    description: 'Implement user session handling',
    systemId: 'auth-service',
    assignee: 'Mike Rodriguez',
    status: 'in progress' as const,
    type: 'feature' as const,
    priority: 'medium' as const,
    effort: { unit: 'points' as const, original: 13, completed: 8 },
    areaPath: 'Session Management',
    tags: ['session', 'user-management'],
    dueDate: '2024-02-01',
    progress: 60
  },
  {
    id: 'work-4',
    title: 'Password reset flow',
    description: 'Implement secure password reset',
    systemId: 'auth-service',
    assignee: 'Mike Rodriguez',
    status: 'todo' as const,
    type: 'feature' as const,
    priority: 'medium' as const,
    effort: { unit: 'points' as const, original: 8 },
    areaPath: 'Authentication',
    tags: ['security', 'password'],
    dueDate: '2024-02-15',
    progress: 0
  },
  {
    id: 'work-5',
    title: 'API rate limiting',
    description: 'Add rate limiting to auth endpoints',
    systemId: 'auth-service',
    assignee: 'Mike Rodriguez',
    status: 'blocked' as const,
    type: 'task' as const,
    priority: 'low' as const,
    effort: { unit: 'points' as const, original: 5 },
    areaPath: 'API Security',
    tags: ['rate-limiting', 'api'],
    dueDate: '2024-02-20',
    progress: 0,
    blockers: ['Waiting for infrastructure team']
  },
  {
    id: 'work-6',
    title: 'Database connection pooling',
    description: 'Optimize database connections',
    systemId: 'hub',
    assignee: 'Sarah Chen',
    status: 'done' as const,
    type: 'task' as const,
    priority: 'high' as const,
    effort: { unit: 'points' as const, original: 8, completed: 8 },
    areaPath: 'Performance',
    tags: ['database', 'performance'],
    dueDate: '2024-01-10',
    progress: 100
  },
  {
    id: 'work-7',
    title: 'Caching layer implementation',
    description: 'Add Redis caching for better performance',
    systemId: 'hub',
    assignee: 'Sarah Chen',
    status: 'in progress' as const,
    type: 'feature' as const,
    priority: 'high' as const,
    effort: { unit: 'points' as const, original: 13, completed: 5 },
    areaPath: 'Performance',
    tags: ['caching', 'redis'],
    dueDate: '2024-02-05',
    progress: 40
  },
  {
    id: 'work-8',
    title: 'API documentation',
    description: 'Generate OpenAPI documentation',
    systemId: 'hub',
    assignee: 'Sarah Chen',
    status: 'todo' as const,
    type: 'task' as const,
    priority: 'medium' as const,
    effort: { unit: 'points' as const, original: 5 },
    areaPath: 'Documentation',
    tags: ['documentation', 'api'],
    dueDate: '2024-02-25',
    progress: 0
  }
];

// Sample initiatives for testing
export const sampleInitiatives = [
  {
    id: 'init-1',
    name: 'Authentication Modernization',
    description: 'Modernize authentication system with OAuth 2.0 and JWT',
    owner: 'Mike Rodriguez',
    systems: ['auth-service'],
    status: 'in progress' as const,
    priority: 'high' as const,
    startDate: '2024-01-01',
    targetDate: '2024-03-01',
    progress: 65,
    color: '#1b5fbf',
    milestones: [
      { id: 'mil-1', name: 'OAuth Implementation', date: '2024-01-15', completed: true },
      { id: 'mil-2', name: 'JWT Integration', date: '2024-01-20', completed: true },
      { id: 'mil-3', name: 'Session Management', date: '2024-02-01', completed: false },
      { id: 'mil-4', name: 'Password Reset', date: '2024-02-15', completed: false }
    ]
  },
  {
    id: 'init-2',
    name: 'Performance Optimization',
    description: 'Improve system performance with caching and connection pooling',
    owner: 'Sarah Chen',
    systems: ['hub'],
    status: 'in progress' as const,
    priority: 'high' as const,
    startDate: '2024-01-01',
    targetDate: '2024-02-28',
    progress: 45,
    color: '#1f7a4d',
    milestones: [
      { id: 'mil-5', name: 'Connection Pooling', date: '2024-01-10', completed: true },
      { id: 'mil-6', name: 'Redis Caching', date: '2024-02-05', completed: false },
      { id: 'mil-7', name: 'API Documentation', date: '2024-02-25', completed: false }
    ]
  }
];
