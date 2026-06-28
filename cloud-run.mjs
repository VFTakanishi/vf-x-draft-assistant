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

function parseArgs(argv) {
  const options = { slot: null };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === "--slot") {
      options.slot = argv[index + 1] ?? null;
      index += 1;
    }
  }
  return options;
}

function seedFrom(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function pick(list, seed) {
  return list[seed % list.length];
}

function fillTemplate(template, replacements) {
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

function buildDrafts(date) {
  const seed = seedFrom(date);

  const morningTopics = [
    "タイヤの空気圧",
    "ブレーキの踏み始め",
    "高速に乗る前のひと確認",
    "朝いちのエンジン音",
    "ハンドルの違和感",
    "走り出しの感覚"
  ];

  const noonTopics = [
    "警告灯が出たとき",
    "暑い日のバッテリー",
    "雨の日の視界",
    "エアコンの効き",
    "長距離前の点検",
    "においや音の変化"
  ];

  const eveningTopics = [
    "ちょっと気になるの段階で相談してもらえること",
    "乗り方のクセが車に出ること",
    "大きく壊れる前に小さいサインが出ること",
    "言葉にしづらい違和感も大事なこと",
    "早めの相談のほうが結局ラクなこと",
    "現場では部品だけじゃなく使い方も見ていること"
  ];

  const morningTemplates = [
    "{topic}って、詳しい知識があるかより、いつもと違うって気づけるかのほうが大事です。小さい違和感を流さないだけで、防げることは結構あります。",
    "{topic}は、難しく考えすぎなくて大丈夫です。昨日までと同じかどうかを見るだけでも、トラブルの早期発見にはかなり効きます。",
    "{topic}で差が出るのは、知識量より普段の感覚です。まだ走れるしで流す前に、一回だけ違和感がないか見ておくのがおすすめです。",
    "{topic}って、整備の現場でも軽く見ないほうがいいところです。大きい不調の前って、だいたい小さいサインが先に出ています。",
    "{topic}は、分かろうとしすぎなくていいです。なんかいつもと違う、その感覚だけ拾えれば十分意味があります。"
  ];

  const noonTemplates = [
    "{topic}でいちばん良くないのは、焦っていろいろ決めつけることです。まず落ち着いて、いつからか、何をした時に出たかだけ整理できると、その後の判断はかなり変わります。",
    "{topic}って、すぐ答えを出したくなるんですが、まず慌てないことが一番大事です。現場でも、最初に状況を整理できるだけで見立てはだいぶ変わります。",
    "{topic}で迷ったら、まずは大きく自己判断しすぎないことです。症状の出方だけ落ち着いて見られると、余計な遠回りはかなり減ります。",
    "{topic}は、最初の受け止め方でその後が変わります。焦って触りすぎるより、今どういう状態かを静かに整理するほうがずっと大事です。",
    "{topic}って、派手な知識より最初の落ち着きのほうが大事だったりします。慌てないだけで、その後の判断ミスはかなり減らせます。"
  ];

  const eveningTemplates = [
    "{topic}って、整備をしていると本当によくあります。深刻になってからより、なんか気になるの段階で話してもらえるほうが、やっぱり早いです。",
    "{topic}は、現場ではかなり大事です。こんなことで聞いていいのかなと思う内容のほうが、実は早く見切れることも多いです。",
    "{topic}って、後から振り返ると最初にサインが出ていたことが多いです。少し引っかかった時点で相談してもらえると、できることは増えます。",
    "{topic}は、こっちからすると遠慮しないでもらえるほうが助かります。大ごとになる前のひとことのほうが、結果的に負担を小さくしやすいです。",
    "{topic}って、本当に現場っぽい話なんですが、早めに聞いてもらえるほうが見やすいです。気軽なくらいの相談のほうが、むしろ助かります。"
  ];

  return {
    morning: fillTemplate(pick(morningTemplates, seed + 11), {
      topic: pick(morningTopics, seed + 3)
    }),
    noon: fillTemplate(pick(noonTemplates, seed + 17), {
      topic: pick(noonTopics, seed + 7)
    }),
    evening: fillTemplate(pick(eveningTemplates, seed + 23), {
      topic: pick(eveningTopics, seed + 13)
    })
  };
}

function slotWindow(slot) {
  return {
    morning: { startHour: 6, startMinute: 45, endHour: 7, endMinute: 15 },
    noon: { startHour: 11, startMinute: 30, endHour: 12, endMinute: 15 },
    evening: { startHour: 17, startMinute: 30, endHour: 18, endMinute: 15 }
  }[slot];
}

function isWithinWindow(now, window) {
  if (!window) return false;
  const currentMinutes = now.hour * 60 + now.minute;
  const startMinutes = window.startHour * 60 + window.startMinute;
  const endMinutes = window.endHour * 60 + window.endMinute;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
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
  const drafts = buildDrafts(now.date);
  const slot = args.slot;

  if (!slot || !drafts[slot]) {
    throw new Error("Missing or invalid slot. Use --slot morning|noon|evening");
  }

  const window = slotWindow(slot);
  const state = await readDeliveryState();
  const deliveries = state.data.deliveries ?? {};
  const deliveryKey = `${now.date}:${slot}`;

  if (!args.slot && !isWithinWindow(now, window)) {
    console.log(`Skip ${slot}: outside delivery window`);
    return;
  }

  if (deliveries[deliveryKey]) {
    console.log(`Skip ${slot}: already delivered for ${now.date}`);
    return;
  }

  await sendLineMessage(drafts[slot]);

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
