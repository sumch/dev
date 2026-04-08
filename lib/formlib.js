
//--------------------------------------
function css_ini(context) {
  // クラス名に "p-[10px]" を含むすべての要素を取得
  // Tailwindの特殊文字 "[" "]" をエスケープして指定
  var targetElements = document.querySelectorAll('.p-\\[10px\\]');
  targetElements.forEach(function(el) {
    // インラインスタイルでパディングを 4px に上書き
    el.style.padding = '4px';
    // クラス名自体を完全に置き換えたい場合は以下も併記
    el.classList.remove('p-[10px]');
    el.classList.add('p-[4px]');
  });

  // クラス名「m-2.5」を持つすべての要素を取得
  targetElements = document.querySelectorAll('.m-2\\.5');
  targetElements.forEach(function(el) {
    // マージンの値を 4px に変更
    el.style.margin = '4px';
  });
  // ★追加：FormBridgeが挿入する白背景をクリアして body の背景を見せる
  const bg = document.querySelector('.fb-custom--background');
  if (bg) bg.style.backgroundColor = 'transparent';
}

//--------------------------------------

function clabel(context,acode,txt) {
  ahid(context, acode, fg);
}
function ahid(context, acode, fg) {
  const el = document.querySelector('[data-field-code=' + acode + ']');
  if(fg) {
      el.style.display = 'none'; // 非表示にする
  } else {
      el.style.display = ''; // 表示にする
  }
}
function adis_all(context, fg) {
  const record = formBridge.fn.getRecord();
  Object.keys(record).forEach(function(fieldCode ) {
    adis(context, fieldCode , true);
  });
}

function adis(context, acode, fg) {
  const el = document.querySelector('[data-field-code=' + acode + ']');
  // 要素内の input, textarea, select をすべて取得
  const inputs = el.querySelectorAll('input, textarea, select');
  
  // 1. 物理的なロック（クリックを禁止にする）
  el.style.pointerEvents = fg ? 'none' : 'auto';
  
  // 2. button と、select 全てを染める
  const targets = el.querySelectorAll('button, select, input, textarea');
  
  targets.forEach(target => {
    if (fg) {
      // button要素の背景色をグレーに強制上書き
      target.style.setProperty('background-color', '#c0c0c0', 'important');
      target.style.setProperty('background', '#c0c0c0', 'important');
      // 枠線の色も変えるとより無効感が出ます
      target.style.setProperty('border-color', '#dcdcdc', 'important');
    } else {
      // 解除時は元の白（bg-white）に戻す
      target.style.setProperty('background-color', '#ffffff', 'important');
      target.style.setProperty('background', '#ffffff', 'important');
      target.style.setProperty('border-color', '', '');
    }
    
    // 要素自体の無効化属性
    target.disabled = fg;
  });
}

//ゼロインサーション
function n00(num) {
  return ( '00' + num ).slice( -2 );
}
function p00(num) {
  return 'f' + n00(num);
}


//金額用　→数値にする
function kins2n(s) {
  if(!s) {
    s = 0;
  } else {
    if(isNaN(s)) {
      s = s.replace(/,/g, '')
    } else {
      s = s - 0
      s = String(s)
    }
  }
  return (s-0);
}
//金額用　→文字にする
function kinn2s(s) {
  if(isNaN(s)) {
    s = "0"
  } else {
    s = s - 0
    s = String(s)
  }
  s = s.replace(/,/g, '')
  s = (s-0).toLocaleString();
  if(s == 0) {
    s = '0';
  }
  return s;
}


//金額の入力欄を右詰めにする
//編集禁止の場合
function tsright(context,acode) {
  const el = document.querySelector('[data-field-code=' + acode + ']');
  if (el) {
    const input = el.querySelector('input');
    if (input) {
      // 入力ボックスを右詰めに設定
      input.style.textAlign = 'right';
    }
  }
}

//金額入力用
function kininput(context, acode, fs) {
  if (fs.match(/^[0-9,]*$/)) {
    context.setFieldValueError(acode, null);
    var k1n = Number(fs.replace(/,/g, ""))-0;
    var k1s = k1n.toLocaleString();
    context.preventDefault();
    context.setFieldValue(acode, k1s);
    tsright(context, acode);
  } else {
    // カタカナ以外が含まれる場合はエラー
    context.preventDefault();
    //context.setFieldValueError(acode, '半角数字、カンマ「,」で入力してください。');
  }
}




formBridge.events.on('form.show', function (context) {
  css_ini(context);
});
