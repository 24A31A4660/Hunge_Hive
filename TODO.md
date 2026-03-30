# Fix Pickup Button in Dashboard Donations

## Current Status
- [x] Identified: Dashboard donations "Pick Up" button silent fail
- [x] Root cause: POST /api/deliveries 409 "already assigned" → no error shown
- [ ] Fix error handling
- [ ] Smart flow for existing deliveries
- [ ] Test complete flow

## Steps
1. **Improve handlePickup error handling** - show specific API errors
2. **Handle existing delivery** - if assigned to user, skip POST + set 'picked'
3. **Add console logging** for debugging
4. **Test**: Login volunteer → pickup → verify delivery + /deliveries page
5. **Optional**: Align donation/delivery status flow

Current file: src/app/dashboard/page.jsx
