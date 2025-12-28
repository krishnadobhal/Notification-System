# Notification System

A **scalable, event-driven notification system** built with **Node.js** and **TypeScript**.
Designed to handle **high-throughput**, **multi-channel notifications** (Email, SMS, In-App, Push) with strong reliability guarantees such as **idempotency**, **rate limiting**, and **retries**.

---

## Architecture Overview

The system follows a **microservices-based, event-driven architecture**.

1. **Kafka** is used for inbound event ingestion.
2. A central **Notification Service** consumes events, applies business logic, and fans out jobs.
3. **RabbitMQ** is used as a job queue to distribute work to channel-specific workers.
4. **Redis** handles idempotency and rate limiting.
5. Dedicated workers deliver notifications via external providers.

```mermaid
graph TD
    %% Styling
    classDef service fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef queue fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,stroke-dasharray: 5 5;
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef database fill:#e0f2f1,stroke:#00695c,stroke-width:2px,shape:cylinder;
    classDef worker fill:#ffebee,stroke:#c62828,stroke-width:2px;

    %% 1. Inbound Layer
    Ext[External Service]:::external -->|Publish Event| Kafka[(Kafka: notifications.inbound)]:::queue

    %% 2. The Core Brain (Notification Service)
    subgraph NS_Context [Notification Service Scope]
        direction TB
        Kafka -->|Consume| NS_Main(Notification Service):::service

        %% Dependencies
        NS_Main <-->|Fetch Prefs| UserDB[(User DB)]:::database
        NS_Main <-->|Check Rules| RulesDB[(Business Rules/Template DB)]:::database
        NS_Main <-->|Check Quota| Redis[(Redis Rate Limiter)]:::database

        %% Internal Logic Visualization
        subgraph NS_Logic [Internal Logic Flow]
            direction TB
            Step1[1. Idempotency Check] --> Step2[2. User Prefs & Rules]
            Step2 --> Step3{3. Rate Limit OK?}
            Step3 -- No --> DLQ_RL[(Rate Limit DLQ)]:::queue
            Step3 -- Yes --> Step4[4. Template Resolution]
            Step4 --> Step5[5. FAN-OUT LOGIC]
        end

        %% Connect Main Service to Logic mainly for visual grouping
        NS_Main -.-> Step1
    end

    %% 3. The Fan-Out (Queues)
    Step5 -- "If Email=True" --> Q_Email[(Email Queue)]:::queue
    Step5 -- "If SMS=True" --> Q_SMS[(SMS Queue)]:::queue
    Step5 -- "If In-App=True" --> Q_InApp[(In-App Queue)]:::queue
    Step5 -- "If Push=True" --> Q_Push[(Push Queue)]:::queue

    %% 4. The Dumb Workers
    Q_Email --> W_Email[Email Worker]:::worker
    Q_SMS --> W_SMS[SMS Worker]:::worker
    Q_InApp --> W_InApp[In-App Worker]:::worker
    Q_Push --> W_Push[Push Worker]:::worker

    %% 5. Final Delivery
    W_Email --> Prov_Email((Email Provider)):::external
    W_SMS --> Prov_SMS((SMS Provider)):::external
    W_InApp --> Prov_InApp((WebSocket / DB)):::external
    W_Push --> Prov_Push((FCM / APNS)):::external
```

## Features

### Event Driven

- Asynchronous ingestion using **Apache Kafka**
- Decouples producers from notification delivery

### Idempotency

- Redis-based deduplication using message IDs
- Prevents duplicate notifications on retries or replays

### Rate Limiting

- Sliding window rate limiter in Redis
- Example: `max 5 emails per user per hour`
- High-priority messages can bypass limits

### User Preferences

- Stored in **PostgreSQL**
- Honors opt-in / opt-out per channel (Email, SMS, etc.)

### Reliable Delivery

- **Retries** via RabbitMQ delayed exchanges (`x-delayed-message`)
- **Exponential backoff**
- **Dead Letter Queues (DLQ)** for failed messages

  - `email.dlq`
  - `sms.dlq`

---

## Tech Stack

| Category         | Technology   |
| ---------------- | ------------ |
| Language         | TypeScript   |
| Runtime          | Node.js      |
| Ingestion Broker | Apache Kafka |
| Job Queue        | RabbitMQ     |
| Database         | PostgreSQL   |
| Cache / Locking  | Redis        |
| Validation       | Zod          |

---

## Setup & Installation

### Prerequisites

Ensure the following services are running (Docker recommended):

- PostgreSQL
- Redis
- RabbitMQ

  - `rabbitmq_delayed_message_exchange` plugin enabled

- Kafka + Zookeeper

---

### 1️. Notification Service

```bash
cd Notification

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Configure DATABASE_URL, REDIS_URL, KAFKA_BROKER, RABBITMQ_URL

# Run database migrations
npm run migrate:up

# Start service
npm run dev
```

---

### 2️. Email Worker

```bash
cd Email-Worker

# Install dependencies
npm install

# Start worker
npm run dev
```

---

## Event Payload Schema

Publish a JSON message to the Kafka **Notification** topic:

```json
{
  "id": "uuid-v4-string",
  "userId": "123",
  "type": ["email", "sms"],
  "priority": "high",
  "to": "user@example.com",
  "notification": "Video_Processing_Complete",
  "action_url": "https://example.com/videos/123"
}
```

### Field Description

| Field          | Description                              |
| -------------- | ---------------------------------------- |
| `id`           | Unique message ID (used for idempotency) |
| `userId`       | Target user ID                           |
| `type`         | Channels to send (`email`, `sms`, etc.)  |
| `priority`     | `high` bypasses rate limits              |
| `to`           | Destination address (email / phone)      |
| `notification` | Template key                             |
| `action_url`   | CTA link included in message             |

---

## Supported Notification Types

- `Video_Processing_Complete`
- `Video_Processing_Failed`
- `Video_Audio_Transcription_Complete`
- `Video_Audio_Transcription_Failed`

---

## Reliability Guarantees

- **At-least-once delivery**
- **Idempotent processing**
- **Backpressure handling via queues**
- **Safe retries with exponential backoff**
- **DLQ for debugging & replay**

---

## Scalability Notes

- Kafka consumers scale horizontally via consumer groups
- RabbitMQ workers scale independently per channel
- Redis ensures consistency across instances
- Stateless services → easy horizontal scaling

---

## Future Improvements

- Circuit breaker per provider
