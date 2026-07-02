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

const SLOT_DRAFTS = {
  morning: [
    "おはようございます。出発前に車を軽く見ておくだけでも、防げるトラブルはけっこうあります。タイヤが少し潰れていないか、下に変な液が垂れていないか。毎日乗っている人の「いつもと違う」は本当に大事です。今日も安全運転でいきましょう！",
    "おはようございます。最近「エンジンのかかりが少し重い気がする」という話は増えています。いきなり動かなくなる前に、昨日までと少し違うかを見ておくだけでもかなり違います。今日も安全運転でいきましょう！",
    "おはようございます。最近、暑くなってきてエアコンを使う時間が一気に増えてきました。この時期はバッテリーに負担がかかりやすいです。エンジンのかかりが少し鈍いかもと思ったら、その感覚はけっこう大事です。今日も安全運転でいきましょう！",
    "おはようございます。出発前に車をぐるっと一周見るだけでも、防げるトラブルはけっこうあります。タイヤの空気圧や下回りの違和感みたいな「いつもと違う」は、毎日乗っている人だから気づけることです。今日も安全運転でいきましょう！",
    "おはようございます。最近の現場でも、タイヤの違和感を後回しにして大きくなる流れはよくあります。気のせいで流さずに、昨日との違いだけでも見ておくのが大事です。今日も安全運転でいきましょう！",
    "おはようございます。ワイパーって動いていれば大丈夫と思われがちですが、拭きムラがあるだけで雨の日の疲れ方はかなり変わります。こういう小さい違和感ほど早めに見ておくのが大事です。今日も安全運転でいきましょう！",
    "おはようございます。ブレーキの踏み始めって、後から思うと前から少し違っていたと言われることが多いです。難しいことより、普段と違う感覚を雑に流さないほうが結果的に安全です。今日も安全運転でいきましょう！",
    "おはようございます。最近は冷却水まわりの変化を見落としていたという話も増えています。大きな故障の話ではなくても、「昨日までと何か違う」の段階で見ておくのは本当に大事です。今日も安全運転でいきましょう！",
    "おはようございます。朝の一発目でエンジンのかかり方がいつもと違う時って、後から振り返るとサインだったということがよくあります。こういう感覚はけっこう当たります。今日も安全運転でいきましょう！",
    "おはようございます。最近、空気圧が少し低いまま乗っていたという話は本当によくあります。毎日見ている車ほど変化に慣れてしまうので、出発前に少しだけ意識して見るのが大事です。今日も安全運転でいきましょう！"
  ],
  noon: [
    "最近、警告灯が出たときの相談は増えています。こういう時に焦って「もうダメかも」と決めつけるのはあまり良くないです。まずはいつ出たのか、走りに変化があるのか、そのあたりを落ち着いて見ておくのが大事です。",
    "最近、ブレーキの違和感についての相談は増えています。こういう時に焦って大丈夫だろうと決めつけるのはあまり良くないです。踏み始めがいつもと違うかどうか、そのくらいから見ておくのが大事です。",
    "最近、警告灯が出たときの相談は増えています。こういう時にいちばん良くないのは、焦って原因を決めつけることです。まずは慌てずに、いつから出たのか、走りは変わったのかを見るだけでも違います。",
    "最近、ブレーキの踏み始めに違和感があるという相談は増えています。こういうのは気のせいで終わることもありますが、後から思うと前から出ていたと言われることも多いです。慌てて決めつけず、まずはいつもと違うかを見ておくのが大事です。",
    "最近、雨の日の見えにくさについての相談は増えています。ワイパーが動いているから大丈夫と思っていても、拭きムラがあるだけで疲れ方はかなり変わります。夜や高速を走る前に一度見ておくのが大事です。",
    "最近、高速に乗る前の点検について聞かれることが増えています。難しいことを全部やるより、タイヤ、警告灯、ブレーキの感覚、このあたりを見るだけでもかなり違います。",
    "最近、バッテリーが怪しいと感じたときの相談は増えています。こういう時にまだ大丈夫だろうで流すと、出先で急に困ることがあります。かかり方がいつもより重いかどうか、その感覚は見ておいたほうが良いです。",
    "最近、暑い日のエアコン使用で負担が増えている話はよくあります。エアコンが効くかだけでなく、エンジンのかかり方やアイドリングの感じが少し違わないかも見ておくと安心です。",
    "最近、雨の日の見落としって本当に多いです。昼は平気でも夜になると一気に見えにくくなることがあります。ワイパーやガラスの状態は早めに見ておくのが大事です。",
    "ニュースや現場でも、警告灯やブレーキの違和感を後回しにしていたという話はよくあります。すぐに大ごとだと思い込むより、いつからか、どういう場面で出るかを見ておくほうが判断しやすいです。"
  ],
  evening: [
    "今日もお疲れ様です。思い返すと前から少し変だったという話はよく聞きます。気のせいかもで流さずに、「なんか気になる」の段階で話してもらえるほうが安心です。",
    "今日もお疲れ様です。現場にいると、思い返すと前から少し違和感が出ていたという話は本当によくあります。気のせいかもで流さずに、「なんか気になる」の段階で話してもらえるほうがやっぱり安心です。",
    "今日もお疲れ様です。現場にいると、「まだ走れるし」でそのままになっていた話は本当によくあります。大きな故障になってからより、少し気になる段階で話してもらえるほうがやっぱり安心です。",
    "今日もお疲れ様です。現場にいると、音や振動の違和感って説明しにくいことが本当によくあります。でも、その説明しにくい感じが大事なことも多いです。うまく言えなくても、少し気になる段階で話してもらえるほうが安心です。",
    "今日もお疲れ様です。後から思うと前から少し違っていたという話は本当によくあります。大きく壊れてからより、「あれ、なんか違うかも」の段階で見せてもらえるほうが早いです。",
    "今日もお疲れ様です。最近よく思うのは、違和感って大きくなってからより小さいうちのほうが拾いやすいということです。気のせいで終わらせずに、少しでも気になった時点で話してもらえると助かります。",
    "今日もお疲れ様です。毎日乗っている人だからこそ気づける変化ってあります。説明しにくくても、その違和感が大事なことは本当によくあります。少しでも気になった時点で見ておくのが大事です。",
    "今日もお疲れ様です。現場にいると、「なんか気になるけど説明しにくい」という相談は本当によくあります。でも、そういう時ほどちゃんと見ておいたほうが良いことが多いです。",
    "今日もお疲れ様です。後から振り返ると、前から少し音が違ったとか、振動が気になっていたとか、そういう話は本当によくあります。気のせいで流さずに、違和感の段階で話してもらえるほうが安心です。",
    "今日もお疲れ様です。完全に動かなくなってからより、少し気になる段階で相談してもらえるほうがやっぱり助かります。現場にいると、その差は本当に大きいです。"
  ]
};

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

function parseDateAsUtc(dateText) {
  return new Date(`${dateText}T00:00:00Z`);
}

function dayDiff(dateA, dateB) {
  const diffMs = parseDateAsUtc(dateA).getTime() - parseDateAsUtc(dateB).getTime();
  return Math.floor(diffMs / 86400000);
}

function recentTextsForSlot(history, slot, date, minGapDays) {
  return new Set(
    history
      .filter((item) => item.slot === slot)
      .filter((item) => {
        const diff = dayDiff(date, item.date);
        return diff >= 0 && diff < minGapDays;
      })
      .map((item) => item.text)
  );
}

function selectDraft(slot, date, history) {
  const pool = SLOT_DRAFTS[slot];
  if (!pool || pool.length === 0) {
    throw new Error(`No drafts configured for slot: ${slot}`);
  }

  const blockedTexts = recentTextsForSlot(history, slot, date, 7);
  const allowedPool = pool.filter((text) => !blockedTexts.has(text));
  const fallbackPool = allowedPool.length > 0 ? allowedPool : pool;
  return pick(fallbackPool, seedFrom(`${slot}:${date}`));
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
      data: { deliveries: {}, history: [] }
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
      data: { deliveries: {}, history: [] }
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to read delivery state: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const decoded = Buffer.from(payload.content, "base64").toString("utf8");
  const parsed = JSON.parse(decoded);

  return {
    sha: payload.sha,
    data: {
      deliveries: parsed.deliveries ?? {},
      history: parsed.history ?? []
    }
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
  const slot = args.slot ?? detectActiveSlot(now);

  if (!slot) {
    console.log(`Skip: outside delivery window at ${now.date} ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")} JST`);
    return;
  }

  const state = await readDeliveryState();
  const deliveries = state.data.deliveries ?? {};
  const history = state.data.history ?? [];
  const deliveryKey = `${now.date}:${slot}`;

  if (deliveries[deliveryKey]) {
    console.log(`Skip ${slot}: already delivered for ${now.date}`);
    return;
  }

  const text = selectDraft(slot, now.date, history);
  await sendLineMessage(text);

  const nextHistory = [
    ...history,
    {
      date: now.date,
      slot,
      text
    }
  ].slice(-120);

  const nextState = {
    deliveries: {
      ...deliveries,
      [deliveryKey]: {
        deliveredAtJst: `${now.date} ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")}`,
        slot,
        text
      }
    },
    history: nextHistory
  };

  await writeDeliveryState(nextState, state.sha, `Record LINE delivery for ${deliveryKey}`);
  console.log(`Sent ${slot} draft for ${now.date}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
