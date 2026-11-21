"use client";

import { useApp } from "./context";
import { Lead } from "@/lib/types";

export function WhatsAppContact({ lead }: { lead: Lead }) {
  const { data, command, notify } = useApp();
  const phone = toWhatsAppPhone(lead.phone);
  const school = data.user.school === "s1" ? "Greenfield School" : "Acadza";
  const message = `Hello ${lead.parent}, I’m ${data.user.name} from ${school}. I’m contacting you about ${lead.student}’s admission for Grade ${lead.grade}. Is this a convenient time to chat?`;
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      className="button secondary whatsapp-button"
      href={href}
      onClick={() => {
        void command({ type: "whatsapp", id: lead.id, version: lead.version })
          .then(() => notify("WhatsApp opened with a personalised draft."))
          .catch((error: Error) => notify(error.message));
      }}
      rel="noreferrer"
      target="_blank"
    >
      <img alt="" aria-hidden="true" src="/whatsapp.svg" />
      WhatsApp message
    </a>
  );
}

function toWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}
