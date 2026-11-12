import { changeLegal, emptyImprint, type Imprint, type Legal, type Privacy } from "../../src/lib/legal";

export const testImprint: Imprint = { ...emptyImprint, proprietor: "Testinhaber des Testsalons", legalForm: "Test-Rechtsform", address: "Teststraße 1, 0000 Testort", email: "salon@example.invalid", phone: "+43 12345678", gisa: "TEST-GISA" };
export const testPrivacy: Privacy = { sections: [{ id: "contact", title: "Freigegebener Datenschutzhinweis", body: "Veröffentlichter Testtext für die isolierte Prüfung." }] };
export const legalTime = "2026-11-12T12:00:00.000Z";
export function publishedLegal(): Legal {
  let legal = changeLegal({}, { action: "save-draft", document: "impressum", content: testImprint, revision: 0 }, "test-owner", legalTime);
  legal = changeLegal(legal, { action: "publish", document: "impressum", approved: true, revision: 1 }, "test-owner", legalTime);
  legal = changeLegal(legal, { action: "save-draft", document: "privacy", content: testPrivacy, revision: 2 }, "test-owner", legalTime);
  return changeLegal(legal, { action: "publish", document: "privacy", approved: true, revision: 3 }, "test-owner", legalTime);
}
