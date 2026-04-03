"use strict";
//					申請					実績
//					--------------------	--------------------	
//	label申請実績	申請					実績
//	labelポチッ		条件分岐で非表示		常に表示
//	labelポチッ		条件分岐で非表示		常に表示
//	cc01			初期値はい				
//	cc02			初期値はい				
//	cc03									初期値はいh
//	
//	公開
//					申請日=初期値、編集不可						
//											実績日=初期値、編集不可
//											
//											
//											
//											
//											
//											
//											
//											
//											

//--------------------------------------------------------
//申請額の合計
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
//function tsright(context, acode) {
//  const bu1 = document.querySelector('[data-vv-name="' + acode + '"]');
//  if (bu1) {
//    const bu2 = bu1.getElementsByClassName("el-input__inner");
//    if (bu2[0]) bu2[0].style.textAlign = "right";
//  }
//}
//入力がある場合
function tiright(context, acode) {
  const el = document.querySelector('[data-field-code="' + acode + '"]');
  if (!el) return;
  const input = el.querySelector('input');
  if (!input) return;
  input.style.textAlign = 'right';
  input.addEventListener('focus', function() {
    if (input.value == '0') input.value = '';
    input.selectionStart = input.selectionEnd = input.value.length;
    var rec = context.getRecord();
    if (rec[acode]) context.setFieldValue(acode, rec[acode].value);
  });
}

function txright(context) {
    tsright(context , '補助金申請額');
    tsright(context , '交付決定額');
    tsright(context , '交付算定額');
    tiright(context , '工事費総額_実績');
    
    tsright(context , 'Bsum');
    tsright(context , 'Csum');
    tsright(context , 'Esum');
    
    tiright(context , 'E01');
    tiright(context , 'E02');
    tiright(context , 'E03');
    tiright(context , 'E04');
    tiright(context , 'E05');
    tiright(context , 'E06');
    tiright(context , 'E07');
    tiright(context , 'E08');
    tiright(context , 'E09');
    tiright(context , 'E10');
    tiright(context , 'E11');
    tiright(context , 'E18');
    tiright(context , 'E19');
}

//--------------------------------------------------------
//金額の計算
  function pint(ts) {
    var ret = 0;
    if(ts) {
      ret = parseInt(ts);
    } else {
      
    }
    return ret;
  }


var sss = [];
var sss_master = [];

var kosodatefg = -1;
var sum = 0;
var Bsum = 0;
var Csum = 0;
var Esum = 0;
var sts;

function stsck(context) {
  if(typeof stsconst !== 'undefined' && stsconst == '申請') {
    return('申請');
  } else {
    if(typeof stsconst !== 'undefined' && stsconst == '修正') {
      var rec = context.getRecord();
      return(rec.status.value);
    } else {
      return('実績');
    }
  }
}

function m2csv(m) {
  if (!m) return '';
  var ss = '';
  for (let i = 0; i < m.length; i++) {
    ss = ss + m[i];
  }
  return(ss);
}
function getv(context, getcode, changedCode) {
  var rec = context.getRecord();
  if (getcode === changedCode) return context.value;
  if (!rec[getcode]) return '';   // ← フィールドが存在しない場合の保護
  return rec[getcode].value;
}
function calyen1(context, changedCode) {
  var j03 = getv(context, 'j03', changedCode);			//住宅の種別
  var jcat = '専用';
  if(j03 == '専用住宅') {
  } else {
    jcat = '併用';
  }
  
    
    var kB01 = getv(context, 'B01浴室',   changedCode)
    var kB03 = m2csv(getv(context, 'B03手すり',   changedCode));
    var kB04 = m2csv(getv(context, 'B04段差解消', changedCode));
    var kB05 = m2csv(getv(context, 'B05転倒防止', changedCode));
    var kB06 = m2csv(getv(context, 'B06通路拡幅', changedCode));
    var kB07 = m2csv(getv(context, 'B07昇降機',   changedCode));
    var kB08 = m2csv(getv(context, 'B08暖房機',   changedCode));
    var kB09 = m2csv(getv(context, 'B09洋便器',   changedCode));
    if(!!kB01) {
    var B01 = kB01.indexOf('B01');  if(B01 < 0) {sss['B01']=0;  context.setFieldValue('B01', 0); } else {sss['B01']=1;  context.setFieldValue('B01', 1); }
    var B02 = kB01.indexOf('B02');  if(B02 < 0) {sss['B02']=0;  context.setFieldValue('B02', 0); } else {sss['B02']=1;  context.setFieldValue('B02', 1); }
    }
    var B03 = kB03.indexOf('B03');  if(B03 < 0) {sss['B03']=0;  context.setFieldValue('B03', 0); } else {sss['B03']=1;  context.setFieldValue('B03', 1); }
    var B04 = kB04.indexOf('B04');  if(B04 < 0) {sss['B04']=0;  context.setFieldValue('B04', 0); } else {sss['B04']=1;  context.setFieldValue('B04', 1); }
    var B05 = kB05.indexOf('B05');  if(B05 < 0) {sss['B05']=0;  context.setFieldValue('B05', 0); } else {sss['B05']=1;  context.setFieldValue('B05', 1); }
    var B06 = kB06.indexOf('B06');  if(B06 < 0) {sss['B06']=0;  context.setFieldValue('B06', 0); } else {sss['B06']=1;  context.setFieldValue('B06', 1); }
    var B07 = kB07.indexOf('B07');  if(B07 < 0) {sss['B07']=0;  context.setFieldValue('B07', 0); } else {sss['B07']=1;  context.setFieldValue('B07', 1); }
    var B08 = kB08.indexOf('B08');  if(B08 < 0) {sss['B08']=0;  context.setFieldValue('B08', 0); } else {sss['B08']=1;  context.setFieldValue('B08', 1); }
    var B09 = kB09.indexOf('B09');  if(B09 < 0) {sss['B09']=0;  context.setFieldValue('B09', 0); } else {sss['B09']=1;  context.setFieldValue('B09', 1); }
   
   if(kosodatefg < 0) {
                                                 sss['C01']=0;  context.setFieldValue('C01', 0);
                                                 sss['C02']=0;  context.setFieldValue('C02', 0);
                                                 sss['C03']=0;  context.setFieldValue('C03', 0);
                                                 sss['C04']=0;  context.setFieldValue('C04', 0);
                                                 sss['C05']=0;  context.setFieldValue('C05', 0);
                                                 sss['C06']=0;  context.setFieldValue('C06', 0);
                                                 sss['C07']=0;  context.setFieldValue('C07', 0);
                                                 sss['C08']=0;  context.setFieldValue('C08', 0);
                                                 sss['C09']=0;  context.setFieldValue('C09', 0);
                                                 sss['C10']=0;  context.setFieldValue('C10', 0);
                                                 sss['C11']=0;  context.setFieldValue('C11', 0);
                                                 sss['C12']=0;  context.setFieldValue('C12', 0);
                                                 sss['C13']=0;  context.setFieldValue('C13', 0);
   } else {
    var kC01 = m2csv(getv(context, 'C01部屋増築',     changedCode));
    var kC02 = m2csv(getv(context, 'C02部屋改修',     changedCode));
    var kC03 = m2csv(getv(context, 'C03衝突防止',     changedCode));
    var kC04 = m2csv(getv(context, 'C04落下防止',     changedCode));
    var kC05 = m2csv(getv(context, 'C05指はさみ防止', changedCode));
    var kC06 = m2csv(getv(context, 'C06進入閉込防止', changedCode));
    var kC07 = m2csv(getv(context, 'C07感電火傷防止', changedCode));
    var kC08 = m2csv(getv(context, 'C08対面キッチン', changedCode));
    var kC09 = m2csv(getv(context, 'C09LDK改修',      changedCode));
    var kC10 = m2csv(getv(context, 'C10食洗機',       changedCode));
    var kC11 = m2csv(getv(context, 'C11自動コンロ',   changedCode));
    var kC12 = m2csv(getv(context, 'C12レンジフード', changedCode));
    var kC13 = m2csv(getv(context, 'C13宅配ボックス', changedCode));
    var C01 = kC01.indexOf('C01');    if(C01 < 0) {sss['C01']=0;    context.setFieldValue('C01', 0); } else {sss['C01']=1;    context.setFieldValue('C01', 1); }
    var C02 = kC02.indexOf('C02-1');  if(C02 < 0) {sss['C02-1']=0;  context.setFieldValue('C02', 0); } else {sss['C02-1']=1;  context.setFieldValue('C02', 1); }
    var C02 = kC02.indexOf('C02-2');  if(C02 < 0) {sss['C02-2']=0;  context.setFieldValue('C02', 0); } else {sss['C02-2']=1;  context.setFieldValue('C02', 1); }
    var C02 = kC02.indexOf('C02-3');  if(C02 < 0) {sss['C02-3']=0;  context.setFieldValue('C02', 0); } else {sss['C02-3']=1;  context.setFieldValue('C02', 1); }
    var C02 = kC02.indexOf('C02-4');  if(C02 < 0) {sss['C02-4']=0;  context.setFieldValue('C02', 0); } else {sss['C02-4']=1;  context.setFieldValue('C02', 1); }
    var C02 = kC02.indexOf('C02-5');  if(C02 < 0) {sss['C02-5']=0;  context.setFieldValue('C02', 0); } else {sss['C02-5']=1;  context.setFieldValue('C02', 1); }
    var C03 = kC03.indexOf('C03');    if(C03 < 0) {sss['C03']=0;    context.setFieldValue('C03', 0); } else {sss['C03']=1;    context.setFieldValue('C03', 1); }
    var C04 = kC04.indexOf('C04');    if(C04 < 0) {sss['C04']=0;    context.setFieldValue('C04', 0); } else {sss['C04']=1;    context.setFieldValue('C04', 1); }
    var C05 = kC05.indexOf('C05');    if(C05 < 0) {sss['C05']=0;    context.setFieldValue('C05', 0); } else {sss['C05']=1;    context.setFieldValue('C05', 1); }
    var C06 = kC06.indexOf('C06');    if(C06 < 0) {sss['C06']=0;    context.setFieldValue('C06', 0); } else {sss['C06']=1;    context.setFieldValue('C06', 1); }
    var C07 = kC07.indexOf('C07');    if(C07 < 0) {sss['C07']=0;    context.setFieldValue('C07', 0); } else {sss['C07']=1;    context.setFieldValue('C07', 1); }
    var C08 = kC08.indexOf('C08');    if(C08 < 0) {sss['C08']=0;    context.setFieldValue('C08', 0); } else {sss['C08']=1;    context.setFieldValue('C08', 1); }
    var C09 = kC09.indexOf('C09');    if(C09 < 0) {sss['C09']=0;    context.setFieldValue('C09', 0); } else {sss['C09']=1;    context.setFieldValue('C09', 1); }
    var C10 = kC10.indexOf('C10');    if(C10 < 0) {sss['C10']=0;    context.setFieldValue('C10', 0); } else {sss['C10']=1;    context.setFieldValue('C10', 1); }
    var C11 = kC11.indexOf('C11');    if(C11 < 0) {sss['C11']=0;    context.setFieldValue('C11', 0); } else {sss['C11']=1;    context.setFieldValue('C11', 1); }
    var C12 = kC12.indexOf('C12');    if(C12 < 0) {sss['C12']=0;    context.setFieldValue('C12', 0); } else {sss['C12']=1;    context.setFieldValue('C12', 1); }
    var C13 = kC13.indexOf('C13');    if(C13 < 0) {sss['C13']=0;    context.setFieldValue('C13', 0); } else {sss['C13']=1;    context.setFieldValue('C13', 1); }

   }
    sss['E01'] = getv(context, 'E01', changedCode);
    sss['E02'] = getv(context, 'E02', changedCode);
    sss['E03'] = getv(context, 'E03', changedCode);
    sss['E04'] = getv(context, 'E04', changedCode);
    sss['E05'] = getv(context, 'E05', changedCode);
    sss['E06'] = getv(context, 'E06', changedCode);
    sss['E07'] = getv(context, 'E07', changedCode);
    sss['E08'] = getv(context, 'E08', changedCode);
    sss['E09'] = getv(context, 'E09', changedCode);
    sss['E10'] = getv(context, 'E10', changedCode);
    sss['E11'] = getv(context, 'E11', changedCode);
    var kE12 = getv(context, 'E12外壁', changedCode);
    if(!!kE12) {
    var E12 = kE12.indexOf('E12');  if(E12 < 0) {sss['E12']=0;  context.setFieldValue('E12', 0); } else {sss['E12']=1;  context.setFieldValue('E12', 1); }
    var E13 = kE12.indexOf('E13');  if(E13 < 0) {sss['E13']=0;  context.setFieldValue('E13', 0); } else {sss['E13']=1;  context.setFieldValue('E13', 1); }
    }
    var kE14 = getv(context, 'E14屋根天井', changedCode);
    if(!!kE14) {
    var E14 = kE14.indexOf('E14');  if(E14 < 0) {sss['E14']=0;  context.setFieldValue('E14', 0); } else {sss['E14']=1;  context.setFieldValue('E14', 1); }
    var E15 = kE14.indexOf('E15');  if(E15 < 0) {sss['E15']=0;  context.setFieldValue('E15', 0); } else {sss['E15']=1;  context.setFieldValue('E15', 1); }
    }
    var kE16 = getv(context, 'E16床', changedCode);
    if(!!kE16) {
    var E16 = kE16.indexOf('E16');  if(E16 < 0) {sss['E16']=0;  context.setFieldValue('E16', 0); } else {sss['E16']=1;  context.setFieldValue('E16', 1); }
    var E17 = kE16.indexOf('E17');  if(E17 < 0) {sss['E17']=0;  context.setFieldValue('E17', 0); } else {sss['E17']=1;  context.setFieldValue('E17', 1); }
    }
    sss['E18'] = getv(context, 'E18', changedCode);
    sss['E19'] = getv(context, 'E19', changedCode);
    
    
    
    
    sum = 0;
    Bsum = 0;
    Csum = 0;
    Esum = 0;
    for (let i = 0; i < sss_master.length; i++) {
      var s = sss_master[i]['項目']
      var n = kins2n(sss[s]);
      var k = sss_master[i][jcat];
      var kin = n * k;
      sum = sum + kin;
      if(s.indexOf('B') < 0) { ; } else {Bsum = Bsum + kin}
      if(s.indexOf('C') < 0) { ; } else {Csum = Csum + kin}
      if(s.indexOf('E') < 0) { ; } else {Esum = Esum + kin}
    }
    if(sum > 100000) {
      sum = 100000
    }
  if(stsck(context) == '申請') {
    context.setFieldValue('補助金申請額', kinn2s(sum));
  } else {
    var koji = 0
    koji = koji - 0 + kins2n(getv(context, '工事費_B01',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B02',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B03手すり',       changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B04段差解消',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B05転倒防止',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B06通路拡幅',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B07昇降機',       changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B08暖房機',       changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_B09洋便器',       changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C01部屋増築',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C02部屋改修',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C03衝突防止',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C04落下防止',     changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C05指はさみ防止', changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C06進入閉込防止', changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C07感電火傷防止', changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C08対面キッチン', changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C09LDK改修',      changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C10食洗機',       changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C11自動コンロ',   changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C12レンジフード', changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_C13宅配ボックス', changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E01',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E02',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E03',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E04',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E05',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E06',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E07',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E08',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E09',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E10',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E11',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E12',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E13',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E14',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E15',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E16',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E17',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E18',             changedCode));
    koji = koji - 0 + kins2n(getv(context, '工事費_E19',             changedCode));
    context.setFieldValue('工事費総額_実績', kinn2s(koji));

    var max1 = kins2n(getv(context, '交付決定額',             changedCode));
    context.setFieldValue('交付決定額', kinn2s(max1));
    
    if(sum > max1) {
      sum = max1;
    }
    context.setFieldValue('交付算定額', kinn2s(sum));
  }
    context.setFieldValue('Bsum', kinn2s(Bsum));
    context.setFieldValue('Csum', kinn2s(Csum));
    context.setFieldValue('Esum', kinn2s(Esum));


    txright(context);
    return context;
}






//--------------------------------------------------------
//工事場所
function copyaddr(context) {
  var rec = context.getRecord();
  if(rec.工事場所.value.length > 0) {
    context.setFieldValue('ap202', rec.ap10.value);
    context.setFieldValue('ap212', rec.ap11.value);
    context.setFieldValue('ap222', rec.ap12.value);
    context.setFieldValue('ap232', rec.ap13.value);
    context.setFieldValue('ap242', rec.ap14.value);
    context.setFieldValue('ap252', rec.ap15.value);
  }
}
//工事業者
function copyaddr2(context) {
  var rec = context.getRecord();
  if(rec.代行者情報をコピーする.value.length > 0) {
    // 【警告】ap361が新バージョンで使用不能な場合、setFieldValueを実行しても反映されない可能性があります。
    context.setFieldValue('ap361', rec.ap26.value);
  }
}

function adis2(context, fg) {
   adis(context,'C01部屋増築'    ,fg)
   adis(context,'C02部屋改修'    ,fg)
   adis(context,'C03衝突防止'    ,fg)
   adis(context,'C04落下防止'    ,fg)
   adis(context,'C05指はさみ防止',fg)
   adis(context,'C06進入閉込防止',fg)
   adis(context,'C07感電火傷防止',fg)
   adis(context,'C08対面キッチン',fg)
   adis(context,'C09LDK改修'     ,fg)
   adis(context,'C10食洗機'      ,fg)
   adis(context,'C11自動コンロ'  ,fg)
   adis(context,'C12レンジフード',fg)
   adis(context,'C13宅配ボックス',fg)
}
function adis3(context, fg) {
   ahid(context,'工事費_B01'    ,fg)
   ahid(context,'工事費_B02'    ,fg)
   //ahid(context,'工事費_B01浴室'    ,fg)
   //ahid(context,'工事費_B02浴室'    ,fg)
   ahid(context,'工事費_B03手すり'    ,fg)
   ahid(context,'工事費_B04段差解消'    ,fg)
   ahid(context,'工事費_B05転倒防止'    ,fg)
   ahid(context,'工事費_B06通路拡幅'    ,fg)
   ahid(context,'工事費_B07昇降機'    ,fg)
   ahid(context,'工事費_B08暖房機'    ,fg)
   ahid(context,'工事費_B09洋便器'    ,fg)
   ahid(context,'工事費_C01部屋増築'    ,fg)
   ahid(context,'工事費_C02部屋改修'    ,fg)
   ahid(context,'工事費_C03衝突防止'    ,fg)
   ahid(context,'工事費_C04落下防止'    ,fg)
   ahid(context,'工事費_C05指はさみ防止'    ,fg)
   ahid(context,'工事費_C06進入閉込防止'    ,fg)
   ahid(context,'工事費_C07感電火傷防止'    ,fg)
   ahid(context,'工事費_C08対面キッチン'    ,fg)
   ahid(context,'工事費_C09LDK改修'    ,fg)
   ahid(context,'工事費_C10食洗機'    ,fg)
   ahid(context,'工事費_C11自動コンロ'    ,fg)
   ahid(context,'工事費_C12レンジフード'    ,fg)
   ahid(context,'工事費_C13宅配ボックス'    ,fg)
   ahid(context,'工事費_E01'    ,fg)
   ahid(context,'工事費_E02'    ,fg)
   ahid(context,'工事費_E03'    ,fg)
   ahid(context,'工事費_E04'    ,fg)
   ahid(context,'工事費_E05'    ,fg)
   ahid(context,'工事費_E06'    ,fg)
   ahid(context,'工事費_E07'    ,fg)
   ahid(context,'工事費_E08'    ,fg)
   ahid(context,'工事費_E09'    ,fg)
   ahid(context,'工事費_E10'    ,fg)
   ahid(context,'工事費_E11'    ,fg)
   ahid(context,'工事費_E12'    ,fg)
   ahid(context,'工事費_E13'    ,fg)
   ahid(context,'工事費_E14'    ,fg)
   ahid(context,'工事費_E15'    ,fg)
   ahid(context,'工事費_E16'    ,fg)
   ahid(context,'工事費_E17'    ,fg)
   ahid(context,'工事費_E18'    ,fg)
   ahid(context,'工事費_E19'    ,fg)
}

function kosodateexe(context) {
    var rec = context.getRecord();
    var setai = Array.isArray(context.value) ? context.value : rec['補助対象世帯'].value;
    var setai2 = m2csv(setai);
    kosodatefg = setai2.indexOf('子育て');
    if (kosodatefg < 0) {
        adis2(context, true);   // 子育て世帯なし → C01〜C13 編集不可
    } else {
        adis2(context, false);  // 子育て世帯あり → C01〜C13 編集可能
    }
}
//--------------------------------------------------------
// イベント登録

const changeFields = [
    'j03', '補助対象世帯', '工事場所', '代行者情報をコピーする',
    'B01浴室', 'B03手すり', 'B04段差解消', 'B05転倒防止', 'B06通路拡幅', 'B07昇降機', 'B08暖房機', 'B09洋便器',
    'C01部屋増築', 'C02部屋改修', 'C03衝突防止', 'C04落下防止', 'C05指はさみ防止', 'C06進入閉込防止', 'C07感電火傷防止', 'C08対面キッチン', 'C09LDK改修', 'C10食洗機', 'C11自動コンロ', 'C12レンジフード', 'C13宅配ボックス',
    'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11', 'E12外壁', 'E14屋根天井', 'E16床', 'E18', 'E19',
    '工事費_B01', '工事費_B02', '工事費_B03手すり', '工事費_B04段差解消', '工事費_B05転倒防止', '工事費_B06通路拡幅', '工事費_B07昇降機', '工事費_B08暖房機', '工事費_B09洋便器',
    '工事費_C01部屋増築', '工事費_C02部屋改修', '工事費_C03衝突防止', '工事費_C04落下防止', '工事費_C05指はさみ防止', '工事費_C06進入閉込防止', '工事費_C07感電火傷防止', '工事費_C08対面キッチン', '工事費_C09LDK改修', '工事費_C10食洗機', '工事費_C11自動コンロ', '工事費_C12レンジフード', '工事費_C13宅配ボックス',
    '工事費_E01', '工事費_E02', '工事費_E03', '工事費_E04', '工事費_E05', '工事費_E06', '工事費_E07', '工事費_E08', '工事費_E09', '工事費_E10', '工事費_E11', '工事費_E12', '工事費_E13', '工事費_E14', '工事費_E15', '工事費_E16', '工事費_E17', '工事費_E18', '工事費_E19'
];

changeFields.forEach(code => {
    formBridge.events.on('form.field.change.' + code, (context) => {
        // 値の参照は context.value を使用
        const value = context.value;
        if (code === '補助対象世帯') kosodateexe(context);
        if (code === '工事場所') copyaddr(context);
        if (code === '代行者情報をコピーする') copyaddr2(context);
        calyen1(context, code);
        return context;
    });
});

formBridge.events.on('form.field.change.cbポチッ', (context) => {
    const value = context.value;
    context.setFieldValue('cc01', ['はい']);
    context.setFieldValue('cc02', ['はい']);
    context.setFieldValue('cc03', ['はい']);
    return context;
});

function adis_all(context, fg) {
  for (let j = 1; j < context.fields.length; j++){
      context.fields[j].editable = fg;
  }
}

// ----------------------------------------
// バリデーション（旧meigi.jsのfb.addValidatorsを移植）
// ----------------------------------------

// 名義人：半角カタカナチェック（meigi.jsと重複するが念のため）

// 補助金申請額：10,000円以上
formBridge.events.on('form.field.change.補助金申請額', (context) => {
  if (stsck(context) === '申請') {
    if (kins2n(context.value) < 10000) {
      context.setFieldValueError('補助金申請額', '10000円以上でなければなりません');
    } else {
      context.setFieldValueError('補助金申請額', null);
    }
  }
  return context;
});

// 交付算定額：10,000円以上（実績時）
formBridge.events.on('form.field.change.交付算定額', (context) => {
  if (stsck(context) !== '申請') {
    if (kins2n(context.value) < 10000) {
      context.setFieldValueError('交付算定額', '10000円以上でなければなりません');
    } else {
      context.setFieldValueError('交付算定額', null);
    }
  }
  return context;
});

// 工事費総額_実績：交付算定額以上（実績時）
formBridge.events.on('form.field.change.工事費総額_実績', (context) => {
  if (stsck(context) !== '申請') {
    var rec = context.getRecord();
    if (kins2n(context.value) < kins2n(rec['交付算定額'].value)) {
      context.setFieldValueError('工事費総額_実績', '工事費総額は交付算定額以上としてください');
    } else {
      context.setFieldValueError('工事費総額_実績', null);
    }
  }
  return context;
});

// C02部屋改修：複数選択不可
formBridge.events.on('form.field.change.C02部屋改修', (context) => {
  if (Array.isArray(context.value) && context.value.length > 1) {
    context.setFieldValueError('C02部屋改修', '複数選択できません。');
  } else {
    context.setFieldValueError('C02部屋改修', null);
  }
  return context;
});

// 日付バリデーション（申請時）
formBridge.events.on('form.field.change.着手予定日', (context) => {
  if (stsck(context) === '申請') {
    var day1 = context.value;
    var day2 = new Date('2026/3/13');
    var today = new Date();
    if (!day1 || day1 < today || day1 > day2) {
      context.setFieldValueError('着手予定日', '2026年3月13日までの日付を再設定ください');
    } else {
      context.setFieldValueError('着手予定日', null);
    }
  }
  return context;
});

formBridge.events.on('form.field.change.完了予定日', (context) => {
  if (stsck(context) === '申請') {
    var day1 = context.value;
    var day2 = new Date('2026/3/13');
    var today = new Date();
    if (!day1 || day1 < today || day1 > day2) {
      context.setFieldValueError('完了予定日', '2026年3月13日までの日付を再設定ください');
    } else {
      context.setFieldValueError('完了予定日', null);
    }
  }
  return context;
});


/* --------------------------------------------------------
   フォーム画面遷移時
   -------------------------------------------------------- */
formBridge.events.on('form.show', async (context) => {
 var rec = context.getRecord();
 if(typeof stsconst2 !== 'undefined' && stsconst2 == '市') {
 } else {
      //2026年3月14日以降入力禁止
  //var date0 = new Date(2026, 3-1, 14, 0, 0, 0);
      //2025年11月11日以降入力禁止
  //var date0 = new Date(2025, 11-1, 11, 0, 0, 0);
  var date0 = new Date(2026, 3-1, 14, 0, 0, 0);
  var today = new Date();
  if(today.getTime() >date0.getTime()) {
        ahid(context,'label_登録期間', false);
        adis_all(context,  false);
  } else {
      //2025年10月14日～2025年11月4日8:30まで入力禁止
    var date2 = new Date(2025, 10-1, 13, 0, 0, 0);
    if(today.getTime() >date2.getTime()) {
      
      //----------------------
      var date3 = new Date(2025, 11-1, 4, 8, 30, 0);
      if(date3.getTime() > today.getTime() ) {
        ahid(context,'label_登録期間', false);
        adis_all(context,  false);
      } else {
        ahid(context,'label_登録期間', true);
      }
    } else {
      //2025年4月17日8:30まで入力禁止
      ahid(context,'label_登録期間', true);
      var date1 = new Date(2025, 4-1, 17, 8, 30, 0);
    //  var date1 = new Date(2025, 4-1, 1, 1, 8, 30);
      if(date1.getTime() > today.getTime() ) {
        ahid(context,'label_登録期間', false);
        adis_all(context,  false);
      } else {
        ahid(context,'label_登録期間', true);
      }
    }
  }
 }
  if(typeof stsconst !== 'undefined' && stsconst == '申請') {
  } else if(typeof stsconst !== 'undefined' && stsconst == '実績') {
  const bu1 = document.querySelector('[data-vv-name="cbポチッ"]');
  if (bu1) {
    const bu2 = bu1.getElementsByClassName("el-checkbox__original");
    if (bu2[0]) bu2[0].value = "実績入力はじめます";
  }
  }
  
  if(typeof stsconst !== 'undefined') {
    if(stsconst == '申請') {
     context.setFieldValue('status', "申請");
    } else if(stsconst == '実績') {
     context.setFieldValue('status', "実績");
    } else {
     sts = rec.status.value;
    }
  }
   kosodateexe(context);


 if(typeof stsconst2 !== 'undefined' && stsconst2 == '市') {
  context.setFieldValue('cc01', ['はい']);
  context.setFieldValue('cc02', ['はい']);
  context.setFieldValue('cc03', ['はい']);
  if(stsconst == '申請') {
   ahid(context,'labelポチッ',true);	//非表示
   ahid(context,'cbポチッ',true);		//非表示
   ahid(context,'受付番号',false);	//表示
   adis(context,'受付番号',true);		//編集可
   adis(context,'申請日',true);		//編集可
   ahid(context,'実績報告日',true);	//非表示
   adis(context,'実績報告日',true);	//編集可
   ahid(context,'交付決定日',true);	//非表示
   adis(context,'交付決定日',false);	//編集不可
   adis3(context,true);
  } else if(stsconst == '実績') {
   ahid(context,'labelポチッ',false);	//表示
   ahid(context,'cbポチッ',false);	//表示
   ahid(context,'受付番号',false);	//表示
   adis(context,'受付番号',false);	//編集不可
   adis(context,'申請日',false);		//編集不可
   ahid(context,'実績報告日',false);	//表示
   adis(context,'実績報告日',true);	//編集可
   ahid(context,'交付決定日',false);	//表示
   adis(context,'交付決定日',false);	//編集不可
   adis(context,'j03',false);				//住宅　編集不可
   adis(context,'j04',false);				//住宅　編集不可
   adis(context,'補助対象世帯',false);	//住宅　編集不可
   adis3(context,false);
   
   adis(context,'ap17',false);	//編集不可 申請者_氏名
   adis(context,'ap17f',false);	//編集不可 申請者_ふりがな
   adis(context,'工事場所',false);//編集不可 工事場所
   adis(context,'ap202',false);	//編集不可 工事場所_郵便番号
   adis(context,'ap212',false);	//編集不可 工事場所_住所_県
   adis(context,'ap222',false);	//編集不可 工事場所_住所_市町村区
   adis(context,'ap232',false);	//編集不可 工事場所_住所_町域
   adis(context,'ap242',false);	//編集不可 工事場所_住所_番地
   adis(context,'ap252',false);	//編集不可 工事場所_住所_方書
  } else {
    sts = rec.status.value;
   ahid(context,'labelポチッ',false);	//表示
   ahid(context,'cbポチッ',false);	//表示
   ahid(context,'受付番号',false);	//表示
   adis(context,'受付番号',false);	//編集不可
   adis(context,'申請日',false);		//編集不可
   ahid(context,'交付決定日',false);	//表示
   adis(context,'交付決定日',false);	//編集不可
   adis(context,'j03',false);				//住宅　編集不可
   adis(context,'j04',false);				//住宅　編集不可
   adis(context,'補助対象世帯',false);	//住宅　編集不可
   ahid(context,'cc01',true);	//非表示
   ahid(context,'cc02',true);	//非表示
   ahid(context,'cc03',true);	//非表示
    if(sts == '申請') {
   ahid(context,'実績報告日',true);	//非表示
   adis(context,'実績報告日',true);	//編集可
   adis3(context,true);
    } else {
   ahid(context,'実績報告日',false);	//表示
   adis(context,'実績報告日',true);	//編集可
   adis3(context,false);
    }
  }
 } else {
   //代行
  if(typeof stsconst !== 'undefined' && stsconst == '申請') {
   ahid(context,'labelポチッ',true);	//非表示
   ahid(context,'cbポチッ',true);		//非表示
   ahid(context,'受付番号',true);		//非表示
   adis(context,'受付番号',false);	//編集不可
   adis(context,'申請日',false);		//編集不可
   adis(context,'実績報告日',false);	//編集不可
   ahid(context,'交付決定日',true);	//非表示
   adis(context,'交付決定日',false);	//編集不可
   adis3(context,true);
  } else {
   context.setFieldValue('実績報告日', new Date());
   ahid(context,'labelポチッ',false);	//表示
   ahid(context,'cbポチッ',false);	//表示
   ahid(context,'受付番号',false);	//表示
   adis(context,'受付番号',false);	//編集不可
   adis(context,'申請日',false);		//編集不可
   adis(context,'実績報告日',false);	//編集不可
   ahid(context,'交付決定日',false);	//表示
   adis(context,'交付決定日',false);	//編集不可

   adis(context,'ap17',false);	//編集不可
   adis(context,'ap17f',false);	//編集不可
   adis(context,'bd1',false);		//編集不可
   adis(context,'bdtext',false);	//編集不可
   adis(context,'工事場所',false);//編集不可
   adis(context,'ap202',false);	//編集不可
   adis(context,'ap212',false);	//編集不可
   adis(context,'ap222',false);	//編集不可
   adis(context,'ap232',false);	//編集不可
   adis(context,'ap242',false);	//編集不可
   adis(context,'ap252',false);	//編集不可
   adis(context,'j03',false);				//住宅　編集不可
   adis(context,'j04',false);				//住宅　編集不可
   adis(context,'補助対象世帯',false);	//住宅　編集不可


   ahid(context,'label代行者情報',true);		//非表示
   ahid(context,'kviewer_lookup_1',true);		//非表示
   ahid(context,'ap27',true);		//非表示
   ahid(context,'ap27f',true);		//非表示
   ahid(context,'ap20',true);		//非表示
   ahid(context,'ap21',true);		//非表示
   ahid(context,'ap22',true);		//非表示
   ahid(context,'ap23',true);		//非表示
   ahid(context,'ap24',true);		//非表示
   ahid(context,'ap25',true);		//非表示
   ahid(context,'ap26',true);		//非表示
   ahid(context,'ap28',true);		//非表示
   ahid(context,'ap29',true);		//非表示
   adis3(context,false);

  }
 }
  
  var mn = rec.名義人.value;
  if(!mn && typeof zenkana2Hankana === 'function' && typeof hiraToKana === 'function') {
    var nf = zenkana2Hankana(hiraToKana(rec.ap17f.value));
    context.setFieldValue('名義人', nf);
  }

    //----------------
    context.setFieldValue('okfg', 'ok');
    await axios.get('https://f1762abc.viewer.kintoneapp.com/public/api/records/a9a61879c2024d8de00a414fb71e7ba107149bea09257823382f3a52112c437d/1',
        { }).then(response => {
      var ssm = [];
      ssm = response.data.records;
      sss_master = [];
      for (let i = 0; i < ssm.length; i++) {
        var sm = [];
        sm['項目'] = ssm[i].項目.value;
        sm['専用'] = ssm[i].補助単価専用住宅.value;
        sm['併用'] = ssm[i].補助単価併用住宅.value;
        sss_master.push(sm);
      }
    }).catch(response => console.log(response))
    //----------------
    calyen1(context, '');
    return context;
});