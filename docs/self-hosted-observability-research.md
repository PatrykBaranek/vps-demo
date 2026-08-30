# Self-hosted observability for React + Spring Boot

Research checked on 2026-08-30. Sources are limited to product-owned
documentation or repositories. Capabilities and licenses can differ by release
and edition; verify the exact version before deploying.

## Executive recommendation

For this project, **SigNoz is the best default if one platform must cover all
three signals**. Its documented model is OpenTelemetry-native, its Java agent
automatically instruments Spring Boot, its frontend monitoring uses browser
OpenTelemetry, and its exception view provides configurable grouping. The cost
is operating a ClickHouse-based stack and an OpenTelemetry Collector.

Choose **OpenObserve** when a smaller single-node footprint is more important
than a Sentry-like issue workflow. Its official docs describe a single binary
or container, OTLP ingestion for logs/metrics/traces, and a browser RUM SDK;
the reviewed OSS documentation does not establish Sentry-style issue
fingerprinting or incident grouping.

Choose **GlitchTip** when error tracking is the priority. It is Sentry SDK/API
compatible, records errors as issues, supports performance and logs, and has a
particularly small documented self-hosting footprint. It is less compelling as
the central infrastructure metrics platform: its documented Prometheus
endpoint is for monitoring GlitchTip itself, and its logs documentation says it
does not expose a raw OTLP HTTP receiver.

Choose **Sentry Self-Hosted** when the mature issue/grouping and release
workflow outweighs operational cost and the Functional Source License (FSL).
It has the strongest documented browser and Spring integration in this set, but
the official self-hosted project describes a many-container deployment aimed at
low-volume installations and proofs of concept. The reviewed self-hosted
sources expose performance, logs, and application-metrics feature flags, but do
not document a generic self-hosted OTLP receiver.

**Grafana Faro/LGTM** is a good fit for an organisation already operating
Grafana, Loki, Tempo, and Mimir. **HyperDX / ClickStack** is attractive for an
OpenTelemetry- and ClickHouse-centric stack with RUM/session replay, but its
all-in-one deployment is documented for testing; production separates the
components.

## Recommendation matrix

| Option | Error tracking and grouping | React/browser + Java/Spring fit | Traces, logs, metrics, and OpenTelemetry | Self-hosting complexity | License and fit |
| --- | --- | --- | --- | --- | --- |
| **Sentry Self-Hosted** | Strongest issue workflow here: Sentry models events as issues/groups, and its docs describe stack-trace-based grouping and custom grouping. [Issues](https://docs.sentry.io/product/issues/issue-details/) | Browser tracing is documented in the JavaScript SDK; Spring MVC request tracing and the `sentry-spring-jakarta` integration are documented. [Java/Spring setup](https://github.com/getsentry/sentry-docs/blob/master/platform-includes/getting-started-install/java.spring.mdx) · [Spring tracing](https://github.com/getsentry/sentry-docs/blob/master/docs/platforms/java/guides/spring-boot/tracing/instrumentation/automatic-instrumentation.mdx) | Performance/tracing is enabled in the self-host config. Current config also exposes logs and application-metrics flags, but feature/profile availability must be checked for the chosen release. [Config](https://github.com/getsentry/self-hosted/blob/master/sentry/sentry.conf.example.py) | **High**: official guidance says many Docker containers; minimum 2 CPU/4 GB RAM and recommended 4 CPU/16 GB RAM/20 GB free disk. [Self-hosting guide](https://develop.sentry.dev/self-hosted/) | Server bundle is FSL-1.1-Apache-2.0, not OSI-approved; SDKs are separately licensed. Best when Sentry’s issue workflow is the requirement and traffic is modest. [License](https://github.com/getsentry/self-hosted/blob/master/LICENSE.md) |
| **GlitchTip** | Errors are recorded as issues; performance docs describe transaction/span grouping and aggregates. Exact grouping internals are not specified in the reviewed docs. [Errors](https://glitchtip.com/documentation/error-tracking/) · [Performance](https://glitchtip.com/documentation/performance/) | Sentry JavaScript SDK usage is documented, including React in the SDK index; a generic Java SDK is documented, but no GlitchTip-specific Spring Boot auto-instrumentation page was found. [JavaScript](https://glitchtip.com/sdkdocs/javascript/) · [Java](https://glitchtip.com/sdkdocs/java/) | Performance and logs are documented. Logs use the Sentry endpoint; OTel log records can be bridged through the SDK, but GlitchTip documents no raw OTLP HTTP receiver. The Prometheus observability endpoint is for GlitchTip’s own monitoring. [Logs](https://glitchtip.com/documentation/logs/) · [Install/config](https://glitchtip.com/documentation/install/) | **Low to medium**: Docker Compose, PostgreSQL 14+, and optionally Valkey/Redis; official guidance lists 256 MB as an all-in-one minimum and 512 MB as a recommendation. HA adds Kubernetes and external services. [Install](https://glitchtip.com/documentation/install/) | Backend and frontend repositories publish MIT licenses. Best low-operations, Sentry-compatible error-first choice. [Backend license](https://gitlab.com/glitchtip/glitchtip-backend/-/blob/master/LICENSE) · [Frontend license](https://gitlab.com/glitchtip/glitchtip-frontend/-/blob/master/LICENSE) |
| **SigNoz** | Exceptions are represented as trace span events and grouped by service, exception type, and message by default; self-hosted users can choose lower-cardinality grouping. [Exceptions](https://signoz.io/docs/userguide/exceptions/) | Browser monitoring is OpenTelemetry-based. The Java agent automatically instruments Spring Boot and is launched alongside the executable JAR with `-javaagent`. [Frontend monitoring](https://signoz.io/docs/frontend-monitoring/) · [Java](https://signoz.io/docs/instrumentation/java/opentelemetry-java/) | **Strongest OTel fit**: official docs cover OTLP ingestion and a unified logs/traces/metrics backend; exceptions remain correlated with traces. [Self-hosted ingestion](https://signoz.io/docs/ingestion/self-hosted/overview/) · [Logs](https://signoz.io/docs/logs-management/overview/) | **Medium to high**: Docker Compose requires at least 4 GB memory and runs multiple services including ClickHouse and a Collector; production capacity planning is substantially larger. [Docker install](https://signoz.io/docs/install/docker/) · [Capacity planning](https://signoz.io/docs/setup/capacity-planning/community/resources-planning/) | Community core is MIT; `ee/` has a separate license. Best default for vendor-neutral, full-stack OTel. [License](https://github.com/SigNoz/signoz/blob/main/LICENSE) |
| **Grafana Faro / LGTM** | Faro captures uncaught browser errors, logs, and Web Vitals. Grafana’s frontend fingerprinting page is Cloud documentation, and the official release note says there is no self-managed release; do not assume Sentry-like self-hosted issue grouping. [Faro quick start](https://github.com/grafana/faro-web-sdk/blob/main/docs/sources/tutorials/quick-start-browser.md) · [Fingerprinting status](https://grafana.com/whats-new/2026-04-21-error-fingerprinting-in-frontend-observability/) | Faro has web and React packages; a separate Faro web-tracing package supplies OTel tracing. Grafana documents its OTel Java distribution/agent for JVM apps, including no-code startup instrumentation. [Faro SDK](https://github.com/grafana/faro-web-sdk) · [Grafana Java OTel](https://grafana.com/docs/opentelemetry/instrument/grafana-java/) | Alloy can receive Faro payloads and route logs to Loki and traces into OTel consumers; LGTM adds [Loki](https://grafana.com/docs/loki/latest/) (logs), [Tempo](https://grafana.com/docs/tempo/latest/) (traces), and [Mimir](https://grafana.com/docs/mimir/latest/) (metrics). OTel is first-class, but the stack is composed of separate backends. [Faro receiver](https://grafana.com/docs/alloy/latest/reference/components/faro/faro.receiver/) · [Alloy](https://grafana.com/docs/opentelemetry/collector/) | **High in production**: several services, storage, dashboards, and auth/ingress decisions. The official `docker-otel-lgtm` bundle is explicitly for development/demo/testing, not production. [Demo bundle](https://github.com/grafana/docker-otel-lgtm) | Faro and Alloy are Apache-2.0; Grafana, Loki, Tempo, and Mimir are AGPL-3.0-only. Best for an existing Grafana operations team, not a turnkey issue tracker. [Faro license](https://github.com/grafana/faro-web-sdk/blob/main/LICENSE) · [Loki licensing](https://github.com/grafana/loki/blob/main/LICENSING.md) |
| **OpenObserve** | RUM error tracking covers JavaScript errors, promise rejections, console errors, and network/resource errors. The docs discuss grouping similar errors, but the reviewed OSS sources do not establish a Sentry-equivalent issue/group lifecycle; automatic incident grouping is documented as Enterprise/Cloud-only. [RUM errors](https://openobserve.ai/docs/user-guide/data-exploration/rum/error-tracking/) · [Incidents](https://openobserve.ai/docs/user-guide/analytics/incidents/) | Official RUM packages cover browser telemetry. The Java guide documents zero-code OTel Java-agent instrumentation, including servlet/HTTP/JDBC integrations, so it fits `java -javaagent:... -jar app.jar`. [RUM setup](https://openobserve.ai/docs/user-guide/data-exploration/rum/setup/) · [Java OTel](https://openobserve.ai/opentelemetry/java/) | Logs, metrics, and traces are accepted through OTLP; RUM is a separate browser SDK path. [Ingestion](https://openobserve.ai/docs/ingestion/) · [Traces](https://openobserve.ai/docs/ingestion/traces/) | **Low for single-node, high for HA**: official docs describe a single binary/container with local storage; HA adds Kubernetes, object storage, PostgreSQL, and NATS. [Architecture](https://openobserve.ai/docs/architecture/) · [Getting started](https://openobserve.ai/docs/getting-started/) | OSS is AGPL-3.0; Enterprise has a separate EULA. Best lower-footprint full-signal option when AGPL and less mature issue management are acceptable. [Downloads/licensing](https://openobserve.ai/downloads/) · [OSS license](https://github.com/openobserve/openobserve/blob/main/LICENSE) |
| **HyperDX / ClickStack** | Errors and browser RUM/session replay are documented, but the reviewed official sources do not establish a Sentry-like issue grouping/fingerprinting workflow. Treat it as telemetry analytics unless the target release proves otherwise. [Browser SDK](https://github.com/hyperdxio/hyperdx-js/blob/main/packages/browser/README.md) · [ClickStack](https://clickhouse.com/clickstack) | `@hyperdx/browser` provides browser RUM, tracing, session replay, console/network capture, and React error-boundary support. Java is supported through OpenTelemetry; use the upstream Java agent for the JAR. [HyperDX JS](https://github.com/hyperdxio/hyperdx-js) · [OTel Java agent](https://opentelemetry.io/docs/zero-code/java/agent/) | ClickStack is OTel-native and unifies logs, metrics, traces, errors, and session replay on ClickHouse; the all-in-one image bundles the Collector. [ClickStack](https://clickhouse.com/clickstack) · [HyperDX repo](https://github.com/hyperdxio/hyperdx) | **Medium to high**: all-in-one is documented for testing (at least 4 GB RAM/2 cores); production uses separate ClickHouse, MongoDB, Collector, and HyperDX components. [Deployment](https://github.com/hyperdxio/hyperdx/blob/main/DEPLOY.md) · [Embedded UI caveat](https://clickhouse.com/blog/clickstack-embedded-clickhouse) | HyperDX UI repository is MIT; ClickStack’s page describes ClickHouse/Collector as Apache-2.0 and the HyperDX UI as MIT. Best for ClickHouse/OTel teams wanting high-cardinality search and RUM. [Repository license](https://github.com/hyperdxio/hyperdx/blob/main/LICENSE) |

## Product notes and evidence

### 1. Sentry Self-Hosted

Sentry has the clearest issue-centric model in this comparison: an issue is a
group of events, with stack trace data being a major grouping input and custom
grouping available. Its JavaScript SDK supports browser tracing, and the Java
Spring integration documents automatic request tracing. This is the closest
match if the primary question is “which release caused this recurring browser
or backend exception?”

Self-hosted Sentry is not a small sidecar. The official configuration says the
full feature set requires many Docker containers and provides an `errors-only`
profile. The same configuration currently contains flags for performance/
tracing, logs (`ourlogs`), and application metrics (`tracemetrics`); those flags
should be treated as release/profile-dependent rather than as a promise that
every feature is enabled in every installation. The official [self-hosted
release page](https://github.com/getsentry/self-hosted/releases) also calls
Application Metrics generally available.

The self-hosted server is licensed under FSL-1.1-Apache-2.0. That permits
internal deployment but has restrictions around offering a competing hosted
service; involve legal review if this is part of a product. The Java SDK itself
is maintained separately in the [Sentry Java repository](https://github.com/getsentry/sentry-java),
which is MIT-licensed.

### 2. GlitchTip

GlitchTip retains the Sentry SDK shape, which makes browser JavaScript and
generic Java instrumentation straightforward. Its official documentation
explicitly covers error issues, performance transactions/spans, and log
ingestion. The Java page is a generic Java SDK guide; the reviewed GlitchTip
sources do not document a Spring Boot-specific auto-instrumentation path, so
Spring coverage should be validated before choosing it for JVM tracing.

Deployment is the most approachable in the set: Compose is recommended,
PostgreSQL is required, and Valkey/Redis is optional. The small memory guidance
is useful for a private low-volume installation, not a capacity guarantee. For
larger or highly available deployments, the official Helm guidance adds
Kubernetes and an external PostgreSQL service.

GlitchTip’s OTel story is deliberately narrower than SigNoz/OpenObserve:
the logs guide describes accepting OTel-formatted log records through the
Sentry SDK integration, not a standalone OTLP receiver. Its observability API
can expose Prometheus metrics for GlitchTip itself; that is not documented as a
general application-metrics storage/query backend.

### 3. SigNoz

SigNoz is the cleanest match for a vendor-neutral signal pipeline. Its official
documentation describes logs, metrics, traces, and exceptions in one
OpenTelemetry-powered product. The Java agent can run alongside an executable
Spring Boot JAR and automatically instrument common Spring, HTTP, database, and
messaging paths. Browser monitoring is also OTel-based, with separate browser
configuration and collector/CORS concerns.

Its exception model is worth distinguishing from Sentry’s: exceptions are
trace events, and the exception view groups by service, type, and message by
default. That gives useful correlation and alerting, but it is a different
workflow from a dedicated issue tracker with release-oriented grouping.

The operational trade-off is ClickHouse and the Collector. Docker Compose is a
reasonable evaluation deployment, while the official capacity-planning guide
shows that production scale can require considerably more resources and
multiple collector/backend instances.

### 4. Grafana Faro/LGTM

Faro is the browser collection layer, not the complete backend. The official
SDK quick start says it collects uncaught errors, logs, and Web Vitals; tracing
is supplied by a separate package. Grafana Alloy’s self-hosted Faro receiver
can route logs to Loki and traces into OTel pipelines. Backend metrics normally
belong in Mimir, traces in Tempo, and logs in Loki, with Grafana as the UI.

This gives maximum composability, but also the largest deployment surface. The
official all-in-one OTel-LGTM container is explicitly a development/demo/test
convenience. Tempo documents monolithic and microservices deployment modes,
which reinforces that production topology is an operations decision rather
than a single JAR-like install.

Do not transfer Grafana Cloud’s frontend error-fingerprinting documentation to
self-hosted LGTM: Grafana’s own release note says there was no self-managed
release for that feature at the time checked. Faro/LGTM should therefore be
selected for telemetry, dashboards, and alerting—not for a Sentry-equivalent
browser issue inbox—unless a later self-managed release is verified.

### 5. OpenObserve

OpenObserve has an unusually direct low-footprint story: official docs describe
a single-node binary/container and a separate HA architecture. Its Java guide
supports zero-code instrumentation with the OpenTelemetry Java agent and
documents OTLP HTTP endpoints for traces, metrics, and logs. The browser side
uses OpenObserve’s RUM packages, which capture frontend errors and related
telemetry.

The important limitation is error workflow maturity in the OSS edition. The
RUM docs provide an error-tracking view and advice for grouping similar errors,
while the incidents docs mark automatic incident grouping as an Enterprise/
Cloud capability. That is useful monitoring, but it is not evidence of the
same issue lifecycle as Sentry.

Single-node storage is simple, but it is not equivalent to HA durability. The
official architecture requires additional infrastructure for the distributed
mode. The OSS edition is AGPL-3.0; the Enterprise edition has a separate EULA,
so the intended edition should be decided before standardising the deployment.

### 6. HyperDX / ClickStack

The current product direction matters: ClickHouse describes ClickStack as the
open-source OTel observability stack and HyperDX as its unified UI; older
HyperDX references are therefore best read as “HyperDX / ClickStack.” The
browser SDK provides RUM, tracing, session replay, console/network capture,
and React error-boundary integration. The backend is OpenTelemetry-centric and
ClickHouse-backed.

The all-in-one image is convenient for evaluation and bundles ClickHouse,
MongoDB, HyperDX, and the Collector. Official deployment guidance separates
those pieces for production, and ClickHouse explicitly says the embedded UI is
for local exploration rather than a production deployment. The reviewed
official sources document errors and RUM dashboards but not a Sentry-like issue
grouping workflow.

## Practical deployment conclusion for this JAR

The executable-JAR packaging does not make browser and JVM telemetry one
runtime. The React bundle executes in users’ browsers, while Spring Boot runs
in the JVM. Plan for two instrumentation paths:

1. Browser SDK/RUM instrumentation sends to a browser-safe ingest endpoint with
   the required CORS policy.
2. The Spring Boot process uses an SDK or an OpenTelemetry Java agent. The
   upstream agent is explicitly launched as `java -javaagent:... -jar app.jar`,
   so it does not require changing the application source or repackaging the
   JAR. [OpenTelemetry Java agent setup](https://opentelemetry.io/docs/zero-code/java/agent/getting-started/)

Use stable, separate service names such as `frontend` and `spring-api`, and
propagate W3C trace context on browser-to-API requests, as described in the
[OpenTelemetry browser guidance](https://opentelemetry.io/docs/languages/js/getting-started/browser/).
Keep private collector credentials server-side; a browser ingest endpoint must
be treated as public and protected with product-supported origin, quota,
sampling, and scrubbing controls.

### Bottom line

| Priority | Pick | Why |
| --- | --- | --- |
| Full logs + metrics + traces + exception correlation through OTel | **SigNoz** | Best documented end-to-end OTel and Spring/JAR fit; accept ClickHouse/Collector operations. |
| Small self-hosted footprint with full signals | **OpenObserve** | Single-node binary/container and OTLP support; accept AGPL and less-established issue management. |
| Error/issue workflow first | **GlitchTip** or **Sentry Self-Hosted** | GlitchTip is lighter and MIT; Sentry has the richer issue workflow but heavier FSL-licensed operations. |
| Existing Grafana platform | **Faro + LGTM** | Excellent composability; operate multiple backends and do not assume Cloud-only fingerprinting is self-hosted. |
| ClickHouse, high-cardinality search, and session replay | **HyperDX / ClickStack** | OTel-native and unified; production is a composed ClickHouse/MongoDB/Collector deployment. |
