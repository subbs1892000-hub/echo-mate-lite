# EchoMateLite

EchoMateLite is a lightweight MERN social media platform with JWT authentication, profile management, post creation, and a reverse-chronological feed.

## Project Structure

```text
EchoMateLite/
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   └── axiosInstance.js
│       ├── components/
│       │   ├── Loader.jsx
│       │   ├── Navbar.jsx
│       │   ├── PostCard.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── SignupPage.jsx
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── profileRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── package.json
│   └── server.js
└── README.md
```

## Backend APIs

- `POST /auth/signup`
- `POST /auth/login`
- `GET /posts`
- `POST /posts`
- `GET /profile`
- `PUT /profile`

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Update `.env` with your MongoDB URI and JWT secret.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
```

## Run Locally

Start backend:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## AWS Deployment Readiness

- Backend uses environment variables for `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
- Frontend uses `VITE_API_BASE_URL` so the API endpoint can be changed for production.
- CORS is configured through `CLIENT_URL`.
- Both apps have production build/start scripts for deployment pipelines.

## Additional Documentation

- [Portfolio-Ready SOC Lab Master Document](./PORTFOLIO_READY_SOC_LAB_MASTER_DOCUMENT.md)
- [Project Documentation](./PROJECT_DOCUMENTATION.md)
- [AWS Deployment Guide](./AWS_DEPLOYMENT.md)
- [SOC Wazuh Lab Guide](./SOC_WAZUH_LAB_GUIDE.md)
- [SOC Wazuh Detection Rules](./SOC_WAZUH_DETECTION_RULES.md)
- [Wazuh Local Rules Bundle](./WAZUH_LOCAL_RULES_BUNDLE.xml)
- [Wazuh Local Rules Bundle v2](./WAZUH_LOCAL_RULES_BUNDLE_V2.xml)
- [Wazuh Advanced Correlation Rules](./WAZUH_ADVANCED_CORRELATION_RULES.xml)
- [Wazuh ossec.conf Sample](./WAZUH_OSSEC_CONF_SAMPLE.xml)
- [Wazuh FIM Config Sample](./WAZUH_FIM_CONFIG_SAMPLE.xml)
- [Wazuh Vulnerability Detection Config](./WAZUH_VULNERABILITY_DETECTION_CONFIG.xml)
- [Wazuh Syscollector Agent Config](./WAZUH_SYSCOLLECTOR_AGENT_CONFIG.xml)
- [Wazuh VirusTotal Integration Sample](./WAZUH_VIRUSTOTAL_INTEGRATION_SAMPLE.xml)
- [SOC Wazuh Upgrade and Active Response Guide](./SOC_WAZUH_UPGRADE_AND_ACTIVE_RESPONSE_GUIDE.md)
- [Linux Victim and Active Response Setup](./LINUX_VICTIM_AND_ACTIVE_RESPONSE_SETUP.md)
- [Wazuh Unified Dashboard Guide](./WAZUH_UNIFIED_DASHBOARD_GUIDE.md)
- [Wazuh Dashboard Panel Checklist](./WAZUH_DASHBOARD_PANEL_CHECKLIST.md)
- [SOC Dashboard v2 Guide](./SOC_DASHBOARD_V2_GUIDE.md)
- [Wazuh CDB Lists and Enrichment](./WAZUH_CDB_LISTS_AND_ENRICHMENT.md)
- [Suricata Integration Guide](./SURICATA_INTEGRATION_GUIDE.md)
- [Osquery Integration Guide](./OSQUERY_INTEGRATION_GUIDE.md)
- [Case Management and Playbooks](./CASE_MANAGEMENT_AND_PLAYBOOKS.md)
- [All Upgrades Implementation Guide](./ALL_UPGRADES_IMPLEMENTATION_GUIDE.md)
- [Sigma Rule Pack](./SIGMA_RULE_PACK.yml)
- [Alert Severity Classification Matrix](./ALERT_SEVERITY_CLASSIFICATION_MATRIX.md)
- [False Positive Tuning Guide](./FALSE_POSITIVE_TUNING_GUIDE.md)
- [SOC Lab Sample Test Logs](./SOC_LAB_SAMPLE_TEST_LOGS.md)
- [Brute Force Incident Report Template](./BRUTE_FORCE_INCIDENT_REPORT_TEMPLATE.md)
- [Final SOC Lab Project Report](./FINAL_SOC_LAB_PROJECT_REPORT.md)
- [Security Tools](./security_tools/README.md)
