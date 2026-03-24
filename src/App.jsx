/* eslint-disable */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserPlus, Users, Home, Share2, Phone, Bell, CheckCircle2, X, Wifi, Battery, Signal,
  Camera, Building2, Briefcase, UserCheck, LayoutGrid, Mail, Loader2, ChevronLeft,
  MessageCircle, Smartphone, CheckSquare, Square, ToggleLeft, ToggleRight, ShieldCheck,
  ChevronRight, CalendarDays, FileText, Plus, Edit2, MessageSquare,
  Coffee, CreditCard, Clock, MapPin, ChevronDown, ChevronUp, Hash
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

const safeGet = (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } };
const safeSet = (key, val) => { try { localStorage.setItem(key, val); } catch(e) { console.warn("Storage restricted"); } };

// ==========================================
// 💡 구글 Cloud Vision API 키 입력란 💡
// ==========================================
const GOOGLE_VISION_API_KEY = "여기에_발급받은_API_키를_넣으세요"; 
// 예시: "AIzaSyBxmt_FgriUrO_..."

let firebaseConfig;
try {
  firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyBxmt_FgriUrO_P_Xctb5-un2kEMauYRfo",
    authDomain: "reed-up-pro.firebaseapp.com",
    projectId: "reed-up-pro",
    storageBucket: "reed-up-pro.firebasestorage.app",
    messagingSenderId: "522503627879",
    appId: "1:522503627879:web:0daf3238b6673929c3e0c2",
    measurementId: "G-4B9MLBCXK0"
  };
} catch (e) {
  firebaseConfig = {
    apiKey: "AIzaSyBxmt_FgriUrO_P_Xctb5-un2kEMauYRfo",
    authDomain: "reed-up-pro.firebaseapp.com",
    projectId: "reed-up-pro",
    storageBucket: "reed-up-pro.firebasestorage.app",
    messagingSenderId: "522503627879",
    appId: "1:522503627879:web:0daf3238b6673929c3e0c2",
    measurementId: "G-4B9MLBCXK0"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'readup-pro-v1';

const GoogleAdPlaceholder = ({ type = 'banner', className = '' }) => {
  let sizeClass = 'h-[100px]'; 
  if (type === 'native') sizeClass = 'h-[250px]'; 
  if (type === 'infeed') sizeClass = 'h-[120px]'; 

  return (
    <div className={`bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 ${sizeClass} ${className}`}>
      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-2">
        <CreditCard size={16} className="text-slate-400" />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Google AdMob</p>
      <p className="text-[10px] font-bold text-slate-400 mt-1">구글 광고 영역</p>
    </div>
  );
};

const INSURANCE_DATA = { /* ... (기존과 동일하므로 길이상 중간 데이터 생략 없이 원래대로 모두 유지됨) ... */
  '생명보험': {
    '삼성생명': { color: '#005BAC', types: { '종신/정기': ['(무)삼성생명 다(多)모은 종신보험', '(무)삼성생명 든든플러스 종신보험', '(무)삼성생명 경영인정기보험', '(무)삼성생명 에이스 종신보험', '직접 입력'], '건강/암/간병': ['(무)삼성생명 백세시대 간병보험', '(무)삼성생명 다(多)모은 건강보험', '(무)삼성 치매보장보험', '(무)삼성생명 올인원 암보험', '직접 입력'], '연금/저축': ['(무)삼성 연금저축보험', '(무)삼성 인터넷 연금보험', '(무)삼성생명 모아모아 저축보험', '직접 입력'], '변액/기타': ['(무)변액유니버셜종신', '(무)삼성생명 변액연금보험', '(무)삼성생명 인덱스 펀드 연금', '직접 입력']}},
    '교보생명': { color: '#008240', types: { '종신/정기': ['(무)교보실속있는 평생든든종신보험', '(무)교보 종신보험', '(무)교보 가족든든 정기보험', '직접 입력'], '건강/암/간병': ['(무)교보건강보험(퍼펙트플러스)', '(무)교보내맘쏙건강보험', '(무)교보 치매간병보험', '(무)교보 괜찮아요 암보험', '직접 입력'], '연금/저축': ['(무)교보연금보험', '(무)교보 연금저축', '(무)교보 100세시대 연금보험', '직접 입력'], '변액/기타': ['(무)교보변액유니버셜', '(무)교보 변액연금보험', '직접 입력']}},
    '한화생명': { color: '#F37321', types: { '종신/정기': ['(무)한화생명 시그니처 종신보험', '(무)한화생명 경영인정기보험', '(무)한화생명 스페셜 종신보험', '직접 입력'], '건강/암/간병': ['(무)한화생명 누구나필요한 수술비건강보험', '(무)한화생명 시그니처 여성건강보험', '(무)한화생명 꼭맞춤 암보험', '직접 입력'], '연금/저축': ['(무)한화생명 e연금저축보험', '(무)스마트 연금보험', '(무)한화생명 내일의 연금보험', '직접 입력'], '변액/기타': ['(무)한화생명 변액유니버셜종신', '(무)한화생명 스마트 VUL', '직접 입력']}},
    '신한라이프': { color: '#0046FF', types: { '종신/정기': ['(무)신한케어종신보험', '(무)신한라이프 놀라운종신보험', '(무)신한더드림종신보험', '직접 입력'], '건강/암/간병': ['(무)신한홈케어암보험', '(무)신한 3대건강보험', '(무)신한라이프 놀라운 건강보험', '직접 입력'], '연금/저축': ['(무)신한연금미리받는종신', '(무)신한 참좋은 연금보험', '직접 입력'], '변액/기타': ['(무)신한 변액유니버셜', '(무)신한라이프 VIP 변액연금', '직접 입력']}},
    '동양생명': { color: '#008DD2', types: { '종신/정기': ['(무)수호천사종신보험', '(무)수호천사알뜰한종신보험', '(무)수호천사 경영인정기보험', '직접 입력'], '건강/암/간병': ['(무)수호천사내가만드는보장보험', '(무)수호천사암보험', '(무)수호천사 치매케어보험', '직접 입력'], '연금/저축': ['(무)수호천사연금보험', '(무)수호천사 더블업 저축보험', '직접 입력'], '변액/기타': ['(무)수호천사변액연금', '직접 입력']}},
    '흥국생명': { color: '#E6004C', types: { '종신/정기': ['(무)다재다능종신보험', '(무)흥국생명 우리가족종신보험', '(무)흥국생명 안심 정기보험', '직접 입력'], '건강/암/간병': ['(무)흥국생명 암보험', '(무)치매간병보험', '(무)흥국생명 다사랑건강보험', '직접 입력'], '연금/저축': ['(무)흥국생명 연금보험', '(무)흥국생명 드림저축보험', '직접 입력'], '변액/기타': ['(무)흥국생명 변액유니버셜종신', '(무)흥국생명 베스트 VUL', '직접 입력']}},
    'AIA생명': { color: '#D31145', types: { '종신/정기': ['(무)AIA바이탈리티 평생안심 종신', '(무)AIA 든든 정기보험', '직접 입력'], '건강/암/간병': ['(무)원스톱 100세 암보험', '(무)종합건강보험', '(무)AIA 꼭 필요한 건강보험', '직접 입력'], '연금/저축': ['(무)AIA 건강해지는 플러스 연금', '(무)AIA 골든타임 연금보험', '직접 입력'], '변액/기타': ['(무)AIA 변액유니버셜', '직접 입력']}},
    '라이나생명': { color: '#005EB8', types: { '종신/정기': ['(무)라이나 종신보험', '(무)라이나 정기보험', '직접 입력'], '건강/암/간병': ['(무)THE건강한치아보험', '(무)라이나플러스암보험', '(무)치매간병보험', '(무)라이나골라담는건강보험', '직접 입력'], '연금/저축': ['(무)라이나 연금보험', '직접 입력'], '변액/기타': ['직접 입력']}},
    'DB생명': { color: '#009044', types: { '종신/정기': ['(무)10년의약속종신보험', '(무)DB생명 알차고행복한플러스종신', '(무)DB 경영인 정기보험', '직접 입력'], '건강/암/간병': ['(무)백년친구암보험', '(무)DB생명 내가고른건강보험', '직접 입력'], '연금/저축': ['(무)DB생명 연금보험', '(무)DB생명 알찬저축보험', '직접 입력'], '변액/기타': ['(무)DB생명 변액유니버셜', '직접 입력']}},
    'KB라이프생명': { color: '#E5A700', types: { '종신/정기': ['(무)KB 100세만기 종신보험', '(무)KB라이프 든든한종신보험', '(무)KB라이프 경영인정기보험', '직접 입력'], '건강/암/간병': ['(무)KB라이프 암보험', '(무)KB라이프 3대질병 건강보험', '직접 입력'], '연금/저축': ['(무)KB연금보험', '(무)KB라이프 100세 연금', '직접 입력'], '변액/기타': ['(무)KB라이프 변액연금보험', '직접 입력']}},
    'KDB생명': { color: '#003A8C', types: { '종신/정기': ['(무)KDB종신보험', '(무)KDB버팀목종신보험', '직접 입력'], '건강/암/간병': ['(무)KDB암보험', '(무)KDB 간편가입 건강보험', '직접 입력'], '연금/저축': ['(무)KDB연금보험', '(무)KDB 미리받는 연금', '직접 입력'], '변액/기타': ['(무)KDB 변액유니버셜', '직접 입력']}},
    'NH농협생명': { color: '#00125B', types: { '종신/정기': ['(무)NH사랑종신보험', '(무)NH든든 정기보험', '직접 입력'], '건강/암/간병': ['(무)NH건강보험', '(무)NH암보험', '(무)NH치매간병보험', '직접 입력'], '연금/저축': ['(무)NH연금보험', '(무)NH농협생명 스마트저축보험', '직접 입력'], '변액/기타': ['(무)NH 변액유니버셜', '직접 입력']}},
    '미래에셋생명': { color: '#FF7F00', types: { '종신/정기': ['(무)미래에셋생명 변액유니버셜종신', '(무)미래에셋 정기보험', '직접 입력'], '건강/암/간병': ['(무)미래에셋 헬스케어건강보험', '(무)미래에셋 온라인암보험', '(무)미래에셋생명 치매케어', '직접 입력'], '연금/저축': ['(무)미래에셋생명 변액연금보험', '(무)미래에셋 스마트 연금', '직접 입력'], '변액/기타': ['(무)미래에셋생명 글로벌 자산배분 VUL', '직접 입력']}},
    '메트라이프생명': { color: '#0090D4', types: { '종신/정기': ['(무)메트라이프 변액종신보험', '(무)메트라이프 달러종신보험', '(무)메트라이프 유니버셜종신', '직접 입력'], '건강/암/간병': ['(무)메트라이프 360헬스 종합보장', '(무)메트라이프 암보험', '직접 입력'], '연금/저축': ['(무)메트라이프 달러연금보험', '직접 입력'], '변액/기타': ['(무)메트라이프 글로벌 VUL', '직접 입력']}},
    '푸본현대생명': { color: '#004C97', types: { '종신/정기': ['(무)푸본현대 ZERO 종신보험', '(무)푸본현대 정기보험', '직접 입력'], '건강/암/간병': ['(무)푸본현대 건강보험', '(무)푸본현대 암보험', '직접 입력'], '연금/저축': ['(무)푸본현대 연금보험', '직접 입력'], '변액/기타': ['직접 입력']}},
    'ABL생명': { color: '#E3000F', types: { '종신/정기': ['(무)ABL종신보험', '(무)ABL경영인정기보험', '직접 입력'], '건강/암/간병': ['(무)ABL건강보험', '(무)ABL치매간병보험', '직접 입력'], '연금/저축': ['(무)ABL스마트연금', '직접 입력'], '변액/기타': ['(무)ABL변액유니버셜종신', '직접 입력']}},
    'iM라이프(구 DGB)': { color: '#009744', types: { '종신/정기': ['(무)iM라이프 종신보험', '(무)iM라이프 정기보험', '직접 입력'], '건강/암/간병': ['(무)iM라이프 건강보험', '(무)iM라이프 암보험', '직접 입력'], '연금/저축': ['(무)iM라이프 연금보험', '직접 입력'], '변액/기타': ['(무)iM라이프 변액연금보험', '직접 입력']}},
    '처브라이프생명': { color: '#00B5E2', types: { '종신/정기': ['(무)처브라이프 종신보험', '(무)처브 정기보험', '직접 입력'], '건강/암/간병': ['(무)처브라이프 암보험', '(무)처브 치매보험', '직접 입력'], '연금/저축': ['(무)처브라이프 연금보험', '직접 입력'], '변액/기타': ['직접 입력']}},
    'BNP파리바카디프생명': { color: '#00915A', types: { '종신/정기': ['(무)카디프 신용생명보험', '직접 입력'], '건강/암/간병': ['(무)카디프 건강보험', '직접 입력'], '연금/저축': ['(무)카디프 변액연금보험', '직접 입력'], '변액/기타': ['(무)카디프 ETF변액', '직접 입력']}},
    '기타 생보사': { color: '#64748B', types: { '종신/정기': ['종신보험', '정기보험', '경영인정기보험', '직접 입력'], '건강/암/간병': ['건강보험', '암보험', '치매/간병보험', '직접 입력'], '연금/저축': ['연금보험', '연금저축보험', '저축보험', '직접 입력'], '변액/기타': ['변액유니버셜종신', '변액연금보험', '직접 입력']}}
  },
  '손해보험': {
    '삼성화재': { color: '#005BAC', types: { '종합/건강/실손': ['(무)삼성화재 건강보험 마이헬스파트너', '(무)삼성화재 다이렉트 실손의료비', '(무)삼성화재 간병보험', '(무)삼성화재 3대질병 보장보험', '직접 입력'], '운전자/자동차': ['애니카 자동차보험', '(무)안전운전 파트너(운전자)', '삼성화재 다이렉트 자동차보험', '직접 입력'], '어린이/태아': ['(무)마이슈퍼스타 어린이보험', '(무)삼성화재 다이렉트 어린이보험', '직접 입력'], '화재/재물/기타': ['(무)삼성화재 주택화재보험', '(무)삼성화재 배상책임보험', '(무)삼성화재 펫보험(애니펫)', '직접 입력']}},
    '현대해상': { color: '#F37321', types: { '종합/건강/실손': ['(무)퍼펙트플러스 종합보험', '(무)현대해상 실손의료비보험', '(무)간편한 333건강보험', '(무)현대해상 계속받는 암보험', '직접 입력'], '운전자/자동차': ['하이카 자동차보험', '(무)마음드림 운전자보험', '다이렉트 하이카', '직접 입력'], '어린이/태아': ['(무)굿앤굿 어린이종합보험Q', '(무)굿앤굿 어린이스타종합보험', '직접 입력'], '화재/재물/기타': ['(무)현대해상 화재보험', '(무)성공마스터 재산종합보험', '(무)하이펫보험', '직접 입력']}},
    'DB손해보험': { color: '#009044', types: { '종합/건강/실손': ['(무)참좋은 종합건강보험', '(무)프로미라이프 실손의료비', '(무)나에게 맞춘 건강보험', '(무)참좋은 훼밀리플러스 종합보험', '직접 입력'], '운전자/자동차': ['프로미카 자동차보험', '(무)참좋은 운전자상해보험', '다이렉트 프로미카', '직접 입력'], '어린이/태아': ['(무)아이러브플러스 건강보험(어린이)', '(무)참좋은 우리아이보험', '직접 입력'], '화재/재물/기타': ['(무)프로미라이프 화재보험', '(무)펫블리 반려견보험', '직접 입력']}},
    'KB손해보험': { color: '#E5A700', types: { '종합/건강/실손': ['(무)KB희망플러스 종합보험', '(무)KB 닥터플러스 건강보험', '(무)KB 실손의료비보험', '(무)KB 4세대 실손', '직접 입력'], '운전자/자동차': ['매직카 자동차보험', '(무)KB운전자상해보험', '다이렉트 매직카', '직접 입력'], '어린이/태아': ['(무)KB금쪽같은 자녀보험', '(무)KB 희망플러스 자녀보험', '직접 입력'], '화재/재물/기타': ['(무)KB홈앤비즈 케어종합보험', '(무)KB 금쪽같은 펫보험', '직접 입력']}},
    '메리츠화재': { color: '#E6002D', types: { '종합/건강/실손': ['(무)알파플러스 종합보험', '(무)메리츠 간편건강보험', '(무)메리츠 실손의료비', '(무)더좋은 3대질병보험', '직접 입력'], '운전자/자동차': ['(무)운전자보험 M-Drive', '메리츠 다이렉트 자동차보험', '(무)메리츠 안심 운전자', '직접 입력'], '어린이/태아': ['(무)내맘같은 어린이보험', '(무)메리츠 듬뿍담은 자녀보험', '직접 입력'], '화재/재물/기타': ['(무)메리츠 펫폼(반려동물)', '(무)올바른 주택화재보험', '(무)비즈니스 파트너 종합보험', '직접 입력']}},
    '한화손해보험': { color: '#F37321', types: { '종합/건강/실손': ['(무)마이라이프 건강보험', '(무)한화 실손의료보험', '(무)한화 굿밸런스 건강보험', '(무)한화 시그니처 3대건강', '직접 입력'], '운전자/자동차': ['차도리 자동차보험', '(무)한화 무배당 운전자보험', '다이렉트 차도리', '직접 입력'], '어린이/태아': ['(무)1등엄마 어린이보험', '(무)한화 아이블리 자녀보험', '직접 입력'], '화재/재물/기타': ['(무)한화 보금자리 화재보험', '(무)하얀미소 펫보험', '직접 입력']}},
    '흥국화재': { color: '#E6004C', types: { '종합/건강/실손': ['(무)행복을다주는 가족사랑보험', '(무)흥국화재 실손의료비', '(무)흥국화재 착한건강보험', '직접 입력'], '운전자/자동차': ['이유다이렉트 자동차보험', '(무)흥국화재 든든한 운전자보험', '직접 입력'], '어린이/태아': ['(무)흥국화재 맘편한 자녀사랑보험', '직접 입력'], '화재/재물/기타': ['(무)흥국화재 재물종합보험', '직접 입력']}},
    '롯데손해보험': { color: '#DA291C', types: { '종합/건강/실손': ['(무)더끌림 건강보험', '(무)롯데 실손의료비보험', '(무)렛스마일 종합건강보험', '직접 입력'], '운전자/자동차': ['렛클릭 자동차보험', '(무)안심케어 운전자보험', '직접 입력'], '어린이/태아': ['(무)도담도담 자녀보험', '(무)렛플레이 어린이보험', '직접 입력'], '화재/재물/기타': ['(무)렛마이라이프 펫보험', '(무)롯데 화재보험', '직접 입력']}},
    'NH농협손해보험': { color: '#00125B', types: { '종합/건강/실손': ['(무)헤아림 종합보험', '(무)NH가성비굿 건강보험', '(무)NH실손의료비보험', '직접 입력'], '운전자/자동차': ['(무)NH운전자보험', '(무)NH안전운전 파트너', '직접 입력'], '어린이/태아': ['(무)NH어린이보험', '(무)NH착한어린이보험', '직접 입력'], '화재/재물/기타': ['(무)NH올바른지구 대중교통안전보험', '(무)NH재물보험', '직접 입력']}},
    'MG손해보험': { color: '#00A651', types: { '종합/건강/실손': ['(무)건강명품 종합보험', '(무)MG실손의료비보험', '(무)MG원더풀 종합보험', '직접 입력'], '운전자/자동차': ['조이 자동차보험', '(무)MG하이패스 운전자보험', '직접 입력'], '어린이/태아': ['(무)아이조아 어린이보험', '직접 입력'], '화재/재물/기타': ['(무)MG성공도약 재물보험', '직접 입력']}},
    '하나손해보험': { color: '#008469', types: { '종합/건강/실손': ['(무)하나가득담은 건강보험', '(무)하나실손의료비보험', '(무)하나 Grade 건강보험', '직접 입력'], '운전자/자동차': ['에듀카 자동차보험', '(무)하나운전자보험', '직접 입력'], '어린이/태아': ['(무)하나가득담은 어린이보험', '직접 입력'], '화재/재물/기타': ['(무)하나 원데이 레저보험', '(무)하나 화재보험', '직접 입력']}},
    '캐롯손해보험': { color: '#FF4C00', types: { '종합/건강/실손': ['캐롯 직장인 건강보험', '직접 입력'], '운전자/자동차': ['퍼마일 자동차보험', '캐롯 운전자보험', '직접 입력'], '어린이/태아': ['직접 입력'], '화재/재물/기타': ['캐롯 폰케어 액정안심보험', '캐롯 스마트폰보험', '직접 입력']}},
    '카카오페이손해보험': { color: '#FFCD00', types: { '종합/건강/실손': ['카카오페이손보 실손의료비', '직접 입력'], '운전자/자동차': ['카카오페이손보 운전자보험', '직접 입력'], '어린이/태아': ['카카오페이손보 영유아보험', '직접 입력'], '화재/재물/기타': ['카카오페이손보 해외여행보험', '카카오페이손보 폰케어보험', '직접 입력']}},
    '신한EZ손해보험': { color: '#0046FF', types: { '종합/건강/실손': ['(무)신한EZ 건강보험', '직접 입력'], '운전자/자동차': ['(무)신한EZ 운전자보험', '직접 입력'], '어린이/태아': ['직접 입력'], '화재/재물/기타': ['(무)신한EZ 레저보험', '직접 입력']}},
    'AXA손해보험': { color: '#00008F', types: { '종합/건강/실손': ['(무)AXA 다이렉트 건강보험', '직접 입력'], '운전자/자동차': ['AXA 다이렉트 자동차보험', '(무)AXA 다이렉트 운전자보험', '직접 입력'], '어린이/태아': ['(무)AXA 다이렉트 자녀보험', '직접 입력'], '화재/재물/기타': ['(무)AXA 다이렉트 화재보험', '직접 입력']}},
    'AIG손해보험': { color: '#00A4E4', types: { '종합/건강/실손': ['(무)AIG 헬스케어보험', '직접 입력'], '운전자/자동차': ['직접 입력'], '어린이/태아': ['직접 입력'], '화재/재물/기타': ['(무)AIG 글로벌 기업보험', '(무)AIG 여행자보험', '직접 입력']}},
    '에이스손해보험(Chubb)': { color: '#00B5E2', types: { '종합/건강/실손': ['(무)Chubb 건강보험', '(무)Chubb 치아안심보험', '직접 입력'], '운전자/자동차': ['(무)Chubb 운전자보험', '직접 입력'], '어린이/태아': ['직접 입력'], '화재/재물/기타': ['(무)Chubb 여행자보험', '(무)Chubb 모바일 안심보험', '직접 입력']}},
    '기타 손보사': { color: '#64748B', types: { '종합/건강/실손': ['종합건강보험', '실손의료비보험', '간편심사보험', '직접 입력'], '운전자/자동차': ['자동차보험', '운전자보험', '직접 입력'], '어린이/태아': ['어린이/태아보험', '직접 입력'], '화재/재물/기타': ['주택화재보험', '일반화재보험', '펫보험', '직접 입력']}}
  }
};

const TEAM_MEMBERS = [
  { id: 1, name: "이현우", position: "차장", dept: "영업1팀", certs: "AFPK · 변액보험", isPublic: true },
  { id: 2, name: "박민호", position: "과장", dept: "영업1팀", certs: "", isPublic: false },
  { id: 3, name: "최유리", position: "대리", dept: "영업1팀", certs: "손해보험 · 제3보험", isPublic: true },
  { id: 4, name: "김동건", position: "부장", dept: "영업2팀", certs: "CFP", isPublic: true },
  { id: 5, name: "정수진", position: "팀장", dept: "본점 VIP라운지", certs: "", isPublic: false },
  { id: 6, name: "오영석", position: "과장", dept: "영업지원팀", certs: "생명보험", isPublic: true },
];

const CONTACT_TYPES = [
  { id: '통화', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: '메세지', icon: MessageCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: '카톡', icon: MessageSquare, color: 'text-yellow-700', bg: 'bg-[#FEE500]/20', border: 'border-yellow-400' },
  { id: '대면상담', icon: Coffee, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: '제안서', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: '미팅약속', icon: CalendarDays, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
];

const CERTIFICATIONS = ['생명보험', '손해보험', '제3보험', '변액보험', 'AFPK', 'CFP', '펀드투자권유대행인'];

export default function App() {
  const [user, setUser] = useState(null); 

  const [appState, setAppState] = useState('intro'); 
  const [activeTab, setActiveTab] = useState('home'); 
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const [customerTab, setCustomerTab] = useState('가망');
  const [customerDetailTab, setCustomerDetailTab] = useState('기본정보');

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState('');

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    origin: '가입상품', 
    category: '생명보험', 
    company: '삼성생명', 
    productType: '종신/정기',
    name: '(무)삼성생명 다(多)모은 종신보험', 
    isCustomName: false,
    customName: '',
    amount: '', 
    enrollDate: new Date().toISOString().split('T')[0].substring(0, 7)
  });

  const [isAddingHashtag, setIsAddingHashtag] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');

  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [newHistory, setNewHistory] = useState({
    type: '통화',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    alarm: '알림 없음',
    note: ''
  });

  const [isAddingMemo, setIsAddingMemo] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');

  const [shareScope, setShareScope] = useState('basic');
  const [selectedShareMembers, setSelectedShareMembers] = useState([]);
  const [shareSearchQuery, setShareSearchQuery] = useState('');

  const [tosAgreed, setTosAgreed] = useState({ all: false, service: false, privacy: false, marketing: false });
  const [isScanning, setIsScanning] = useState(false);
  
  const [isMainScanning, setIsMainScanning] = useState(false);
  const [mainScanStep, setMainScanStep] = useState('choice'); 
  const [scannedData, setScannedData] = useState(null);
  const [manualData, setManualData] = useState({
    name: '', phone: '', job: '회사원', company: '', dept: '', position: ''
  });

  const [teamTab, setTeamTab] = useState('dept');
  const [myBusinessCards, setMyBusinessCards] = useState([]);
  const [isMyCardsModalOpen, setIsMyCardsModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
    id: String(Date.now()),
    name: '', company: '', dept1: '', dept2: '', position: '', phone: '', email: '',
    experience: '', certs: [], isPublic: true
  });

  const [cardIndex, setCardIndex] = useState(0);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState([]);

  const [notiTab, setNotiTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState([
    { 
      id: 1, type: '공유', icon: Share2, color: 'text-purple-600', bg: 'bg-purple-100', 
      title: "고객 공유 요청", desc: "이현우 차장님이 '강동원' 고객님의 공동 관리를 요청했습니다.", time: "방금 전", isNew: true, 
      payload: { id: 999, name: "강동원", company: "스타트업", position: "대표", phone: "010-9999-8888", email: "kang@startup.com", status: "가망", product: "경영인정기보험", isSharedWithMe: true, ownerName: "이현우 차장", lastContact: new Date().toISOString().split('T')[0], note: "법인 자금 및 대표이사 리스크 대비 상담 요청", createdAt: new Date().toISOString().split('T')[0], hashtags: ['CEO', '법인'], sharedWith: [1], products: [], history: [] } 
    }
  ]);
  const [popupData, setPopupData] = useState(null);

  // 💡 카메라 입력을 받기 위한 참조 추가
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (appState === 'intro') {
      const timer = setTimeout(() => setAppState('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || appState !== 'main') return;

    const customersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'customers');
    const unsubCustomers = onSnapshot(customersRef, async (snapshot) => {
      if (snapshot.empty) {
        const initialData = [
          { 
            id: 1, name: "김태양", company: "미래IT", position: "수석", 
            phone: "010-1234-5678", email: "sun@email.com", 
            status: "가입", product: "종신/연금", 
            lastContact: "2026-03-21", note: "상속세 관련 추가 상담 필요.", createdAt: "2026-01-10",
            hashtags: ['골프', '법인전환'], sharedWith: [1, 3],
            products: [{ id: 101, origin: '가입상품', category: '생명보험', company: '한화생명', productType: '종신/정기', name: '(무)한화생명 시그니처 종신보험', amount: '5억원', enrollDate: '2026-02', author: '본인' }],
            history: [{ id: 201, date: '2026-03-21', type: '대면상담', note: '상속세 관련 추가 상담 필요.', author: '본인' }]
          }
        ];
        for (const c of initialData) { await setDoc(doc(customersRef, String(c.id)), c); }
      } else {
        const data = [];
        snapshot.forEach(d => data.push(d.data()));
        setCustomers(data);
      }
    });

    const cardsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'businessCards');
    const unsubCards = onSnapshot(cardsRef, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push(d.data()));
      setMyBusinessCards(data);
      if (data.length > 0 && !userProfile.name) setUserProfile(data[0]); 
    });

    return () => { unsubCustomers(); unsubCards(); };
  }, [user, appState]);

  useEffect(() => {
    if (user && appState === 'main') showToast("☁️ 구글 클라우드 서버 연동 중");
  }, [user, appState]);

  useEffect(() => {
    setIsAddingProduct(false); setIsEditingStatus(false); setIsAddingHistory(false); setIsAddingMemo(false); setCardIndex(0); setExpandedHistoryIds([]);
  }, [customerDetailTab, selectedCustomer]);

  useEffect(() => {
    setNewProduct(prev => {
      const categories = INSURANCE_DATA[prev.category] || {};
      if (!Object.keys(categories).includes(prev.company)) {
        const firstCompany = Object.keys(categories)[0];
        const firstType = Object.keys(categories[firstCompany]?.types || {})[0];
        const firstProduct = categories[firstCompany]?.types?.[firstType]?.[0] || '직접 입력';
        return { ...prev, company: firstCompany, productType: firstType, name: firstProduct, isCustomName: firstProduct === '직접 입력', customName: '' };
      }
      return prev;
    });
  }, [newProduct.category]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const updateSelectedCustomer = async (updates) => {
    if (!selectedCustomer || !user) return;
    const updated = { ...selectedCustomer, ...updates };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(updated.id)), updated);
      setSelectedCustomer(updated);
    } catch (e) { console.error("업데이트 실패:", e); }
  };

  const handleSaveProduct = () => {
    const finalProductName = newProduct.isCustomName ? newProduct.customName : newProduct.name;
    if (!finalProductName || !newProduct.amount || !newProduct.enrollDate) return showToast("상품명, 가입금액, 가입년월을 모두 입력해주세요.");
    const newProductData = { id: Date.now(), ...newProduct, name: finalProductName, author: userProfile.name || '본인' };
    updateSelectedCustomer({ products: [newProductData, ...(selectedCustomer.products || [])] });
    setIsAddingProduct(false); showToast("가입 상품 내역이 추가되었습니다.");
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !(selectedCustomer.hashtags || []).includes(hashtagInput.trim())) {
      updateSelectedCustomer({ hashtags: [...(selectedCustomer.hashtags || []), hashtagInput.trim()] });
    }
    setHashtagInput(''); setIsAddingHashtag(false);
  };

  const handleRemoveHashtag = (tag) => { updateSelectedCustomer({ hashtags: (selectedCustomer.hashtags || []).filter(t => t !== tag) }); };
  const getOffsetDate = (offsetDays) => { const d = new Date(); d.setDate(d.getDate() + offsetDays); return d.toISOString().split('T')[0]; };

  const handleSaveHistory = () => {
    if (newHistory.type === '미팅약속') {
      if (!newHistory.time || !newHistory.location.trim()) return showToast("시간과 장소를 입력해주세요.");
      if (!newHistory.note.trim()) newHistory.note = "미팅 일정이 등록되었습니다.";
    } else {
      if (!newHistory.note.trim()) return showToast("상담 내용을 입력해주세요.");
    }
    const historyEntry = { ...newHistory, id: Date.now(), author: userProfile.name || '본인' };
    const allHistory = [historyEntry, ...(selectedCustomer.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    updateSelectedCustomer({ history: allHistory, lastContact: allHistory[0].date, note: allHistory[0].note });
    setIsAddingHistory(false); setNewHistory({ type: '통화', date: getOffsetDate(0), time: '', location: '', alarm: '알림 없음', note: '' }); showToast("새로운 상담 이력이 등록되었습니다.");
  };

  const handleSaveMemo = () => {
    if (!newMemoText.trim()) return showToast("메모 내용을 입력해주세요.");
    const memoEntry = { id: Date.now(), date: new Date().toISOString().split('T')[0], type: '메모', note: newMemoText, author: userProfile.name || '본인' };
    const allHistory = [memoEntry, ...(selectedCustomer.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    updateSelectedCustomer({ history: allHistory, lastContact: allHistory[0].date, note: allHistory[0].note });
    setIsAddingMemo(false); setNewMemoText(''); showToast("새로운 메모가 등록되었습니다.");
  };

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (searchQuery) result = result.filter(c => c.name.includes(searchQuery) || c.company.includes(searchQuery) || (c.product && c.product.includes(searchQuery)));
    if (customerTab === '공유') return result.filter(c => c.isSharedWithMe).sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
    return result.filter(c => c.status === customerTab && !c.isSharedWithMe).sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
  }, [customers, customerTab, searchQuery]);

  const handleOpenScanner = () => {
    setIsMainScanning(true);
    setMainScanStep(selectedCustomer ? 'detail_choice' : 'choice');
    setManualData({ name: '', phone: '', job: '회사원', company: '', dept: '', position: '' });
  };

  // ==========================================
  // 💡 진짜 카메라 및 Google Vision API 장착 로직
  // ==========================================
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMainScanStep('camera');

    // 파일을 base64 문자열로 변환 (구글 API 전송용)
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];

      try {
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
          method: 'POST',
          body: JSON.stringify({
            requests: [{
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION' }]
            }]
          })
        });

        const data = await response.json();
        const extractedText = data.responses[0]?.textAnnotations?.[0]?.description || '';
        
        // 텍스트 분석 로직 (전화번호, 이메일, 이름, 회사명 추론)
        const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l);
        let phone = '';
        let email = '';
        let name = lines[0] || '이름 인식 불가';
        let company = lines[1] || '회사명 인식 불가';

        const phoneRegex = /(01[016789]|02|0[3-9][0-9]?)[-.\s]*[0-9]{3,4}[-.\s]*[0-9]{4}/g;
        const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;

        const phoneMatch = extractedText.match(phoneRegex);
        if (phoneMatch) phone = phoneMatch[0];

        const emailMatch = extractedText.match(emailRegex);
        if (emailMatch) email = emailMatch[0];

        setScannedData({
          name: name.replace(/[^가-힣a-zA-Z]/g, '').substring(0, 5), 
          company: company, 
          position: "직급/부서 입력", 
          phone: phone, 
          email: email, 
          status: "가망", 
          note: "Google AI 스캔으로 등록됨"
        });
        setMainScanStep('result');
        showToast("명함 정보 인식이 완료되었습니다!");

      } catch (error) {
        console.error("OCR Error:", error);
        showToast("명함 인식에 실패했습니다. (API 키를 확인하세요)");
        setMainScanStep('choice');
      }
    };
  };

  const handleSaveScannedData = async () => {
    if(!scannedData || !user) return;
    const currentDate = new Date().toISOString().split('T')[0];
    const newCustomer = {
      id: String(Date.now()), ...scannedData, product: "미정", lastContact: currentDate, createdAt: currentDate, hashtags: [], sharedWith: [], products: [],
      history: [{ id: String(Date.now()), date: currentDate, type: '대면상담', note: 'Google AI 명함 스캔으로 신규 등록됨', author: userProfile.name || '본인' }]
    };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(newCustomer.id)), newCustomer);
      setIsMainScanning(false); setScannedData(null); showToast(`${newCustomer.name} 고객이 등록되었습니다.`); setActiveTab('customers'); setCustomerTab(newCustomer.status);
    } catch(e) { console.error(e); }
  };

  const handleSaveManualData = async () => {
    if(!manualData.name || !manualData.phone || !user) return showToast('이름과 연락처를 입력해주세요.');
    const currentDate = new Date().toISOString().split('T')[0];
    const jobCompany = ['회사원', '전문직'].includes(manualData.job) ? (manualData.company || manualData.job) : manualData.job;
    const newCustomer = { id: String(Date.now()), name: manualData.name, phone: manualData.phone, company: jobCompany, position: manualData.position, email: "", product: "미정", status: "가망", lastContact: currentDate, createdAt: currentDate, hashtags: [manualData.job], sharedWith: [], products: [], history: [{ id: String(Date.now()), date: currentDate, type: '대면상담', note: '수동 등록', author: userProfile.name || '본인' }] };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(newCustomer.id)), newCustomer);
      setIsMainScanning(false); setManualData({ name: '', phone: '', job: '회사원', company: '', dept: '', position: '' }); showToast(`가망 고객 등록 완료.`); setActiveTab('customers'); setCustomerTab('가망');
    } catch(e) { console.error(e); }
  };

  const toggleHistoryExpand = (id) => setExpandedHistoryIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);

  const handleSaveUpdatedCard = async () => {
    if(!scannedData || !user) return;
    const currentDate = new Date().toISOString().split('T')[0];
    const oldCard = { name: selectedCustomer.name, company: selectedCustomer.company, position: selectedCustomer.position, phone: selectedCustomer.phone, email: selectedCustomer.email, updatedAt: currentDate };
    updateSelectedCustomer({ ...selectedCustomer, name: scannedData.name, company: scannedData.company, position: scannedData.position, phone: scannedData.phone, email: scannedData.email, pastCards: [oldCard, ...(selectedCustomer.pastCards || [])] });
    setIsMainScanning(false); setScannedData(null); showToast(`명함 업데이트 완료.`);
  };

  const handleCompleteGeneralCard = async () => {
    if (!user) return;
    const newCard = { ...userProfile, id: String(Date.now()) };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'businessCards', String(newCard.id)), newCard);
      setUserProfile(newCard); setAppState('main'); showToast("명함 등록 완료.");
    } catch(e) { console.error(e); }
  };

  const handleNotiClick = (noti) => {
    if (noti.type === '공지') setPopupData({ type: 'notice', data: noti });
    else if (noti.type === '약속') setPopupData({ type: 'appointment', data: noti });
  };

  const handleAcceptShare = async (e, noti) => {
    e.stopPropagation();
    const newCustomer = noti.payload;
    if (!customers.find(c => c.id === newCustomer.id) && user) {
      try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(newCustomer.id)), newCustomer); } catch(err) {}
    }
    setNotifications(notifications.filter(n => n.id !== noti.id)); showToast(`공유를 수락했습니다.`);
  };

  const handleRejectShare = (e, id) => { e.stopPropagation(); setNotifications(notifications.filter(n => n.id !== id)); showToast("요청을 거절했습니다."); };

  // ==========================================
  // 렌더링 함수들
  // ==========================================

  const renderIntroPage = () => (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] shadow-2xl flex items-center justify-center text-white"><ShieldCheck size={48} strokeWidth={1.5} /></div>
        <div className="text-center space-y-2"><h1 className="text-4xl font-black text-slate-900 tracking-tighter">ReadUp <span className="text-indigo-600">Pro</span></h1></div>
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="absolute inset-0 z-[190] bg-white flex flex-col px-8 pt-24 pb-12 animate-in slide-in-from-right duration-300">
      <div className="flex-1">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><UserPlus size={32} /></div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">영업의 시작,<br/>리드업과 함께하세요</h1>
      </div>
      <div className="space-y-3">
        <button onClick={() => setAppState('terms')} className="w-full bg-[#FEE500] text-[#000000] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm"><MessageCircle size={18} className="fill-black" /> 카카오로 3초 만에 시작하기</button>
      </div>
    </div>
  );

  const renderTermsPage = () => {
    const handleToggleAll = () => { const newVal = !tosAgreed.all; setTosAgreed({ all: newVal, service: newVal, privacy: newVal, marketing: newVal }); };
    const canProceed = tosAgreed.service && tosAgreed.privacy;
    return (
      <div className="absolute inset-0 z-[180] bg-slate-50 flex flex-col px-6 pt-20 pb-10 animate-in slide-in-from-right duration-300">
        <h2 className="text-2xl font-black text-slate-900 mb-8">서비스 약관 동의</h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 flex-1">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 cursor-pointer" onClick={handleToggleAll}>{tosAgreed.all ? <CheckSquare size={24} className="text-indigo-600" /> : <Square size={24} className="text-slate-300" />} <span className="font-black text-lg text-slate-900">약관 전체 동의</span></div>
          <div className="space-y-5">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setTosAgreed({...tosAgreed, service: !tosAgreed.service})}><div className="flex items-center gap-3">{tosAgreed.service ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-slate-300" />}<span className="font-bold text-sm text-slate-700">[필수] 이용약관</span></div></div>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setTosAgreed({...tosAgreed, privacy: !tosAgreed.privacy})}><div className="flex items-center gap-3">{tosAgreed.privacy ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-slate-300" />}<span className="font-bold text-sm text-slate-700">[필수] 개인정보 수집</span></div></div>
          </div>
        </div>
        <button disabled={!canProceed} onClick={() => setAppState('profile_step1')} className={`w-full py-5 rounded-2xl font-black text-base mt-6 ${canProceed ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>다음으로</button>
      </div>
    );
  };

  const renderProfileStep1Page = () => (
    <div className="absolute inset-0 z-[160] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-white px-6 pt-14 pb-5 border-b border-slate-100 sticky top-0 z-10 shadow-sm flex items-center justify-between"><div><h2 className="text-2xl font-black text-slate-900">프로필 등록 <span className="text-indigo-600 ml-1">1/2</span></h2></div></div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32 hide-scrollbar">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-[10px] font-bold text-slate-400 ml-1">소속 회사</label><input type="text" value={userProfile.company} onChange={e=>setUserProfile({...userProfile, company:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mt-1" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 ml-1">직급</label><input type="text" value={userProfile.position} onChange={e=>setUserProfile({...userProfile, position:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mt-1" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 ml-1">이름</label><input type="text" value={userProfile.name} onChange={e=>setUserProfile({...userProfile, name:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mt-1" /></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-6"><button onClick={() => setAppState('profile_step2')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-xl">다음 단계로</button></div>
    </div>
  );

  const renderProfileStep2Page = () => {
    const toggleCert = (cert) => setUserProfile(prev => ({ ...prev, certs: prev.certs.includes(cert) ? prev.certs.filter(c => c !== cert) : [...prev.certs, cert] }));
    const isNextEnabled = userProfile.certs.length > 0; 
    return (
      <div className="absolute inset-0 z-[160] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="bg-white px-6 pt-14 pb-5 border-b border-slate-100 sticky top-0 z-10 shadow-sm flex items-center gap-3"><button onClick={() => setAppState('profile_step1')} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-600"><ChevronLeft size={18}/></button><div><h2 className="text-2xl font-black text-slate-900">프로필 등록 2/2</h2></div></div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32 hide-scrollbar">
          <div className="flex flex-wrap gap-2">
            {CERTIFICATIONS.map(cert => {
              const isActive = userProfile.certs.includes(cert);
              return <button key={cert} type="button" onClick={() => toggleCert(cert)} className={`px-4 py-2.5 rounded-xl text-xs font-black border ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>{cert}</button>
            })}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-6"><button disabled={!isNextEnabled} onClick={handleCompleteGeneralCard} className={`w-full py-4 rounded-2xl font-black text-base ${isNextEnabled ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>프로필 등록 완료</button></div>
      </div>
    );
  };

  const renderHomePage = () => {
    const recentCustomers = [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    return (
      <div className="p-5 space-y-5 pb-32 flex flex-col min-h-full">
        <header className="flex justify-between items-start pt-2">
          <div className="pt-1 flex-1">
            <h2 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Good Morning</h2>
            <h1 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight truncate">{userProfile.name ? `${userProfile.name}님` : '차부장님'}, 화이팅!</h1>
          </div>
        </header>
        <section className="grid grid-cols-3 gap-2 mt-2">
          <button onClick={() => { setCustomerTab('가망'); setActiveTab('customers'); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:border-blue-300">
            <UserPlus size={12} className="text-blue-500" /><h4 className="text-[10px] font-black text-slate-700">가망 고객</h4><p className="text-sm font-black text-blue-600">{customers.filter(c => c.status === '가망' && !c.isSharedWithMe).length}명</p>
          </button>
          <button onClick={() => { setCustomerTab('가입'); setActiveTab('customers'); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:border-emerald-300">
            <UserCheck size={12} className="text-emerald-500" /><h4 className="text-[10px] font-black text-slate-700">가입 고객</h4><p className="text-sm font-black text-emerald-600">{customers.filter(c => c.status === '가입' && !c.isSharedWithMe).length}명</p>
          </button>
          <button onClick={() => { setCustomerTab('공유'); setActiveTab('customers'); }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:border-purple-300">
            <Share2 size={12} className="text-purple-500" /><h4 className="text-[10px] font-black text-slate-700">공유 고객</h4><p className="text-sm font-black text-purple-600">{customers.filter(c => c.isSharedWithMe).length}명</p>
          </button>
        </section>
        <section className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex-1">
           <h3 className="text-xs font-black text-slate-900 mb-3">최근 연락처</h3>
           <div className="space-y-3">
            {customers.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact)).slice(0, 3).map(c => (
              <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerDetailTab('기본정보'); }} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-black">{c.name[0]}</div>
                  <div><h4 className="font-bold text-slate-900 text-xs">{c.name}</h4><p className="text-[9px] font-bold text-slate-400">{c.company}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <GoogleAdPlaceholder type="banner" className="mt-4 mb-2" />
      </div>
    );
  };

  const renderCustomerListPage = () => (
    <div className="p-5 space-y-4 animate-in slide-in-from-right duration-300 pb-32">
      <div className="flex justify-between items-center pt-2 mb-2">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">고객 DB 관리</h1>
        <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"><p className="text-[10px] font-black text-indigo-600">총 {filteredCustomers.length}명</p></div>
      </div>
      <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-xl mb-4">
        {['가망', '가입', '거래처', '공유'].map(tab => (
          <button key={tab} onClick={() => setCustomerTab(tab)} className={`flex-1 py-2.5 text-[12px] font-black rounded-lg transition-all ${customerTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold text-sm">등록된 고객이 없습니다.</div>
        ) : (
          filteredCustomers.map((c, index) => (
            <React.Fragment key={c.id}>
              {index === 2 && <GoogleAdPlaceholder type="infeed" className="mb-3" />}
              <div onClick={() => { setSelectedCustomer(c); setCustomerDetailTab('기본정보'); }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-200">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-lg font-black">{c.name[0]}</div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{c.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{c.company}</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );

  const renderTeamMockPage = () => {
    const displayMembers = TEAM_MEMBERS;
    return (
      <div className="p-5 space-y-5 pb-32">
        <h1 className="text-xl font-black text-slate-900 pt-2">조직도</h1>
        <div className="space-y-3">
           {displayMembers.map(member => (
             <div key={member.id} onClick={() => setSelectedTeamMember(member)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-lg font-black">{member.name[0]}</div>
                 <div><h4 className="font-black text-sm text-slate-900">{member.name}</h4><p className="text-[10px] text-slate-500 font-medium mt-1">{member.dept}</p></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderNotificationPage = () => {
    return (
      <div className="p-5 space-y-5 pb-32">
        <h1 className="text-xl font-black text-slate-900 pt-2">알림 센터</h1>
        <div className="space-y-3">
          {notifications.map(noti => {
            const Icon = noti.icon;
            return (
              <div key={noti.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${noti.bg} ${noti.color}`}><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900">{noti.title}</h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">{noti.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTeamMemberDetailView = () => {
    if (!selectedTeamMember) return null;
    return (
      <div className="pb-10 bg-[#f8fafc] min-h-full">
        <div className="bg-white px-5 pt-4 pb-4 flex items-center sticky top-0 z-20 shadow-sm border-b border-slate-100 gap-3">
          <button onClick={() => setSelectedTeamMember(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-600"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-black text-slate-900">동료 상세 프로필</h2>
        </div>
        <div className="p-5">
           <h3 className="text-2xl font-black mt-2">{selectedTeamMember.name} <span className="text-sm">{selectedTeamMember.position}</span></h3>
        </div>
      </div>
    );
  };

  const renderCustomerDetailView = () => {
    if (!selectedCustomer) return null;
    return (
      <div className="pb-10 bg-[#f8fafc] min-h-full">
        <div className="bg-white px-5 pt-4 pb-4 flex justify-between items-center sticky top-0 z-20 shadow-sm border-b border-slate-100">
          <button onClick={() => setSelectedCustomer(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-600"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">고객 상세 프로필</h2>
        </div>
        <div className="p-5">
           <h3 className="text-2xl font-black mt-2">{selectedCustomer.name}</h3>
           <p className="text-sm font-bold text-slate-500">{selectedCustomer.phone}</p>
        </div>
      </div>
    );
  };

  const renderBottomNav = () => (
    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-between items-center h-[76px] pb-4 pt-1 px-6 z-40 rounded-b-[2.5rem]">
      <div className="flex gap-8">
        <button onClick={() => { setActiveTab('home'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'home' && !selectedCustomer && !selectedTeamMember ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Home size={22} /><span className="text-[9px] font-bold">홈</span>
        </button>
        <button onClick={() => { setActiveTab('customers'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'customers' && !selectedCustomer ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Users size={22} /><span className="text-[9px] font-bold">고객관리</span>
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex justify-center">
        <button onClick={handleOpenScanner} className="bg-indigo-600 text-white w-[60px] h-[60px] rounded-full shadow-lg shadow-indigo-200 flex flex-col items-center justify-center active:scale-95 border-4 border-[#f8fafc]">
          <Camera size={24} className="mb-0.5" />
        </button>
      </div>

      <div className="flex gap-8">
        <button onClick={() => { setActiveTab('team'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'team' && !selectedCustomer && !selectedTeamMember ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Share2 size={22} /><span className="text-[9px] font-bold">팀 공유</span>
        </button>
        <button onClick={() => { setActiveTab('profile'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' && !selectedCustomer ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Bell size={22} /><span className="text-[9px] font-bold">알림</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      
      {/* 💡 숨겨진 파일 입력 (카메라 및 갤러리 호출용) */}
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />

      <div className="min-h-screen bg-slate-900 flex items-center justify-center sm:p-8">
        <div className="relative w-full h-[100dvh] sm:w-[390px] sm:h-[844px] bg-black sm:rounded-[3.5rem] shadow-2xl overflow-hidden sm:p-2.5 flex-shrink-0 ring-1 ring-white/10">
          <div className="relative w-full h-full bg-[#f8fafc] sm:rounded-[3rem] overflow-hidden flex flex-col font-sans select-none border border-slate-200/50">
            <div className="absolute top-0 inset-x-0 h-12 flex justify-between items-center px-7 z-[100] pointer-events-none text-slate-800">
              <span className="text-[13px] font-bold mt-1 tracking-tight">9:41</span>
              <div className="flex gap-1.5 items-center mt-1">
                <Wifi size={14} className="stroke-[2.5]" /><Battery size={16} className="stroke-[2.5]" />
              </div>
            </div>
            
            {appState === 'intro' && renderIntroPage()}
            {appState === 'login' && renderLoginPage()}
            {appState === 'terms' && renderTermsPage()}
            {appState === 'scan' && renderScanProfilePage()}
            {appState === 'profile_step1' && renderProfileStep1Page()}
            {appState === 'profile_step2' && renderProfileStep2Page()}
            {appState === 'main' && (
              <>
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-12 relative pb-24">
                  {!selectedCustomer && !selectedTeamMember ? (
                    <>
                      {activeTab === 'home' && renderHomePage()}
                      {activeTab === 'customers' && renderCustomerListPage()}
                      {activeTab === 'team' && renderTeamMockPage()}
                      {activeTab === 'profile' && renderNotificationPage()}
                    </>
                  ) : (selectedTeamMember ? renderTeamMemberDetailView() : renderCustomerDetailView())}
                </div>
                {renderBottomNav()}

                {/* 메인 카메라 스캐너 기능 모달 */}
                {isMainScanning && (
                  <div className="absolute inset-0 z-[300] bg-slate-900 flex flex-col animate-in fade-in duration-300">
                    <div className="flex justify-between items-center p-5 text-white pt-14"><h2 className="text-lg font-black">신규 고객 등록</h2><button onClick={() => setIsMainScanning(false)}><X size={24}/></button></div>
                    {mainScanStep === 'choice' && (
                      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                         <div className="w-full flex flex-col gap-4 mt-4">
                           {/* 💡 AI 스캔 버튼 (누르면 폰 카메라가 켜짐) */}
                           <button onClick={() => fileInputRef.current.click()} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-900 active:scale-95 flex items-center justify-center gap-2"><Camera size={20} /> AI 명함 스캔하기</button>
                           <button onClick={() => setMainScanStep('manual')} className="w-full py-5 bg-slate-800 text-white border border-slate-700 rounded-2xl font-black text-base active:scale-95 flex items-center justify-center gap-2"><Edit2 size={20} /> 직접 입력하기</button>
                         </div>
                      </div>
                    )}
                    {mainScanStep === 'manual' && (
                      <div className="flex-1 bg-slate-50 rounded-t-[2rem] overflow-hidden flex flex-col mt-4 text-slate-800">
                         <div className="p-6 overflow-y-auto hide-scrollbar pb-32 flex-1 space-y-6">
                            <h3 className="text-xl font-black text-slate-900 mb-2">고객 직접 입력</h3>
                            <div className="space-y-4">
                              <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">고객명 *</label><input value={manualData.name} onChange={e=>setManualData({...manualData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold" /></div>
                              <div><label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">전화번호 *</label><input type="tel" value={manualData.phone} onChange={e=>setManualData({...manualData, phone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold" /></div>
                            </div>
                         </div>
                         <div className="p-5 bg-white border-t border-slate-100 pb-8 flex gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10">
                           <button onClick={() => setMainScanStep('choice')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm active:scale-95">뒤로</button>
                           <button onClick={handleSaveManualData} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95">고객 등록하기</button>
                         </div>
                      </div>
                    )}
                    {mainScanStep === 'camera' && (
                      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                         <div className="w-full aspect-[1.6/1] border-2 border-dashed border-white/50 rounded-2xl relative overflow-hidden bg-slate-800/50">
                            <div className="absolute inset-x-0 top-1/2 h-[2px] bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                         </div>
                         <p className="mt-8 text-green-400 font-black animate-pulse">구글 Vision AI 분석 중...</p>
                      </div>
                    )}
                    {mainScanStep === 'result' && (
                      <div className="flex-1 bg-slate-50 rounded-t-[2rem] flex flex-col mt-4">
                         <div className="p-6 flex-1 overflow-y-auto pb-32">
                            <h3 className="text-xl font-black mb-4">인식 결과 확인</h3>
                            <input value={scannedData?.name} onChange={e=>setScannedData({...scannedData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3"/>
                            <input value={scannedData?.phone} onChange={e=>setScannedData({...scannedData, phone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3"/>
                            <input value={scannedData?.company} onChange={e=>setScannedData({...scannedData, company: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3"/>
                            <input value={scannedData?.email} onChange={e=>setScannedData({...scannedData, email: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold mb-3" placeholder="이메일"/>
                         </div>
                         <div className="p-5 bg-white flex gap-2">
                           <button onClick={() => setMainScanStep('choice')} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-sm">다시 찍기</button>
                           <button onClick={handleSaveScannedData} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm">저장</button>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            <div className={`absolute left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all duration-300 z-[100] w-[85%] ${toast.show ? 'bottom-[100px] opacity-100' : 'bottom-10 opacity-0 pointer-events-none'}`}>
              <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={14} /><span className="text-[11px] font-bold tracking-tight truncate">{toast.message}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}