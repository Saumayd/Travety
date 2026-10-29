import type { Member } from "@/data/mock";

/* ------------------------------------------------------------------ */
/* Friend avatar SVG system (§3.2/§4). Round characters with stable    */
/* accessories; route colour follows the member's official palette.    */
/* Identity cues: colour + accessory — never colour alone (§13).       */
/* ------------------------------------------------------------------ */

function Accessory({ kind, color }: { kind: Member["accessory"]; color: string }) {
  const dark = "#252541";
  switch (kind) {
    case "cap":
      return (
        <g>
          <path d="M12 14 Q20 4 28 14 L28 16 Q20 12 12 16 Z" fill={dark} />
          <path d="M28 15 Q34 15 34 17.5 L28 17.5 Z" fill={dark} />
        </g>
      );
    case "bow":
      return (
        <g transform="translate(9 8)">
          <ellipse cx="3" cy="3" rx="3.4" ry="2.6" fill={color} stroke={dark} strokeWidth="0.8" />
          <ellipse cx="10" cy="3" rx="3.4" ry="2.6" fill={color} stroke={dark} strokeWidth="0.8" />
          <circle cx="6.5" cy="3" r="1.6" fill={dark} />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path d="M11 17 Q20 6 29 17" fill="none" stroke={dark} strokeWidth="2.6" strokeLinecap="round" />
          <rect x="8" y="15" width="5" height="7" rx="2.5" fill={dark} />
          <rect x="27" y="15" width="5" height="7" rx="2.5" fill={dark} />
        </g>
      );
    case "glasses":
      return (
        <g>
          <circle cx="15.5" cy="19.5" r="3.6" fill="none" stroke={dark} strokeWidth="1.6" />
          <circle cx="24.5" cy="19.5" r="3.6" fill="none" stroke={dark} strokeWidth="1.6" />
          <path d="M19.1 19.5 L20.9 19.5" stroke={dark} strokeWidth="1.6" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M11 14 Q20 4 29 14 L29 16 L11 16 Z" fill={color} stroke={dark} strokeWidth="0.9" />
          <rect x="10.5" y="14.5" width="19" height="3.2" rx="1.6" fill={dark} />
          <circle cx="20" cy="6" r="2" fill="#F472B6" />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(29 8)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-2.6"
              rx="1.7"
              ry="2.6"
              fill="#F472B6"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="1.5" fill="#FBBF24" />
        </g>
      );
  }
}

export function FriendAvatar({
  member,
  size = 40,
  label,
}: {
  member: Member;
  size?: number;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={label ?? member.name}
      className="shrink-0 overflow-visible"
    >
      {/* halo keeps the character readable on any surface (§4.2) */}
      <circle cx="20" cy="20" r="18.4" fill="var(--card)" stroke={member.color} strokeWidth="1.6" />
      <circle cx="20" cy="22" r="13" fill={member.color} />
      <circle cx="16.4" cy="21" r="1.5" fill="#252541" />
      <circle cx="23.6" cy="21" r="1.5" fill="#252541" />
      <path d="M16.5 25.5 Q20 28.4 23.5 25.5" fill="none" stroke="#252541" strokeWidth="1.4" strokeLinecap="round" />
      <Accessory kind={member.accessory} color={member.color} />
    </svg>
  );
}
