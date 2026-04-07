//9500914
//9590401
//9501146
//============================================
// 郵便番号から住所を入力（複数フィールド・完全互換版）
//============================================

// 各フィールドごとの住所データを保持するオブジェクト
// seleDataStore['sele10'] = ['住所1表示テキスト', '住所2表示テキスト'] のように保存されます
// ※ input.value は常に 'sample1'/'sample2' のまま維持し、spanの表示テキストのみ書き換える設計

// 非表示時にセットする value をフィールドごとに管理
// （input.value を書き換えない設計のため、各フィールド共通で 'sample1' が初期値）
// seleResetValue['sele10'] = 'sample1', seleResetValue['sele20'] = 'sample1', ...
var seleResetValue = {};
var seleDataStore  = {};

// フィールド表示・非表示制御
// fg = true  → 非表示にして value を 'sample1' にリセット
// fg = false → 表示する
function ahid2(context, fc, fg) {
  const el = document.querySelector('[data-field-code=' + fc.sele + ']');
  if (!el) return;

  if (fg) {
    el.style.display = 'none';
    // 非表示時はフィールドごとのリセット値をセット（未設定なら 'sample1'）
    context.setFieldValue(fc.sele, seleResetValue[fc.sele] || 'sample1');
  } else {
    el.style.display = '';
  }
}

// ラジオボタンのラベル(span)書き換え＋住所データ保存＋選択を空にする
// ※ postal_org.js の aset2() + wsele() を統合した関数
// ※ input.value（'sample1'/'sample2'）は変更しない
//    → ラジオ変更イベントでの比較・非表示時のリセット値が常に安定する
function aset2(context, fc, p1, p2) {
  const el = document.querySelector('[data-field-code=' + fc.sele + ']');

  // 住所データをフィールドコードをキーにして保存
  // （postal_org.js の sele10[0], sele10[1] 相当）
  seleDataStore[fc.sele] = [p1, p2];

  // このフィールドのリセット値を初期化（input.valueは書き換えないので常に 'sample1'）
  // フィールドごとに独立管理することで複数フィールドの混在を防ぐ
  seleResetValue[fc.sele] = 'sample1';

  if (el) {
    const labels = el.querySelectorAll('label.cursor-pointer');
    labels.forEach(label => {
      const input = label.querySelector('input[type="radio"]');
      const span  = label.querySelector('span.block');

      // 表示テキスト(span)のみ書き換え、input.value は触らない
      if (input && input.value === 'sample1' && span) {
        span.textContent = p1;
      }
      if (input && input.value === 'sample2' && span) {
        span.textContent = p2;
      }
    });
  }

  // 選択を空にする（postal_org.js の wsele() 相当）
  context.setFieldValue(fc.sele, '');
}

// 住所フィールドへのセット
function wcityname(context, fc, pref, city, town) {
  context.setFieldValue(fc.ap1, pref);
  context.setFieldValue(fc.ap2, city);
  context.setFieldValue(fc.ap3, town);
}

// 郵便番号検索
function zip7(context, fc, zip) {
  if (zip && zip.length == 7) {
    // 1. 一般的な郵便番号API
    $.ajax({
      url: 'https://api.zipaddress.net/?zipcode=' + zip,
      type: 'GET',
      dataType: 'json'
    }).done((data) => {
      if (data.data) {
        wcityname(context, fc, data.data.pref, data.data.city, data.data.town);
      }
    });

    // 2. 新潟市などの特殊判定API（複数住所候補がある郵便番号）
    var url = 'https://f1762abc.viewer.kintoneapp.com/public/api/records/a3201a43879abc9f9d35b93f52651bff8a37c01bf54c637acf783b82c87090c6/1';
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json'
    }).done((data) => {
      data.records.forEach(function(p) {
        if (zip == p.郵便番号.value) {
          var p1  = p.住所1.value;
          var p2  = p.住所2.value;
          var p1s = p1.split('区', 2);
          var p2s = p2.split('区', 2);

          // ラジオボタンのラベルをセット＆選択を空にする（wsele相当を含む）
          aset2(context, fc, p1s[0] + '区　' + p1s[1], p2s[0] + '区　' + p2s[1]);
          // ラジオボタンを表示
          ahid2(context, fc, false);

          // 初期値として住所1側をセット
          wcityname(context, fc, '新潟県', p1s[0] + '区', p1s[1]);
        }
      });
    });
  } else {
    // 7桁未満の場合はラジオを非表示にしてリセット
    ahid2(context, fc, true);
  }
}

// --- 設定とイベント登録 ---

// フォーム内に存在するフィールドから自動構築（初回のみ）
const apFields = [];
var postal_initialized = false; // 重複初期化防止フラグ

// 初期化関数
function postal_ini(context) {
  // form.show が複数回発火しても1回だけ実行する
  if (postal_initialized) {
    // 初期化済みの場合はラジオ非表示だけ再実行
    apFields.forEach(fc => { ahid2(context, fc, true); });
    return;
  }
  postal_initialized = true;

  // フォーム内の全 data-field-code を収集
  const elements = document.querySelectorAll('[data-field-code]');
  const allCodes = Array.from(elements).map(el => el.getAttribute('data-field-code'));

  // "ap" + "数字0" で終わるフィールドコードを探す（ap10, ap20, ap30...）
  allCodes.forEach(code => {
    //const match = code.match(/^ap(\d+0)$/);
    const match = code.match(/^ap(\d+0\d*)$/);
    if (!match) return;

    const nStr = match[1];       // "10", "20" ... (文字列)
    const nNum = parseInt(nStr); // 10, 20 ... (数値)
    var kei = 1;
    if(nNum > 100) {
      kei = 10;
    }
    // 対応する seleXX フィールドがフォームに存在する場合のみ登録
    if (allCodes.includes('sele' + nStr)) {
      apFields.push({
        mode: nNum,
        sele: 'sele' + nStr,
        ap0:  'ap'  + nStr,
        ap1:  'ap'  + (nNum + 1*kei),
        ap2:  'ap'  + (nNum + 2*kei),
        ap3:  'ap'  + (nNum + 3*kei)
      });
    }
  });

  apFields.forEach(fc => {
    // 郵便番号フィールド変更時
    formBridge.events.on('form.field.change.' + fc.ap0, function(context) {
      zip7(context, fc, context.value);
      return context;
    });

    // ラジオボタン（選択肢）変更時
    // input.value は 'sample1'/'sample2' のままなのでそのまま比較できる
    formBridge.events.on('form.field.change.' + fc.sele, function(context) {
      var p0   = context.value;
      var data = seleDataStore[fc.sele]; // このフィールド用の住所データを取得

      // 空値（aset2直後の "" セット）やデータ未設定時は無視
      if (!p0 || !data) return context;

      var p = (p0 === 'sample1') ? data[0] : data[1];

      if (p) {
        var ps = p.split('区', 2);
        wcityname(context, fc, '新潟県', ps[0] + '区', ps[1].replace('　', ''));
      }
      return context;
    });
  });

  // 初期表示時はラジオを非表示にする
  apFields.forEach(fc => { ahid2(context, fc, true); });
}

function formshow_postal(context) {
  postal_ini(context);
  return context;
);
