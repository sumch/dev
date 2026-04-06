const ygr = [
'申請_審査状況',
'申請_1次審査',
'申請_2次審査',
'申請_係長審査',
'申請_修正指示日',
'申請_指摘事項',
];

const ggr = [
'実績審査_工事場所と同じか',
'実績審査_納税証明書',
'実績審査_身分証',
'実績審査_申請者と同じか',
'実績審査_領収書',
'実績審査_工事前後写真',
'実績審査_追加資料',
'実績審査_工事費が正しく入力されているか',
'実績_審査状況',
'実績_1次審査',
'実績_2次審査',
'実績_係長審査',
'実績_修正指示日',
'再修正',
'再修正指示日',
'実績_指摘事項',
];

const agr = [
'位置用住所',
'正規化住所',
'lat',
'lng',
'level',
'postcode',
'位置用住所2',
'正規化住所2',
'lat2',
'lng2',
'level2',
'postcode2',
];

const config1 = {
  content: { // フィールドの背景のスタイル
    backgroundColor: '#ffc0cb'	//pink	//'#98fb98'	'palegreen'
  },
};
const config2 = {
  content: { // フィールドの背景のスタイル
    backgroundColor: '#fffacd'	//'lemonchiffon'
  },
};
const config3 = {
  background: { // フィールドの背景のスタイル
    backgroundColor: '#4169e1'	//'royalblue darkblue'
  },
};

//
kintone.events.on(['app.record.edit.show'], function(event) {
  var record = event.record;
  ggr.forEach(fieldCode => {
    kintone.app.record.setFieldStyle(fieldCode, config1);
  });
  ygr.forEach(fieldCode => {
    kintone.app.record.setFieldStyle(fieldCode, config2);
  });
  agr.forEach(fieldCode => {
    kintone.app.record.setFieldStyle(fieldCode, config3);
  });
});

kintone.events.on(['app.record.detail.show'], function(event) {
  var record = event.record;
  ggr.forEach(fieldCode => {
    var el = kintone.app.record.getFieldElement(fieldCode);
    if (el) {
      el.style.backgroundColor = 'pink'		//'palegreen';
    }
  });
  ygr.forEach(fieldCode => {
    var el = kintone.app.record.getFieldElement(fieldCode);
    if (el) {
      el.style.backgroundColor = 'lemonchiffon';
    }
  });
  agr.forEach(fieldCode => {
    var el = kintone.app.record.getFieldElement(fieldCode);
    if (el) {
      el.style.backgroundColor = 'royalblue';
    }
  });
});



kintone.events.on("app.record.index.show", (event) => {
  // HTMLが描画されるのを少し待つ
  setTimeout(() => {
    const rows = document.querySelectorAll("table.recordlist-gaia tbody tr");

    event.records.forEach((record, index) => {
      if (record["status"].value === "無効" || record["status"].value === "取消") {
        const row = rows[index];
        if (row) {
          row.style.backgroundColor = "#bdbdbd"; // グレーに変更
        }
      }
      if (record["重複自動チェック"].value.length > 0) {
        const row = rows[index];
        if (row) {
          row.style.backgroundColor = "#ee82ee"; // violet
        }
      }
    });
  }, 100);
  return event;
});
