import type { Channel } from "@/lib/mockData";

const map: Record<Channel, { label: string; cls: string }> = {
  whatsapp: { label: "WhatsApp", cls: "bg-whatsapp/15 text-whatsapp" },
  instagram: { label: "Instagram", cls: "bg-instagram/15 text-instagram" },
  facebook: { label: "Facebook", cls: "bg-facebook/15 text-facebook" },
};

export function ChannelDot({ channel }: { channel: Channel }) {
  const colors = { whatsapp: "bg-whatsapp", instagram: "bg-instagram", facebook: "bg-facebook" }[channel];
  return <span className={`inline-block h-2 w-2 rounded-full ${colors}`} />;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const { label, cls } = map[channel];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      <ChannelDot channel={channel} />
      {label}
    </span>
  );
}
