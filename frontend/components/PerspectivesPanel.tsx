import { Handshake, ShieldAlert } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";

interface Props {
  supporters: string;
  opponents: string;
}

export default function PerspectivesPanel({ supporters, opponents }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className="rounded-xl p-4"
        style={{
          background: "#EDF5F0",
          border: "1px solid #C8DDD3",
          borderLeft: "3px solid #2d6a4f",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Handshake size={15} strokeWidth={1.5} style={{ color: "#2d6a4f" }} />
          <h4 className="text-sm font-bold" style={{ color: "#2d6a4f" }}>
            Supporters argue
          </h4>
        </div>
        <div className="text-sm" style={{ color: "#3D2B1F" }}>
          <MarkdownContent text={supporters} />
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "#FAF0F0",
          border: "1px solid #E8C8C8",
          borderLeft: "3px solid #B31942",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={15} strokeWidth={1.5} style={{ color: "#B31942" }} />
          <h4 className="text-sm font-bold" style={{ color: "#B31942" }}>
            Opponents argue
          </h4>
        </div>
        <div className="text-sm" style={{ color: "#3D2B1F" }}>
          <MarkdownContent text={opponents} />
        </div>
      </div>
    </div>
  );
}
