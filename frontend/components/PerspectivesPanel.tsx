interface Props {
  supporters: string;
  opponents: string;
}

export default function PerspectivesPanel({ supporters, opponents }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-4" style={{ borderLeft: "3px solid #22c55e" }}>
        <h4 className="text-sm font-bold mb-2" style={{ color: "#22c55e" }}>
          Supporters argue
        </h4>
        <p className="text-sm" style={{ color: "var(--foreground)", lineHeight: 1.6 }}>
          {supporters}
        </p>
      </div>
      <div className="card p-4" style={{ borderLeft: "3px solid #ef4444" }}>
        <h4 className="text-sm font-bold mb-2" style={{ color: "#ef4444" }}>
          Opponents argue
        </h4>
        <p className="text-sm" style={{ color: "var(--foreground)", lineHeight: 1.6 }}>
          {opponents}
        </p>
      </div>
    </div>
  );
}
