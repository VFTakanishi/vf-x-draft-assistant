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
    "朝いちの違和感の拾い方",
    "高速に乗る前のひと確認",
    "ブレーキの感触の変化",
    "タイヤの空気圧の見方",
    "いつもと違う音への気づき"
  ];

  const noonTopics = [
    "警告灯が出たときの初動",
    "暑い日の車内トラブル対策",
    "雨の日の運転で気をつけること",
    "バッテリーが弱る前ぶれ",
    "エアコン不調の見分け方"
  ];

  const eveningTopics = [
    "小さい違和感のうちに相談してもらえること",
    "乗り方のクセで車の状態が変わること",
    "壊れてからより前の相談のほうが早いこと",
    "現場では言葉にしにくい違和感も大事なこと",
    "こんなこと聞いていいのかなの相談が役立つこと"
  ];

  const morningTemplates = [
    "{topic}って、知識があるかどうかより普段との違いに気づけるかのほうが大事です。昨日までと何か違うなと思ったら、その感覚はだいたい当たっています。",
    "{topic}でいちばん大事なのは、無理に詳しく判断しようとしないことです。いつもと違うかどうかだけ見ておくだけでも、トラブルの早期発見にはかなり効きます。",
    "{topic}は、整備の知識がなくても見ておけます。まだ走れるしで流すより、昨日までと同じかどうかを一回気にするだけで変わります。",
    "{topic}って、派手な知識より普段の感覚のほうが役に立ちます。違和感が小さいうちに止められる人ほど、大きなトラブルを避けやすいです。",
    "{topic}は、整備士から見るとかなり大事です。なんとなく気になるの時点で拾えていると、その後の判断がだいぶ楽になります。"
  ];

  const noonTemplates = [
    "{topic}でいちばん良くないのは、焦っていろいろ決めつけることです。まず落ち着いて、いつからか、何をした時に出たかだけ整理できると、その後の判断はかなり変わります。",
    "{topic}って、慌てて動くより先に状況を整理するのが大事です。現場でも、最初に落ち着いて症状を分けられるだけで見立てはかなり変わります。",
    "{topic}で迷ったら、まずは大きく決めつけないことです。急いで結論を出すより、出方やタイミングを落ち着いて見るほうが結果的に早いです。",
    "{topic}は、最初の受け止め方でその後が変わります。焦って自己判断を増やすより、今どういう状態かを静かに整理するほうがずっと大事です。",
    "{topic}って、すぐ答えを出したくなるんですが、まず慌てないことが一番です。症状を落ち着いて見られるだけで、余計な遠回りはかなり減ります。"
  ];

  const eveningTemplates = [
    "{topic}って、現場にいると本当によくあります。深刻になってからより、なんか気になるの段階で見せてもらえるほうが、やっぱり話は早いです。",
    "{topic}は、整備をしているとかなり大事だと感じます。こんなことで聞いていいのかなと思う内容のほうが、実は早く見切れることも多いです。",
    "{topic}って、後から振り返ると最初にサインが出ていたことが多いです。少し引っかかった時点で相談してもらえるほうが、できることは増えます。",
    "{topic}は、こちらからすると遠慮しないでもらえると助かる部分です。大ごとになる前のひとことのほうが、結果的に負担を小さくしやすいです。",
    "{topic}って、部品の話だけじゃなく使い方の積み重ねでも出てきます。だからこそ、ちょっとした違和感でも早めに聞いてもらえると見やすいです。"
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
