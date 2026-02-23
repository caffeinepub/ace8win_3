# Specification

## Summary
**Goal:** Enable automatic admin role assignment for the first registered user and allow open registration for all other users.

**Planned changes:**
- Automatically grant admin role to the first user who registers in the system
- Ensure the first user has full access to all admin features (match creation, payment approval, user management, WhatsApp messaging)
- Allow subsequent users to register and access user-facing features without admin privileges
- Update frontend navigation to conditionally display admin links only to users with admin role

**User-visible outcome:** The first person to register becomes the admin with full system control, while all other users can freely register and participate in matches without admin access.
