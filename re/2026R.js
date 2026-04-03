"use strict";
//					申請					実績
//					--------------------	--------------------	
//	label申請実績	申請					実績
//	labelポチッ		条件分岐で非表示		常に表示
//	labelポチッ		条件分岐で非表示		常に表示
//	cc01			初期値はい				
//	cc02			初期値はい				
//	cc03									初期値はい
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
function tsright(state,acode) {
  const bu1 = document.querySelector('[data-vv-name=' + acode + ']');
  const bu2 = bu1.getElementsByClassName("el-input__inner");
  bu2[0].style.textAlign = "right";
}
//入力がある場合
function tiright(state,acode) {
  const bu1 = document.querySelector('[data-vv-name=' + acode + ']');
  const bu2 = bu1.getElementsByClassName("el-input__inner");
  bu2[0].style.textAlign = "right";
  $(bu2).on({
    "focus": function(e) {
      var num = $(this).val();
      if(num == '0') {
        $(this).val('');
      } else {
      }
      bu2[0].selectionStart = bu2[0].selectionEnd = bu2[0].value.length;
      bu2[0].value = bu2[0].value;
      state.record[acode].value = state.record[acode].value;
    }
  });
}

function txright(state) {
    tsright(state , '補助金申請額');
    tsright(state , '交付決定額');
    tsright(state , '交付算定額');
    tiright(state , '工事費総額_実績');
    tiright(state , '領収金額_実績');
    
    tsright(state , 'Bsum');
    tsright(state , 'Csum');
    tsright(state , 'Esum');
    
    tiright(state , 'E01');
    tiright(state , 'E02');
    tiright(state , 'E03');
    tiright(state , 'E04');
    tiright(state , 'E05');
    tiright(state , 'E06');
    tiright(state , 'E07');
    tiright(state , 'E08');
    tiright(state , 'E09');
    tiright(state , 'E10');
    tiright(state , 'E11');
    tiright(state , 'E18');
    tiright(state , 'E19');
}

//--------------------------------------------------------
function ahid(state,acode,fg) {
    for (let j = 0; j < state.fields.length; j++){
      if(state.fields[j].code == acode) {
        state.fields[j].hide = fg;
      }
    }
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

function stsck(state) {
  if(stsconst == '申請') {
    return('申請');
  } else {
    if(stsconst == '修正') {
      return(state.record.status.value);
    } else {
      return('実績');
    }
  }
}
//    fb.addValidators = function(state) {
//        return {
//            c02ent_validation: {
//                // エラーメッセージ内容
//                getMessage: function(fieldCode, params) {
//                    return '複数選択できません。';
//                },
//                // エラー判定条件
//                validate: function(value, params) {
//                    var m = state.record.C02部屋改修.value;
//                    if(m.length > 1) {
//                        return false;
//                    } else {
//                        return true;
//                    }
//                }
//            },
//        }
//    }
//    fb.events.form.created = [function(state) {
//        // 全フィールドからエラーを出したいフィールドを検索
//        state.fields.filter(function(field) {
//            // エラーを出したいフィールド
//            return field.code === 'C02部屋改修';
//        })[0].validations.push({
//            params: [],
//            rule: 'c02ent_validation'
//        });
//    }];


function m2csv(m) {
  var ss = '';
  for (let i = 0; i < m.length; i++) {
    ss = ss + m[i];
  }
  return(ss);
}

function calyen1(state) {
  var j03 = state.record.j03.value;			//住宅の種別
  var jcat = '専用';
  if(j03 == '専用住宅') {
  } else {
    jcat = '併用';
  }
  
    
    var kB01 = state.record.B01浴室.value
    var kB03 = m2csv(state.record.B03手すり.value);
    var kB04 = m2csv(state.record.B04段差解消.value);
    var kB05 = m2csv(state.record.B05転倒防止.value);
    var kB06 = m2csv(state.record.B06通路拡幅.value);
    var kB07 = m2csv(state.record.B07昇降機.value);
    var kB08 = m2csv(state.record.B08暖房機.value);
    var kB09 = m2csv(state.record.B09洋便器.value);
    if(!!kB01) {
    var B01 = kB01.indexOf('B01');  if(B01 < 0) {sss['B01']=0;  state.record.B01.value = 0; } else {sss['B01']=1;  state.record.B01.value = 1; }
    var B02 = kB01.indexOf('B02');  if(B02 < 0) {sss['B02']=0;  state.record.B02.value = 0; } else {sss['B02']=1;  state.record.B02.value = 1; }
    }
    var B03 = kB03.indexOf('B03');  if(B03 < 0) {sss['B03']=0;  state.record.B03.value = 0; } else {sss['B03']=1;  state.record.B03.value = 1; }
    var B04 = kB04.indexOf('B04');  if(B04 < 0) {sss['B04']=0;  state.record.B04.value = 0; } else {sss['B04']=1;  state.record.B04.value = 1; }
    var B05 = kB05.indexOf('B05');  if(B05 < 0) {sss['B05']=0;  state.record.B05.value = 0; } else {sss['B05']=1;  state.record.B05.value = 1; }
    var B06 = kB06.indexOf('B06');  if(B06 < 0) {sss['B06']=0;  state.record.B06.value = 0; } else {sss['B06']=1;  state.record.B06.value = 1; }
    var B07 = kB07.indexOf('B07');  if(B07 < 0) {sss['B07']=0;  state.record.B07.value = 0; } else {sss['B07']=1;  state.record.B07.value = 1; }
    var B08 = kB08.indexOf('B08');  if(B08 < 0) {sss['B08']=0;  state.record.B08.value = 0; } else {sss['B08']=1;  state.record.B08.value = 1; }
    var B09 = kB09.indexOf('B09');  if(B09 < 0) {sss['B09']=0;  state.record.B09.value = 0; } else {sss['B09']=1;  state.record.B09.value = 1; }
   
   if(kosodatefg < 0) {
                                                 sss['C01']=0;  state.record.C01.value = 0;
                                                 sss['C02']=0;  state.record.C02.value = 0;
                                                 sss['C03']=0;  state.record.C03.value = 0;
                                                 sss['C04']=0;  state.record.C04.value = 0;
                                                 sss['C05']=0;  state.record.C05.value = 0;
                                                 sss['C06']=0;  state.record.C06.value = 0;
                                                 sss['C07']=0;  state.record.C07.value = 0;
                                                 sss['C08']=0;  state.record.C08.value = 0;
                                                 sss['C09']=0;  state.record.C09.value = 0;
                                                 sss['C10']=0;  state.record.C10.value = 0;
                                                 sss['C11']=0;  state.record.C11.value = 0;
                                                 sss['C12']=0;  state.record.C12.value = 0;
                                                 sss['C13']=0;  state.record.C13.value = 0;
   } else {
    var kC01 = m2csv(state.record.C01部屋増築.value);
    var kC02 = m2csv(state.record.C02部屋改修.value);
    var kC03 = m2csv(state.record.C03衝突防止.value);
    var kC04 = m2csv(state.record.C04落下防止.value);
    var kC05 = m2csv(state.record.C05指はさみ防止.value);
    var kC06 = m2csv(state.record.C06進入閉込防止.value);
    var kC07 = m2csv(state.record.C07感電火傷防止.value);
    var kC08 = m2csv(state.record.C08対面キッチン.value);
    var kC09 = m2csv(state.record.C09LDK改修.value);
    var kC10 = m2csv(state.record.C10食洗機.value);
    var kC11 = m2csv(state.record.C11自動コンロ.value);
    var kC12 = m2csv(state.record.C12レンジフード.value);
    var kC13 = m2csv(state.record.C13宅配ボックス.value);
    var C01 = kC01.indexOf('C01');    if(C01 < 0) {sss['C01']=0;    state.record.C01.value = 0; } else {sss['C01']=1;    state.record.C01.value = 1; }
    var C02 = kC02.indexOf('C02-1');  if(C02 < 0) {sss['C02-1']=0;  state.record.C02.value = 0; } else {sss['C02-1']=1;  state.record.C02.value = 1; }
    var C02 = kC02.indexOf('C02-2');  if(C02 < 0) {sss['C02-2']=0;  state.record.C02.value = 0; } else {sss['C02-2']=1;  state.record.C02.value = 1; }
    var C02 = kC02.indexOf('C02-3');  if(C02 < 0) {sss['C02-3']=0;  state.record.C02.value = 0; } else {sss['C02-3']=1;  state.record.C02.value = 1; }
    var C02 = kC02.indexOf('C02-4');  if(C02 < 0) {sss['C02-4']=0;  state.record.C02.value = 0; } else {sss['C02-4']=1;  state.record.C02.value = 1; }
    var C02 = kC02.indexOf('C02-5');  if(C02 < 0) {sss['C02-5']=0;  state.record.C02.value = 0; } else {sss['C02-5']=1;  state.record.C02.value = 1; }
    var C03 = kC03.indexOf('C03');    if(C03 < 0) {sss['C03']=0;    state.record.C03.value = 0; } else {sss['C03']=1;    state.record.C03.value = 1; }
    var C04 = kC04.indexOf('C04');    if(C04 < 0) {sss['C04']=0;    state.record.C04.value = 0; } else {sss['C04']=1;    state.record.C04.value = 1; }
    var C05 = kC05.indexOf('C05');    if(C05 < 0) {sss['C05']=0;    state.record.C05.value = 0; } else {sss['C05']=1;    state.record.C05.value = 1; }
    var C06 = kC06.indexOf('C06');    if(C06 < 0) {sss['C06']=0;    state.record.C06.value = 0; } else {sss['C06']=1;    state.record.C06.value = 1; }
    var C07 = kC07.indexOf('C07');    if(C07 < 0) {sss['C07']=0;    state.record.C07.value = 0; } else {sss['C07']=1;    state.record.C07.value = 1; }
    var C08 = kC08.indexOf('C08');    if(C08 < 0) {sss['C08']=0;    state.record.C08.value = 0; } else {sss['C08']=1;    state.record.C08.value = 1; }
    var C09 = kC09.indexOf('C09');    if(C09 < 0) {sss['C09']=0;    state.record.C09.value = 0; } else {sss['C09']=1;    state.record.C09.value = 1; }
    var C10 = kC10.indexOf('C10');    if(C10 < 0) {sss['C10']=0;    state.record.C10.value = 0; } else {sss['C10']=1;    state.record.C10.value = 1; }
    var C11 = kC11.indexOf('C11');    if(C11 < 0) {sss['C11']=0;    state.record.C11.value = 0; } else {sss['C11']=1;    state.record.C11.value = 1; }
    var C12 = kC12.indexOf('C12');    if(C12 < 0) {sss['C12']=0;    state.record.C12.value = 0; } else {sss['C12']=1;    state.record.C12.value = 1; }
    var C13 = kC13.indexOf('C13');    if(C13 < 0) {sss['C13']=0;    state.record.C13.value = 0; } else {sss['C13']=1;    state.record.C13.value = 1; }

   }
    sss['E01'] = state.record.E01.value;
    sss['E02'] = state.record.E02.value;
    sss['E03'] = state.record.E03.value;
    sss['E04'] = state.record.E04.value;
    sss['E05'] = state.record.E05.value;
    sss['E06'] = state.record.E06.value;
    sss['E07'] = state.record.E07.value;
    sss['E08'] = state.record.E08.value;
    sss['E09'] = state.record.E09.value;
    sss['E10'] = state.record.E10.value;
    sss['E11'] = state.record.E11.value;
    var kE12 = state.record.E12外壁.value
    if(!!kE12) {
    var E12 = kE12.indexOf('E12');  if(E12 < 0) {sss['E12']=0;  state.record.E12.value = 0; } else {sss['E12']=1;  state.record.E12.value = 1; }
    var E13 = kE12.indexOf('E13');  if(E13 < 0) {sss['E13']=0;  state.record.E13.value = 0; } else {sss['E13']=1;  state.record.E13.value = 1; }
    }
    var kE14 = state.record.E14屋根天井.value
    if(!!kE14) {
    var E14 = kE14.indexOf('E14');  if(E14 < 0) {sss['E14']=0;  state.record.E14.value = 0; } else {sss['E14']=1;  state.record.E14.value = 1; }
    var E15 = kE14.indexOf('E15');  if(E15 < 0) {sss['E15']=0;  state.record.E15.value = 0; } else {sss['E15']=1;  state.record.E15.value = 1; }
    }
    var kE16 = state.record.E16床.value
    if(!!kE16) {
    var E16 = kE16.indexOf('E16');  if(E16 < 0) {sss['E16']=0;  state.record.E16.value = 0; } else {sss['E16']=1;  state.record.E16.value = 1; }
    var E17 = kE16.indexOf('E17');  if(E17 < 0) {sss['E17']=0;  state.record.E17.value = 0; } else {sss['E17']=1;  state.record.E17.value = 1; }
    }
    sss['E18'] = state.record.E18.value;
    sss['E19'] = state.record.E19.value;
    
    
    
    
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
  if(stsck(state) == '申請') {
    state.record.補助金申請額.value = kinn2s(sum);
  } else {
    var koji = 0
    koji = koji - 0 + kins2n(state.record.工事費_B01.value);
    koji = koji - 0 + kins2n(state.record.工事費_B02.value);
    koji = koji - 0 + kins2n(state.record.工事費_B03手すり.value);
    koji = koji - 0 + kins2n(state.record.工事費_B04段差解消.value);
    koji = koji - 0 + kins2n(state.record.工事費_B05転倒防止.value);
    koji = koji - 0 + kins2n(state.record.工事費_B06通路拡幅.value);
    koji = koji - 0 + kins2n(state.record.工事費_B07昇降機.value);
    koji = koji - 0 + kins2n(state.record.工事費_B08暖房機.value);
    koji = koji - 0 + kins2n(state.record.工事費_B09洋便器.value);
    koji = koji - 0 + kins2n(state.record.工事費_C01部屋増築.value);
    koji = koji - 0 + kins2n(state.record.工事費_C02部屋改修.value);
    koji = koji - 0 + kins2n(state.record.工事費_C03衝突防止.value);
    koji = koji - 0 + kins2n(state.record.工事費_C04落下防止.value);
    koji = koji - 0 + kins2n(state.record.工事費_C05指はさみ防止.value);
    koji = koji - 0 + kins2n(state.record.工事費_C06進入閉込防止.value);
    koji = koji - 0 + kins2n(state.record.工事費_C07感電火傷防止.value);
    koji = koji - 0 + kins2n(state.record.工事費_C08対面キッチン.value);
    koji = koji - 0 + kins2n(state.record.工事費_C09LDK改修.value);
    koji = koji - 0 + kins2n(state.record.工事費_C10食洗機.value);
    koji = koji - 0 + kins2n(state.record.工事費_C11自動コンロ.value);
    koji = koji - 0 + kins2n(state.record.工事費_C12レンジフード.value);
    koji = koji - 0 + kins2n(state.record.工事費_C13宅配ボックス.value);
    koji = koji - 0 + kins2n(state.record.工事費_E01.value);
    koji = koji - 0 + kins2n(state.record.工事費_E02.value);
    koji = koji - 0 + kins2n(state.record.工事費_E03.value);
    koji = koji - 0 + kins2n(state.record.工事費_E04.value);
    koji = koji - 0 + kins2n(state.record.工事費_E05.value);
    koji = koji - 0 + kins2n(state.record.工事費_E06.value);
    koji = koji - 0 + kins2n(state.record.工事費_E07.value);
    koji = koji - 0 + kins2n(state.record.工事費_E08.value);
    koji = koji - 0 + kins2n(state.record.工事費_E09.value);
    koji = koji - 0 + kins2n(state.record.工事費_E10.value);
    koji = koji - 0 + kins2n(state.record.工事費_E11.value);
    koji = koji - 0 + kins2n(state.record.工事費_E12.value);
    koji = koji - 0 + kins2n(state.record.工事費_E13.value);
    koji = koji - 0 + kins2n(state.record.工事費_E14.value);
    koji = koji - 0 + kins2n(state.record.工事費_E15.value);
    koji = koji - 0 + kins2n(state.record.工事費_E16.value);
    koji = koji - 0 + kins2n(state.record.工事費_E17.value);
    koji = koji - 0 + kins2n(state.record.工事費_E18.value);
    koji = koji - 0 + kins2n(state.record.工事費_E19.value);
    state.record.工事費総額_実績.value = kinn2s(koji)

    var max1 = kins2n(state.record.交付決定額.value);
    state.record.交付決定額.value = kinn2s(max1);
    
    if(sum > max1) {
      sum = max1;
    }
    state.record.交付算定額.value = kinn2s(sum);
  }
    state.record.Bsum.value = kinn2s(Bsum);
    state.record.Csum.value = kinn2s(Csum);
    state.record.Esum.value = kinn2s(Esum);
    state.record.BCE.value = state.record.Bsum.value + ' / ' + state.record.Csum.value + ' / ' + state.record.Esum.value;


    txright(state);
}






//--------------------------------------------------------
//工事場所
function copyaddr(state) {
  if(state.record.工事場所.value.length > 0) {
    state.record.ap202.value = state.record.ap10.value
    state.record.ap212.value = state.record.ap11.value
    state.record.ap222.value = state.record.ap12.value
    state.record.ap232.value = state.record.ap13.value
    state.record.ap242.value = state.record.ap14.value
    state.record.ap252.value = state.record.ap15.value
  }
}
//居住中
function copyaddr3(state) {
  if(state.record.居住中.value == 'はい') {
    state.record.ap202.value = state.record.ap10.value
    state.record.ap212.value = state.record.ap11.value
    state.record.ap222.value = state.record.ap12.value
    state.record.ap232.value = state.record.ap13.value
    state.record.ap242.value = state.record.ap14.value
    state.record.ap252.value = state.record.ap15.value
  }
}
//工事業者
function copyaddr2(state) {
  if(state.record.代行者情報をコピーする.value.length > 0) {
    state.record.ap361.value = state.record.ap26.value
  }
}

function adis2(state,fg) {
   adis(state,'C01部屋増築'    ,fg)
   adis(state,'C02部屋改修'    ,fg)
   adis(state,'C03衝突防止'    ,fg)
   adis(state,'C04落下防止'    ,fg)
   adis(state,'C05指はさみ防止',fg)
   adis(state,'C06進入閉込防止',fg)
   adis(state,'C07感電火傷防止',fg)
   adis(state,'C08対面キッチン',fg)
   adis(state,'C09LDK改修'     ,fg)
   adis(state,'C10食洗機'      ,fg)
   adis(state,'C11自動コンロ'  ,fg)
   adis(state,'C12レンジフード',fg)
   adis(state,'C13宅配ボックス',fg)
}
function adis3(state,fg) {
   ahid(state,'工事費_B01'    ,fg)
   ahid(state,'工事費_B02'    ,fg)
   //ahid(state,'工事費_B01浴室'    ,fg)
   //ahid(state,'工事費_B02浴室'    ,fg)
   ahid(state,'工事費_B03手すり'    ,fg)
   ahid(state,'工事費_B04段差解消'    ,fg)
   ahid(state,'工事費_B05転倒防止'    ,fg)
   ahid(state,'工事費_B06通路拡幅'    ,fg)
   ahid(state,'工事費_B07昇降機'    ,fg)
   ahid(state,'工事費_B08暖房機'    ,fg)
   ahid(state,'工事費_B09洋便器'    ,fg)
   ahid(state,'工事費_C01部屋増築'    ,fg)
   ahid(state,'工事費_C02部屋改修'    ,fg)
   ahid(state,'工事費_C03衝突防止'    ,fg)
   ahid(state,'工事費_C04落下防止'    ,fg)
   ahid(state,'工事費_C05指はさみ防止'    ,fg)
   ahid(state,'工事費_C06進入閉込防止'    ,fg)
   ahid(state,'工事費_C07感電火傷防止'    ,fg)
   ahid(state,'工事費_C08対面キッチン'    ,fg)
   ahid(state,'工事費_C09LDK改修'    ,fg)
   ahid(state,'工事費_C10食洗機'    ,fg)
   ahid(state,'工事費_C11自動コンロ'    ,fg)
   ahid(state,'工事費_C12レンジフード'    ,fg)
   ahid(state,'工事費_C13宅配ボックス'    ,fg)
   ahid(state,'工事費_E01'    ,fg)
   ahid(state,'工事費_E02'    ,fg)
   ahid(state,'工事費_E03'    ,fg)
   ahid(state,'工事費_E04'    ,fg)
   ahid(state,'工事費_E05'    ,fg)
   ahid(state,'工事費_E06'    ,fg)
   ahid(state,'工事費_E07'    ,fg)
   ahid(state,'工事費_E08'    ,fg)
   ahid(state,'工事費_E09'    ,fg)
   ahid(state,'工事費_E10'    ,fg)
   ahid(state,'工事費_E11'    ,fg)
   ahid(state,'工事費_E12'    ,fg)
   ahid(state,'工事費_E13'    ,fg)
   ahid(state,'工事費_E14'    ,fg)
   ahid(state,'工事費_E15'    ,fg)
   ahid(state,'工事費_E16'    ,fg)
   ahid(state,'工事費_E17'    ,fg)
   ahid(state,'工事費_E18'    ,fg)
   ahid(state,'工事費_E19'    ,fg)
}

function kosodateexe(state) {
    var setai = state.record.補助対象世帯.value
    var setai2 = m2csv(setai);
    kosodatefg = setai2.indexOf('子育て');
   if(kosodatefg < 0) {
      adis2(state,false)
   } else {
      adis2(state,true)
   }
}

//--------------------------------------------------------
  fb.events.fields['j03'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['補助対象世帯'].changed = [function (state) {
    kosodateexe(state);
    calyen1(state);
  }];
  
  fb.events.fields['工事場所'].changed = [function (state) {  copyaddr(state);  }];
  fb.events.fields['居住中'].changed = [function (state) {  copyaddr3(state);  }];
  fb.events.fields['代行者情報をコピーする'].changed = [function (state) {  copyaddr2(state);  }];
  
  fb.events.fields['B01浴室'        ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B03手すり'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B04段差解消'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B05転倒防止'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B06通路拡幅'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B07昇降機'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B08暖房機'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['B09洋便器'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C01部屋増築'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C02部屋改修'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C03衝突防止'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C04落下防止'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C05指はさみ防止'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C06進入閉込防止'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C07感電火傷防止'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C08対面キッチン'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C09LDK改修'     ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C10食洗機'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C11自動コンロ'  ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C12レンジフード'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['C13宅配ボックス'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E01'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E02'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E03'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E04'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E05'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E06'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E07'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E08'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E09'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E10'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E11'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E12外壁'        ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E14屋根天井'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E16床'          ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E18'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['E19'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B01'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B02'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B03手すり'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B04段差解消'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B05転倒防止'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B06通路拡幅'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B07昇降機'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B08暖房機'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_B09洋便器'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C01部屋増築'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C02部屋改修'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C03衝突防止'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C04落下防止'    ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C05指はさみ防止'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C06進入閉込防止'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C07感電火傷防止'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C08対面キッチン'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C09LDK改修'     ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C10食洗機'      ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C11自動コンロ'  ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C12レンジフード'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_C13宅配ボックス'].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E01'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E02'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E03'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E04'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E05'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E06'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E07'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E08'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E09'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E10'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E11'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E12'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E13'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E14'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E15'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E16'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E17'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E18'            ].changed = [function (state) {  calyen1(state);  }];
  fb.events.fields['工事費_E19'            ].changed = [function (state) {  calyen1(state);  }];

  fb.events.fields['領収金額_実績'         ].changed = [function (state) {
    state.record.領収金額_実績.value = kinn2s(kins2n(state.record.領収金額_実績.value))
  }];


  fb.events.fields['cbポチッ'            ].changed = [function (state) {
    state.record.cc01.value[0] = 'はい';
    state.record.cc02.value[0] = 'はい';
    state.record.cc03.value[0] = 'はい';
  }];

function adis_all(state,fg) {
  for (let j = 1; j < state.fields.length; j++){
      state.fields[j].editable = fg;
  }
}

/* --------------------------------------------------------
   フォーム画面遷移時
   -------------------------------------------------------- */
fb.events.form.mounted = [async function (state) {
 if(stsconst2 == '市') {
 } else {
    const url = 'https://f1762abc.viewer.kintoneapp.com/public/api/records/097fc03ec6016e8285b5e970bbec041d41b1fd3e5d785093c90d4cdafe612afe/1';
    await axios.get(url,  { }).then(response => {
    // 一つでも期間内（start <= now <= end）があればtrue
    const now = new Date();
    const isAvailable = response.data.records.some(rd => {
      const start = new Date(rd.start.value);
      const end = new Date(rd.end.value);
      return now >= start && now <= end;
    });

    // 状態の更新
    if (isAvailable) {
      ahid(state, 'label_登録期間', true);
    } else {
      ahid(state, 'label_登録期間', false);
      adis_all(state, false);
    }
    }).catch(response => console.log(response))

 }
  if(stsconst == '申請') {
    state.record.居住中.value = '';
  } else if(stsconst == '実績') {
  const bu1 = document.querySelector('[data-vv-name=' + 'cbポチッ' + ']');
  const bu2 = bu1.getElementsByClassName("el-checkbox__original");
  bu2[0].value = "実績入力はじめます";
  }
  
  if(stsconst == '申請') {
   state.record.status.value = "申請";
  } else if(stsconst == '実績') {
   state.record.status.value = "実績";
  } else {
   sts = state.record.status.value;
  }
   kosodateexe(state);


 if(stsconst2 == '市') {
  state.record.cc01.value[0] = 'はい';
  state.record.cc02.value[0] = 'はい';
  state.record.cc03.value[0] = 'はい';
  if(stsconst == '申請') {
   ahid(state,'labelポチッ',true);	//非表示
   ahid(state,'cbポチッ',true);		//非表示
   ahid(state,'受付番号',false);	//表示
   adis(state,'受付番号',true);		//編集可
   adis(state,'申請日',true);		//編集可
   ahid(state,'実績報告日',true);	//非表示
   adis(state,'実績報告日',true);	//編集可
   ahid(state,'交付決定日',true);	//非表示
   adis(state,'交付決定日',false);	//編集不可
   adis3(state,true);
  } else if(stsconst == '実績') {
   ahid(state,'labelポチッ',false);	//表示
   ahid(state,'cbポチッ',false);	//表示
   ahid(state,'受付番号',false);	//表示
   adis(state,'受付番号',false);	//編集不可
   adis(state,'申請日',false);		//編集不可
   ahid(state,'実績報告日',false);	//表示
   adis(state,'実績報告日',true);	//編集可
   ahid(state,'交付決定日',false);	//表示
   adis(state,'交付決定日',false);	//編集不可
   adis(state,'j03',false);				//住宅　編集不可
   adis(state,'j04',false);				//住宅　編集不可
   adis(state,'補助対象世帯',false);	//住宅　編集不可
   adis3(state,false);
   
   adis(state,'ap17',false);	//編集不可 申請者_氏名
   adis(state,'ap17f',false);	//編集不可 申請者_ふりがな
   adis(state,'居住中',false);//編集不可
   adis(state,'工事場所',false);//編集不可 工事場所
   adis(state,'ap202',false);	//編集不可 工事場所_郵便番号
   adis(state,'ap212',false);	//編集不可 工事場所_住所_県
   adis(state,'ap222',false);	//編集不可 工事場所_住所_市町村区
   adis(state,'ap232',false);	//編集不可 工事場所_住所_町域
   adis(state,'ap242',false);	//編集不可 工事場所_住所_番地
   adis(state,'ap252',false);	//編集不可 工事場所_住所_方書
  } else {
    sts = state.record.status.value;
   ahid(state,'labelポチッ',false);	//表示
   ahid(state,'cbポチッ',false);	//表示
   ahid(state,'受付番号',false);	//表示
   adis(state,'受付番号',false);	//編集不可
   adis(state,'申請日',false);		//編集不可
   ahid(state,'交付決定日',false);	//表示
   adis(state,'交付決定日',false);	//編集不可
   adis(state,'j03',false);				//住宅　編集不可
   adis(state,'j04',false);				//住宅　編集不可
   adis(state,'補助対象世帯',false);	//住宅　編集不可
   ahid(state,'cc01',true);	//非表示
   ahid(state,'cc02',true);	//非表示
   ahid(state,'cc03',true);	//非表示
    if(sts == '申請') {
   ahid(state,'実績報告日',true);	//非表示
   adis(state,'実績報告日',true);	//編集可
   adis3(state,true);
    } else {
   ahid(state,'実績報告日',false);	//表示
   adis(state,'実績報告日',true);	//編集可
   adis3(state,false);
    }
  }
 } else {
   //代行
  if(stsconst == '申請') {
   ahid(state,'labelポチッ',true);	//非表示
   ahid(state,'cbポチッ',true);		//非表示
   ahid(state,'受付番号',true);		//非表示
   adis(state,'受付番号',false);	//編集不可
   adis(state,'申請日',false);		//編集不可
   adis(state,'実績報告日',false);	//編集不可
   ahid(state,'交付決定日',true);	//非表示
   adis(state,'交付決定日',false);	//編集不可
   adis3(state,true);
  } else {
   state.record.実績報告日.value = new Date();
   ahid(state,'labelポチッ',false);	//表示
   ahid(state,'cbポチッ',false);	//表示
   ahid(state,'受付番号',false);	//表示
   adis(state,'受付番号',false);	//編集不可
   adis(state,'申請日',false);		//編集不可
   adis(state,'実績報告日',false);	//編集不可
   ahid(state,'交付決定日',false);	//表示
   adis(state,'交付決定日',false);	//編集不可

   adis(state,'ap17',false);	//編集不可
   adis(state,'ap17f',false);	//編集不可
   adis(state,'bd1',false);		//編集不可
   adis(state,'bdtext',false);	//編集不可
   adis(state,'居住中',false);//編集不可
   adis(state,'工事場所',false);//編集不可
   adis(state,'ap202',false);	//編集不可
   adis(state,'ap212',false);	//編集不可
   adis(state,'ap222',false);	//編集不可
   adis(state,'ap232',false);	//編集不可
   adis(state,'ap242',false);	//編集不可
   adis(state,'ap252',false);	//編集不可
   adis(state,'j03',false);				//住宅　編集不可
   adis(state,'j04',false);				//住宅　編集不可
   adis(state,'補助対象世帯',false);	//住宅　編集不可


   ahid(state,'label代行者情報',true);		//非表示
   ahid(state,'kviewer_lookup_1',true);		//非表示
   ahid(state,'ap27',true);		//非表示
   ahid(state,'ap27f',true);		//非表示
   ahid(state,'ap20',true);		//非表示
   ahid(state,'ap21',true);		//非表示
   ahid(state,'ap22',true);		//非表示
   ahid(state,'ap23',true);		//非表示
   ahid(state,'ap24',true);		//非表示
   ahid(state,'ap25',true);		//非表示
   ahid(state,'ap26',true);		//非表示
   ahid(state,'ap28',true);		//非表示
   ahid(state,'ap29',true);		//非表示
   adis3(state,false);

  }
 }
  
  var mn = state.record.名義人.value;
  if(!mn) {
    var nf = zenkana2Hankana(hiraToKana(state.record.ap17f.value));
    state.record.名義人.value = nf;
  }
    //---------------------------------
    //var dmaillogin = state.record['__kintoneAppAuthenticationEmail__'].value;
    //var dmail = state.record.代表メールアドレス.value;
    //if(!dmail) {
    //  //代表者の設定がないケース
    //  if(status2 == '実績') {
    //    ahid(state,'実績報告します',false);
    //    ahid(state,'申請します',true);
    //  } else {
    //    ahid(state,'実績報告します',true);
    //    ahid(state,'申請します',false);
    //  }
    //  
    //} else {
    //  //代表者の設定があるケース
    //  if(dmaillogin == dmail) {
    //    //代表者の場合
    //    state.record.代表者FG.value = 'yes';
    //    if(status2 == '実績') {
    //      ahid(state,'実績報告します',false);
    //      ahid(state,'申請します',true);
    //    } else {
    //      ahid(state,'実績報告します',true);
    //      ahid(state,'申請します',false);
    //    }
    //  } else {
    //    //代表者以外の場合
    //    ahid(state,'申請します',true);
    //    ahid(state,'実績報告します',true);
    //  }
    //}

    //----------------
    state.record.okfg.value = 'ok';
    await axios.get('https://f1762abc.viewer.kintoneapp.com/public/api/records/a9a61879c2024d8de00a414fb71e7ba107149bea09257823382f3a52112c437d/1',
        { }).then(response => {
      var ssm = [];
      ssm = response.data.records;
      for (let i = 0; i < ssm.length; i++) {
        var sm = [];
        sm['項目'] = ssm[i].項目.value;
        sm['専用'] = ssm[i].補助単価専用住宅.value;
        sm['併用'] = ssm[i].補助単価併用住宅.value;
        sss_master.push(sm);
      }
    }).catch(response => console.log(response))
    //----------------
    calyen1(state);
    return state;
}];

