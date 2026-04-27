// cu5_en.js
// fc_en の q01〜q21 の順に質問タイトルを設定し、
// 1/2キー押下で自動フォーカス移動を行う

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

/**
 * 指定インデックスの次の質問にフォーカスを移動する
 */
function focusNext(idx) {
  const next = EN_QUESTIONS[idx + 1];
  if (!next) return;
  const nextEl = document.querySelector('[data-field-code="' + next.fc + '"]');
  if (!nextEl) return;
  const firstRadio = nextEl.querySelector('input[type="radio"]');
  if (firstRadio) {
    firstRadio.focus();
  } else {
    nextEl.focus();
  }
  nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * ラジオボタンの値をセットしてclickイベントを発火する
 */
function selectRadioValue(fieldEl, value) {
  const radios = fieldEl.querySelectorAll('input[type="radio"]');
  radios.forEach(function(radio) {
    if (radio.value === value) {
      radio.checked = true;
      radio.click();
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

/**
 * q01〜q21 のラジオボタンタイトルを EN_QUESTIONS の str で上書きし、
 * 1キー→はい(値=1)、2キー→いいえ(値=2) のキーボード入力と
 * 回答後の次フィールドへの自動フォーカス移動を設定する
 */
function setupQuestions() {
  EN_QUESTIONS.forEach(function(q, idx) {
    const fieldEl = document.querySelector('[data-field-code="' + q.fc + '"]');
    if (!fieldEl) return;

    // --- タイトルの書き換え ---
    const titleEl = fieldEl.querySelector('.form-group-title, .field-title, label');
    if (titleEl) {
      titleEl.textContent = (idx + 1) + '. ' + q.str;
    }

    // --- ラジオボタン各個にkeydownを付ける ---
    // fieldEl自体はフォーカスを受け取れないため、radio inputに直接付ける
    const radios = fieldEl.querySelectorAll('input[type="radio"]');

    radios.forEach(function(radio) {
      // 1/2キーで選択 → 次へ
      radio.addEventListener('keydown', function(e) {
        let targetValue = null;
        if (e.key === '1') targetValue = '1'; // はい
        if (e.key === '2') targetValue = '2'; // いいえ
        if (targetValue === null) return;

        e.preventDefault();
        selectRadioValue(fieldEl, targetValue);
        // changeイベント処理後に移動するため少し待つ
        setTimeout(function() { focusNext(idx); }, 80);
      });

      // クリック・スペースキーでラジオ選択された後も次へ移動
      radio.addEventListener('change', function() {
        setTimeout(function() { focusNext(idx); }, 80);
      });
    });

    // --- fieldEl全体にもkeydownを付ける（tabフォーカス時など）---
    fieldEl.setAttribute('tabindex', '0');
    fieldEl.addEventListener('keydown', function(e) {
      let targetValue = null;
      if (e.key === '1') targetValue = '1';
      if (e.key === '2') targetValue = '2';
      if (targetValue === null) return;

      e.preventDefault();
      selectRadioValue(fieldEl, targetValue);
      setTimeout(function() { focusNext(idx); }, 80);
    });
  });
}

/**
 * main_en.js から呼ばれるエントリーポイント
 */
async function formshow_cu5_en(context) {
  // DOM が描画された後に実行する
  setTimeout(function() {
    setupQuestions();
  }, 300);
}
