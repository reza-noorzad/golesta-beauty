import type {Content} from "./content";
/** Preserve unchanged legacy entries; validate the fields the owner actually edits. */
export function validateAdministrationChanges(previous:Content,next:Content){
  if(JSON.stringify(previous.voucher)!==JSON.stringify(next.voucher)&&next.voucher.published&&!next.voucher.description.trim())throw Error("Bitte ergänze die Gutscheinbeschreibung vor dem Veröffentlichen.");
  for(const profile of next.settings.socials||[]){
    const old=previous.settings.socials?.find(item=>item.id===profile.id);
    if(JSON.stringify(old)!==JSON.stringify(profile)&&profile.published&&(!profile.name.trim()||!profile.url.trim()))throw Error("Sichtbare Social-Media-Profile brauchen einen Namen und einen Profil-Link.");
  }
  for(const key of ["announcements","promotions"] as const){
    for(const item of next[key]||[]){
      const old=(previous[key]||[]).find(entry=>entry.id===item.id);
      if(JSON.stringify(old)===JSON.stringify(item))continue;
      if((!old||old.startsAt!==item.startsAt||old.endsAt!==item.endsAt)&&item.startsAt&&item.endsAt&&Date.parse(item.endsAt)<=Date.parse(item.startsAt))throw Error("Das Ende muss nach dem Beginn liegen.");
      if(key==="announcements"){
        const announcement=item as NonNullable<Content["announcements"]>[number];
        const before=old as typeof announcement|undefined;
        if(announcement.enabled&&!announcement.message.trim())throw Error("Bitte ergänze vor dem Veröffentlichen die Nachricht.");
        if((!before||before.linkUrl!==announcement.linkUrl||before.linkLabel!==announcement.linkLabel)&&Boolean(announcement.linkUrl?.trim())!==Boolean(announcement.linkLabel?.trim()))throw Error("Bitte ergänze Linkadresse und Beschriftung gemeinsam oder lasse beide leer.");
      }else if(item.enabled&&(!item.title.trim()||!("value" in item)||item.value<=0))throw Error("Aktive Aktionen brauchen einen Namen und einen Rabatt größer als null.");
    }
  }
}
