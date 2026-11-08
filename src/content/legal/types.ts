/** Shape of a long legal text. Inline format is described in components/ui/rich-text.tsx. */
export type LegalBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDocument = { title: string; updated: string; sections: LegalSection[] };
