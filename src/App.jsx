import { useState, useMemo } from "react";

// ─── Data ───────────────────────────────────────────────────────────
const REMINDERS_RAW = [
  { id: "BF8A03BF", title: "奥さまのTEN合同会社・業務執行社員追加を検討する（経費最適化の大きなレバー）", due: "2026-03-28T10:00:00", priority: "medium", tag: "経営" },
  { id: "51D92FC4", title: "Cursorのバグbot 無料期間終了", due: "2026-04-02", priority: "none", tag: "ツール" },
  { id: "EBD0F77A", title: "JAROのリーガルチェックを徹底する！", due: "2026-03-25T11:00:00", priority: "none", tag: "法務" },
  { id: "EDFE2AAE", title: "識学マネジメント第一案", due: "2026-03-26T09:06:00", priority: "none", tag: "経営" },
  { id: "5CDC9164", title: "非対話、機械可読", due: "2026-03-26T09:25:00", priority: "none", tag: "AI" },
  { id: "F07DA4A3", title: "ecforceとLINE Claude Codeの可能性探る", due: "2026-03-26T10:20:00", priority: "none", tag: "開発" },
  { id: "6EE260F1", title: "カスタマージャーニーベルトコンベア作って", due: "2026-03-26T10:54:00", priority: "none", tag: "CRM" },
  { id: "3C58FE7A", title: "PDCA完全自動化 3ステップ", due: "2026-03-27T10:00:00", priority: "none", tag: "AI" },
  { id: "800E5326", title: "LPの品質スコアチェック", due: "2026-03-27T10:18:00", priority: "none", tag: "LP" },
  { id: "0DFCDEDE", title: "LPを品質スコア化して(100点評価)", due: "2026-03-27T10:18:00", priority: "none", tag: "LP" },
  { id: "CD430838", title: "LINEソケット通信", due: "2026-03-27T10:39:00", priority: "none", tag: "開発" },
  { id: "0FB4EFBF", title: "ガット張り替え", due: "2026-03-28T05:00:00", priority: "none", tag: "私用" },
  { id: "47323833", title: "参考デザインを徹底的に言語化するプロンプト", due: "2026-03-28T05:00:00", priority: "none", tag: "LP" },
  { id: "97360873", title: "送信元メールアドレス：ma@mudage-clinic.comの発行", due: "2026-03-30", priority: "none", tag: "インフラ" },
  { id: "9E91B530", title: "[セーブ] 配当管理アプリ Phase2完了", due: "2026-04-01T10:00:00", priority: "medium", tag: "投資" },
  { id: "39FFF725", title: "[セーブ] freee自動仕訳 - 自動登録ルール設定待ち", due: "2026-04-02T10:00:00", priority: "none", tag: "会計" },
  // No due date items (backlog)
  { id: "1613BD1A", title: "4月からの新体制で識学マネジメントを実行する", due: null, priority: "none", tag: "経営" },
  { id: "F4433A31", title: "初回3本率最大化のフローチャート", due: null, priority: "none", tag: "CRM" },
  { id: "671EA335", title: "矢野さんに納品フォルダを作ってもらう", due: null, priority: "none", tag: "スタッフ" },
  { id: "48A82747", title: "小室さんにアニメーション設定を伝える", due: null, priority: "none", tag: "スタッフ" },
  { id: "D6BBF8BF", title: "大豆抽出成分の抑毛効果文献（鼻から下）", due: null, priority: "none", tag: "薬機法" },
  { id: "978FEDE8", title: "Notebook LMからレギュレーションシート作成", due: null, priority: "none", tag: "法務" },
  { id: "3F8601F9", title: "LINEリッチメニュー 定期再開ボタン", due: null, priority: "none", tag: "CRM" },
  { id: "2C598756", title: "保有銘柄の配当権利月を表形式で作成", due: null, priority: "none", tag: "投資" },
  { id: "4A7127ED", title: "未処理明細→AI勘定科目判定→freee登録", due: null, priority: "none", tag: "会計" },
  { id: "7DDAAD43", title: "ecforce LPテンプレート自作ツール", due: null, priority: "none", tag: "LP" },
  { id: "408A4118", title: "Supabaseに入れるデータを増やす", due: null, priority: "none", tag: "AI" },
  { id: "24B825BF", title: "CVR高いLPを作るために必要な知識の要件", due: null, priority: "none", tag: "LP" },
  { id: "64CC3C0A", title: "三上さん実行計画を作って", due: null, priority: "none", tag: "スタッフ" },
  { id: "804D6D12", title: "JARO回答文の修正反映チェック(LP+記事LP)", due: null, priority: "none", tag: "法務" },
  { id: "74ECCD43", title: "全トークンを今すぐローテーション（セキュリティ）", due: null, priority: "none", tag: "インフラ" },
  { id: "627CA4AC", title: "D2C定期LP高ROAS自動PDCAループシステム", due: null, priority: "none", tag: "LP" },
  { id: "056736F9", title: "ゴールデンパス カスタマージャーニーマップ", due: null, priority: "none", tag: "CRM" },
  { id: "D7E3B040", title: "LPデザイン依頼の要件定義（これじゃない感ゼロ）", due: null, priority: "none", tag: "LP" },
  { id: "5733DCF6", title: "SlackでLINE問い合わせ確認+ecforce連携返信", due: null, priority: "none", tag: "CRM" },
  { id: "90AF8D54", title: "Supabase→課題発見→イシュー→CC実行の改善ループ", due: null, priority: "none", tag: "AI" },
  { id: "5B496509", title: "Mac/iPhone同期コピペアプリ", due: null, priority: "none", tag: "ツール" },
  { id: "C201FB4E", title: "ファイル管理自動化（フォルダ名/ファイル名ルール）", due: null, priority: "none", tag: "AI" },
  { id: "42489BD3", title: "LP 270円×3パターン 月20回の試行速度戦略", due: null, priority: "none", tag: "LP" },
  { id: "6E7F9D99", title: "3回目継続者限定 12ヶ月サブスクオファー損益分析", due: null, priority: "none", tag: "CRM" },
  { id: "B2D92DAE", title: "Human on the Loop（モニタリング体制）", due: null, priority: "none", tag: "AI" },
  { id: "72177B07", title: "CC vs 人間 パフォーマンス棚卸し", due: null, priority: "none", tag: "AI" },
  { id: "AAECE3EF", title: "ecforceチャットを自前で作れるか調査", due: null, priority: "none", tag: "開発" },
  { id: "AFB9DB0D", title: "リーガルチェックQ&AをSupabaseへ自動登録", due: null, priority: "none", tag: "法務" },
  { id: "B5B50450", title: "GTMUPセルページの漏れ分とテスト用LP分", due: null, priority: "none", tag: "LP" },
];

const GITHUB_ISSUES_RAW = [
  { number: 154, title: "[TEST] Issue Gate S-size PASS verification", state: "open", labels: ["cc","ready","size:S"], updated: "2026-04-02", epic: null },
  { number: 155, title: "[TEST] Issue Gate FAIL verification", state: "open", labels: ["size:S","needs-revision"], updated: "2026-04-02", epic: null },
  { number: 130, title: "[CC] LINE友だち追加CV → Meta CAPI v3.1 実装", state: "open", labels: ["cc","size:M"], updated: "2026-04-01", epic: null },
  { number: 128, title: "【CC実装】Gemini API (Nano Banana Pro) 画像生成スキル構築", state: "open", labels: ["cc","skill","size:L"], updated: "2026-04-01", epic: null },
  { number: 116, title: "ecforce API仕様書2ファイルをGitHubにアップロード", state: "open", labels: ["cc"], updated: "2026-04-01", epic: null },
  { number: 150, title: "J-Quants Dividend Sync: ゴーストラン恒久対応 & 再有効化", state: "open", labels: ["bug","infrastructure"], updated: "2026-04-01", epic: "配当アプリ" },
  { number: 109, title: "ClipBuddy: iOS 26 Dynamic Island常駐型クリップボード", state: "open", labels: ["enhancement"], updated: "2026-04-01", epic: null },
  { number: 118, title: "[Epic] TEN LP Optimizer Phase 1 — 広告URL分岐A/Bテスト", state: "open", labels: ["epic","lp-optimizer"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 126, title: "[LP Optimizer] 初回テスト実行 — FVヒーロー画像差替テスト", state: "open", labels: ["lp-optimizer","test-execution"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 120, title: "[LP Optimizer] Supabaseテーブル設計・マイグレーション実行", state: "open", labels: ["lp-optimizer","supabase"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 122, title: "[LP Optimizer] Cloudflare Workers — トラフィック振分け", state: "open", labels: ["lp-optimizer","cloudflare-workers"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 125, title: "[LP Optimizer] CVRダッシュボード — テスト結果可視化", state: "open", labels: ["lp-optimizer","dashboard"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 124, title: "[LP Optimizer] 統計的有意差判定 + ChatWork通知", state: "open", labels: ["lp-optimizer","chatwork"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 123, title: "[LP Optimizer] データ同期EF — ecforce API → Supabase", state: "open", labels: ["lp-optimizer","supabase","ecforce-api"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 121, title: "[LP Optimizer] Playwright — ecforce管理画面自動操作", state: "open", labels: ["automation","lp-optimizer","playwright"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 119, title: "[LP Optimizer] 技術検証 — CSP確認・ログインテスト・疎通", state: "open", labels: ["lp-optimizer","tech-verification"], updated: "2026-03-30", epic: "LP Optimizer" },
  { number: 113, title: "配当カレンダー Web版UI（React SPA + Supabase連携）", state: "open", labels: ["enhancement","dividend-app"], updated: "2026-03-30", epic: "配当アプリ" },
  { number: 110, title: "REIT分配金自動取得Edge Functionの作成", state: "open", labels: ["enhancement","dividend-app"], updated: "2026-03-30", epic: "配当アプリ" },
  { number: 107, title: "[Epic] Notion Issues Board — Linear風機能拡張", state: "open", labels: ["enhancement","ops"], updated: "2026-03-30", epic: null },
  // recently closed
  { number: 151, title: "Issue Gate System — ハイブリッド品質ゲート", state: "closed", labels: ["enhancement","cc","ready"], updated: "2026-04-01", epic: null },
  { number: 138, title: "[CC] freee重複deal削除（166件）+ 自動仕訳再登録", state: "closed", labels: [], updated: "2026-04-01", epic: null },
  { number: 143, title: "[CC] freee MCP消込機能の検証 + 正しい自動仕訳フロー確定", state: "closed", labels: [], updated: "2026-04-01", epic: null },
  { number: 132, title: "[Setup] Codex セカンドオピニオン・レビュア導入", state: "closed", labels: ["enhancement"], updated: "2026-04-01", epic: null },
  { number: 129, title: "GTMフォーム: LP名リスト週次自動更新", state: "closed", labels: ["gtm","automation"], updated: "2026-04-01", epic: null },
  { number: 127, title: "保育園連絡帳 検温自動入力（Playwright + launchd）", state: "closed", labels: ["automation"], updated: "2026-04-01", epic: null },
  { number: 108, title: "【市川さん】レギュレーションチェックシートの自動化", state: "closed", labels: ["automation"], updated: "2026-04-01", epic: null },
  { number: 104, title: "ecforce決済エラー検知ツールをローカルから発掘してリポにpush", state: "closed", labels: [], updated: "2026-04-01", epic: null },
  { number: 136, title: "[CC] freee未登録明細の一括自動仕訳登録（377件）", state: "closed", labels: [], updated: "2026-04-01", epic: null },
];

const TODAY = "2026-04-02";

// ─── Helpers ────────────────────────────────────────────────────────
function classifyReminder(r) {
  if (!r.due) return "backlog";
  const d = r.due.slice(0, 10);
  if (d < TODAY) return "overdue";
  if (d === TODAY) return "today";
  return "upcoming";
}

function classifyGHIssue(i) {
  if (i.state === "closed") return "done";
  if (i.labels.includes("needs-revision")) return "revision";
  if (i.labels.includes("ready")) return "ready";
  if (i.labels.includes("epic")) return "epic";
  return "open";
}

const TAG_COLORS = {
  "経営": { bg: "#1a1a2e", fg: "#e94560" },
  "法務": { bg: "#1a1a2e", fg: "#f5a623" },
  "薬機法": { bg: "#1a1a2e", fg: "#f5a623" },
  "LP": { bg: "#0f3460", fg: "#53d8fb" },
  "CRM": { bg: "#16213e", fg: "#a29bfe" },
  "AI": { bg: "#1b1b3a", fg: "#08d9d6" },
  "開発": { bg: "#162447", fg: "#e43f5a" },
  "会計": { bg: "#1a1a2e", fg: "#6decb9" },
  "投資": { bg: "#1a1a2e", fg: "#ffd369" },
  "スタッフ": { bg: "#1a1a2e", fg: "#ff9a76" },
  "インフラ": { bg: "#162447", fg: "#48dbfb" },
  "ツール": { bg: "#1a1a2e", fg: "#c8d6e5" },
  "私用": { bg: "#1a1a2e", fg: "#576574" },
};

const GH_LABEL_COLORS = {
  "cc": "#3b82f6",
  "ready": "#22c55e",
  "needs-revision": "#ef4444",
  "bug": "#dc2626",
  "epic": "#8b5cf6",
  "lp-optimizer": "#06b6d4",
  "enhancement": "#10b981",
  "automation": "#f59e0b",
  "infrastructure": "#6366f1",
  "dividend-app": "#eab308",
  "ops": "#ec4899",
  "skill": "#14b8a6",
  "supabase": "#22c55e",
  "cloudflare-workers": "#f97316",
  "playwright": "#a855f7",
  "ecforce-api": "#e11d48",
  "chatwork": "#059669",
  "dashboard": "#0ea5e9",
  "test-execution": "#84cc16",
  "tech-verification": "#7c3aed",
  "gtm": "#d946ef",
  "codex": "#6366f1",
};

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr.slice(0, 10));
  const t = new Date(TODAY);
  return Math.floor((t - d) / 86400000);
}

// ─── Components ─────────────────────────────────────────────────────
const Badge = ({ children, color, bg }) => (
  <span style={{
    display: "inline-block",
    padding: "1px 7px",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.02em",
    color: color || "#fff",
    background: bg || "#333",
    marginRight: 4,
    marginBottom: 2,
    whiteSpace: "nowrap",
  }}>{children}</span>
);

const PriorityDot = ({ p }) => {
  if (p === "none") return null;
  const c = p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#3b82f6";
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: c, marginRight: 6, flexShrink: 0 }} />;
};

const ReminderCard = ({ r }) => {
  const col = classifyReminder(r);
  const days = daysAgo(r.due);
  const tc = TAG_COLORS[r.tag] || { bg: "#1a1a2e", fg: "#888" };
  const isSave = r.title.startsWith("[セーブ]");

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 8,
      cursor: "default",
      transition: "all 0.15s",
      borderLeft: col === "overdue" ? "3px solid #ef4444" : col === "today" ? "3px solid #3b82f6" : "3px solid transparent",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
        <PriorityDot p={r.priority} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.45, color: "#e2e8f0", wordBreak: "break-word" }}>
            {isSave && <span style={{ color: "#22c55e", marginRight: 4 }}>⏸</span>}
            {r.title}
          </div>
          <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3 }}>
            <Badge color={tc.fg} bg={tc.bg}>{r.tag}</Badge>
            {r.due && (
              <span style={{ fontSize: 10, color: col === "overdue" ? "#f87171" : "#64748b" }}>
                {col === "overdue" ? `${days}日超過` : col === "today" ? "今日" : r.due.slice(5, 10)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GHIssueCard = ({ issue }) => {
  const col = classifyGHIssue(issue);
  const sizeLabel = issue.labels.find(l => l.startsWith("size:"));

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 8,
      cursor: "default",
      transition: "all 0.15s",
      borderLeft: col === "done" ? "3px solid #22c55e" : col === "revision" ? "3px solid #ef4444" : col === "ready" ? "3px solid #3b82f6" : "3px solid transparent",
      opacity: col === "done" ? 0.6 : 1,
    }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.45, color: "#e2e8f0", wordBreak: "break-word" }}>
            <span style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginRight: 5 }}>#{issue.number}</span>
            {issue.title}
          </div>
          <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3 }}>
            {issue.labels.filter(l => !l.startsWith("size:")).slice(0, 3).map(l => (
              <Badge key={l} bg={GH_LABEL_COLORS[l] ? `${GH_LABEL_COLORS[l]}22` : "#333"} color={GH_LABEL_COLORS[l] || "#888"}>{l}</Badge>
            ))}
            {sizeLabel && <Badge bg="#1e293b" color="#94a3b8">{sizeLabel}</Badge>}
            {issue.epic && <span style={{ fontSize: 10, color: "#8b5cf6" }}>📦 {issue.epic}</span>}
          </div>
        </div>
        <span style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap", flexShrink: 0 }}>{issue.updated.slice(5)}</span>
      </div>
    </div>
  );
};

const Column = ({ title, icon, count, accent, children, collapsed, onToggle }) => (
  <div style={{
    flex: collapsed ? "0 0 44px" : "1 1 260px",
    minWidth: collapsed ? 44 : 240,
    maxWidth: collapsed ? 44 : 380,
    background: "rgba(255,255,255,0.015)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "all 0.3s ease",
  }}>
    <div
      onClick={onToggle}
      style={{
        padding: collapsed ? "14px 8px" : "12px 14px",
        display: "flex",
        alignItems: collapsed ? "center" : "center",
        justifyContent: collapsed ? "center" : "space-between",
        flexDirection: collapsed ? "column" : "row",
        gap: collapsed ? 8 : 0,
        cursor: "pointer",
        borderBottom: collapsed ? "none" : "1px solid rgba(255,255,255,0.04)",
        userSelect: "none",
      }}
    >
      {collapsed ? (
        <>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            fontSize: 11,
            fontWeight: 600,
            color: accent,
            letterSpacing: "0.05em",
          }}>{title}</span>
          <span style={{
            background: accent + "22",
            color: accent,
            fontSize: 10,
            fontWeight: 700,
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>{count}</span>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: accent, letterSpacing: "0.03em", textTransform: "uppercase" }}>{title}</span>
          </div>
          <span style={{
            background: accent + "18",
            color: accent,
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 6,
            padding: "2px 8px",
            minWidth: 24,
            textAlign: "center",
          }}>{count}</span>
        </>
      )}
    </div>
    {!collapsed && (
      <div style={{ padding: "8px 10px", overflowY: "auto", flex: 1 }}>
        {children}
      </div>
    )}
  </div>
);

// ─── Main ───────────────────────────────────────────────────────────
export default function KanbanDashboard() {
  const [view, setView] = useState("all"); // all | reminders | github
  const [tagFilter, setTagFilter] = useState(null);
  const [epicFilter, setEpicFilter] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCol = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  // Classify
  const reminders = useMemo(() => {
    let items = REMINDERS_RAW.map(r => ({ ...r, col: classifyReminder(r) }));
    if (tagFilter) items = items.filter(r => r.tag === tagFilter);
    if (searchQuery) items = items.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [tagFilter, searchQuery]);

  const ghIssues = useMemo(() => {
    let items = GITHUB_ISSUES_RAW.map(i => ({ ...i, col: classifyGHIssue(i) }));
    if (epicFilter) items = items.filter(i => i.epic === epicFilter);
    if (searchQuery) items = items.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [epicFilter, searchQuery]);

  const overdue = reminders.filter(r => r.col === "overdue");
  const today = reminders.filter(r => r.col === "today");
  const upcoming = reminders.filter(r => r.col === "upcoming");
  const backlog = reminders.filter(r => r.col === "backlog");

  const ghReady = ghIssues.filter(i => i.col === "ready");
  const ghRevision = ghIssues.filter(i => i.col === "revision");
  const ghEpic = ghIssues.filter(i => i.col === "epic");
  const ghOpen = ghIssues.filter(i => i.col === "open");
  const ghDone = ghIssues.filter(i => i.col === "done");

  const allTags = [...new Set(REMINDERS_RAW.map(r => r.tag))].sort();
  const allEpics = [...new Set(GITHUB_ISSUES_RAW.filter(i => i.epic).map(i => i.epic))];

  // Stats
  const totalReminders = REMINDERS_RAW.length;
  const totalGH = GITHUB_ISSUES_RAW.filter(i => i.state === "open").length;
  const closedRecent = GITHUB_ISSUES_RAW.filter(i => i.state === "closed").length;

  return (
    <div style={{
      background: "#0a0a0f",
      color: "#e2e8f0",
      minHeight: "100vh",
      fontFamily: "'DM Sans', 'Noto Sans JP', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
            }}>T</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>TEN Kanban</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>Reminders + GitHub Issues</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Stats */}
            <div style={{ display: "flex", gap: 12, marginRight: 8 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171" }}>{overdue.length}</div>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>超過</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#3b82f6" }}>{today.length}</div>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>今日</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>{closedRecent}</div>
                <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>完了</div>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                color: "#e2e8f0",
                width: 160,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* View tabs + Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "すべて", icon: "📋" },
            { key: "reminders", label: "Reminders", icon: "🍎" },
            { key: "github", label: "GitHub", icon: "🐙" },
          ].map(t => (
            <button key={t.key} onClick={() => { setView(t.key); setTagFilter(null); setEpicFilter(null); }} style={{
              background: view === t.key ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
              border: view === t.key ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: 11.5,
              fontWeight: 600,
              color: view === t.key ? "#60a5fa" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s",
            }}>{t.icon} {t.label}</button>
          ))}

          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />

          {(view === "all" || view === "reminders") && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {tagFilter && (
                <button onClick={() => setTagFilter(null)} style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#f87171", cursor: "pointer",
                }}>✕ {tagFilter}</button>
              )}
              {!tagFilter && allTags.slice(0, 8).map(tag => {
                const tc = TAG_COLORS[tag] || {};
                return (
                  <button key={tag} onClick={() => setTagFilter(tag)} style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 6, padding: "2px 7px", fontSize: 10, color: tc.fg || "#888", cursor: "pointer",
                    transition: "all 0.1s",
                  }}>{tag}</button>
                );
              })}
            </div>
          )}

          {(view === "all" || view === "github") && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {epicFilter && (
                <button onClick={() => setEpicFilter(null)} style={{
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#a78bfa", cursor: "pointer",
                }}>✕ {epicFilter}</button>
              )}
              {!epicFilter && allEpics.map(ep => (
                <button key={ep} onClick={() => setEpicFilter(ep)} style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: 6, padding: "2px 7px", fontSize: 10, color: "#a78bfa", cursor: "pointer",
                }}>📦 {ep}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: 10,
        padding: "12px 12px",
        overflowX: "auto",
        alignItems: "stretch",
      }}>
        {/* Reminder columns */}
        {(view === "all" || view === "reminders") && (
          <>
            <Column title="期限超過" icon="🔴" count={overdue.length} accent="#ef4444" collapsed={collapsed.overdue} onToggle={() => toggleCol("overdue")}>
              {overdue.map(r => <ReminderCard key={r.id} r={r} />)}
            </Column>
            <Column title="今日" icon="📅" count={today.length} accent="#3b82f6" collapsed={collapsed.today} onToggle={() => toggleCol("today")}>
              {today.map(r => <ReminderCard key={r.id} r={r} />)}
              {upcoming.length > 0 && (
                <div style={{ padding: "8px 0 4px", fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  直近 ({upcoming.length})
                </div>
              )}
              {upcoming.map(r => <ReminderCard key={r.id} r={r} />)}
            </Column>
            <Column title="バックログ" icon="📋" count={backlog.length} accent="#64748b" collapsed={collapsed.backlog} onToggle={() => toggleCol("backlog")}>
              {backlog.map(r => <ReminderCard key={r.id} r={r} />)}
            </Column>
          </>
        )}

        {/* Divider */}
        {view === "all" && (
          <div style={{ width: 2, background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.2), transparent)", flexShrink: 0, borderRadius: 2 }} />
        )}

        {/* GitHub columns */}
        {(view === "all" || view === "github") && (
          <>
            <Column title="Ready" icon="🟢" count={ghReady.length} accent="#22c55e" collapsed={collapsed.ready} onToggle={() => toggleCol("ready")}>
              {ghReady.map(i => <GHIssueCard key={i.number} issue={i} />)}
            </Column>
            <Column title="Open" icon="🟡" count={ghOpen.length + ghEpic.length} accent="#f59e0b" collapsed={collapsed.open} onToggle={() => toggleCol("open")}>
              {ghEpic.map(i => <GHIssueCard key={i.number} issue={i} />)}
              {ghOpen.map(i => <GHIssueCard key={i.number} issue={i} />)}
            </Column>
            {ghRevision.length > 0 && (
              <Column title="要修正" icon="🔴" count={ghRevision.length} accent="#ef4444" collapsed={collapsed.revision} onToggle={() => toggleCol("revision")}>
                {ghRevision.map(i => <GHIssueCard key={i.number} issue={i} />)}
              </Column>
            )}
            <Column title="完了" icon="✅" count={ghDone.length} accent="#22c55e" collapsed={collapsed.done} onToggle={() => toggleCol("done")}>
              {ghDone.map(i => <GHIssueCard key={i.number} issue={i} />)}
            </Column>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "8px 20px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 10,
        color: "#475569",
      }}>
        <span>🍎 {totalReminders} reminders · 🐙 {totalGH} open issues · ✅ {closedRecent} closed</span>
        <span>Last sync: {TODAY} — Claude.aiで「カンバン更新」と言えば最新データに更新</span>
      </div>
    </div>
  );
}
