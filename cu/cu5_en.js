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

// kintoneapp プロキシAPI（cu5.js と同じ方式・CORS不要）
const KV_API_URL = 'https://f1762abc.viewer.kintoneapp.com/public/api/records/2faef12e299fa2dd90a116e5ef4de294e30df4a676401f256420f48e3293cdf9/1';

/**
 * 受付番号フィールドの変更イベント
 * 6桁入力完了時に kintoneapp API を axios で取得し、受付番号が一致したレコードのフィールドをコピーする
 */
function setupUketsukeBango(context) {
  formBridge.events.on('form.field.change.受付番号', async function(ctx) {
    const input = String(ctx.value || '').trim();

    // 6桁入力されたときだけ照合
    if (input.length !== 6) return ctx;

    let records;
    try {
      const response = await axios.get(KV_API_URL);
      // レスポンス形式: { num: N, records: [ { フィールドコード: { type, value } } ] }
      const raw = response.data.records || [];
      // kintone形式 { value: '...' } をフラット化
      records = raw.map(r => {
        const flat = {};
        Object.keys(r).forEach(k => {
          flat[k] = (r[k] && r[k].value !== undefined) ? r[k].value : r[k];
        });
        return flat;
      });
    } catch (e) {
      console.error('[cu5_en] kv fetch error:', e);
      return ctx;
    }

    const matched = records.find(r =>
      String(r['受付番号'] || '').trim() === input
    );

    if (matched) {
      // コピー対象フィールド一覧
      const copyFields = ['LOT', 'p01_1', 'ap17f', 'bd', 'p04_1', 'p06_2'];
      copyFields.forEach(function(fc) {
        if (matched[fc] !== undefined && matched[fc] !== '') {
          ctx.setFieldValue(fc, matched[fc]);
        }
      });
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

  // 受付番号の照合イベントをセット
  setupUketsukeBango(context);

  // 質問タイトルの書き換えとキーボード操作のセットアップ
  // DOM が描画された後に実行する
  setTimeout(function() {
    setupQuestions();
  }, 300);
}
