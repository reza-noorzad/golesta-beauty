import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
test("Firestore and Storage deny direct writes, including admins", async () => {
  const env = await initializeTestEnvironment({
    projectId: "demo-golesta-v2",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });
  try {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "admins/manager"), { active: true });
      await setDoc(doc(ctx.firestore(), "publicServices/current"), {
        categories: [],
      });
    });
    const anon = env.unauthenticatedContext();
    const admin = env.authenticatedContext("manager");
    const other = env.authenticatedContext("other");
    await assertSucceeds(
      getDoc(doc(anon.firestore(), "publicServices/current")),
    );
    await assertSucceeds(getDoc(doc(admin.firestore(), "admins/manager")));
    await assertFails(getDoc(doc(other.firestore(), "admins/manager")));
    for (const ctx of [anon, admin, other]) {
      await assertFails(getDoc(doc(ctx.firestore(), "golestaV2/content")));
      await assertFails(
        setDoc(doc(ctx.firestore(), "golestaV2/content"), { data: {} }),
      );
      await assertFails(
        setDoc(doc(ctx.firestore(), "admins/manager"), { active: true }),
      );
      await assertFails(
        setDoc(doc(ctx.firestore(), "publicServices/current"), {
          categories: [],
        }),
      );
      await assertFails(
        uploadBytes(
          ref(ctx.storage(), "golesta-v2/test.webp"),
          new Uint8Array([1]),
          { contentType: "image/webp" },
        ),
      );
    }
  } finally {
    await env.cleanup();
  }
});
