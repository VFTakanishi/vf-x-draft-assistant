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
    "タイヤの違和感",
    "ブレーキの踏み始め",
    "走り出しの小さな変化",
    "朝いちのエンジン音",
    "ハンドルの手応え",
    "季節の変わり目の点検"
  ];

  const noonTopics = [
    "警告灯が出たときの初動",
    "バッテリーが弱い日の対応",
    "檹い日の車内トラブル",
    "エアコンの効きが悪いとき",
    "長距離前の確認",
    "においに気づいたときの見方"
  ];

  const eveningTopics = [
    "ちょっと気になる違和感を放置しないこと",
    "相談が早い人ほど大きな出費を避けやすいこと",
    "整備って結局は普段の乗り方が出ること",
    "言葉にしづらい不安でも先に聞くほうがいいこと",
    "車の変化に気づける人ほど安全に近いこと",
    "現場では小さいサインほど見逃さないこと"
  ];

  const morningTemplates = [
    "{topic}って、知識があるかどうかより普段との違いに気づけるかのほうが大事です。昨日までと何か違うなと思ったら、その感覚はだいたい合っています。",
    "{topic}で差が出るのは、派手な知識より毎日の感覚です。まだ走れるしで流すより、いつもと違うかだけ先に見ておくほうが結果的に安全です。",
    "{topic}は大きな故障の前に小さく出ることが多いです。朝の数分で違和感を拾えるだけでも、その後のトラブルはかなり減らせます。",
    "{topic}は、あとで振り返ると前から出ていたと言われることが多いです。気のせいかもで終わらせず、昨日との違いだけ見ておくのが大事です。"
  ];

  const noonTemplates = [
    "{topic}でいちばん良くないのは、焦っていろいろ決めつけることです。まず落ち着いて症状を整理できるだけで、その後の判断はかなり変わります。",
    "{topic}は、すぐに答えを出そうとするより先に状況を切り分けるのが大事です。慌てず順番に見るだけで、余計な遠回りはかなり減ります。",
    "{topic}って、現場でも最初の落ち着き方でその後が変わります。焦って自己判断するより、何が起きたかを整理するほうが先です。",
    "{topic}で困ったときほど、最初の一手はシンプルなほうがいいです。慌てない、決めつけない、症状を整理する。この3つだけでも十分違います。"
  ];

  const eveningTemplates = [
    "{topic}。現場で見ていても、早めに聞いてもらえたケースほど話が早いです。大事になる前に止められることは意外と多いです。",
    "{topic}。整備って結局、壊れてからより違和感の段階で動けるかどうかが大きいです。迷った時点で聞くのは全然早すぎません。",
    "{topic}。実際、あとから見れば小さいサインだったということは多いです。だからこそ、気になった時点で相談してもらえるのがいちばん助かります。",
    "{topic}。はっきり故障していなくても、気になる感覚には意味があることが多いです。迷うくらいなら早めに聞くほうが結果的に安心です。"
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
    morning: { startHour: 6, startMinute: 30, endHour: 8, endMinute: 0 },
    noon: { startHour: 11, startMinute: 20, endHour: 12, endMinute: 40 },
    evening: { startHour: 17, startMinute: 20, endHour: 18, endMinute: 40 }
  }[slot];
}

function isWithinWindow(now, window) {
  if (!window) return false;
  const currentMinutes = now.hour * 60 + now.minute;
  const startMinutes = window.startHour * 60 + window.startMinute;
  const endMinutes = window.endHour * 60 + window.endMinute;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function detectActiveSlot(now) {
  for (const slot of ["morning", "noon", "evening"]) {
    if (isWithinWindow(now, slotWindow(slot))) {
      return slot;
    }
  }
  return null;
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
  const slot = args.slot ?? detectActiveSlot(now);

  if (!slot) {
    console.log(`Skip: outside delivery window at ${now.date} ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")} JST`);
    return;
  }

  if (!drafts[slot]) {
    throw new Error("Invalid slot. Use --slot morning|noon|evening");
  }

  const state = await readDeliveryState();
  const deliveries = state.data.deliveries ?? {};
  const deliveryKey = `${now.date}:${slot}`;

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
