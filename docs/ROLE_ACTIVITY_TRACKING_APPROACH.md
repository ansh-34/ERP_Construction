# Role Activity Tracking & Revert System
## Technical Design Document

---

## 1. Overview

This document outlines the comprehensive approach for implementing a **Role Activity Tracking & Revert System** that monitors all role-based actions, maintains complete audit trails with before/after state snapshots, and enables authorized users to review history and selectively revert decisions.

---

## 2. System Architecture

### 2.1 High-Level Flow

```
User Action (Create/Update/Delete Role, Permission, etc.)
    ↓
Interceptor/Middleware Captures Request
    ↓
Fetch Current State (Before-Change Data)
    ↓
Execute Action in Database
    ↓
Capture New State (After-Change Data)
    ↓
Store Audit Record with Diff
    ↓
Return Response + Audit Metadata
```

### 2.2 Key Components

1. **Audit Trail Service** - Captures and stores activity logs
2. **Activity Models** - Prisma schema for audit tables
3. **Middleware/Interceptor** - Intercepts role actions
4. **Revert Service** - Handles state restoration
5. **History API** - Provides endpoints to query activity logs
6. **Permission Guard** - Controls who can view/revert history

---

## 3. Database Schema Design

### 3.1 Core Audit Table: `RoleActivityLog`

```prisma
model RoleActivityLog {
  id              String            @id @default(uuid()) @db.Uuid
  
  // Entity Reference
  entityType      String            // e.g., "Role", "Permission", "RoleModulePermission"
  entityId        String            @db.Uuid
  
  // Action Details
  action          ActivityActionEnum // CREATE, UPDATE, DELETE
  actionBy        String            @db.Uuid  // User/Admin who performed action
  actionByUser    User              @relation(fields: [actionBy], references: [id])
  
  // Data Snapshots
  beforeData      Json              @db.JsonB  // Full state before change (null for CREATE)
  afterData       Json              @db.JsonB  // Full state after change
  changedFields   String[]          // Array of field names that changed
  
  // Context
  domainId        String            @db.Uuid
  domain          Domain            @relation(fields: [domainId], references: [id])
  reason          String?           // Optional: why the change was made
  ipAddress       String?
  userAgent       String?
  
  // Revert Tracking
  revertedBy      String?           @db.Uuid  // User who reverted this action
  revertedUser    User?             @relation("RevertedBy", fields: [revertedBy], references: [id])
  revertedAt      DateTime?
  revertReason    String?
  
  // Timestamps
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([entityType, entityId, domainId])
  @@index([actionBy, domainId])
  @@index([createdAt, domainId])
  @@index([entityType, action, domainId])
}

enum ActivityActionEnum {
  CREATE
  UPDATE
  DELETE
  RESTORE  // For reverts
}
```

### 3.2 Additional Tables

#### `RolePermissionSnapshot` (Optional - for quick rollback)
```prisma
model RolePermissionSnapshot {
  id            String    @id @default(uuid()) @db.Uuid
  roleId        String    @db.Uuid
  role          Role      @relation(fields: [roleId], references: [id])
  
  // Full snapshot of permissions at this point
  permissions   Json      @db.JsonB  // Complete permission set
  snapshotType  String    // "BEFORE_UPDATE", "AFTER_UPDATE", "SCHEDULED_BACKUP"
  
  linkedActivityId String? @db.Uuid  // Reference to RoleActivityLog
  createdAt     DateTime  @default(now())
  
  @@index([roleId, createdAt])
}
```

---

## 4. Activity Tracking Strategy

### 4.1 Trackable Entities

```
Primary:
- Role (create, update, delete)
- Permission (create, update, delete)
- RoleModulePermission (create, update, delete)

Secondary:
- Module (create, update, delete)
- ModuleDependency (create, update, delete)
- ModulePermission (create, update, delete)

Tertiary (Optional):
- AdminLanguages, AdminCurrencies, etc.
```

### 4.2 Implementation Pattern: Repository Wrapper

Instead of modifying every repository directly, use a **decorator/wrapper pattern**:

```typescript
// Original: RoleRepository.create(data)
// Wrapped:  AuditedRoleRepository.create(data, auditContext)

class AuditedRoleRepository {
  constructor(
    private roleRepository: RoleRepository,
    private auditService: AuditService
  ) {}

  async create(data, auditContext) {
    // 1. Capture before-state (null for CREATE)
    const before = null;
    
    // 2. Execute actual operation
    const result = await this.roleRepository.create(data);
    
    // 3. Capture after-state
    const after = result;
    
    // 4. Log to audit trail
    await this.auditService.log({
      entityType: 'Role',
      entityId: result.id,
      action: 'CREATE',
      beforeData: before,
      afterData: after,
      actionBy: auditContext.userId,
      domainId: auditContext.domainId,
      reason: auditContext.reason
    });
    
    return result;
  }

  async update(id, data, auditContext) {
    // 1. Fetch current state (before)
    const before = await this.roleRepository.findById(id);
    
    // 2. Execute update
    const result = await this.roleRepository.update(id, data);
    
    // 3. Capture after state
    const after = result;
    
    // 4. Calculate changed fields
    const changedFields = this.diff(before, after);
    
    // 5. Log to audit
    await this.auditService.log({
      entityType: 'Role',
      entityId: id,
      action: 'UPDATE',
      beforeData: before,
      afterData: after,
      changedFields,
      actionBy: auditContext.userId,
      domainId: auditContext.domainId,
      reason: auditContext.reason
    });
    
    return result;
  }

  async delete(id, auditContext) {
    // 1. Fetch current state (before)
    const before = await this.roleRepository.findById(id);
    
    // 2. Execute soft/hard delete
    const result = await this.roleRepository.delete(id);
    
    // 3. Log to audit
    await this.auditService.log({
      entityType: 'Role',
      entityId: id,
      action: 'DELETE',
      beforeData: before,
      afterData: null,  // Data is deleted
      actionBy: auditContext.userId,
      domainId: auditContext.domainId,
      reason: auditContext.reason
    });
    
    return result;
  }

  private diff(before, after) {
    // Return array of changed field names
  }
}
```

### 4.3 Audit Context Enrichment

Extract from request context:
```typescript
interface AuditContext {
  userId: string;
  domainId: string;
  reason?: string;          // Why change was made
  ipAddress?: string;
  userAgent?: string;
  roleId?: string;          // If action restricted to specific role
  permissionId?: string;
}
```

---

## 5. Revert Mechanism

### 5.1 Revert Strategy

**Two Levels:**

#### Level 1: Point-in-Time Revert
Restore a specific action to its previous state:
```typescript
async revertAction(activityLogId: string, revertContext) {
  // 1. Fetch activity log
  const activity = await auditService.getActivity(activityLogId);
  
  // 2. Validate permissions
  if (!canRevert(revertContext.user, activity)) {
    throw new UnauthorizedException('Cannot revert this action');
  }
  
  // 3. Get before-state
  const beforeState = activity.beforeData;
  
  // 4. If CREATE action, delete the entity
  if (activity.action === 'CREATE') {
    await repository.delete(activity.entityId);
  }
  
  // 5. If UPDATE/DELETE, restore previous state
  else {
    await repository.update(activity.entityId, beforeState);
  }
  
  // 6. Log the revert as new activity
  await auditService.log({
    entityType: activity.entityType,
    entityId: activity.entityId,
    action: 'RESTORE',
    beforeData: activity.afterData,     // Current state
    afterData: beforeState,              // Restored state
    revertedBy: revertContext.userId,
    revertReason: revertContext.reason,
    linkedActivityId: activityLogId
  });
  
  return { success: true, restoredState: beforeState };
}
```

#### Level 2: Snapshot Restore
Restore to a known-good snapshot:
```typescript
async restoreFromSnapshot(snapshotId: string, revertContext) {
  const snapshot = await snapshotService.getSnapshot(snapshotId);
  const roleId = snapshot.roleId;
  
  // 1. Validate permissions
  if (!canRevert(revertContext.user, roleId)) {
    throw new UnauthorizedException();
  }
  
  // 2. Get current state
  const currentState = await roleService.getById(roleId);
  
  // 3. Apply snapshot
  await roleService.update(roleId, snapshot.permissions);
  
  // 4. Log the restore
  await auditService.log({
    entityType: 'Role',
    entityId: roleId,
    action: 'RESTORE',
    beforeData: currentState,
    afterData: snapshot.permissions,
    revertedBy: revertContext.userId,
    revertReason: revertContext.reason,
    linkedSnapshotId: snapshotId
  });
}
```

### 5.2 Revert Permissions

Define who can revert what:

```typescript
interface RevertPolicy {
  // Role level
  canRevertOwnActions: boolean;           // Can user revert their own actions
  canRevertOthersActions: boolean;        // Can user revert actions by others
  canRevertActionsOlderThanDays: number;  // Time window for revert
  
  // Entity level
  protectedEntities: string[];            // Entities that cannot be reverted
  requiresApprovalForRevert: boolean;     // Need another admin approval
}

// Example: Domain Admin policy
const domainAdminPolicy: RevertPolicy = {
  canRevertOwnActions: true,
  canRevertOthersActions: true,
  canRevertActionsOlderThanDays: 30,
  protectedEntities: [],  // Can revert everything
  requiresApprovalForRevert: false
};

// Example: Role Manager policy
const roleManagerPolicy: RevertPolicy = {
  canRevertOwnActions: true,
  canRevertOthersActions: false,
  canRevertActionsOlderThanDays: 7,
  protectedEntities: ['SuperAdminRole'],
  requiresApprovalForRevert: true  // Need approval from domain admin
};
```

---

## 6. API Endpoints

### 6.1 Activity History Endpoints

```typescript
// GET /api/v1/activity-logs?entityType=Role&entityId=xxx&domainId=yyy
// Fetch activity history for an entity
interface GetActivityLogsQuery {
  entityType?: string;
  entityId?: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  actionBy?: string;
  startDate?: Date;
  endDate?: Date;
  domainId: string;
  limit: number;
  offset: number;
}
Response: { 
  data: RoleActivityLog[], 
  total: number,
  hasMore: boolean 
}

// GET /api/v1/activity-logs/:logId/diff
// Get detailed diff between before/after states
Response: {
  logId: string;
  entityType: string;
  changedFields: {
    fieldName: string;
    oldValue: any;
    newValue: any;
  }[];
  action: string;
  timestamp: Date;
  actedBy: User;
}

// GET /api/v1/roles/:roleId/activity-history
// Get complete history for a specific role
Response: RoleActivityLog[]

// GET /api/v1/roles/:roleId/snapshots
// Get available snapshots for restore
Response: RolePermissionSnapshot[]
```

### 6.2 Revert Endpoints

```typescript
// POST /api/v1/activity-logs/:logId/revert
// Revert a specific activity
interface RevertRequest {
  reason: string;  // Required: why reverting
  approvalToken?: string;  // If approval required
}
Response: {
  success: boolean;
  restoredState: any;
  revertActivityLogId: string;
}

// POST /api/v1/roles/:roleId/restore-snapshot
// Restore from snapshot
interface RestoreSnapshotRequest {
  snapshotId: string;
  reason: string;
  approvalToken?: string;
}
Response: {
  success: boolean;
  restoredState: any;
  revertActivityLogId: string;
}

// POST /api/v1/revert-approvals
// Create approval request for revert (if needed)
// Can be workflow-based or direct approval
```

---

## 7. Implementation Timeline & Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create audit schema in Prisma
- [ ] Implement AuditService class
- [ ] Create activity log model
- [ ] Set up database migration

### Phase 2: Tracking Integration (Week 2-3)
- [ ] Wrap Role repository with auditing
- [ ] Wrap Permission repository with auditing
- [ ] Wrap RoleModulePermission repository with auditing
- [ ] Add audit context to controllers
- [ ] Test tracking functionality

### Phase 3: History & Viewing (Week 3-4)
- [ ] Implement activity history endpoints
- [ ] Build diff calculation service
- [ ] Create activity log filters
- [ ] Add pagination and sorting

### Phase 4: Revert Mechanism (Week 4-5)
- [ ] Implement basic revert logic
- [ ] Add revert permissions/policies
- [ ] Create revert endpoints
- [ ] Test revert scenarios

### Phase 5: Advanced Features (Week 5-6)
- [ ] Implement snapshot mechanism
- [ ] Add snapshot restore functionality
- [ ] Approval workflow for reverts
- [ ] Audit trail for reverts themselves

### Phase 6: UI & Documentation (Week 6-7)
- [ ] Create activity log UI
- [ ] Build revert confirmation dialog
- [ ] Add diff viewer
- [ ] Write API documentation
- [ ] Create user guide

---

## 8. Security Considerations

### 8.1 Access Control

```typescript
// Only show activity logs for entities in accessible domains
// Filter by: domain, role, permission level

// Revert permissions:
- Super Admin: Can revert anything
- Domain Admin: Can revert within domain
- Role Manager: Can only revert own role actions, limited timeframe
- Viewer: Can only see history, cannot revert
```

### 8.2 Data Protection

- Encrypt sensitive data in JSON snapshots
- Implement row-level security in database
- Audit trail is immutable (log-only, never delete)
- Separate read permissions from write permissions

### 8.3 Compliance

- GDPR: Implement data retention policies
- SOX: Complete audit trail with user identification
- Track approval workflows for revert decisions
- Maintain revert audit trail indefinitely

---

## 9. Performance Optimization

### 9.1 Indexing Strategy

```prisma
// Core indexes
@@index([entityType, entityId, domainId])
@@index([actionBy, domainId, createdAt])
@@index([createdAt, domainId])
@@index([action, domainId, createdAt])

// For filtering
@@index([revertedBy, revertedAt])
@@index([entityType, action])
```

### 9.2 Pagination

Always paginate activity logs:
```typescript
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 1000;

// Implement cursor-based pagination for large datasets
```

### 9.3 Caching

- Cache snapshots in Redis with TTL
- Cache user permissions for revert checks
- Invalidate cache on policy changes

---

## 10. Error Handling

```typescript
// Scenarios:
- Revert fails if entity no longer exists
- Revert fails if dependencies were created based on previous state
- Revert fails if user lacks permission
- Revert fails if time window expired
- Concurrent reverts: Use optimistic locking
- Cascading reverts: Define policy (auto-cascade or fail)
```

---

## 11. Testing Strategy

### Unit Tests
- AuditService log/retrieve operations
- Diff calculation accuracy
- Revert logic with various data types

### Integration Tests
- End-to-end role update → log → view history flow
- Revert workflow with permissions
- Snapshot creation and restore

### Scenario Tests
- Create Role → Update Role → Delete Role → Revert Delete
- Bulk permission changes → Revert all
- Concurrent updates → Revert order verification
- Time-window revert expiration

---

## 12. Migration Strategy

### Existing Data
- Create baseline audit logs for all current roles (action: "BASELINE")
- Create initial snapshots
- Set actionBy to system user for historical data

### Backward Compatibility
- Activity logs are append-only (safe)
- No breaking changes to existing models
- Audit functionality is transparent to existing code

---

## 13. Monitoring & Alerts

```typescript
// Alert scenarios:
- High volume of reverts in short time
- Unauthorized revert attempts
- Revert of critical role changes
- Revert approval workflow delays
```

---

## 14. Future Enhancements

- Scheduled automatic snapshots
- Bulk revert operations with approval workflow
- Activity analytics dashboard
- Predictive revert suggestions
- Machine learning anomaly detection
- Real-time activity streaming (WebSocket)

---

## Summary

This comprehensive approach ensures:
✅ Complete audit trail for all role-based actions
✅ Before/after state capture for accurate history
✅ Flexible revert mechanism with permission control
✅ Scalable architecture with performance optimization
✅ Security-first design with compliance in mind
✅ User-friendly history viewing and revert operations
