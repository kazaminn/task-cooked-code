export interface NoteTemplate {
  name: string;
  icon: string;
  title: string;
  content: string;
  tags: string[];
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    name: "空のノート",
    icon: "📝",
    title: "新しいノート",
    content: "",
    tags: [],
  },
  {
    name: "議事録",
    icon: "🗓️",
    title: "議事録 - ",
    content: `## 会議情報

- **日時**:
- **参加者**:
- **場所**:

## アジェンダ

1.

## 議論内容

### トピック1



## アクション項目

- [ ]
- [ ]

## 次回予定

- **日時**:
- **議題**:
`,
    tags: ["議事録"],
  },
  {
    name: "TODOリスト",
    icon: "✅",
    title: "TODO - ",
    content: `## 優先度: 高

- [ ]

## 優先度: 中

- [ ]

## 優先度: 低

- [ ]

## 完了

- [x]
`,
    tags: ["TODO"],
  },
  {
    name: "日記",
    icon: "📔",
    title: `日記 - ${new Date().toLocaleDateString("ja-JP")}`,
    content: `## 今日のハイライト



## やったこと

-

## 学んだこと

-

## 明日やること

- [ ]

## 気分メモ

`,
    tags: ["日記"],
  },
  {
    name: "技術メモ",
    icon: "💻",
    title: "技術メモ - ",
    content: `## 概要



## 環境

- OS:
- 言語/FW:

## 手順

\`\`\`bash

\`\`\`

## ポイント

-

## 参考リンク

- [](url)
`,
    tags: ["技術"],
  },
  {
    name: "振り返り (KPT)",
    icon: "🔄",
    title: "振り返り - ",
    content: `## Keep (続けること)

-

## Problem (改善すること)

-

## Try (挑戦すること)

-
`,
    tags: ["振り返り"],
  },
  {
    name: "バグレポート",
    icon: "🐛",
    title: "Bug: ",
    content: `## 概要



## 再現手順

1.
2.
3.

## 期待される動作



## 実際の動作



## 環境

- ブラウザ:
- OS:
- バージョン:

## スクリーンショット



## 備考

`,
    tags: ["バグ"],
  },
];
