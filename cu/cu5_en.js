// cu5_en.js
// fc_en の q01〜q21 の順に質問タイトルを設定し、
// 1/2キー押下で自動フォーカス移動、受付番号一致でフィールドコピーを行う

// 点数_園.xlsx の fc_en 列を fc_en昇順（q01〜q21）でソートした定義
// fc: フォームに保存するフィールドコード
// fc_en: 英語キー（表示順の管理用）
// str: 表示ラベル
const EN_QUESTIONS = [
  { fc: 'q25', fc_en: 'q01', str: '片足立ちが5秒以上できますか' },
  { fc: 'q26', fc_en: 'q02', str: 'えんぴつを親指・人差し指・中指の3本の指で持てますか' },
  { fc: 'q27', fc_en: 'q03', str: 'お手本を見て四角がかけますか' },
  { fc: 'q28', fc_en: 'q04', str: 'ボタンのかけはずしできますか' },
  { fc: 'q29', fc_en: 'q05', str: 'ひとりで服を着られますか' },
  { fc: 'q30', fc_en: 'q06', str: 'ハサミで紙を線にそって切れますか' },
  { fc: 'q31', fc_en: 'q07', str: 'じゃんけんで勝ち負けが分かりますか' },
  { fc: 'q32', fc_en: 'q08', str: '左右が分かりますか' },
  { fc: 'q33', fc_en: 'q09', str: '用途の説明ができますか　（例）えんぴつ／ぼうし／いすは何に使うものですか' },
  { fc: 'q02', fc_en: 'q10', str: '好き嫌いが激しく、食べられるものが非常に少ないですか' },
  { fc: 'q09', fc_en: 'q11', str: '強いこだわり（物の順序、色、場所など）があり、違うと直したり、激しく怒ったりしますか' },
  { fc: 'q10', fc_en: 'q12', str: '音・光・におい・食感・肌触りなどに過敏に反応しますか' },
  { fc: 'q11', fc_en: 'q13', str: '悲しい時や困っている時、いやな時など気持ちをことばで伝えてくれますか' },
  { fc: 'q12', fc_en: 'q14', str: '家族や周囲が困るほどのかんしゃくを起こしますか' },
  { fc: 'q13', fc_en: 'q15', str: '家族以外の人をたたく、引っかく、かみつくことはありますか' },
  { fc: 'q34', fc_en: 'q16', str: '一方的な話し方ではなく、会話のやりとりが続きますか' },
  { fc: 'q35', fc_en: 'q17', str: 'ことば遊び（しりとり、なぞなぞなど）やストーリーのある絵本を楽しみますか' },
  { fc: 'q36', fc_en: 'q18', str: 'ことばが不明瞭（発音や話し方など）で普段の会話で伝わりにくいことはありますか' },
  { fc: 'q37', fc_en: 'q19', str: 'カ行、ガ行がうまく言えますか（例）菊；チトゥ/イウ、下がる；タダル/アアル、ぴかぴか；ピタピタ/ピアピア）' },
  { fc: 'q38', fc_en: 'q20', str: '人の話をじっと聞いたり、友達と一緒に遊び続けることができますか' },
  { fc: 'q39', fc_en: 'q21', str: '集団生活では、友達と一緒に遊んだり、行動することができますか' },
];

// id=2230 のレコードをあらかじめ読み込んでおくキャッシュ
let _kvCache = null;

/**
 * kv.php から id=2230 のデータを取得してキャッシュに保存
 */
async function preloadKv2230() {
  try {
    const res = await fetch('https://cityniigata.com/cu/ra/kv.php?id=2230');
    if (!res.ok) throw new Error('kv fetch failed: ' + res.status);
    _kvCache = await res.json();
  } catch (e) {
    console.error('[cu5_en] kv preload error:', e);
    _kvCache = null;
  }
}

/**
 * 受付番号フィールドの変更イベント
 * 入力された6桁と kv データの受付番号を照合し、一致したらフィールドをコピーする
 */
function setupUketsukeBango(context) {
  formBridge.events.on('form.field.change.受付番号', function(ctx) {
    const input = String(ctx.value || '').trim();
    if (!_kvCache) return;

    // レスポンスが配列の場合・オブジェクトの場合両方に対応
    const records = Array.isArray(_kvCache) ? _kvCache : (_kvCache.records || [_kvCache]);
    const matched = records.find(r => {
      const uketsuke = String(r['受付番号'] || r.uketsukeNo || '').trim();
      return uketsuke === input;
    });

    if (matched) {
      // 一致した場合、各フィールドをコピー
      if (matched['LOT']   !== undefined) ctx.setFieldValue('LOT',   matched['LOT']);
      if (matched['p01_1'] !== undefined) ctx.setFieldValue('p01_1', matched['p01_1']);
      if (matched['ap17f'] !== undefined) ctx.setFieldValue('ap17f', matched['ap17f']);
      if (matched['bd']    !== undefined) ctx.setFieldValue('bd',    matched['bd']);
      if (matched['p04_1'] !== undefined) ctx.setFieldValue('p04_1', matched['p04_1']);
      if (matched['p06_2'] !== undefined) ctx.setFieldValue('p06_2', matched['p06_2']);
    }
    return ctx;
  });
}

/**
 * q01〜q21 のラジオボタンタイトルを EN_QUESTIONS の str で上書きし、
 * 1キー→はい(値=1)、2キー→いいえ(値=2) のキーボード入力と
 * 回答後の次フィールドへの自動フォーカス移動を設定する
 */
function setupQuestions() {
  // --- タイトルの書き換え ---
  EN_QUESTIONS.forEach(function(q, idx) {
    const fieldEl = document.querySelector('[data-field-code="' + q.fc + '"]');
    if (!fieldEl) return;
    const titleEl = fieldEl.querySelector('.form-group-title, .field-title, label');
    if (titleEl) {
      titleEl.textContent = (idx + 1) + '. ' + q.str;
    }
  });

  // --- キーボード操作（1=はい, 2=いいえ）と自動フォーカス ---
  EN_QUESTIONS.forEach(function(q, idx) {
    const fieldEl = document.querySelector('[data-field-code="' + q.fc + '"]');
    if (!fieldEl) return;

    fieldEl.addEventListener('keydown', function(e) {
      let targetValue = null;
      if (e.key === '1') targetValue = '1'; // はい
      if (e.key === '2') targetValue = '2'; // いいえ
      if (targetValue === null) return;

      e.preventDefault();

      // ラジオボタンを選択
      const radios = fieldEl.querySelectorAll('input[type="radio"]');
      radios.forEach(function(radio) {
        if (radio.value === targetValue) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // 次の質問へフォーカス移動
      const next = EN_QUESTIONS[idx + 1];
      if (next) {
        const nextEl = document.querySelector('[data-field-code="' + next.fc + '"]');
        if (nextEl) {
          const focusTarget = nextEl.querySelector('input[type="radio"], input, button');
          if (focusTarget) focusTarget.focus();
          else nextEl.focus();
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    // ラジオ変更時も次の質問に自動フォーカス
    const radios = fieldEl.querySelectorAll('input[type="radio"]');
    radios.forEach(function(radio) {
      radio.addEventListener('change', function() {
        const next = EN_QUESTIONS[idx + 1];
        if (next) {
          setTimeout(function() {
            const nextEl = document.querySelector('[data-field-code="' + next.fc + '"]');
            if (nextEl) {
              const focusTarget = nextEl.querySelector('input[type="radio"], input, button');
              if (focusTarget) focusTarget.focus();
              else nextEl.focus();
              nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 80);
        }
      });
    });
  });
}

/**
 * main_en.js から呼ばれるエントリーポイント
 */
async function formshow_cu5_en(context) {
  // kv データを事前読み込み（非同期、完了を待つ）
  await preloadKv2230();

  // 受付番号の照合イベントをセット
  setupUketsukeBango(context);

  // 質問タイトルの書き換えとキーボード操作のセットアップ
  // DOM が描画された後に実行する
  setTimeout(function() {
    setupQuestions();
  }, 300);
}
