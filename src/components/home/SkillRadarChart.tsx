"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { SKILL_LABELS } from "@/lib/missions";
import { SiteIcon } from "@/components/SiteIcon";
import { EditableText } from "@/components/admin/EditableText";

type Props = {
  skills: {
    writing: number;
    toolUsage: number;
    consistency: number;
    publishing: number;
    monetization: number;
  };
  boardTitle?: string;
  icon?: string;
};

// チャート色はダーク背景(#160f11)でのコントラスト検証済みの値を使用
const CHART_COLOR = "#ad8025";

export function SkillRadarChart({ skills, boardTitle = "技量", icon = "📜" }: Props) {
  const data = (Object.keys(SKILL_LABELS) as Array<keyof typeof skills>).map((key) => ({
    skill: SKILL_LABELS[key],
    value: skills[key],
  }));

  return (
    <section className="game-card animate-fade-up" style={{ animationDelay: "0.15s" }}>
      <h2 className="mansion-title flex items-center gap-1.5 text-base">
        <SiteIcon value={icon} size={18} />
        <EditableText siteTextKey="skill.board.title" value={boardTitle} />
      </h2>
      <div className="mt-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#3a2530" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#a8a29e", fontSize: 11 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#1f1418",
                border: "1px solid #3a2530",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#e7e5e4" }}
              labelStyle={{ color: "#a8a29e" }}
            />
            <Radar
              name="技量"
              dataKey="value"
              stroke={CHART_COLOR}
              strokeWidth={2}
              fill={CHART_COLOR}
              fillOpacity={0.35}
              isAnimationActive
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
