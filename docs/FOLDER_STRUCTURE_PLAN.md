# Role Activity Tracking & Revert System
## Folder & File Structure Plan

---

## 📁 Project Root Structure Overview

```
infowareconstructionerp/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── constants/
│   ├── docs/                          ← NEW
│   ├── infra/
│   ├── middlewares/
│   ├── modules/
│   ├── repositories/
│   ├── services/
│   ├── start/
│   ├── templates/
│   ├── types/
│   └── utils/
│
├── tests/
├── logs/
└── docs/                              ← EXISTING (technical docs)
    └── ROLE_ACTIVITY_TRACKING_APPROACH.md
```

---

## 🎯 Folder Structure for Activity Tracking System

### **Location 1: Database Schema Updates**
```
prisma/
├── schema.prisma                      ← MODIFY (add new models)
└── migrations/
    └── [timestamp]_add_role_activity_tracking/
        └── migration.sql              ← AUTO-GENERATED (creates tables)
```

**What goes in schema.prisma:**
- `RoleActivityLog` model
- `RolePermissionSnapshot` model
- `ActivityActionEnum`
- New relations with User, Domain, Role

---

### **Location 2: Core Audit Service Layer**

**Folder:** `src/services/audit/`

```
src/services/audit/
├── index.ts                           ← Barrel export
│
├── AuditService.ts                    ← Main audit logging service
│   - log(activityData)                  Method to record activities
│   - getActivityLog(filters)             Fetch activity history
│   - getActivityById(logId)              Get single activity
│   - calculateDiff(before, after)        Compute changes
│
├── RevertService.ts                   ← Revert mechanism
│   - revertActivity(logId, context)     Revert single action
│   - restoreSnapshot(snapshotId, ctx)   Restore from snapshot
│   - validateRevertPermission()         Check if user can revert
│
├── SnapshotService.ts                 ← Snapshot management
│   - createSnapshot(roleId, data)       Create point-in-time snapshot
│   - getSnapshot(snapshotId)            Retrieve snapshot
│   - listSnapshots(roleId)              List all snapshots
│
├── AuditPolicy.ts                     ← Permission policies
│   - Define RevertPolicy interface
│   - Define role-based policies
│   - Policy enforcement methods
│
└── utils/
    ├── diffCalculator.ts              ← Utility to diff objects
    ├── dataEncryption.ts              ← Encrypt sensitive data
    └── auditContextBuilder.ts         ← Build audit context from request
```

---

### **Location 3: Repository Wrappers/Decorators**

**Folder:** `src/repositories/audit/`

```
src/repositories/audit/
├── index.ts                           ← Barrel export
│
├── AuditedRoleRepository.ts           ← Wraps RoleRepository
│   - create(data, auditContext)
│   - update(id, data, auditContext)
│   - delete(id, auditContext)
│   - findById(id)                      (pass-through)
│
├── AuditedPermissionRepository.ts     ← Wraps PermissionRepository
│   - create(data, auditContext)
│   - update(id, data, auditContext)
│   - delete(id, auditContext)
│
├── AuditedRoleModulePermissionRepository.ts
│   - create(data, auditContext)
│   - update(id, data, auditContext)
│   - delete(id, auditContext)
│
├── AuditedModuleRepository.ts         ← Wraps ModuleRepository
│   - create(data, auditContext)
│   - update(id, data, auditContext)
│   - delete(id, auditContext)
│
└── BaseAuditedRepository.ts           ← Abstract base class
    - Common audit logic
    - Diff calculation
    - Log creation helpers
```

---

### **Location 4: API Controllers**

**Folder:** `src/modules/domain/activityTracking/` (NEW)

```
src/modules/domain/activityTracking/
│
├── controllers/
│   ├── index.ts                       ← Barrel export
│   │
│   └── activityTracking.controller.ts
│       - getActivityHistory()           GET /activity-logs
│       - getActivityDiff()              GET /activity-logs/:logId/diff
│       - getActivityById()              GET /activity-logs/:logId
│       - listRoleActivity()             GET /roles/:roleId/activity-history
│
├── services/
│   ├── index.ts                       ← Barrel export
│   │
│   └── activityTracking.service.ts
│       - buildActivityHistory()         Format logs for API response
│       - filterAndPaginate()            Apply filters
│       - validateActivityAccess()       Check user can see activity
│
├── routers/
│   └── activityTracking.router.ts
│       - Define all routes
│       - Middleware stack
│       - Validation schemas
│
└── types/
    └── activityTracking.types.ts
        - Interfaces for requests/responses
        - Filter types
        - Activity data types
```

---

### **Location 5: Revert System Controllers**

**Folder:** `src/modules/domain/revert/` (NEW)

```
src/modules/domain/revert/
│
├── controllers/
│   ├── index.ts                       ← Barrel export
│   │
│   └── revert.controller.ts
│       - revertActivity()               POST /activity-logs/:logId/revert
│       - restoreSnapshot()              POST /roles/:roleId/restore-snapshot
│       - getRevertPolicy()              GET /revert-policies/:roleId
│       - createApprovalRequest()        POST /revert-approvals (if needed)
│
├── services/
│   ├── index.ts                       ← Barrel export
│   │
│   └── revert.service.ts
│       - executeRevert()                Core revert logic
│       - validateRevertRequest()        Check permissions + time window
│       - handleApprovalWorkflow()       If approval needed
│       - buildRevertResponse()          Format response
│
├── policies/
│   ├── index.ts                       ← Barrel export
│   │
│   ├── domainAdminPolicy.ts           ← Can revert anything
│   ├── roleManagerPolicy.ts           ← Limited revert scope
│   └── viewerPolicy.ts                ← No revert access
│
├── routers/
│   └── revert.router.ts
│       - Define revert routes
│       - Validation middleware
│
└── types/
    └── revert.types.ts
        - RevertRequest interface
        - RevertPolicy interface
        - RevertResponse interface
```

---

### **Location 6: Middleware**

**Folder:** `src/middlewares/` (MODIFY EXISTING)

```
src/middlewares/
├── ... existing files ...
│
└── auditContext.ts                    ← NEW
    - Extract audit info from request
    - Build AuditContext object
    - Inject into request object
    - Capture: userId, domainId, ipAddress, userAgent
```

---

### **Location 7: Types/Interfaces**

**Folder:** `src/types/audit/` (NEW)

```
src/types/audit/
├── index.ts                           ← Barrel export
│
├── ActivityLog.types.ts               ← Activity log interfaces
│   - RoleActivityLog
│   - ActivityFilter
│   - ActivityResponse
│
├── Audit.types.ts                     ← General audit types
│   - AuditContext
│   - AuditData
│   - EntityType
│   - ActionType
│
├── Revert.types.ts                    ← Revert-specific types
│   - RevertRequest
│   - RevertPolicy
│   - RevertPermission
│
└── Snapshot.types.ts                  ← Snapshot types
    - SnapshotData
    - SnapshotFilter
```

---

### **Location 8: Utilities**

**Folder:** `src/utils/audit/` (NEW)

```
src/utils/audit/
├── index.ts                           ← Barrel export
│
├── diffCalculator.ts
│   - calculateDiff(before, after)
│   - getChangedFields(before, after)
│   - formatDiff(diff)
│
├── dataEncryption.ts
│   - encryptSensitiveData()            Encrypt JSON snapshots
│   - decryptSensitiveData()
│
├── auditContextBuilder.ts
│   - buildFromRequest(request)         Extract audit context
│   - addReason(context, reason)
│   - addMetadata(context, meta)
│
├── policyValidator.ts
│   - validateRevertEligibility()       Check policies
│   - isWithinTimeWindow()
│   - hasPermission()
│
├── activityFilter.ts
│   - applyFilters(logs, filters)       Filter activity logs
│   - sortLogs(logs, sortBy)
│   - paginateLogs(logs, limit, offset)
│
└── constants.ts
    - AUDIT_EVENTS enum
    - TIME_WINDOWS constants
    - ERROR_MESSAGES
```

---

### **Location 9: Tests**

**Folder:** `tests/audit/` (NEW)

```
tests/audit/
├── unit/
│   ├── services/
│   │   ├── AuditService.test.ts
│   │   ├── RevertService.test.ts
│   │   └── SnapshotService.test.ts
│   │
│   ├── utils/
│   │   ├── diffCalculator.test.ts
│   │   └── policyValidator.test.ts
│   │
│   └── repositories/
│       └── AuditedRoleRepository.test.ts
│
├── integration/
│   ├── activityTracking.integration.test.ts
│   │   - Create role → log → view history
│   │
│   ├── revert.integration.test.ts
│   │   - Update role → revert → check state
│   │
│   └── permissions.integration.test.ts
│       - Verify permission-based revert
│
└── scenarios/
    ├── roleLifecycle.test.ts
    │   - Create → Update → Delete → Revert
    │
    ├── bulkOperations.test.ts
    │   - Multiple changes → Revert order
    │
    └── timeWindow.test.ts
        - Revert outside time window fails
```

---

### **Location 10: Documentation**

**Folder:** `docs/` (EXISTING, ADD NEW FILES)

```
docs/
├── ROLE_ACTIVITY_TRACKING_APPROACH.md  ← Architecture doc
├── FOLDER_STRUCTURE_PLAN.md            ← This file
│
├── IMPLEMENTATION_GUIDE.md             ← NEW: Step-by-step
│   - How to add auditing to new entities
│   - How to extend policies
│   - Configuration guide
│
├── API_DOCUMENTATION.md                ← NEW: API reference
│   - All endpoints with examples
│   - Request/response schemas
│   - Error codes
│
├── SECURITY.md                         ← NEW: Security details
│   - Permission model
│   - Data protection
│   - Compliance considerations
│
└── DATABASE.md                         ← NEW: Schema reference
    - RoleActivityLog schema
    - Indexes & performance
    - Migration guide
```

---

## 📊 File Dependencies & Relationships

```
Entry Points:
├── src/modules/domain/activityTracking/routers/activityTracking.router.ts
│   └── src/modules/domain/activityTracking/controllers/
│       └── src/services/audit/AuditService.ts
│           └── prisma (RoleActivityLog model)
│
└── src/modules/domain/revert/routers/revert.router.ts
    └── src/modules/domain/revert/controllers/
        └── src/services/audit/RevertService.ts
            ├── src/services/audit/AuditPolicy.ts
            ├── src/repositories/audit/AuditedRoleRepository.ts
            └── prisma (RoleActivityLog model)

Repository Wrappers:
├── src/repositories/audit/AuditedRoleRepository.ts
│   ├── src/repositories/role.repository.ts (original)
│   ├── src/services/audit/AuditService.ts
│   └── src/utils/audit/diffCalculator.ts

Middleware Stack:
├── src/middlewares/auditContext.ts
│   └── src/utils/audit/auditContextBuilder.ts
```

---

## 🔄 Integration Points with Existing Code

### **1. Modify Role Controller**
```
src/modules/domain/role/role.controller.ts
├── Use AuditedRoleRepository instead of RoleRepository
├── Pass auditContext from middleware
└── Add reason parameter to requests
```

### **2. Modify Role Service**
```
src/modules/domain/role/role.service.ts
├── Inject AuditedRoleRepository
├── Handle audit context
└── Log business operations
```

### **3. Modify App Router**
```
src/modules/router.ts
├── Mount new routes:
│   ├── /api/v1/activity-logs (from activityTracking)
│   ├── /api/v1/reverts (from revert)
│   └── /api/v1/snapshots (from snapshot)
```

### **4. Modify Middleware Stack**
```
src/app.ts or src/config/index.ts
├── Add auditContext middleware to request pipeline
├── Before: auth, after: logging
```

---

## 📋 Summary Table

| Purpose | Folder Path | File Names | Responsibility |
|---------|-------------|-----------|-----------------|
| **DB Schema** | `prisma/` | schema.prisma | Define audit tables |
| **Core Services** | `src/services/audit/` | AuditService, RevertService, SnapshotService | Logic |
| **Repository Wrappers** | `src/repositories/audit/` | AuditedRoleRepository, BaseAuditedRepository | Intercept DB operations |
| **Activity API** | `src/modules/domain/activityTracking/` | controllers, services, routers | View history |
| **Revert API** | `src/modules/domain/revert/` | controllers, services, routers, policies | Revert operations |
| **Middleware** | `src/middlewares/` | auditContext.ts | Extract request info |
| **Types** | `src/types/audit/` | *.types.ts | TypeScript interfaces |
| **Utilities** | `src/utils/audit/` | diffCalculator, policyValidator | Helper functions |
| **Tests** | `tests/audit/` | unit/, integration/, scenarios/ | Test coverage |
| **Docs** | `docs/` | Multiple MD files | Documentation |

---

## 🚀 Implementation Order

1. **Step 1**: Create Prisma schema (`prisma/schema.prisma` - add models)
2. **Step 2**: Create base services (`src/services/audit/`)
3. **Step 3**: Create utilities (`src/utils/audit/`)
4. **Step 4**: Create repository wrappers (`src/repositories/audit/`)
5. **Step 5**: Create middleware (`src/middlewares/auditContext.ts`)
6. **Step 6**: Create types (`src/types/audit/`)
7. **Step 7**: Create activity API module (`src/modules/domain/activityTracking/`)
8. **Step 8**: Create revert API module (`src/modules/domain/revert/`)
9. **Step 9**: Integrate with existing role module
10. **Step 10**: Write tests (`tests/audit/`)
11. **Step 11**: Create documentation (`docs/`)

---

## 📝 Total Files to Create: ~45 files

```
Database:        1 file (schema.prisma modify)
Services:        4 files
Repositories:    5 files
Controllers:     2 files
Routers:         2 files
Middleware:      1 file
Types:           4 files
Utilities:       7 files
Tests:           10+ files
Documentation:   4 files
────────────────────
Total:          ~45 files
```
