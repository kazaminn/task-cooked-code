import { useMemo } from "react";
import type { Note } from "../types/Note";

interface StatsPanelProps {
  open: boolean;
  notes: Note[];
  onClose: () => void;
}

export function StatsPanel({ open, notes, onClose }: StatsPanelProps) {
  if (!open) return null;

  const stats = useMemo(() => {
    const active = notes.filter((n) => !n.trashed);
    const trashed = notes.filter((n) => n.trashed);
    const totalChars = active.reduce((sum, n) => sum + n.content.length, 0);
    const totalWords = active.reduce(
      (sum, n) => sum + (n.content.trim() ? n.content.trim().split(/\s+/).length : 0),
      0
    );
    const totalImages = active.reduce((sum, n) => sum + n.images.length, 0);
    const readingTime = Math.max(1, Math.ceil(totalWords / 200));

    // Tag distribution
    const tagMap = new Map<string, number>();
    for (const n of active) {
      for (const t of n.tags) {
        tagMap.set(t, (tagMap.get(t) || 0) + 1);
      }
    }
    const tagDist = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const maxTagCount = tagDist.length > 0 ? tagDist[0][1] : 1;

    // Activity (notes per week day)
    const dayMap = new Map<string, number>();
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    for (const name of dayNames) dayMap.set(name, 0);
    for (const n of active) {
      const day = dayNames[new Date(n.updatedAt).getDay()];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }
    const activityData = dayNames.map((d) => ({ day: d, count: dayMap.get(d) || 0 }));
    const maxActivity = Math.max(...activityData.map((d) => d.count), 1);

    // Longest note
    const longest = active.length > 0
      ? active.reduce((a, b) => (a.content.length > b.content.length ? a : b))
      : null;

    // Most recently updated
    const recentCount = active.filter(
      (n) => Date.now() - n.updatedAt < 7 * 24 * 60 * 60 * 1000
    ).length;

    return {
      activeCount: active.length,
      trashedCount: trashed.length,
      totalChars,
      totalWords,
      totalImages,
      readingTime,
      tagDist,
      maxTagCount,
      activityData,
      maxActivity,
      longest,
      recentCount,
    };
  }, [notes]);

  return (
    <div className="theme-panel-overlay" onClick={onClose} role="dialog" aria-label="統計" aria-modal="true">
      <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="theme-panel-title">統計ダッシュボード</h3>

        {/* Summary Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.activeCount}</span>
            <span className="stat-label">ノート</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalWords.toLocaleString()}</span>
            <span className="stat-label">総単語数</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalChars.toLocaleString()}</span>
            <span className="stat-label">総文字数</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.readingTime}</span>
            <span className="stat-label">分 (読了)</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalImages}</span>
            <span className="stat-label">画像</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.recentCount}</span>
            <span className="stat-label">今週更新</span>
          </div>
        </div>

        {/* Tag distribution */}
        {stats.tagDist.length > 0 && (
          <div className="stats-section">
            <h4 className="stats-section-title">タグ分布</h4>
            <div className="tag-chart">
              {stats.tagDist.map(([tag, count]) => (
                <div key={tag} className="tag-chart-row">
                  <span className="tag-chart-label">{tag}</span>
                  <div className="tag-chart-bar-wrap">
                    <div
                      className="tag-chart-bar"
                      style={{ width: `${(count / stats.maxTagCount) * 100}%` }}
                    />
                  </div>
                  <span className="tag-chart-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        <div className="stats-section">
          <h4 className="stats-section-title">曜日別アクティビティ</h4>
          <div className="activity-chart">
            {stats.activityData.map((d) => (
              <div key={d.day} className="activity-bar-col">
                <div className="activity-bar-wrap">
                  <div
                    className="activity-bar"
                    style={{ height: `${(d.count / stats.maxActivity) * 100}%` }}
                  />
                </div>
                <span className="activity-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Longest note */}
        {stats.longest && (
          <div className="stats-section">
            <h4 className="stats-section-title">最長ノート</h4>
            <p className="stats-detail">
              {stats.longest.title || "無題"} — {stats.longest.content.length.toLocaleString()} 文字
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
