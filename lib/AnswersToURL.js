// 対象とするフィールドコード
const PARAM_KEY = "answers";
//const fbfc = [
//  "id", "受付番号", "p00_2", "p00_3", "p00_4", "p00_6", "p00_5",
//];

/**
 * 配列をURL安全な文字列に変換（Base64）
 * ✅ 純粋な変換関数に修正（context への依存を除去）
 */
const encodeToParam = (answersArray) => {
  try {
    const jsonStr = JSON.stringify(answersArray);
    const base64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16)) // ✅ '0x' + p1 より parseInt(p1, 16) が明示的
      )
    );
    return encodeURIComponent(base64);
  } catch (e) {
    console.error("encodeToParam エラー:", e);
    return "";
  }
};

/**
 * URLパラメータから配列を復元
 */
const decodeFromParam = () => {
  const params = new URLSearchParams(window.location.search);
  const data = params.get(PARAM_KEY);
  if (!data) return null;
  try {
    const decoded = decodeURIComponent(data);
    const jsonStr = decodeURIComponent(escape(atob(decoded)));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("decodeFromParam エラー:", e);
    return null;
  }
};

// 1. 送信時に現在の回答内容からURLパラメータを生成
formBridge.events.on('form.submit', function(context) {
  const rec = context.getRecord();

  const currentValues = fbfc.map(code => rec[code].value); // ✅ 不要な変数代入を削除

  const paramValue = encodeToParam(currentValues);

  // ✅ setFieldValue の呼び出しを encodeToParam の外（正しいスコープ）に移動
  context.setFieldValue(PARAM_KEY, paramValue);

  const resultURL = `${window.location.origin}${window.location.pathname}?${PARAM_KEY}=${paramValue}`;
  console.log("再現用URL:", resultURL);
});

// 2. フォーム表示時にURLパラメータから値を再現
function formshow_AnswersToURL(context) {
  const restoredData = decodeFromParam();

  if (restoredData && Array.isArray(restoredData)) {
    fbfc.forEach((code, index) => {
      const value = restoredData[index];
      if (value !== undefined) {
        context.setFieldValue(code, value);
      }
    });
    console.log("URLパラメータから値を復元・セットしました");
    kana_ini(context);
  }
);
