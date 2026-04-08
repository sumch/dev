const fbfc = [
  "id", "受付番号", "p00_2", "p00_3", "p00_4", "p00_6", "p00_5",
  "p01_1", "ap17f", "p04_1", "bd", "ap10", "ap11", "ap12", "ap13", "ap14",
  "ap15", "p05_1", "p05_2", "p05_4", "p05_3", "p06_1", "p06_2",
  "p10_1", "p10_3", "p10_4", "p08_1", "p09_1", "p07_1", "p07_2", "p07_3",
  "p11", "p15", "p12",
  "q01","q02","q03","q04","q05","q06","q07","q08","q09","q10",
  "q11","q12","q13","q14","q15","q16","q17","q18","q19","q20",
  "q21","q22","q23","q24","q25","q26","q27","q28","q29","q30",
  "q31","q32","q33","q34","q35","q36","q37","q38","q39"
];

/**
 * 今日の日付から年度と期（04 or 10）を判定してコードを返す
 * 3月〜6月  => YYYY04
 * 7月〜翌2月 => YYYY10
 */
const getFiscalPeriodCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonthは0-11のため+1

  let result;

  if (month >= 3 && month <= 6) {
    // 3月〜6月
    result = `${year}04`;
  } else if (month >= 7 && month <= 12) {
    // 7月〜12月
    result = `${year}10`;
  } else {
    // 1月〜2月（前年の7月期扱いのため年を-1する）
    result = `${year - 1}10`;
  }

  return result;
};


async function formshow_cu5(context) {
  var lot = getFiscalPeriodCode();
  context.setFieldValue('LOT', lot);
  
  //登録可能期間
  const url = 'https://f1762abc.viewer.kintoneapp.com/public/api/records/82e53c20f3f0d1cb83b7cbba66a82d9693ea062629a0cf180cfc8a3ce0097d1b/1';
  await axios.get(url,  { }).then(response => {
    // 一つでも期間内（start <= now <= end）があればtrue
    const now = new Date();
    const isAvailable = response.data.records.some(rd => {
      const start = new Date(rd.start.value);
      const end = new Date(rd.end.value);
      return now >= start && now <= end;
    });
    const labelfc = 'label1';
    if (isAvailable) {
      ahid2(context, labelfc, true);
    } else {
      ahid2(context, labelfc, false);
      //adis_all(state, false);
        const fieldEl = document.querySelector('[data-field-code="' + labelfc + '"]');
        const titleEl = fieldEl.querySelector('.flex');
        titleEl.innerText = response.data.records[0].label1.value;
        titleEl.innerHTML = '<div class="lexical-html wrap-break-word"><span style="font-size: 20px; color: red;"><p class=""><br></p></span></div>'
        
        const record = formBridge.fn.getRecord();
        record.forEach(function(key ) {
          adis(context, key , true);
        });
    }  
  }).catch(response => console.log(response))
  

  
  //ahid2(context, 'sele10', true);

  // --- q01〜q39 radioボタンのタイトルをAPIのstrで置き換え ---
  const API_URL = 'https://f1762abc.viewer.kintoneapp.com/public/api/records/2feaae2f724401ff0d7e3171a1b58d5f30fdef6eaddc39875b66290e80816dea/1';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('API fetch failed: ' + res.status);
    const json = await res.json();

    // レスポンス: { records: [{ str: { value: '...' } }, ...] }
    const records = json?.records;
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('records が取得できませんでした');
    }

    // fc フィールドの値（q01〜q39）を使ってDOM要素を特定
    records.forEach(function(record) {
      const fieldCode = record?.fc?.value;   // e.g. "q39"
      const title     = record?.str?.value;
      if (!fieldCode || !title) return;

      // q01〜q39 の番号を取得して先頭に付ける
      const num = parseInt(fieldCode.replace('q', ''), 10); // e.g. 39

      const fieldEl = document.querySelector('[data-field-code="' + fieldCode + '"]');
      if (!fieldEl) return;

      const titleEl = fieldEl.querySelector('.form-group-title, .field-title, label');
      if (!titleEl) return;

      titleEl.textContent = num + '. ' + title.trim();
    });

  } catch (e) {
    console.error('[cu5] radioタイトル更新エラー:', e);
  }
}

//整数、または小数点以下が1桁までの小数を許可する正規表現
function validateDecimal1(value) {
  // 正規表現の意味:
  // ^      : 文字列の先頭
  // -?     : 負の符号（あってもなくても良い）
  // \d+    : 1つ以上の数字
  // (\.\d)?: 小数点とそれに続く1つの数字（あってもなくても良い）
  // $      : 文字列の末尾
  const regex = /^-?\d+(\.\d)?$/;
  return regex.test(value);
}
const validateDecimal1Fields = [
'p07_1',
'p07_2',
];
function validateval1(value) {
  var h = Number(value);
  return(50 < h  && h < 150);
}
validateDecimal1Fields.forEach(fc => {
  formBridge.events.on('form.field.change.' + fc, function(context) {
    var ts = context.value;
    if(validateDecimal1(ts)) {
      if(fc == 'p07_1') {
        if(validateval1(ts)) {
          context.setFieldValueError(fc, null);
        } else {
          context.setFieldValueError(fc, '値を確認してください');
        }
      } else {
          context.setFieldValueError(fc, null);
      }
    } else {
        context.setFieldValueError(fc, '小数点第１位まで入力ください');
    }
    return context;
  });
});

/**
 * 年齢が4歳0ヶ月〜6歳0ヶ月の範囲内（両端を含む）かどうかを判定する
 * @param {string} birthStr - 生年月日 ('2020-04-01')
 * @param {string} measureStr - 測定日 ('2024-04-01')
 * @returns {boolean} 範囲内なら true
 */
const isTargetAgeRange = (birthStr, measure) => {
  if (!birthStr || !measureStr) return false;

  const birth = new Date(birthStr);
  //const measure = new Date(measureStr);
  //const measure = measureStr;

  // 1. 満年齢（年）の計算
  let years = measure.getFullYear() - birth.getFullYear();
  let months = measure.getMonth() - birth.getMonth();

  // 日付を見て月を調整
  if (months < 0 || (months === 0 && measure.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  
  // 日付の調整後の正確な月数（0〜11）
  //if (measure.getDate() < birth.getDate()) {
  //  months--;
  //  if (months < 0) {
  //    // 0ヶ月未満になった場合は前月の扱いに調整
  //    months = 11;
  //  }
  //}

  // 2. 判定ロジック
  // 4歳0ヶ月(48ヶ月) 〜 6歳0ヶ月(72ヶ月)
  const totalMonths = (years * 12) + months;

  return totalMonths >= 48 && totalMonths <= 72;
};

// --- 使用例 ---

formBridge.events.on('form.field.change.bd', function(context) {
  var ts = context.value;
  if(isTargetAgeRange(ts, new Date())) {
        context.setFieldValueError('bd', null);
  } else {
        context.setFieldValueError('bd', '値を確認してください');
  }
});


