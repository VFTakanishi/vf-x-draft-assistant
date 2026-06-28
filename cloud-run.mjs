function nowInJstParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour)
  };
}

function slotFromHour(hour) {
  if (hour < 10) return "morning";
  if (hour < 15) return "noon";
  return "evening";
}

function parseArgs(argv) {
  const options = { slot: null };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--slot") {
      options.slot = argv[i + 1];
      i += 1;
    }
  }
  return options;
}

function pick(list, seed) {
  return list[seed % list.length];
}

function seedFrom(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function buildDrafts(date) {
  const seed = seedFrom(date);
  const morningTopics = [
    "タイヤの空気圧",
    "ブレーキの違和感",
    "夏場のバッテリー負荷",
    "高速走行前の点検",
    "季節ごとの車の注意点"
  ];
  const noonTopics = [
    "警告灯が出たときの初動",
    "暑い日のバッテリー負荷",
    "エアコン使用時の燃費の考え方",
    "長距離前に見るべき基本項目",
    "雨の日の視界確保"
  ];
  const eveningTopics = [
    "相談が早い人ほど大きな出費を避けやすい",
    "違和感を言葉にして伝える大切さ",
    "整備は派手さより丁寧さが出る仕事",
    "ちょっとした不安の共有が事故予防につながる",
    "現場で見るのは部品だけでなく使い方の癖"
  ];

  return {
    morning: `${pick(morningTopics, seed)}で差が出るのは、知識量より普段の感覚です。『まだ走れるし』で流す前に、昨日までと違うかだけ見ておくとトラブルはかなり減ります。`,
    noon: `${pick(noonTopics, seed + 7)}で迷ったら、まず慌てて自己判断しすぎないことが大事です。安全を優先して、症状を一つずつ整理するだけでも判断ミスは減らせます。`,
    evening: `${pick(eveningTopics, seed + 13)}というのは、現場にいると本当によく感じます。大きな故障になる前の『ちょっと気になる』の段階で相談してもらえるほうが、現場としてはずっと助かります。`
  };
}

async function sendLineMessage(text) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;

  if (!token || !userId) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_USER_ID");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: "text",
          text
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`LINE push failed: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const now = nowInJstParts();
  const slot = args.slot ?? slotFromHour(now.hour);
  const drafts = buildDrafts(now.date);

  if (!drafts[slot]) {
    throw new Error(`Unknown slot: ${slot}`);
  }

  const message = drafts[slot];

  await sendLineMessage(message);
  console.log(`Sent ${slot} draft for ${now.date}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
