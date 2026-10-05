# Firestore Security Specification & Invariants

## 1. Data Invariants

1. **Global Read Availability**: Examination question bank (`/questions/{questionId}`), registered topics (`/topics/{topicKey}`), and shared mock test sets (`/custom_tests/{testId}`) must be publicly readable by candidates preparing for BPSC TRE 4.0, while writes and deletes require verified authorization or appropriate schema validation.
2. **Question Integrity**: Every question created must have an ID matching `isValidId()`, mandatory `textHindi`, a valid options array with up to 10 options, and a valid `correctOptionId`. Max text sizes must not exceed 10,000 characters.
3. **Attempt Records Ownership**: A user can only write or query attempt records (`/attempt_records/{attemptId}`) that belong to them (`userId == request.auth.uid`), or guest sessions can record attempts with strict schema limits.
4. **Tombstone Sync**: Deletion tombstones (`/deleted_question_ids/{recordId}`) require a valid `questionId` string.
5. **Denial-of-Wallet Guard**: All document IDs and string attributes have explicit length boundaries (`size() <= 200` for IDs, `size() <= 10000` for texts).

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (Ghost Field Injection)**: Attempting to insert arbitrary admin privilege `{ "id": "q1", "textHindi": "...", "isAdmin": true, "options": [] }`.
2. **Payload 2 (Oversized ID Poisoning)**: Document path with 2KB string ID `/questions/aaaaaaaa...`.
3. **Payload 3 (Unbounded Options Explosion)**: Attempting to save question with 5,000 options to exhaust client memory.
4. **Payload 4 (Identity Spoofing in Attempt Record)**: User A attempting to save an attempt record with `userId: "user_B"`.
5. **Payload 5 (Cross-User Attempt Reading)**: User A attempting to list or read User B's private attempt scorecards.
6. **Payload 6 (Invalid Data Types)**: Saving `questionNumber` as string `"invalid"` instead of number.
7. **Payload 7 (Missing Required Fields)**: Saving a question without `textHindi` or without `correctOptionId`.
8. **Payload 8 (Oversized Payload Denial of Wallet)**: Injecting 2MB payload into `textHindi` or `explanationHindi`.
9. **Payload 9 (Malicious Topic Key)**: Topic key containing script tags or invalid characters `../../bad`.
10. **Payload 10 (Direct Field Mutation / Update-Gap)**: Updating an immutable test ID or created date.
11. **Payload 11 (Unverified User Privileged Write)**: Attempting admin operations with unverified email credentials.
12. **Payload 12 (Blanket List Query Scraping)**: Running an unconstrained collectionGroup list query across all user private attempts.

---

## 3. Security Rules Test Runner Specification (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Test Suite: BPSC TRE 4.0 Firestore Fortress Rules
describe('Firestore Security Rules Matrix', () => {
  it('rejects oversized question IDs', async () => {
    // Expect PERMISSION_DENIED on ID > 128 chars
  });

  it('rejects questions missing required fields', async () => {
    // Expect PERMISSION_DENIED when textHindi or correctOptionId missing
  });

  it('prevents cross-user attempt tampering', async () => {
    // User A cannot write attempt with userId of User B
  });

  it('allows public read of questions and topics', async () => {
    // Public candidates can read questions
  });
});
```
