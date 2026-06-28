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
    hour: Number(map.hour),
    minute: Number(map.minute)
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
    "高速に乗る前の点検",
    "夏場のバッテリー負荷",
    "季節の変わり目の車の変化"
  ];

  const noonTopics = [
    "警告灯が出たときの初動",
    "暑い日のバッテリー負荷",
    "雨の日の視界確保",
    "長距離前に見るべき基本項目",
    "エアコン使用時の燃費の考え方"
  ];

  const eveningTopics = [
    "ちょっとした違和感を早めに言ってもらえること",
    "大きな故障の前に小さいサインが出ていること",
    "整備は派手さより丁寧さが出る仕事だということ",
    "相談が早いほど結果的に負担が小さくなること",
    "現場では部品だけでなく使い方の癖も見ていること"
  ];

  const morningTemplates = [
    "{topic}って、難しい知識より先に『いつもと違うか』を見るほうが大事です。現場で見ても、大きい不調の手前には小さい違和感がちゃんと出ています。流さないだけで防げるトラブルは結構あります。",
    "{topic}で差が出るのは、詳しさより違和感に気づけるかどうかです。整備の現場でも『まだ走れるし』で先送りしたところから話が大きくなることは少なくありません。早めに気づくだけでも十分価値があります。",
    "{topic}を見るときは、完璧に分かろうとしなくて大丈夫です。昨日までと違う感じがあるかだけでも見ておくと、無駄なトラブルはかなり減ります。現場感覚だと、その差は結構大きいです。"
  ];

  const noonTemplates = [
    "{topic}で迷ったら、まず慌てて自己判断しすぎないことが大事です。安全を優先して、症状を一つずつ整理するだけでも判断ミスはかなり減ります。こういう初動の差が後で効きます。",
    "{topic}は、知っているかどうかで動き方が変わりやすいです。現場でも、最初の対応が落ち着いているだけで余計な悪化を防げることは多いです。まずは状況整理からで十分です。",
    "{topic}は派手な話ではないけど、実はかなり大事です。焦っていろいろ触るより、何が起きているかを順番に見るほうが結果的に早いです。こういう基本が一番強いです。"
  ];

  const eveningTemplates = [
    "{topic}というのは、現場にいると本当によく感じます。車のことって、深刻になってからより『ちょっと気になる』の段階で話してもらえるほうが助かります。結果的にそのほうが話も早いです。",
    "{topic}は、日々の現場で何度も思うことです。大きく壊れてからだと選べる手が減るので、少し気になる時点で相談してもらえるほうがずっと動きやすいです。気軽なくらいでちょうどいいです。",
    "{topic}は、整備をしていると自然と実感します。こちらとしても『こんなことで聞いていいのかな』くらいの段階で言ってもらえるほうが見やすいです。遠慮しない相談のほうが結局うまくいきます。"
  ];

  const morningTopic = pick(morningTopics, seed);
  const noonTopic = pick(noonTopics, seed + 7);
  const eveningTopic = pick(eveningTopics, seed + 13);

  return {
    morning: pick(morningTemplates, seed + 19).replace("{topic}", morningTopic),
    noon: pick(noonTemplates, seed + 23).replace("{topic}", noonTopic),
    evening: pick(eveningTemplates, seed + 29).replace("{topic}", eveningTopic)
  };
}

function slotWindow(slot) {
  const windows = {
    morning: { startHour: 6, startMinute: 45, endHour: 6, endMinute: 59 },
    noon: { startHour: 11, startMinute: 30, endHour: 11, endMinute: 44 },
    evening: { startHour: 17, startMinute: 30, endHour: 17, endMinute: 44 }
  };
  return windows[slot];
}

function isWithinWindow(now, window) {
  if (!window) return false;
  const current = now.hour * 60 + now.minute;
  const start = window.startHour * 60 + window.startMinute;
  const end = window.endHour * 60 + window.endMinute;
  return current >= start && current <= end;
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

async function readDeliveryState() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const path = ".github/line-delivery-state.json";

  if (!repo || !token) {
    return {
      sha: null,
      data: { deliveries: {} }
    };
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 404) {
    return {
      sha: null,
      data: { deliveries: {} }
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to read delivery state: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const decoded = Buffer.from(payload.content, "base64").toString("utf8");
  return {
    sha: payload.sha,
    data: JSON.parse(decoded)
  };
}

async function writeDeliveryState(nextData, sha, message) {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const path = ".github/line-delivery-state.json";

  if (!repo || !token) {
    return;
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(`${JSON.stringify(nextData, null, 2)}\n`, "utf8").toString("base64"),
      sha
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to write delivery state: ${response.status} ${await response.text()}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const now = nowInJstParts();
  const slot = args.slot ?? slotFromHour(now.hour);
  const drafts = buildDrafts(now.date);
  const window = slotWindow(slot);

  if (!drafts[slot]) {
    throw new Error(`Unknown slot: ${slot}`);
  }

  if (!args.slot && !isWithinWindow(now, window)) {
    console.log(`Skip ${slot}: outside delivery window`);
    return;
  }

  const state = await readDeliveryState();
  const deliveries = state.data.deliveries ?? {};
  const deliveryKey = `${now.date}:${slot}`;

  if (deliveries[deliveryKey]) {
    console.log(`Skip ${slot}: already delivered for ${now.date}`);
    return;
  }

  const message = drafts[slot];
  await sendLineMessage(message);

  const nextState = {
    deliveries: {
      ...deliveries,
      [deliveryKey]: {
        deliveredAtJst: `${now.date} ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")}`,
        slot
      }
    }
  };

  await writeDeliveryState(nextState, state.sha, `Record LINE delivery for ${deliveryKey}`);
  console.log(`Sent ${slot} draft for ${now.date}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
