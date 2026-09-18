# Security Specification & Threat Model for Catatan Keuangan

## 1. Data Invariants
1. **User Scoping & Isolation**: All user-specific financial records (transactions, categories, settings) live strictly under `/users/{userId}/...` where `userId == request.auth.uid`. A user cannot read, query, list, or write another user's financial records.
2. **Identity Integrity**: For every write, incoming `userId` MUST strictly equal `request.auth.uid`.
3. **No Unauthenticated Access**: Unauthenticated visitors cannot access or mutate any Firestore documents.
4. **Data Shape Validation**: 
   - `Transaction.amount` must be a positive number.
   - `Transaction.type` must be either `'income'` or `'expense'`.
   - `Transaction.date` must match `^[0-9]{4}-[0-9]{2}-[0-9]{2}$`.
   - `Category.name` must be between 1 and 50 characters.
   - `UserSettings.theme` must be one of `['slate', 'teal', 'ocean', 'charcoal']`.
5. **No System Spoofing**: Users cannot alter other users' profile documents or inject ghost keys.

## 2. The "Dirty Dozen" Threat Payloads
1. **Spoofed User ID in Transaction**: Attacker attempts to write a transaction with `userId: "victim123"` while logged in as `attacker456`.
2. **Unauthenticated Write**: Unauthenticated client attempts to post a transaction to `/users/victim123/transactions/tx-1`.
3. **Cross-User Read**: User A attempts to read `/users/userB/transactions/tx-99`.
4. **List Query Bypass**: User A attempts to list collection `/users/userB/transactions`.
5. **Negative Amount Tampering**: Attacker sends `amount: -50000` to skew reports.
6. **Invalid Transaction Type**: Attacker sends `type: "unauthorized_transfer"`.
7. **Oversized String Bomb**: Attacker sends a 500KB string for `title` or `notes`.
8. **Malicious Date String Injection**: Attacker sends `date: "<script>alert(1)</script>"`.
9. **Category ID Poisoning**: Attacker injects a 2KB junk character string as the document ID.
10. **Ghost Field Injection**: Attacker sends an update payload containing undeclared admin flags like `isAdmin: true`.
11. **Altering Immutable Fields**: Attacker attempts to change `userId` during a transaction update.
12. **Settings Theme Tampering**: Attacker sends an invalid theme like `theme: "hacked_theme"`.
