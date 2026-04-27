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

// 現在アクティブな質問インデックス
let _currentIdx = -1;

// fieldset の常時枠表示＋アクティブハイライト用CSS
(function() {
  const style = document.createElement('style');
  style.textContent = `
    [data-field-code] fieldset[tabindex] {
      outline: none !important;
      border: 2px solid #ccc;
      border-radius: 6px;
      padding: 4px 8px;
      transition: border-color 0.2s, background 0.2s;
    }
    [data-field-code] fieldset[tabindex].fb-active {
      border-color: #2563eb;
      background: #eff6ff;
    }
  `;
  document.head.appendChild(style);
})();

// アクティブなfieldsetをハイライト
function setActiveFieldset(idx) {
  EN_QUESTIONS.forEach(function(q) {
    const el = document.querySelector('[data-field-code="' + q.fc + '"]');
    if (!el) return;
    const fs = el.querySelector('fieldset[tabindex]');
    if (fs) fs.classList.remove('fb-active');
  });
  if (idx >= 0 && idx < EN_QUESTIONS.length) {
    const el = document.querySelector('[data-field-code="' + EN_QUESTIONS[idx].fc + '"]');
    if (el) {
      const fs = el.querySelector('fieldset[tabindex]');
      if (fs) fs.classList.add('fb-active');
    }
  }
}

function focusNext(idx) {
  const next = EN_QUESTIONS[idx + 1];
  if (!next) return;
  const nextEl = document.querySelector('[data-field-code="' + next.fc + '"]');
  if (!nextEl) return;
  _currentIdx = idx + 1;
  setActiveFieldset(_currentIdx);
  const fieldset = nextEl.querySelector('fieldset');
  if (fieldset) fieldset.focus();
  else nextEl.focus();
  nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function selectValue(fieldEl, value) {
  const labels = fieldEl.querySelectorAll('fieldset label');
  labels.forEach(function(label) {
    const input = label.querySelector('input[type="radio"]');
    if (input && input.value === value) {
      label.click();
    }
  });
}

function setupQuestions() {
  EN_QUESTIONS.forEach(function(q, idx) {
    const fieldEl = document.querySelector('[data-field-code="' + q.fc + '"]');
    if (!fieldEl) return;

    // タイトルの書き換え
    const titleEl = fieldEl.querySelector('label.text-form-base, .form-group-title, .field-title');
    if (titleEl) {
      titleEl.textContent = (idx + 1) + '. ' + q.str;
    }

    // fieldsetにtabindex付与
    const fieldset = fieldEl.querySelector('fieldset');
    if (fieldset) {
      fieldset.setAttribute('tabindex', '0');
      fieldset.addEventListener('focus', function() {
        _currentIdx = idx;
        setActiveFieldset(idx);
      });
      // blurしても枠は消えない（fb-activeはsetActiveFieldsetで管理）
      fieldset.addEventListener('blur', function() {
        // 何もしない：枠は残す
      });
    }

    // labelクリック時に次へ移動
    const labels = fieldEl.querySelectorAll('fieldset label');
    labels.forEach(function(label) {
      label.addEventListener('click', function() {
        _currentIdx = idx;
        setActiveFieldset(idx);
        setTimeout(function() { focusNext(idx); }, 100);
      });
    });
  });

  // documentレベルで1/2キーを監視
  document.addEventListener('keydown', function(e) {
    if (_currentIdx < 0 || _currentIdx >= EN_QUESTIONS.length) return;
    if (e.key !== '1' && e.key !== '2') return;

    // テキスト入力欄にフォーカスがある場合は無視
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    e.preventDefault();
    const targetValue = e.key === '1' ? 'はい' : 'いいえ';
    const idx = _currentIdx;
    const fieldEl = document.querySelector('[data-field-code="' + EN_QUESTIONS[idx].fc + '"]');
    if (!fieldEl) return;

    selectValue(fieldEl, targetValue);
    setTimeout(function() { focusNext(idx); }, 100);
  });
}

async function formshow_cu5_en(context) {
  setTimeout(function() {
    setupQuestions();
    // 最初の質問にフォーカス＆ハイライト
    const firstEl = document.querySelector('[data-field-code="' + EN_QUESTIONS[0].fc + '"]');
    if (firstEl) {
      const fieldset = firstEl.querySelector('fieldset');
      if (fieldset) {
        _currentIdx = 0;
        setActiveFieldset(0);
        fieldset.focus();
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, 300);
}
