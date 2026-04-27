// cu5_en.js

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

function focusNext(idx) {
  const next = EN_QUESTIONS[idx + 1];
  if (!next) return;
  const nextEl = document.querySelector('[data-field-code="' + next.fc + '"]');
  if (!nextEl) return;
  const firstRadio = nextEl.querySelector('input[type="radio"]');
  if (firstRadio) firstRadio.focus();
  else nextEl.focus();
  nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setupQuestions() {
  EN_QUESTIONS.forEach(function(q, idx) {
    const fieldEl = document.querySelector('[data-field-code="' + q.fc + '"]');
    if (!fieldEl) return;

    // タイトルの書き換え
    const titleEl = fieldEl.querySelector('.form-group-title, .field-title, label');
    if (titleEl) {
      titleEl.textContent = (idx + 1) + '. ' + q.str;
    }

    // キーボード処理中フラグ（changeイベントの二重発火防止）
    let _keyHandling = false;

    // 1/2キー処理の共通関数
    function handleKey(e) {
      let targetValue = null;
      if (e.key === '1') targetValue = 'はい';
      if (e.key === '2') targetValue = 'いいえ';
      if (targetValue === null) return;

      e.preventDefault();
      _keyHandling = true;

      // 対象ラジオを選択
      const radios = fieldEl.querySelectorAll('input[type="radio"]');
      radios.forEach(function(radio) {
        if (radio.value === targetValue) {
          radio.checked = true;
          // formBridgeへの値反映のためclickを発火
          radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      });

      // 次の質問へ移動
      setTimeout(function() {
        _keyHandling = false;
        focusNext(idx);
      }, 100);
    }

    // ラジオボタン各個にkeydownを付ける
    const radios = fieldEl.querySelectorAll('input[type="radio"]');
    radios.forEach(function(radio) {
      radio.addEventListener('keydown', handleKey);

      // クリックで選択された場合のみ次へ（キー操作時は二重防止）
      radio.addEventListener('change', function() {
        if (_keyHandling) return;
        setTimeout(function() { focusNext(idx); }, 80);
      });
    });

    // fieldEl全体にもkeydownを付ける（tabフォーカスでfieldElにフォーカスが当たった場合）
    fieldEl.setAttribute('tabindex', '0');
    fieldEl.addEventListener('keydown', handleKey);
  });
}

async function formshow_cu5_en(context) {
  setTimeout(function() {
    setupQuestions();
  }, 300);
}
