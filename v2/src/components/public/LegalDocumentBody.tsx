import { imprintFields, type Imprint, type Privacy } from "@/lib/legal";

type Props = { document: "impressum"; content: Imprint } | { document: "privacy"; content: Privacy };
/** Plain text only: private preview and publication share this renderer. */
export function LegalDocumentBody(props: Props) {
  if (props.document === "privacy") return <div className="space-y-7">
    {props.content.sections.map(section => <section key={section.id} className="space-y-3">
      <h2 className="font-serif text-2xl">{section.title}</h2>
      <p className="whitespace-pre-wrap break-words">{section.body}</p>
    </section>)}
  </div>;
  return <dl className="space-y-5">
    {imprintFields.filter(field => props.content[field.key]).map(field => <div key={field.key}>
      <dt className="font-semibold">{field.label}</dt>
      <dd className="whitespace-pre-wrap break-words">{field.key === "email"
        ? <a className="underline underline-offset-4" href={`mailto:${props.content.email}`}>{props.content.email}</a>
        : field.key === "phone"
          ? <a className="underline underline-offset-4" href={`tel:${props.content.phone.replace(/[^+\d]/g, "")}`}>{props.content.phone}</a>
          : props.content[field.key]}</dd>
    </div>)}
  </dl>;
}
export default LegalDocumentBody;
