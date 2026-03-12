# ENGCE301 Final Lab 1: Microservices + HTTPS + Lightweight Logging

##  สมาชิกในกลุ่ม
1. [อรนุช ลุงหลิ่ง] | รหัสนักศึกษา: [67543206031-6]
2. [ชนาธิป ระวิมี] | รหัสนักศึกษา: [67543206044-9]

---

##  Architecture Diagram

```text
Browser / Postman
       │
       │ HTTPS :443  (HTTP :80 redirect → HTTPS)
       ▼
┌─────────────────────────────────────────────────────────────┐
│   Nginx (API Gateway + TLS Termination + Rate Limiter)      │
│                                                             │
│  /api/auth/* → auth-service:3001    (ไม่ต้องมี JWT)            │
│  /api/tasks/* → task-service:3002    [JWT required]         │
│  /api/logs/* → log-service:3003     [JWT required]          │
│  /             → frontend:80          (Static HTML)         │
└───────┬────────────────┬──────────────────┬─────────────────┘
        │                │                  │
        ▼                ▼                  ▼
┌──────────────┐ ┌───────────────┐ ┌──────────────────┐
│  Auth Svc    │ │  Task Svc     │ │  Log Service     │
│   :3001      │ │   :3002       │ │   :3003          │
│              │ │               │ │                  │
│ • Login      │ │ • CRUD Tasks  │ │ • POST /api/logs │
│ • /verify    │ │ • JWT Guard   │ │ • GET  /api/logs │
│ • /me        │ │ • Log events  │ │ • เก็บลง DB       │
└──────┬───────┘ └───────┬───────┘ └──────────────────┘
       │                 │
       └────────┬────────┘
                ▼
     ┌─────────────────────┐
     │   PostgreSQL        │
     │  (1 shared DB)      │
     │  • users  table     │
     │  • tasks  table     │
     │  • logs   table     │
     └─────────────────────┘

```

---

##  วิธีรันโปรเจกต์

1. **สร้าง Self-Signed Certificate** สำหรับ Nginx (รันแค่ครั้งแรก)
```bash
./scripts/gen-certs.sh

```


2. **เตรียม Environment Variables**
```bash
cp .env.example .env

```


3. **Build และ Start Docker Containers**
```bash
docker compose up --build

```


> **Note:** เมื่อ Container รันครบทุกตัวแล้ว (Status = healthy) สามารถเข้าใช้งานเว็บได้ที่ `https://localhost` (หากเบราว์เซอร์แจ้งเตือนเรื่อง Certificate ให้กด Advanced -> Accept the risk / Proceed to localhost เพื่อเข้าสู่เว็บไซต์)



---

##  Seed Users

ระบบนี้ออกแบบมาแบบ **ไม่มี Register** (ใช้ Seed Users เท่านั้น) สามารถใช้ข้อมูลด้านล่างนี้ในการ Login:

| Username | Email | Password (Plain-text) | Role |
| --- | --- | --- | --- |
| **alice** | `alice@lab.local` | `alice123` | member |
| **bob** | `bob@lab.local` | `bob456` | member |
| **admin** | `admin@lab.local` | `adminpass` | admin |

---

##  อธิบายการทำงานของ HTTPS ในระบบนี้

ในสถาปัตยกรรม Microservices ของโปรเจกต์นี้ **HTTPS ทำงานโดยมี Nginx เป็น API Gateway และทำหน้าที่ TLS Termination (การถอดรหัส SSL/TLS)** โดยมีโฟลว์การทำงานดังนี้:

1. **HTTP to HTTPS Redirect:** Nginx จะดักจับ Request ที่เข้ามาทาง Port 80 (HTTP) และทำการบังคับ Redirect (`HTTP 301`) ไปที่ Port 443 (HTTPS) อัตโนมัติ เพื่อให้การเชื่อมต่อระหว่างเบราว์เซอร์และเซิร์ฟเวอร์ถูกเข้ารหัสทั้งหมด
2. **TLS Termination ที่ Gateway:** การเข้ารหัสและถอดรหัสด้วย Self-Signed Certificate (`cert.pem` และ `key.pem`) จะเกิดขึ้นและจบลงที่ตัว Nginx เท่านั้น
3. **Internal Routing:** หลังจาก Nginx ถอดรหัสคำขอเรียบร้อยแล้ว จะทำหน้าที่เป็น Reverse Proxy เพื่อส่งต่อข้อมูลเหล่านั้นไปยัง Service ด้านหลัง (Auth, Task, Log, Frontend) ผ่านโปรโตคอล HTTP ธรรมดาภายในเครือข่ายของ Docker (`taskboard-net`) ซึ่งมีความปลอดภัยอยู่แล้วเนื่องจากเป็นการสื่อสารภายในเครือข่ายปิดที่บุคคลภายนอกเข้าถึงไม่ได้
4. **Security & Rate Limiting:** นอกจากการจัดการเรื่อง HTTPS แล้ว Nginx ยังช่วยเพิ่ม Security Headers ให้กับ Response และทำ Rate Limiting ก่อนที่ Request จะไปถึง Backend เพื่อป้องกันการโจมตีแบบ Brute-force

```