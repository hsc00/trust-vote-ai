# Backend DevOps

Docker, Kubernetes, deployment strategies, and monitoring.

## Docker

### Best Practices

- Use multi-stage builds
- Minimize image size
- Use .dockerignore
- Don't run as root
- Use specific tags, not `latest`

### Example Dockerfile

```dockerfile
#
# Base image version rationale:
# - Lock to a specific minor/patch version (e.g., node:20.20-alpine or node:20.20.1-alpine) for reproducible builds and to avoid breaking changes from upstream. Note: node:20-alpine is a major-only moving alias and may introduce breaking changes unexpectedly.
# - Prefer LTS versions for stability and security. Check your package.json "engines" field or .nvmrc/.node-version for project requirements.
# - Review and update the Node version regularly (e.g., quarterly or on security releases) to balance compatibility and security.
# - Alpine images are smaller but use musl libc, which may cause compatibility issues with some native Node modules. Test thoroughly if using native dependencies.
#
FROM node:20.20-alpine AS builder  # Use explicit minor version for reproducibility
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Install only production dependencies for runtime image
FROM node:20.20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20.20-alpine
WORKDIR /app
# Create non-root user and group
RUN addgroup -g 1001 appgroup && adduser -D -u 1001 -G appgroup appuser
# Copy built app and production node_modules
COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
RUN chown -R appuser:appgroup /app
USER appuser
CMD ["node", "dist/index.js"]
```

## Kubernetes

### Core Concepts

- **Pods** - Smallest deployable unit
- **Services** - Network access to pods
- **Deployments** - Manage pod replicas
- **ConfigMaps** - Configuration data
- **Secrets** - Sensitive data

### Deployment Strategies

- **Rolling Update** - Gradual replacement
- **Blue-Green** - Two environments, switch traffic
- **Canary** - Gradual traffic shift

### Best Practices

- Use resource limits
- Health checks (liveness, readiness)
- Horizontal Pod Autoscaling
- Namespace isolation
- RBAC for security

## CI/CD Pipelines

### Stages

1. **Build** - Compile, test, package
2. **Test** - Run test suite
3. **Deploy** - Deploy to environment
4. **Verify** - Health checks, smoke tests

### Best Practices

- Fast feedback loops
- Parallel execution
- Cache dependencies
- Secure secrets management
- Automated rollback

## Deployment Strategies

### Blue-Green Deployment

- Two identical environments
- Deploy to inactive environment
- Switch traffic when ready
- Instant rollback

### Canary Deployment

- Deploy to subset of users
- Monitor metrics
- Gradually increase traffic
- Rollback if issues

### Rolling Deployment

- Gradual replacement
- Zero downtime
- Automatic rollback on failure

## Feature Flags

- Industry reports suggest up to 90% fewer failures[^1]
  [^1]: See "Feature Flags: 90% Fewer Production Failures" (https://launchdarkly.com/blog/feature-flags-90-percent-fewer-production-failures/) and related industry studies.
- Gradual feature rollout
- A/B testing
- Instant rollback
- Kill switches

## Monitoring

### Metrics

- **Application Metrics** - Response time, error rate, throughput
- **Infrastructure Metrics** - CPU, memory, disk, network
- **Business Metrics** - User actions, revenue, conversions

### Tools

- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Datadog** - APM and monitoring
- **New Relic** - Application monitoring

## Logging

### Best Practices

- Structured logging (JSON)
- Log levels (DEBUG, INFO, WARN, ERROR)
- Include context (request ID, user ID)
- Centralized log aggregation
- Log retention policies

### Tools

- **ELK Stack** - Elasticsearch, Logstash, Kibana
- **Loki** - Log aggregation
- **Fluentd** - Log forwarding

## Tracing

### Distributed Tracing

- Track requests across services
- Identify bottlenecks
- Debug distributed systems

### Tools

- **OpenTelemetry** - Observability standard
- **Jaeger** - Distributed tracing
- **Zipkin** - Distributed tracing

## Health Checks

### Liveness Probe

- Is the application running?
- Restart if unhealthy

### Readiness Probe

- Is the application ready to serve traffic?
- Remove from load balancer if not ready

### Startup Probe

- Is the application starting up?
- Give time for initialization
