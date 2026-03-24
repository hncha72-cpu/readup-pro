/* eslint-disable */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserPlus, Users, Home, Share2, Phone, Bell, CheckCircle2, X, Wifi, Battery, Signal,
  Camera, Building2, Briefcase, UserCheck, LayoutGrid, Mail, Loader2, ChevronLeft,
  MessageCircle, Smartphone, CheckSquare, Square, ToggleLeft, ToggleRight, ShieldCheck,
  ChevronRight, CalendarDays, FileText, Plus, Search, Check, Hash, Edit2, MessageSquare,
  Coffee, CreditCard, Clock, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';

const safeGet = (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } };
const safeSet = (key, val) => { try { localStorage.setItem(key, val); } catch(e) { console.warn("Storage restricted"); } };

// === Firebase 서버 연동 라이브러리 임포트 ===
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

// 💡 구글 Cloud Vision API 키 입력란 (나중에 발급받고 넣으시면 됩니다)
const GOOGLE_VISION_API_KEY = ""; 

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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'leadup-pro-v1'; 

const GoogleAdPlaceholder = ({ type = 'banner', className = '' }) => {
  let sizeClass = 'h-[100px]'; 
  if (type === 'native') sizeClass = 'h-[250px]'; 
  if (type === 'infeed') sizeClass = 'h-[120px]'; 

  return (
    <div className={`bg-slate-200/60 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-4 shadow-inner ${sizeClass} ${className}`}>
      <div className="w-8 h-8 rounded-full bg-slate-300/50 flex items-center justify-center mb-2 shadow-sm">
        <CreditCard size={16} className="text-slate-500" />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Google AdMob</p>
      <p className="text-[10px] font-bold text-slate-400 mt-1">구글 광고 영역</p>
    </div>
  );
};

const INSURANCE_DATA = {
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
  const [toast, setToast] = useState({ show: false, message: '' });

  const [customerTab, setCustomerTab] = useState('가망');
  const [customerDetailTab, setCustomerDetailTab] = useState('기본정보'); 

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState('');

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    origin: '가입상품', category: '생명보험', company: '삼성생명', productType: '종신/정기',
    name: '(무)삼성생명 다(多)모은 종신보험', isCustomName: false, customName: '', amount: '', 
    enrollDate: new Date().toISOString().split('T')[0].substring(0, 7)
  });

  const [isAddingHashtag, setIsAddingHashtag] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');

  const [isAddingHistory, setIsAddingHistory] = useState(false);
  const [newHistory, setNewHistory] = useState({ type: '통화', date: new Date().toISOString().split('T')[0], time: '', location: '', alarm: '알림 없음', note: '' });

  const [isAddingMemo, setIsAddingMemo] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');

  const [shareScope, setShareScope] = useState('basic');
  const [selectedShareMembers, setSelectedShareMembers] = useState([]);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); 

  const [tosAgreed, setTosAgreed] = useState({ all: false, service: false, privacy: false, marketing: false });
  const [isScanning, setIsScanning] = useState(false);
  
  const [isMainScanning, setIsMainScanning] = useState(false);
  const [mainScanStep, setMainScanStep] = useState('choice'); 
  const [scannedData, setScannedData] = useState(null);
  const [manualData, setManualData] = useState({ name: '', phone: '', job: '회사원', company: '', dept: '', position: '' });

  const [teamTab, setTeamTab] = useState('dept');
  const [myBusinessCards, setMyBusinessCards] = useState([]);
  const [isMyCardsModalOpen, setIsMyCardsModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
    id: String(Date.now()), name: '', company: '', dept1: '', dept2: '', position: '', phone: '', email: '', experience: '', certs: [], isPublic: true
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
      } catch (error) { console.error("Firebase Auth Error:", error); }
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
            lastContact: "2026-03-21", note: "상속세 관련 추가 상담 필요. 기존 가입된 종신보험 증액 원하심.", createdAt: "2026-01-10",
            hashtags: ['골프', '법인전환'], sharedWith: [1, 3],
            products: [
              { id: 101, origin: '가입상품', category: '생명보험', company: '한화생명', productType: '종신/정기', name: '(무)한화생명 시그니처 종신보험', amount: '5억원', enrollDate: '2026-02', author: '본인' },
              { id: 102, origin: '기존상품', category: '손해보험', company: '현대해상', productType: '종합/건강/실손', name: '(무)퍼펙트플러스 종합보험', amount: '5천만원', enrollDate: '2015-08', author: '본인' }
            ],
            history: [
              { id: 201, date: '2026-03-21', type: '대면상담', note: '상속세 관련 추가 상담 필요.', author: '본인' },
              { id: 202, date: '2026-01-10', type: '통화', note: '고객 정보 최초 스캔 및 가망 고객 등록 완료.', author: '본인' }
            ]
          },
          { 
            id: 2, name: "이은지", company: "프리랜서", position: "디자이너", 
            phone: "010-9876-5432", email: "ej@email.com", 
            status: "가망", product: "실손/치아", 
            lastContact: "2026-03-20", note: "갱신 시점 안내 완료.", createdAt: "2026-02-05",
            hashtags: ['프리랜서', '디자인'], sharedWith: [],
            products: [
              { id: 103, origin: '기존상품', category: '손해보험', company: '메리츠화재', productType: '종합/건강/실손', name: '(무)알파플러스 종합보험', amount: '5천만원', enrollDate: '2018-04', author: '본인' }
            ],
            history: [
              { id: 203, date: '2026-03-20', type: '메세지', note: '갱신 시점 안내 완료. 다음 달 첫째 주에 다시 연락하기로 함.', author: '본인' },
              { id: 204, date: '2026-02-05', type: '카톡', note: '실손 보험 관련 문의 카톡 접수.', author: '본인' }
            ]
          },
          { 
            id: 3, name: "최성훈", company: "현대건설", position: "과장", 
            phone: "010-1111-2222", email: "choi@example.com", 
            status: "가망", product: "변액보험", 
            lastContact: "2026-03-25", note: "자녀 교육자금 마련 목적 상담.", createdAt: "2026-03-01",
            hashtags: ['건설업', '자녀교육'], sharedWith: [4],
            products: [],
            history: [
              { id: 205, date: '2026-03-25', type: '제안서', note: '자녀 교육자금 마련 목적 상담. 변액유니버셜 상품 안내 자료 메일로 송부 완료.', author: '본인' }
            ]
          },
          { 
            id: 4, name: "박민수", company: "태양물산", position: "팀장", 
            phone: "010-4444-5555", email: "ms.park@test.com", 
            status: "가망", product: "종합건강보험", 
            isSharedWithMe: true, ownerName: "이현우 차장",
            lastContact: "2026-03-22", note: "이관 고객", createdAt: "2026-02-10",
            hashtags: ['이관고객'], sharedWith: [1],
            products: [
              { id: 104, origin: '가입상품', category: '손해보험', company: 'DB손해보험', productType: '종합/건강/실손', name: '(무)참좋은 종합건강보험', amount: '1억원', enrollDate: '2026-03', author: '이현우 차장' }
            ],
            history: [
              { id: 206, date: '2026-03-22', type: '메세지', note: '첫 인사 문자 발송', author: '이현우 차장' }
            ]
          }
        ];
        for (const c of initialData) { await setDoc(doc(customersRef, String(c.id)), c); }
      } else {
        const data = [];
        snapshot.forEach(d => data.push(d.data()));
        setCustomers(data);
      }
    }, (err) => console.error("고객 동기화 에러:", err));

    const cardsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'businessCards');
    const unsubCards = onSnapshot(cardsRef, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push(d.data()));
      setMyBusinessCards(data);
      if (data.length > 0 && !userProfile.name) {
        setUserProfile(data[0]); 
      }
    }, (err) => console.error("명함 동기화 에러:", err));

    return () => { unsubCustomers(); unsubCards(); };
  }, [user, appState]);

  useEffect(() => {
    if (user && appState === 'main') {
      showToast("☁️ 구글 클라우드 서버 연동 중");
    }
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

  useEffect(() => {
    setNewProduct(prev => {
      const typesObj = INSURANCE_DATA[prev.category]?.[prev.company]?.types || {};
      if (!Object.keys(typesObj).includes(prev.productType)) {
        const firstType = Object.keys(typesObj)[0];
        const firstProduct = typesObj[firstType]?.[0] || '직접 입력';
        return { ...prev, productType: firstType, name: firstProduct, isCustomName: firstProduct === '직접 입력', customName: '' };
      }
      return prev;
    });
  }, [newProduct.company, newProduct.category]);

  useEffect(() => {
    setNewProduct(prev => {
      const productsArr = INSURANCE_DATA[prev.category]?.[prev.company]?.types?.[prev.productType] || [];
      if (!productsArr.includes(prev.name)) {
        const firstProduct = productsArr[0] || '직접 입력';
        return { ...prev, name: firstProduct, isCustomName: firstProduct === '직접 입력', customName: '' };
      }
      return prev;
    });
  }, [newProduct.productType, newProduct.company, newProduct.category]);

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
    if (!finalProductName || !newProduct.amount || !newProduct.enrollDate) {
      return showToast("상품명, 가입금액, 가입년월을 모두 입력해주세요.");
    }
    const newProductData = { 
      id: Date.now(), origin: newProduct.origin, category: newProduct.category, company: newProduct.company, productType: newProduct.productType, name: finalProductName, amount: newProduct.amount, enrollDate: newProduct.enrollDate, author: userProfile.name || '본인'
    };
    const existingProducts = selectedCustomer.products || [];
    updateSelectedCustomer({ products: [newProductData, ...existingProducts] });
    setIsAddingProduct(false); showToast("가입 상품 내역이 추가되었습니다.");
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      const currentTags = selectedCustomer.hashtags || [];
      if (!currentTags.includes(hashtagInput.trim())) updateSelectedCustomer({ hashtags: [...currentTags, hashtagInput.trim()] });
    }
    setHashtagInput(''); setIsAddingHashtag(false);
  };

  const handleRemoveHashtag = (tag) => {
    const currentTags = selectedCustomer.hashtags || []; updateSelectedCustomer({ hashtags: currentTags.filter(t => t !== tag) });
  };

  const getOffsetDate = (offsetDays) => {
    const d = new Date(); d.setDate(d.getDate() + offsetDays); return d.toISOString().split('T')[0];
  };

  const handleSaveHistory = () => {
    if (newHistory.type === '미팅약속') {
      if (!newHistory.time) return showToast("미팅 시간을 선택해주세요.");
      if (!newHistory.location.trim()) return showToast("미팅 장소를 입력해주세요.");
      if (!newHistory.note.trim()) newHistory.note = "미팅 일정이 등록되었습니다.";
    } else {
      if (!newHistory.note.trim()) return showToast("상담 내용을 입력해주세요.");
    }
    const historyEntry = { ...newHistory, id: Date.now(), author: userProfile.name || '본인' };
    const existingHistory = selectedCustomer.history || [];
    const allHistory = [historyEntry, ...existingHistory];
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    updateSelectedCustomer({ history: allHistory, lastContact: allHistory[0].date, note: allHistory[0].note });
    setIsAddingHistory(false); setNewHistory({ type: '통화', date: getOffsetDate(0), time: '', location: '', alarm: '알림 없음', note: '' }); showToast("새로운 상담 이력이 등록되었습니다.");
  };

  const handleSaveMemo = () => {
    if (!newMemoText.trim()) return showToast("메모 내용을 입력해주세요.");
    const currentDate = new Date().toISOString().split('T')[0];
    const memoEntry = { id: Date.now(), date: currentDate, type: '메모', note: newMemoText, author: userProfile.name || '본인' };
    const existingHistory = selectedCustomer.history || [];
    const allHistory = [memoEntry, ...existingHistory];
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
    setIsMainScanning(true); setMainScanStep(selectedCustomer ? 'detail_choice' : 'choice'); setManualData({ name: '', phone: '', job: '회사원', company: '', dept: '', position: '' });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMainScanStep('camera');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
      try {
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
          method: 'POST', body: JSON.stringify({ requests: [{ image: { content: base64Image }, features: [{ type: 'TEXT_DETECTION' }] }] })
        });
        const data = await response.json();
        const extractedText = data.responses[0]?.textAnnotations?.[0]?.description || '';
        
        const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l);
        let phone = ''; let email = ''; let name = lines[0] || '이름 인식 불가'; let company = lines[1] || '회사명 인식 불가';

        const phoneRegex = /(01[016789]|02|0[3-9][0-9]?)[-.\s]*[0-9]{3,4}[-.\s]*[0-9]{4}/g;
        const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;

        const phoneMatch = extractedText.match(phoneRegex); if (phoneMatch) phone = phoneMatch[0];
        const emailMatch = extractedText.match(emailRegex); if (emailMatch) email = emailMatch[0];

        setScannedData({
          name: name.replace(/[^가-힣a-zA-Z]/g, '').substring(0, 5), company: company, position: "직급/부서 입력", phone: phone, email: email, status: "가망", note: "Google AI 스캔으로 등록됨"
        });
        setMainScanStep('result'); showToast("명함 정보 인식이 완료되었습니다!");
      } catch (error) {
        console.error("OCR Error:", error); showToast("명함 인식에 실패했습니다. (API 키를 확인하세요)"); setMainScanStep('choice');
      }
    };
  };

  const handleSaveScannedData = async () => {
    if(!scannedData || !user) return;
    const currentDate = new Date().toISOString().split('T')[0];
    const newCustomer = {
      id: String(Date.now()), ...scannedData, product: "미정", lastContact: currentDate, createdAt: currentDate, hashtags: [], sharedWith: [], products: [],
      history: [{ id: String(Date.now()), date: currentDate, type: '대면상담', note: '명함 스캔으로 신규 등록됨', author: userProfile.name || '본인' }]
    };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(newCustomer.id)), newCustomer);
      setIsMainScanning(false); setScannedData(null); showToast(`${newCustomer.name} 고객이 등록되었습니다.`); setActiveTab('customers'); setCustomerTab(newCustomer.status);
    } catch(e) { console.error(e); }
  };

  const handleSaveManualData = async () => {
    if(!manualData.name || !manualData.phone || !user) return showToast('이름과 연락처를 입력해주세요.');
    const currentDate = new Date().toISOString().split('T')[0];
    const isCompanyRequired = ['회사원', '전문직'].includes(manualData.job);
    const jobCompany = isCompanyRequired ? (manualData.company || manualData.job) : manualData.job;
    const jobPosition = isCompanyRequired ? manualData.position : '';
    
    const newCustomer = {
      id: String(Date.now()), name: manualData.name, phone: manualData.phone, company: jobCompany, position: jobPosition, email: "", product: "미정", status: "가망", lastContact: currentDate, createdAt: currentDate, hashtags: [manualData.job], sharedWith: [], products: [],
      history: [{ id: String(Date.now()), date: currentDate, type: '대면상담', note: '직접 입력으로 신규 등록됨', author: userProfile.name || '본인' }]
    };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(newCustomer.id)), newCustomer);
      setIsMainScanning(false); setManualData({ name: '', phone: '', job: '회사원', company: '', dept: '', position: '' }); showToast(`${newCustomer.name} 고객 등록 완료.`); setActiveTab('customers'); setCustomerTab('가망');
    } catch(e) { console.error(e); }
  };

  const toggleHistoryExpand = (id) => setExpandedHistoryIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);

  const startUpdateScan = () => {
    setMainScanStep('update_camera');
    setTimeout(() => {
      setScannedData({ name: selectedCustomer.name, company: "(주)새로운직장", position: "임원", phone: selectedCustomer.phone, email: selectedCustomer.email || "new@email.com", status: selectedCustomer.status, note: "이직으로 인한 명함 업데이트" });
      setMainScanStep('update_result');
    }, 2000);
  };

  const handleSaveUpdatedCard = async () => {
    if(!scannedData || !user) return;
    const currentDate = new Date().toISOString().split('T')[0];
    const oldCard = { name: selectedCustomer.name, company: selectedCustomer.company, position: selectedCustomer.position, phone: selectedCustomer.phone, email: selectedCustomer.email, updatedAt: currentDate };
    const updatedCustomer = { ...selectedCustomer, name: scannedData.name, company: scannedData.company, position: scannedData.position, phone: scannedData.phone, email: scannedData.email, pastCards: [oldCard, ...(selectedCustomer.pastCards || [])] };
    updateSelectedCustomer(updatedCustomer); setIsMainScanning(false); setScannedData(null); showToast(`${updatedCustomer.name} 고객님의 명함이 업데이트 되었습니다.`);
  };

  const handleAddNewProfileCard = () => {
    setIsMyCardsModalOpen(false); setUserProfile({ id: String(Date.now()), name: '', company: '', dept1: '', dept2: '', position: '', phone: '', email: '', experience: '', certs: [], isPublic: true }); setAppState('scan');
  };

  const handleCompleteProfileStep2 = async () => {
    if (!user) return;
    const newCard = { ...userProfile, id: String(Date.now()) };
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'businessCards', String(newCard.id)), newCard); setUserProfile(newCard); setAppState('main'); showToast("프로필 명함이 성공적으로 등록되었습니다."); } catch(e) { console.error(e); }
  };

  const handleCompleteGeneralCard = async () => {
    if (!user) return;
    const newCard = { ...userProfile, id: String(Date.now()) };
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'businessCards', String(newCard.id)), newCard); setUserProfile(newCard); setAppState('main'); showToast("일반 명함이 성공적으로 등록되었습니다."); } catch(e) { console.error(e); }
  };

  const handleNotiClick = (noti) => {
    if (noti.type === '공지') setPopupData({ type: 'notice', data: noti });
    else if (noti.type === '약속') setPopupData({ type: 'appointment', data: noti });
  };

  const handleAcceptShare = async (e, noti) => {
    e.stopPropagation();
    const newCustomer = noti.payload;
    if (!customers.find(c => c.id === newCustomer.id) && user) {
      try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', String(newCustomer.id)), newCustomer); } catch(err) { console.error(err); }
    }
    setNotifications(notifications.filter(n => n.id !== noti.id)); showToast(`${newCustomer.name} 고객님 공유를 수락하여 리스트에 추가했습니다.`);
  };

  const handleRejectShare = (e, id) => { e.stopPropagation(); setNotifications(notifications.filter(n => n.id !== id)); showToast("고객 공유 요청을 거절했습니다."); };


  // ==========================================
  // 렌더링 함수들 (LeadUp 디자인 개선본)
  // ==========================================

  const renderIntroPage = () => (
    <div className="absolute inset-0 z-[200] bg-slate-50 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] shadow-2xl flex items-center justify-center text-white"><ShieldCheck size={48} strokeWidth={1.5} /></div>
        <div className="text-center space-y-2"><h1 className="text-4xl font-black text-slate-800 tracking-tighter">LeadUp <span className="text-indigo-600">Pro</span></h1><p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Insurance Sales Master</p></div>
      </div>
      <div className="absolute bottom-20"><Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /></div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="absolute inset-0 z-[190] bg-slate-50 flex flex-col px-8 pt-24 pb-12 animate-in slide-in-from-right duration-300">
      <div className="flex-1">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><UserPlus size={32} /></div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">영업의 시작,<br/>리드업과 함께하세요</h1>
        <p className="text-sm font-bold text-slate-500 mt-4 leading-relaxed">고객 관리부터 팀 협업까지<br/>보험 영업 프로를 위한 완벽한 솔루션</p>
      </div>
      <div className="space-y-3">
        <button onClick={() => setAppState('terms')} className="w-full bg-[#FEE500] text-[#000000] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-md border border-yellow-400/50"><MessageCircle size={18} className="fill-black" /> 카카오로 3초 만에 시작하기</button>
        <button onClick={() => setAppState('terms')} className="w-full bg-[#03C75A] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm"><span className="font-extrabold text-lg leading-none">N</span> 네이버로 시작하기</button>
        <button onClick={() => setAppState('terms')} className="w-full bg-white text-slate-800 border border-slate-200 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm"><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google로 시작하기</button>
        <button onClick={() => setAppState('terms')} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm mt-2"><Smartphone size={18} /> 휴대폰 번호로 가입하기</button>
      </div>
    </div>
  );

  const renderTermsPage = () => {
    const handleToggleAll = () => { const newVal = !tosAgreed.all; setTosAgreed({ all: newVal, service: newVal, privacy: newVal, marketing: newVal }); };
    const canProceed = tosAgreed.service && tosAgreed.privacy;
    return (
      <div className="absolute inset-0 z-[180] bg-slate-100 flex flex-col px-6 pt-20 pb-10 animate-in slide-in-from-right duration-300">
        <h2 className="text-2xl font-black text-slate-800 mb-8">서비스 이용 약관에<br/>동의해 주세요.</h2>
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-6 flex-1">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 cursor-pointer" onClick={handleToggleAll}>{tosAgreed.all ? <CheckSquare size={24} className="text-indigo-600" /> : <Square size={24} className="text-slate-300" />} <span className="font-black text-lg text-slate-800">약관 전체 동의</span></div>
          <div className="space-y-5">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setTosAgreed({...tosAgreed, service: !tosAgreed.service})}><div className="flex items-center gap-3">{tosAgreed.service ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-slate-300" />}<span className="font-bold text-sm text-slate-700">[필수] LeadUp 서비스 이용약관</span></div></div>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setTosAgreed({...tosAgreed, privacy: !tosAgreed.privacy})}><div className="flex items-center gap-3">{tosAgreed.privacy ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-slate-300" />}<span className="font-bold text-sm text-slate-700">[필수] 개인정보 수집 및 이용 동의</span></div></div>
          </div>
        </div>
        <button disabled={!canProceed} onClick={() => setAppState('scan')} className={`w-full py-5 rounded-2xl font-black text-base transition-all mt-6 shadow-md ${canProceed ? 'bg-indigo-600 text-white shadow-indigo-200 active:scale-95' : 'bg-slate-300 text-slate-500'}`}>동의하고 다음으로</button>
      </div>
    );
  };

  const renderScanProfilePage = () => {
    const startScan = () => { setIsScanning(true); setTimeout(() => { setIsScanning(false); setUserProfile(p => ({ ...p, name: '차기철', company: '대한생명', dept1: '수도권본부', dept2: '영업1팀', position: '부장', phone: '010-8888-9999', email: 'chagc@daehan.com' })); setAppState('profile_step1'); }, 2000); };
    return (
      <div className="absolute inset-0 z-[170] bg-slate-900 flex flex-col px-6 pt-20 pb-10 animate-in slide-in-from-right duration-300 text-center">
        <h2 className="text-2xl font-black text-white mb-3">본인 명함을 스캔하여<br/>프로필을 등록해 주세요.</h2>
        <p className="text-sm font-bold text-slate-400 mb-10">AI가 명함 정보를 자동으로 인식합니다.</p>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full aspect-[1.6/1] border-2 border-dashed border-indigo-400/50 rounded-3xl relative flex items-center justify-center overflow-hidden bg-slate-800/50">
            {isScanning ? <><div className="absolute inset-x-0 top-1/2 h-[2px] bg-indigo-500 shadow-[0_0_15px_3px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div><p className="text-indigo-400 font-black animate-pulse">명함 정보 인식 중...</p></> : <div className="text-slate-500 flex flex-col items-center gap-3"><Camera size={48} strokeWidth={1.5} /><span className="font-bold text-sm">이곳에 명함을 맞춰주세요</span></div>}
          </div>
        </div>
        <button disabled={isScanning} onClick={startScan} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-900 active:scale-95 transition-all mt-10 flex items-center justify-center gap-2"><Camera size={20} /> {isScanning ? '인식 중...' : '내 명함 촬영하기'}</button>
        <button onClick={() => setAppState('profile_step1')} className="mt-4 text-slate-400 font-bold text-xs underline underline-offset-4">직접 입력할게요</button>
        <style>{` @keyframes scan { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } } `}</style>
      </div>
    );
  };

  const renderProfileStep1Page = () => (
    <div className="absolute inset-0 z-[160] bg-slate-100 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="bg-white px-6 pt-14 pb-5 border-b border-slate-200 sticky top-0 z-10 shadow-sm flex items-center justify-between"><div><h2 className="text-2xl font-black text-slate-800">프로필 등록 <span className="text-indigo-600 ml-1">1/2</span></h2><p className="text-[11px] font-bold text-slate-500 mt-1">스캔된 명함 정보를 확인하고 수정하세요.</p></div></div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32 hide-scrollbar">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl aspect-[1.6/1] flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
           <div><p className="text-[10px] font-black text-slate-400 tracking-widest">{userProfile.company}</p><p className="text-[10px] font-bold text-slate-300 mt-0.5">{userProfile.dept1} {userProfile.dept2}</p><h3 className="text-2xl font-black mt-2 tracking-tight">{userProfile.name} <span className="text-xs font-bold text-slate-400 ml-1">{userProfile.position}</span></h3></div>
           <div><p className="text-[11px] font-bold text-slate-300 flex items-center gap-2"><Phone size={12}/> {userProfile.phone || '연락처 없음'}</p></div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={14}/> 스캔 정보 검토</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 ml-1">소속 회사</label><input type="text" value={userProfile.company} onChange={e=>setUserProfile({...userProfile, company:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mt-1 outline-none focus:border-indigo-400 shadow-sm" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 ml-1">소속 본부 (선택)</label><input type="text" value={userProfile.dept1} placeholder="예: 수도권본부" onChange={e=>setUserProfile({...userProfile, dept1:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mt-1 outline-none focus:border-indigo-400 shadow-sm" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 ml-1">소속 팀 (선택)</label><input type="text" value={userProfile.dept2} placeholder="예: 영업1팀" onChange={e=>setUserProfile({...userProfile, dept2:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mt-1 outline-none focus:border-indigo-400 shadow-sm" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 ml-1">직급</label><input type="text" value={userProfile.position} onChange={e=>setUserProfile({...userProfile, position:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mt-1 outline-none focus:border-indigo-400 shadow-sm" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 ml-1">이름</label><input type="text" value={userProfile.name} onChange={e=>setUserProfile({...userProfile, name:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mt-1 outline-none focus:border-indigo-400 shadow-sm" /></div>
            <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 ml-1">연락처</label><input type="text" value={userProfile.phone} onChange={e=>setUserProfile({...userProfile, phone:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mt-1 outline-none focus:border-indigo-400 shadow-sm" /></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent"><button onClick={() => myBusinessCards.length === 0 ? setAppState('profile_step2') : handleCompleteGeneralCard()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-200 active:scale-95 transition-all">{myBusinessCards.length === 0 ? "다음 단계로" : "프로필 등록 완료"}</button></div>
    </div>
  );

  const renderProfileStep2Page = () => {
    const toggleCert = (cert) => { setUserProfile(prev => ({ ...prev, certs: prev.certs.includes(cert) ? prev.certs.filter(c => c !== cert) : [...prev.certs, cert] })); };
    const isNextEnabled = userProfile.certs.length > 0; 
    return (
      <div className="absolute inset-0 z-[160] bg-slate-100 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="bg-white px-6 pt-14 pb-5 border-b border-slate-200 sticky top-0 z-10 shadow-sm flex items-center gap-3"><button onClick={() => setAppState('profile_step1')} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-600 border border-slate-200 shadow-sm active:scale-95"><ChevronLeft size={18} className="pr-0.5" /></button><div><h2 className="text-2xl font-black text-slate-800">프로필 등록 <span className="text-indigo-600 ml-1">2/2</span></h2><p className="text-[11px] font-bold text-slate-500 mt-1">전문성을 나타낼 영업 정보를 선택해주세요.</p></div></div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32 hide-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 ml-1 mb-2 block uppercase tracking-widest">보유 자격 리스트 (필수)</label>
              <p className="text-[10px] font-bold text-indigo-500 ml-1 mb-3">※ 최소 1개 이상의 자격을 선택해야 완료할 수 있습니다.</p>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map(cert => {
                  const isActive = userProfile.certs.includes(cert);
                  return (
                    <button key={cert} type="button" onClick={() => toggleCert(cert)} className={`px-4 py-2.5 rounded-xl text-xs font-black transition-colors border shadow-sm ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                      {cert}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 ml-1 mb-1 block uppercase tracking-widest">보험 영업 경력 (선택)</label>
              <div className="relative flex items-center">
                 <input type="number" placeholder="예: 5" value={userProfile.experience} onChange={e=>setUserProfile({...userProfile, experience:e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 shadow-sm" />
                 <span className="absolute right-4 text-xs font-bold text-slate-400">년차</span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="font-black text-slate-800 text-sm">사내 동료에게 프로필 공개</h4>
                <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">비공개 시 팀원 목록에 <br/>이름이 별표(예: 차**)로 표시됩니다.</p>
              </div>
              <button onClick={() => setUserProfile({...userProfile, isPublic: !userProfile.isPublic})} className="text-indigo-600 transition-transform active:scale-90">
                {userProfile.isPublic ? <ToggleRight size={40} strokeWidth={1.5} /> : <ToggleLeft size={40} className="text-slate-300" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent">
          <button 
            disabled={!isNextEnabled}
            onClick={handleCompleteProfileStep2} 
            className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-lg ${isNextEnabled ? 'bg-slate-800 text-white shadow-slate-800/30 active:scale-95' : 'bg-slate-300 text-slate-500'}`}
          >
            프로필 등록 완료
          </button>
        </div>
      </div>
    );
  };

  const renderHomePage = () => {
    const recentCustomers = [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return (
      // 💡 상단 패딩을 pt-1로 대폭 줄여 빈 공간(붕 뜨는 느낌)을 최소화했습니다.
      <div className="px-5 pt-1 pb-32 space-y-4 animate-in fade-in duration-500 flex flex-col min-h-full">
        <header className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
              Good Morning
              <button onClick={() => setIsMyCardsModalOpen(true)} className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] cursor-pointer hover:bg-indigo-200 transition-colors shrink-0">내 명함 {myBusinessCards.length}/5</button>
            </h2>
            <h1 className="text-lg font-black text-slate-800 mt-0.5 tracking-tight truncate">{userProfile.name ? `${userProfile.name}님` : '차부장님'}, 오늘도 화이팅!</h1>
            {user && <p className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1"><CheckCircle2 size={12}/> 실시간 클라우드 DB 연동 중</p>}
          </div>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <button onClick={() => { setActiveTab('team'); setSelectedTeamMember(null); }} className="bg-white border border-slate-200 pl-2 pr-1.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm hover:border-indigo-300 active:scale-95 transition-all text-left max-w-[130px]">
              <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center border border-indigo-100 shrink-0">
                <Building2 size={12} className="text-indigo-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-[10px] font-black text-slate-700 tracking-tight whitespace-nowrap truncate">{userProfile.company || '소속 미지정'}</p>
                <p className="text-[8px] font-bold text-slate-400 mt-0.5 tracking-tight whitespace-nowrap truncate">1,204명</p>
              </div>
              <ChevronRight size={12} className="text-slate-300 shrink-0 ml-0.5" />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-2 mt-1">
          <button onClick={() => { setCustomerTab('가망'); setActiveTab('customers'); }} className="bg-white py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:border-blue-300 active:bg-slate-50 transition-all">
            <UserPlus size={14} className="text-blue-500 mb-1.5" />
            <h4 className="text-[10px] font-black text-slate-700 whitespace-nowrap tracking-tight">가망 고객</h4>
            <p className="text-sm font-black text-blue-600 leading-none mt-1">{customers.filter(c => c.status === '가망' && !c.isSharedWithMe).length}<span className="text-[8px] font-bold text-slate-400 ml-0.5">명</span></p>
          </button>
          
          <button onClick={() => { setCustomerTab('가입'); setActiveTab('customers'); }} className="bg-white py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:border-emerald-300 active:bg-slate-50 transition-all">
            <UserCheck size={14} className="text-emerald-500 mb-1.5" />
            <h4 className="text-[10px] font-black text-slate-700 whitespace-nowrap tracking-tight">가입 고객</h4>
            <p className="text-sm font-black text-emerald-600 leading-none mt-1">{customers.filter(c => c.status === '가입' && !c.isSharedWithMe).length}<span className="text-[8px] font-bold text-slate-400 ml-0.5">명</span></p>
          </button>
          
          <button onClick={() => { setCustomerTab('거래처'); setActiveTab('customers'); }} className="bg-white py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center hover:border-orange-300 active:bg-slate-50 transition-all">
            <Briefcase size={14} className="text-orange-500 mb-1.5" />
            <h4 className="text-[10px] font-black text-slate-700 whitespace-nowrap tracking-tight">거래처</h4>
            <p className="text-sm font-black text-orange-600 leading-none mt-1">{customers.filter(c => c.status === '거래처' && !c.isSharedWithMe).length}<span className="text-[8px] font-bold text-slate-400 ml-0.5">곳</span></p>
          </button>
        </section>

        <section className="relative mt-1">
          <div className="flex justify-between items-end mb-2.5">
            <h3 className="text-xs font-black text-slate-700">최근 등록한 명함</h3>
            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">가로로 스와이프 <ChevronRight size={10} className="inline"/></span>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 pt-1 -mx-5 px-5 snap-x snap-mandatory">
            {recentCustomers.length > 0 ? recentCustomers.map(customer => (
              /* 💡 메인 명함 크기를 w-[280px] ➔ w-[315px]로 15% 확대하고 입체적인 그림자 추가 */
              <div key={customer.id} onClick={() => { setSelectedCustomer(customer); setCustomerDetailTab('기본정보'); }} className="w-[315px] h-[175px] rounded-[1.25rem] bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] border border-slate-200 p-5 relative overflow-hidden flex-shrink-0 snap-start cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{customer.company}</p>
                    <h3 className="text-xl font-black text-slate-800 mt-0.5 tracking-tight">{customer.name} <span className="text-[11px] font-bold text-slate-500 tracking-normal ml-1">{customer.position}</span></h3>
                  </div>
                  <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <Building2 size={18} className="text-slate-400" />
                  </div>
                </div>
                <div className="space-y-1.5 mt-5">
                  <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><Phone size={13} className="text-indigo-400"/> {customer.phone}</p>
                  {customer.email && <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><Mail size={13} className="text-indigo-400"/> {customer.email}</p>}
                </div>
                <div className="absolute bottom-5 right-5 flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest shadow-sm ${
                    customer.status === 'VIP' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 
                    customer.status === '가입' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                    customer.status === '가망' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                    'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>{customer.status}</span>
                  {customer.isSharedWithMe && (
                     <span className="px-2 py-1 rounded-md text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-0.5 shadow-sm"><Share2 size={8}/> 공유</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="w-[315px] h-[175px] rounded-[1.25rem] bg-slate-100 border border-slate-200 p-5 flex flex-col items-center justify-center flex-shrink-0 snap-start shadow-inner">
                <p className="text-xs font-bold text-slate-500">등록된 명함이 없습니다.</p>
              </div>
            )}
            <div className="min-w-[10px] flex-shrink-0"></div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1">
           <h3 className="text-xs font-black text-slate-700 mb-3.5">최근 관리된 연락처</h3>
           <div className="space-y-3">
            {customers.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact)).slice(0, 3).map(c => (
              <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerDetailTab('기본정보'); }} className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-black shadow-sm group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">{c.name[0]}</div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{c.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 tracking-tight mt-0.5">{c.company}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex gap-1 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black border ${
                      c.status === 'VIP' ? 'bg-purple-100 text-purple-600 border-purple-200' : 
                      c.status === '가입' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 
                      c.status === '가망' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                      'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                      {c.status}
                    </span>
                    {c.isSharedWithMe && <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded-md text-[8px] font-black border border-slate-200"><Share2 size={8}/></span>}
                  </div>
                  <span className="text-[8px] text-indigo-500 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">{c.lastContact}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <GoogleAdPlaceholder type="banner" className="mt-2 mb-2" />
      </div>
    );
  };

  const renderCustomerListPage = () => (
    <div className="p-5 space-y-4 animate-in slide-in-from-right duration-300 pb-32">
      <div className="flex justify-between items-center pt-2 mb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')} 
            className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ChevronLeft size={18} className="text-slate-600 pr-0.5" />
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">고객 DB 관리</h1>
        </div>
        <div className="bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200">
          <p className="text-[10px] font-black text-indigo-700">총 {filteredCustomers.length}명</p>
        </div>
      </div>

      <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-xl mb-4 border border-slate-200/50">
        {['가망', '가입', '거래처', '공유'].map(tab => (
          <button 
            key={tab}
            onClick={() => setCustomerTab(tab)}
            className={`flex-1 py-2.5 text-[12px] font-black rounded-lg transition-all ${customerTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-bold text-sm">해당 분류에 등록된 고객이 없습니다.</div>
        ) : (
          filteredCustomers.map((c, index) => (
            <React.Fragment key={c.id}>
              {index === 2 && <GoogleAdPlaceholder type="infeed" className="mb-3" />}
              
              <div onClick={() => { setSelectedCustomer(c); setCustomerDetailTab('기본정보'); }} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 text-lg font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-sm transition-colors shrink-0">{c.name[0]}</div>
                  <div className="min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <h3 className="text-[15px] font-black text-slate-800 tracking-tight truncate max-w-[100px]">{c.name}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md tracking-widest border shrink-0 shadow-sm ${
                        c.status === '가망' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        c.status === '가입' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        c.status === 'VIP' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        'bg-orange-50 text-orange-600 border-orange-200'
                      }`}>
                        {c.status}
                      </span>
                      {c.isSharedWithMe && (
                        <div className="w-5 h-5 rounded-full bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 shadow-sm" title={`${c.ownerName} 님이 공유함`}>
                          <Share2 size={10} strokeWidth={2.5}/>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-1.5 uppercase tracking-tight truncate">{c.company}</p>
                    
                    <div className="flex gap-2 mt-2.5">
                      <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">이력변경: {c.lastContact}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1.5 pl-2 shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.location.href=`tel:${c.phone}`; }} 
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all"
                  >
                    <Phone size={13} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.location.href=`sms:${c.phone}`; }} 
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all"
                  >
                    <MessageCircle size={13} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); showToast("카카오톡 채팅으로 연결합니다."); }} 
                    className="w-8 h-8 rounded-full bg-[#FEE500] border border-[#FDD800] text-black flex items-center justify-center shadow-sm hover:bg-[#FDD800] active:scale-95 transition-all"
                  >
                    <MessageSquare size={13} className="fill-black" />
                  </button>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );

  const renderTeamMockPage = () => {
    const deptMembers = TEAM_MEMBERS.filter(m => m.dept === '영업1팀');
    const companyMembers = TEAM_MEMBERS;
    const displayMembers = teamTab === 'dept' ? deptMembers : companyMembers;

    const orgString1 = userProfile.dept2 || '영업1팀';
    const orgString2 = userProfile.company || '대한생명';
    
    return (
      <div className="p-5 space-y-5 animate-in fade-in duration-300 pb-32">
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('home')} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 active:scale-95 transition-all">
              <ChevronLeft size={18} className="text-slate-600 pr-0.5" />
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">조직도</h1>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl border border-slate-200/50">
          <button onClick={() => setTeamTab('dept')} className={`flex-1 py-2.5 text-[11px] font-black rounded-lg transition-all ${teamTab === 'dept' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500'}`}>
            {orgString1} (45명)
          </button>
          <button onClick={() => setTeamTab('company')} className={`flex-1 py-2.5 text-[11px] font-black rounded-lg transition-all ${teamTab === 'company' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500'}`}>
            {orgString2} 전체 (1,204명)
          </button>
        </div>

        <div className="space-y-3">
           {displayMembers.map(member => (
             <div key={member.id} onClick={() => setSelectedTeamMember(member)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer active:scale-[0.98]">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-500 shadow-sm rounded-full flex items-center justify-center text-lg font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">{member.name[0]}</div>
                 <div>
                   <div className="flex items-center gap-1.5">
                     <h4 className="font-black text-sm text-slate-800">{member.isPublic ? member.name : `${member.name[0]}**`} <span className="text-[10px] font-bold text-slate-500 ml-0.5">{member.position}</span></h4>
                     {!member.isPublic && <ShieldCheck size={12} className="text-slate-300" />}
                   </div>
                   {teamTab === 'company' && member.dept && (
                     <p className="text-[10px] font-bold text-indigo-500 mt-0.5 tracking-tight">{member.dept}</p>
                   )}
                   <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">{member.isPublic ? (member.certs || '등록된 자격 없음') : '프로필 비공개'}</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={(e) => { e.stopPropagation(); showToast('메시지를 작성합니다.'); }} className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"><MessageCircle size={14} /></button>
                 <button onClick={(e) => { e.stopPropagation(); showToast('전화 연결합니다.'); }} className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"><Phone size={14} /></button>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderNotificationPage = () => {
    const filteredNotis = notiTab === '전체' ? notifications : notifications.filter(n => n.type === notiTab);
    
    return (
      <div className="p-5 space-y-5 animate-in fade-in duration-300 pb-32">
        <div className="flex justify-between items-center pt-2 mb-2">
          <h1 className="text-xl font-black text-slate-800 tracking-tight">알림 센터</h1>
        </div>
        
        <div className="flex gap-1.5 p-1 bg-slate-200/60 border border-slate-200/50 rounded-xl mb-4 overflow-x-auto hide-scrollbar">
          {['전체', '공지', '약속', '공유'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setNotiTab(tab)} 
              className={`flex-1 min-w-[60px] py-2.5 text-[12px] font-black rounded-lg transition-all ${notiTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          {filteredNotis.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-bold text-sm">알림이 없습니다.</div>
          ) : (
            filteredNotis.map(noti => {
              const Icon = noti.icon;
              return (
                <div key={noti.id} onClick={() => handleNotiClick(noti)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-start gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm ${noti.bg} ${noti.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${noti.bg} ${noti.color} border-${noti.color.split('-')[1]}-200`}>{noti.type}</span>
                      <span className="text-[9px] font-bold text-slate-400">{noti.time}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-800">{noti.title}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">{noti.desc}</p>
                    
                    {noti.type === '공유' && noti.isNew && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button onClick={(e) => handleRejectShare(e, noti.id)} className="flex-1 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-black rounded-lg active:scale-95 transition-all shadow-sm">거절</button>
                        <button onClick={(e) => handleAcceptShare(e, noti)} className="flex-1 py-2 bg-indigo-600 text-white text-[11px] font-black rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-200">수락하기</button>
                      </div>
                    )}
                  </div>
                  {noti.isNew && <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shadow-sm"></div>}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderTeamMemberDetailView = () => {
    if (!selectedTeamMember) return null;

    return (
      <div className="pb-10 animate-in slide-in-from-right duration-300 bg-slate-100 min-h-full">
        <div className="bg-white px-5 pt-4 pb-4 flex items-center sticky top-0 z-20 shadow-sm border-b border-slate-200 gap-3">
          <button onClick={() => setSelectedTeamMember(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 shadow-sm text-slate-600 active:scale-95 transition-all">
            <ChevronLeft size={20} className="pr-0.5" />
          </button>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">동료 상세 프로필</h2>
        </div>

        <div className="p-5">
          <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-[2rem] p-6 shadow-xl border border-slate-600 relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between text-white">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{userProfile.company || '대한생명'}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-0.5">{selectedTeamMember.dept}</p>
                <h3 className="text-2xl font-black mt-2 tracking-tight">
                  {selectedTeamMember.isPublic ? selectedTeamMember.name : `${selectedTeamMember.name[0]}**`} 
                  <span className="text-sm font-bold text-slate-400 ml-1">{selectedTeamMember.position}</span>
                </h3>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-sm backdrop-blur-md">
                <Building2 size={20} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-1.5 relative z-10">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-2.5 tracking-wide">
                <Phone size={14} className="text-indigo-400"/> 
                {selectedTeamMember.isPublic ? '010-****-****' : '비공개'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 flex gap-2 mb-6">
           <button onClick={() => showToast('전화 연결합니다.')} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 transition-all active:scale-95"><Phone size={14}/> 전화</button>
           <button onClick={() => showToast('메시지를 작성합니다.')} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 transition-all active:scale-95"><MessageCircle size={14}/> 문자</button>
        </div>

        <div className="p-5 pb-10">
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
             <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">소속</p>
               <p className="text-sm font-black text-slate-800">{userProfile.company || '대한생명'} {selectedTeamMember.dept}</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">보유 자격</p>
               <div className="flex flex-wrap gap-1.5 mt-2">
                 {selectedTeamMember.isPublic && selectedTeamMember.certs ? 
                   (Array.isArray(selectedTeamMember.certs) ? selectedTeamMember.certs : selectedTeamMember.certs.split(' · ')).map(cert => (
                     <span key={cert} className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[11px] font-black border border-indigo-200 shadow-sm">{cert}</span>
                   )) : 
                   <span className="text-xs font-bold text-slate-500">프로필 비공개 또는 등록된 자격 없음</span>
                 }
               </div>
             </div>
           </div>
        </div>
      </div>
    );
  };

  const renderCustomerDetailView = () => {
    if (!selectedCustomer) return null;

    let allCards = [];
    if (selectedCustomer) {
      allCards = [
        { 
          name: selectedCustomer.name, company: selectedCustomer.company, 
          position: selectedCustomer.position, phone: selectedCustomer.phone, 
          email: selectedCustomer.email, isCurrent: true 
        },
        ...(selectedCustomer.pastCards || []).map(c => ({...c, isCurrent: false}))
      ];
    }
    const displayCard = allCards.length > 0 ? (allCards[cardIndex] || allCards[0]) : {};

    return (
      <div className="pb-10 animate-in slide-in-from-right duration-300 bg-slate-100 min-h-full">
        <div className="bg-white px-5 pt-4 pb-4 flex justify-between items-center sticky top-0 z-20 shadow-sm border-b border-slate-200">
          <button onClick={() => setSelectedCustomer(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 shadow-sm active:scale-95 transition-all">
            <ChevronLeft size={20} className="pr-0.5" />
          </button>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">고객 상세 프로필</h2>
          <button onClick={() => { setShareSearchQuery(''); setSelectedShareMembers(selectedCustomer.sharedWith || []); setIsShareModalOpen(true); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm active:scale-95 transition-all">
            <Share2 size={16} strokeWidth={2.5}/>
          </button>
        </div>

        <div className="p-5">
          <div className="relative">
            {allCards.length > 1 && cardIndex === 0 && (
              <div 
                className="absolute inset-0 bg-slate-200 rounded-[2rem] rotate-3 scale-[0.96] origin-bottom translate-y-3 cursor-pointer border border-slate-300 shadow-sm hover:rotate-6 transition-all"
                onClick={() => setCardIndex(1)}
                title="이전 명함 보기"
              >
                <div className="absolute bottom-4 right-6 text-[10px] font-black text-slate-500 flex items-center gap-1">이전 명함 보기 <ChevronRight size={10}/></div>
              </div>
            )}
            {allCards.length > 1 && cardIndex > 0 && (
              <div 
                className="absolute inset-0 bg-indigo-100 rounded-[2rem] -rotate-3 scale-[0.96] origin-bottom translate-y-3 cursor-pointer border border-indigo-300 shadow-sm hover:-rotate-6 transition-all"
                onClick={() => setCardIndex(0)}
                title="최신 명함 보기"
              >
                <div className="absolute bottom-4 left-6 text-[10px] font-black text-indigo-600 flex items-center gap-1"><ChevronLeft size={10}/> 최신 명함 보기</div>
              </div>
            )}

            <div className={`rounded-[2rem] p-6 shadow-xl border relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between z-10 transition-all ${
              selectedCustomer.isSharedWithMe 
                ? 'bg-gradient-to-br from-purple-50 to-white border-purple-300' 
                : (displayCard.isCurrent ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300')
            }`}>
              {selectedCustomer.isSharedWithMe && (
                <Share2 size={140} className="absolute -right-6 -bottom-6 text-purple-500 opacity-5 pointer-events-none" />
              )}
              {!displayCard.isCurrent && (
                <div className="absolute top-6 right-6 bg-slate-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-sm">과거 명함</div>
              )}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className={`text-[10px] font-bold tracking-widest uppercase ${selectedCustomer.isSharedWithMe ? 'text-purple-500' : 'text-slate-500'}`}>{displayCard.company}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <h3 className="text-2xl font-black tracking-tight text-slate-800">{displayCard.name} <span className="text-sm font-bold text-slate-500 ml-0.5">{displayCard.position}</span></h3>
                    {selectedCustomer.isSharedWithMe && displayCard.isCurrent && (
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center shadow-sm shrink-0" title={`${selectedCustomer.ownerName} 님의 공유 고객`}>
                        <Share2 size={12} strokeWidth={2.5}/>
                      </div>
                    )}
                  </div>
                  {selectedCustomer.isSharedWithMe && displayCard.isCurrent && (
                     <div className="inline-flex items-center gap-1 mt-2 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                       <Share2 size={10} className="text-slate-500" />
                       <span className="text-[9px] font-black text-slate-600">{selectedCustomer.ownerName} 님의 공유 고객</span>
                     </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 ${selectedCustomer.isSharedWithMe ? 'bg-purple-50 border-purple-200 text-purple-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <Building2 size={20} />
                </div>
              </div>
              <div className="space-y-1.5 relative z-10 mt-3">
                <p className={`text-xs font-bold flex items-center gap-2.5 tracking-wide ${selectedCustomer.isSharedWithMe ? 'text-purple-700' : 'text-slate-700'}`}><Phone size={14} className={selectedCustomer.isSharedWithMe ? 'text-purple-500' : 'text-slate-400'}/> {displayCard.phone}</p>
                {displayCard.email && <p className={`text-xs font-bold flex items-center gap-2.5 tracking-wide ${selectedCustomer.isSharedWithMe ? 'text-purple-700' : 'text-slate-700'}`}><Mail size={14} className={selectedCustomer.isSharedWithMe ? 'text-purple-500' : 'text-slate-400'}/> {displayCard.email}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 flex gap-2 mb-6">
          <button onClick={() => window.location.href=`tel:${selectedCustomer.phone}`} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 transition-all active:scale-95"><Phone size={14}/> 전화</button>
           <button onClick={() => window.location.href=`sms:${selectedCustomer.phone}`} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 transition-all active:scale-95"><MessageCircle size={14}/> 문자</button>
           <button onClick={() => showToast('카카오톡 채널로 연결합니다.')} className="flex-1 bg-[#FEE500] border border-[#FDD800] text-black py-3.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#FDD800] transition-all active:scale-95"><MessageSquare size={14} className="fill-black"/> 카톡</button>
        </div>

        <div className="px-2 flex w-full justify-between sticky top-[68px] bg-slate-100 z-10 pt-2 border-b border-slate-300">
          {['기본정보', '상담이력', '가입상품', '메모'].map(tab => (
            <button 
              key={tab}
              onClick={() => setCustomerDetailTab(tab)}
              className={`flex-1 text-center pb-3 text-[13px] font-black transition-colors relative ${customerDetailTab === tab ? 'text-indigo-600' : 'text-slate-500'}`}
            >
              {tab}
              {customerDetailTab === tab && <div className="absolute bottom-0 inset-x-0 mx-auto w-10 h-0.5 bg-indigo-600 rounded-t-full shadow-[0_-2px_4px_rgba(79,70,229,0.5)]"></div>}
            </button>
          ))}
        </div>

        <div className="p-5 pb-10">
          {customerDetailTab === '기본정보' && (
             <div className="space-y-3 animate-in fade-in duration-300">
               <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">고객 분류 상태 (원본)</p>
                   {!isEditingStatus && !selectedCustomer.isSharedWithMe && (
                     <button onClick={() => { setTempStatus(selectedCustomer.status); setIsEditingStatus(true); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1 shadow-sm"><Edit2 size={10}/> 변경하기</button>
                   )}
                 </div>
                 {!isEditingStatus ? (
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-widest border shadow-sm ${
                         selectedCustomer.status === 'VIP' ? 'bg-purple-100 text-purple-600 border-purple-200' : 
                         selectedCustomer.status === '가입' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 
                         selectedCustomer.status === '가망' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                         'bg-orange-50 text-orange-600 border-orange-200'
                       }`}>{selectedCustomer.status} 고객</span>
                    </div>
                 ) : (
                    <div className="space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex gap-2">
                        {['가망', '가입', 'VIP', '거래처'].map(status => (
                          <button 
                            key={status} 
                            onClick={() => setTempStatus(status)} 
                            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border shadow-sm ${tempStatus === status ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setIsEditingStatus(false)} className="flex-1 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black transition-colors active:bg-slate-200 shadow-sm">취소</button>
                        <button onClick={() => { updateSelectedCustomer({ status: tempStatus }); setIsEditingStatus(false); showToast("고객 상태가 변경되었습니다."); }} className="flex-[2] py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-lg shadow-indigo-200 transition-transform active:scale-95">저장 확인</button>
                      </div>
                    </div>
                 )}
               </div>

               <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-2.5">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12}/> 커스텀 해시태그</p>
                   <button onClick={() => setIsAddingHashtag(true)} className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm flex items-center justify-center hover:bg-indigo-100 transition-colors"><Plus size={14}/></button>
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                   {selectedCustomer.hashtags?.map(tag => (
                     <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[11px] font-black border border-indigo-200 shadow-sm">
                       #{tag}
                       <X size={12} className="cursor-pointer hover:text-indigo-800 opacity-50 hover:opacity-100" onClick={() => handleRemoveHashtag(tag)} />
                     </span>
                   ))}
                   {isAddingHashtag && (
                     <input 
                       autoFocus
                       type="text" 
                       value={hashtagInput}
                       onChange={e => setHashtagInput(e.target.value)}
                       onBlur={handleAddHashtag}
                       onKeyDown={e => {
                         if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleAddHashtag(); }
                       }}
                       className="w-24 bg-white border border-indigo-300 rounded-lg px-2 py-1 text-[11px] font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-100 shadow-inner"
                       placeholder="입력..."
                     />
                   )}
                   {!(selectedCustomer.hashtags?.length > 0) && !isAddingHashtag && (
                     <p className="text-[11px] text-slate-400 font-bold">등록된 해시태그가 없습니다.</p>
                   )}
                 </div>
               </div>

               {!selectedCustomer.isSharedWithMe && (
                 <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => { setShareSearchQuery(''); setSelectedShareMembers(selectedCustomer.sharedWith || []); setIsShareModalOpen(true); }}>
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">공동 관리 팀원 <span className="text-indigo-600 ml-1 font-black">{(selectedCustomer.sharedWith || []).length}명</span></p>
                     <div className="flex items-center gap-2">
                       <div className="flex -space-x-2">
                         {selectedCustomer.sharedWith?.length > 0 ? (
                            selectedCustomer.sharedWith.slice(0, 4).map(id => {
                              const m = TEAM_MEMBERS.find(tm => tm.id === id);
                              return <div key={id} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-600 shadow-sm" title={m?.name}>{m?.name[0]}</div>
                            })
                         ) : <p className="text-[11px] text-slate-400 font-bold">공유된 팀원이 없습니다.</p>}
                         {(selectedCustomer.sharedWith?.length || 0) > 4 && <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-500 shadow-sm">+{selectedCustomer.sharedWith.length - 4}</div>}
                       </div>
                       <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1 shadow-sm">관리/변경</span>
                     </div>
                   </div>
                   <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600">
                     <Users size={16} />
                   </div>
                 </div>
               )}

               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                 <div className="flex-1">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">최초 등록 일자</p>
                   <div className="flex items-center gap-2">
                     <input 
                       type="date" 
                       value={selectedCustomer.createdAt} 
                       onChange={e => updateSelectedCustomer({ createdAt: e.target.value })}
                       className="text-base font-black text-slate-800 outline-none w-full bg-transparent cursor-pointer"
                       disabled={selectedCustomer.isSharedWithMe}
                     />
                   </div>
                 </div>
                 <CalendarDays size={24} className="text-indigo-200" />
               </div>

             </div>
          )}

          {customerDetailTab === '상담이력' && (
             <div className="animate-in fade-in duration-300 space-y-4">
               {!isAddingHistory ? (
                 <>
                   <div className="flex justify-between items-center px-1">
                     <h3 className="text-xs font-black text-slate-800">전체 상담 이력</h3>
                     <button onClick={() => {
                        setIsAddingHistory(true);
                        setNewHistory({ type: '통화', date: getOffsetDate(0), time: '', location: '', alarm: '알림 없음', note: '' });
                     }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors shadow-sm">
                       <Plus size={12} strokeWidth={3} /> 신규 이력 추가
                     </button>
                   </div>
                   
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                     {!(selectedCustomer.history?.length > 0) ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold">등록된 상담 이력이 없습니다.</div>
                     ) : (
                       <div className="relative pl-5 border-l-2 border-indigo-200 space-y-8">
                         {(selectedCustomer.history || [])
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((h, i) => {
                           const histType = CONTACT_TYPES.find(t => t.id === h.type) || CONTACT_TYPES[0];
                           const HistIcon = histType.icon;
                           const isExpanded = expandedHistoryIds.includes(h.id);
                           
                           return (
                             <div key={h.id || i} className={`relative ${i !== 0 ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
                               <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ring-4 ring-white shadow-sm ${i === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                               <div className="flex justify-between items-center mb-2 pr-1">
                                 <div className="flex items-center gap-2">
                                   <p className={`text-[10px] font-bold ${i === 0 ? 'text-indigo-600' : 'text-slate-500'}`}>{h.date}</p>
                                   <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border flex items-center gap-1 shadow-sm ${histType.bg} ${histType.color} ${histType.border}`}>
                                     <HistIcon size={10} strokeWidth={3} /> {h.type}
                                   </span>
                                 </div>
                                 {h.author && (
                                   <span className="text-[8px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                     <Edit2 size={8} /> {h.author}
                                   </span>
                                 )}
                               </div>
                               
                               <div 
                                 onClick={() => toggleHistoryExpand(h.id)}
                                 className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-1.5 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all shadow-sm"
                               >
                                  <div className={`overflow-hidden transition-all ${isExpanded ? 'max-h-[500px]' : 'max-h-[38px]'}`}>
                                    {h.type === '미팅약속' && (h.time || h.location) && (
                                      <div className={`mb-2 pb-2 border-b border-slate-200/60 space-y-1.5 ${!isExpanded ? 'hidden' : ''}`}>
                                         {h.time && <p className="text-[10px] font-black text-rose-600 flex items-center gap-1.5"><Clock size={12}/> 약속 시간: {h.time} {h.alarm && h.alarm !== '알림 없음' ? <span className="bg-rose-100 px-1.5 py-0.5 rounded text-[8px] border border-rose-200">🔔 {h.alarm}</span> : ''}</p>}
                                         {h.location && <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1.5"><MapPin size={12}/> 장소: {h.location}</p>}
                                      </div>
                                    )}
                                    <p className={`text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}>{h.note}</p>
                                  </div>
                                  <div className="flex justify-center mt-2 pt-1 border-t border-slate-200/50">
                                      {isExpanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                                  </div>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     )}
                   </div>
                   
                   <GoogleAdPlaceholder className="mt-6" />
                 </>
               ) : (
                 <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                   <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">신규 상담 이력 등록</h4>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 mb-2 block">상담 일자</label>
                       <div className="flex gap-2 mb-2">
                         <button type="button" onClick={() => setNewHistory({...newHistory, date: getOffsetDate(-2)})} className="flex-1 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 shadow-sm rounded-lg text-[10px] font-black hover:bg-slate-200">그제</button>
                         <button type="button" onClick={() => setNewHistory({...newHistory, date: getOffsetDate(-1)})} className="flex-1 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 shadow-sm rounded-lg text-[10px] font-black hover:bg-slate-200">어제</button>
                         <button type="button" onClick={() => setNewHistory({...newHistory, date: getOffsetDate(0)})} className="flex-1 py-1.5 bg-indigo-600 text-white shadow-md shadow-indigo-200 rounded-lg text-[10px] font-black border border-indigo-600">오늘</button>
                         <button type="button" onClick={() => setNewHistory({...newHistory, date: getOffsetDate(1)})} className="flex-1 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 shadow-sm rounded-lg text-[10px] font-black hover:bg-slate-200">내일</button>
                       </div>
                       <input type="date" value={newHistory.date} onChange={e => setNewHistory({...newHistory, date: e.target.value})} className="w-full bg-white border border-slate-300 shadow-sm rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" />
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 mb-2 block">상담 채널 / 방식</label>
                       <div className="grid grid-cols-3 gap-2">
                         {CONTACT_TYPES.map(type => {
                           const Icon = type.icon;
                           const isSelected = newHistory.type === type.id;
                           return (
                             <button key={type.id} type="button" onClick={() => setNewHistory({...newHistory, type: type.id})} className={`flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-xl border transition-all ${isSelected ? `${type.border} ${type.bg} shadow-md scale-105` : 'border-slate-200 shadow-sm bg-white hover:bg-slate-50'}`}>
                               <Icon size={16} className={isSelected ? type.color : 'text-slate-400'} />
                               <span className={`text-[10px] font-black ${isSelected ? type.color : 'text-slate-500'}`}>{type.id}</span>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                     {newHistory.type === '미팅약속' && (
                       <div className="space-y-4 animate-in fade-in duration-300 border-t border-slate-100 pt-4 mt-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[10px] font-bold text-slate-500 mb-1.5 block">약속 시간 *</label><input type="time" value={newHistory.time} onChange={e => setNewHistory({...newHistory, time: e.target.value})} className="w-full bg-white shadow-sm border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 mb-1.5 block">알림 설정</label>
                              <div className="relative">
                                <select value={newHistory.alarm} onChange={e => setNewHistory({...newHistory, alarm: e.target.value})} className="w-full bg-white shadow-sm border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 appearance-none">
                                  <option>알림 없음</option><option>정각</option><option>1시간 전</option><option>하루 전</option>
                                </select>
                                <ChevronRight size={16} className="absolute right-4 top-3.5 text-slate-400 rotate-90 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                          <div><label className="text-[10px] font-bold text-slate-500 mb-1.5 block">미팅 장소 *</label><input type="text" placeholder="예: 강남역 3번출구 스타벅스" value={newHistory.location} onChange={e => setNewHistory({...newHistory, location: e.target.value})} className="w-full bg-white shadow-sm border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400" /></div>
                       </div>
                     )}
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 mb-2 block">{newHistory.type === '미팅약속' ? '미팅 목적 / 특이사항' : '상담 내용'}</label>
                       <textarea rows="4" placeholder={newHistory.type === '미팅약속' ? "미팅의 목적이나 사전에 준비할 특이사항을 기록해 주세요." : "고객과의 상담 내용이나 특이사항을 상세히 기록해 주세요."} value={newHistory.note} onChange={e => setNewHistory({...newHistory, note: e.target.value})} className="w-full bg-white shadow-inner border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none leading-relaxed"></textarea>
                     </div>
                   </div>
                   <div className="flex gap-2 pt-2">
                     <button onClick={() => setIsAddingHistory(false)} className="flex-1 bg-slate-100 border border-slate-200 shadow-sm text-slate-600 py-3.5 rounded-xl font-black text-xs transition-colors active:bg-slate-200">취소</button>
                     <button onClick={handleSaveHistory} className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl font-black text-xs transition-transform active:scale-95 shadow-lg shadow-indigo-200">이력 등록하기</button>
                   </div>
                 </div>
               )}
             </div>
          )}

          {customerDetailTab === '가입상품' && (
             <div className="animate-in fade-in duration-300">
               {!isAddingProduct ? (
                 <div className="space-y-6">
                   {/* 1. 신규 가입 상품 */}
                   <div>
                     <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={14}/> 신규 가입 상품</h4></div>
                     {!(selectedCustomer.products?.filter(p => p.origin === '가입상품' || p.origin === '신규 계약').length > 0) ? (
                       <div className="bg-white p-4 rounded-xl text-center text-[10px] font-bold text-slate-400 border border-slate-200 shadow-sm">등록된 가입 상품이 없습니다.</div>
                     ) : (
                       <div className="space-y-2">
                         {selectedCustomer.products.filter(p => p.origin === '가입상품' || p.origin === '신규 계약').map(p => {
                           const catData = INSURANCE_DATA[p.category] || {};
                           const compData = catData[p.company] || { color: '#64748B' };
                           const bgColor = compData.color;
                           return (
                             <div key={p.id} className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: bgColor }}></div>
                               <div className="flex justify-between items-center mb-1.5 pl-2">
                                 <div className="flex items-center gap-1.5"><span className="text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border" style={{ color: bgColor, backgroundColor: `${bgColor}15`, borderColor: `${bgColor}30` }}>{p.company}</span><span className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><span className="text-emerald-500 font-black">[{p.origin}]</span> {p.enrollDate} 가입</span></div>
                                 {p.author && <span className="text-[8px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{p.author} 등록</span>}
                               </div>
                               <h5 className="text-sm font-black text-slate-800 tracking-tight pl-2">{p.name}</h5>
                               <p className="text-[10px] font-bold text-slate-500 mt-1.5 pl-2">가입금액: <span className="text-slate-800">{p.amount}</span></p>
                             </div>
                           )
                         })}
                       </div>
                     )}
                   </div>
                   {/* 2. 기존 가입 상품 */}
                   <div>
                     <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={14}/> 기존 상품 (타사 포함)</h4></div>
                     {!(selectedCustomer.products?.filter(p => p.origin === '기존상품' || p.origin === '기존 가입').length > 0) ? (
                       <div className="bg-white p-4 rounded-xl text-center text-[10px] font-bold text-slate-400 border border-slate-200 shadow-sm">등록된 기존 상품이 없습니다.</div>
                     ) : (
                       <div className="space-y-2">
                         {selectedCustomer.products.filter(p => p.origin === '기존상품' || p.origin === '기존 가입').map(p => {
                           const catData = INSURANCE_DATA[p.category] || {};
                           const compData = catData[p.company] || { color: '#64748B' };
                           const bgColor = compData.color;
                           return (
                             <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400"></div>
                               <div className="flex justify-between items-center mb-1.5 pl-2">
                                 <div className="flex items-center gap-1.5"><span className="text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border" style={{ color: bgColor, backgroundColor: `${bgColor}15`, borderColor: `${bgColor}30` }}>{p.company}</span><span className="text-[9px] font-bold text-slate-500">{p.enrollDate} 가입</span></div>
                                 {p.author && <span className="text-[8px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{p.author} 등록</span>}
                               </div>
                               <h5 className="text-sm font-black text-slate-800 tracking-tight pl-2">{p.name}</h5>
                               <p className="text-[10px] font-bold text-slate-500 mt-1.5 pl-2">가입금액: <span className="text-slate-800">{p.amount}</span></p>
                             </div>
                           )
                         })}
                       </div>
                     )}
                   </div>
                   {/* 3. 추천/소개 상품 */}
                   <div>
                     <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5"><LayoutGrid size={14}/> 추천/소개 상품</h4></div>
                     {!(selectedCustomer.products?.filter(p => p.origin === '소개상품').length > 0) ? (
                       <div className="bg-white p-4 rounded-xl text-center text-[10px] font-bold text-slate-400 border border-slate-200 shadow-sm">등록된 추천/소개 상품이 없습니다.</div>
                     ) : (
                       <div className="space-y-2">
                         {selectedCustomer.products.filter(p => p.origin === '소개상품').map(p => {
                           const catData = INSURANCE_DATA[p.category] || {};
                           const compData = catData[p.company] || { color: '#64748B' };
                           const bgColor = compData.color;
                           return (
                             <div key={p.id} className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: bgColor }}></div>
                               <div className="flex justify-between items-center mb-1.5 pl-2">
                                 <div className="flex items-center gap-1.5"><span className="text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border" style={{ color: bgColor, backgroundColor: `${bgColor}15`, borderColor: `${bgColor}30` }}>{p.company}</span><span className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><span className="text-blue-500 font-black">[{p.origin}]</span> {p.enrollDate} 추천</span></div>
                                 {p.author && <span className="text-[8px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">{p.author} 등록</span>}
                               </div>
                               <h5 className="text-sm font-black text-slate-800 tracking-tight pl-2">{p.name}</h5>
                               <p className="text-[10px] font-bold text-slate-500 mt-1.5 pl-2">예상금액: <span className="text-slate-800">{p.amount}</span></p>
                             </div>
                           )
                         })}
                       </div>
                     )}
                   </div>
                   <button onClick={() => setIsAddingProduct(true)} className="w-full py-4 mt-2 border-2 border-dashed border-indigo-300 bg-white text-indigo-600 font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors active:scale-95 shadow-sm"><Plus size={16} /> 새로운 가입/소개상품 등록</button>
                   <GoogleAdPlaceholder type="banner" className="mt-6 mb-2" />
                 </div>
               ) : (
                 <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                   <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">가입상품 상세 등록</h4>
                   <div className="space-y-5">
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-widest">상품 출처 구분</label>
                       <div className="flex gap-2">
                         {['가입상품', '기존상품', '소개상품'].map(origin => (
                           <button key={origin} type="button" onClick={() => setNewProduct({...newProduct, origin})} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all border shadow-sm ${newProduct.origin === origin ? 'border-indigo-500 bg-indigo-600 text-white shadow-indigo-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{origin}</button>
                         ))}
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-widest">보험 종류</label>
                       <div className="flex gap-2">
                         {['생명보험', '손해보험'].map(cat => (
                           <button key={cat} type="button" onClick={() => setNewProduct({...newProduct, category: cat})} className={`flex-1 py-2.5 rounded-xl text-xs font-black border shadow-sm transition-all ${newProduct.category === cat ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : 'border-slate-200 text-slate-600 bg-white'}`}>{cat}</button>
                         ))}
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-widest">가입 보험사</label>
                       <div className="relative">
                         <select value={newProduct.company} onChange={(e) => setNewProduct({...newProduct, company: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-3.5 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 appearance-none shadow-sm text-slate-800">
                            {Object.keys(INSURANCE_DATA[newProduct.category] || {}).map(company => (<option key={company} value={company}>{company}</option>))}
                         </select>
                         <ChevronRight size={16} className="absolute right-4 top-4 text-slate-400 rotate-90 pointer-events-none" />
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-widest">상품군 분류</label>
                       <div className="relative">
                         <select value={newProduct.productType} onChange={(e) => { const pType = e.target.value; const firstProd = INSURANCE_DATA[newProduct.category]?.[newProduct.company]?.types?.[pType]?.[0] || '직접 입력'; setNewProduct({...newProduct, productType: pType, name: firstProd, isCustomName: firstProd === '직접 입력', customName: ''}); }} className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-3.5 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 appearance-none shadow-sm text-slate-800">
                            {Object.keys(INSURANCE_DATA[newProduct.category]?.[newProduct.company]?.types || {}).map(type => (<option key={type} value={type}>{type}</option>))}
                         </select>
                         <ChevronRight size={16} className="absolute right-4 top-4 text-slate-400 rotate-90 pointer-events-none" />
                       </div>
                     </div>
                     <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                       <div>
                         <label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-widest">상품명 선택</label>
                         <div className="relative">
                           <select value={newProduct.isCustomName ? '직접 입력' : newProduct.name} onChange={(e) => { const val = e.target.value; setNewProduct({...newProduct, name: val, isCustomName: val === '직접 입력', customName: val === '직접 입력' ? newProduct.customName : ''}); }} className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 appearance-none shadow-sm text-slate-800">
                              {(INSURANCE_DATA[newProduct.category]?.[newProduct.company]?.types?.[newProduct.productType] || ['직접 입력']).map(prod => (<option key={prod} value={prod}>{prod}</option>))}
                           </select>
                           <ChevronRight size={16} className="absolute right-4 top-3.5 text-slate-400 rotate-90 pointer-events-none" />
                         </div>
                       </div>
                       {newProduct.isCustomName && (
                         <div className="animate-in slide-in-from-top-2 duration-200">
                           <input type="text" placeholder="상품명을 직접 입력하세요" value={newProduct.customName} onChange={(e) => setNewProduct({...newProduct, customName: e.target.value})} className="w-full bg-white border border-indigo-300 rounded-xl px-4 py-3 text-sm font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm" />
                         </div>
                       )}
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div><label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-widest">가입 금액</label><input type="text" placeholder="예: 1억원" value={newProduct.amount} onChange={(e) => setNewProduct({...newProduct, amount: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 shadow-sm" /></div>
                       <div><label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-widest">가입/소개 년월</label><input type="month" value={newProduct.enrollDate} onChange={(e) => setNewProduct({...newProduct, enrollDate: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 shadow-sm" /></div>
                     </div>
                   </div>
                   <div className="flex gap-2 pt-4 border-t border-slate-100">
                     <button onClick={() => setIsAddingProduct(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-black text-xs transition-colors active:bg-slate-200 shadow-sm border border-slate-200">취소</button>
                     <button onClick={handleSaveProduct} className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl font-black text-xs transition-transform active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-1.5"><CheckCircle2 size={16} /> 상품 등록하기</button>
                   </div>
                 </div>
               )}
             </div>
          )}

          {customerDetailTab === '메모' && (
             <div className="animate-in fade-in duration-300 space-y-4">
               {!isAddingMemo ? (
                 <>
                   <div className="flex justify-between items-center px-1">
                     <h3 className="text-xs font-black text-slate-800">전체 상담 메모</h3>
                     <button onClick={() => { setIsAddingMemo(true); setNewMemoText(''); }} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors shadow-sm"><Plus size={12} strokeWidth={3} /> 신규 메모 추가</button>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[200px] flex flex-col">
                     <div className="flex-1 space-y-4">
                       {selectedCustomer.history && selectedCustomer.history.filter(h => h.type === '메모').length > 0 ? (
                         selectedCustomer.history.filter(h => h.type === '메모').map(h => {
                           const isExpanded = expandedHistoryIds.includes(h.id);
                           return (
                             <div key={h.id} onClick={() => toggleHistoryExpand(h.id)} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 relative cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all shadow-sm">
                               <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-1.5"><span className="text-[10px] font-black text-indigo-600">{h.date}</span><span className="text-[9px] font-black text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded shadow-sm">{h.type}</span></div>{h.author && <span className="text-[8px] font-black text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm"><Edit2 size={8}/> {h.author}</span>}</div>
                               <div className={`overflow-hidden transition-all ${isExpanded ? 'max-h-[500px]' : 'max-h-[38px]'}`}><p className={`text-xs font-bold text-slate-800 leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}>{h.note}</p></div>
                               <div className="flex justify-center mt-2 pt-1 border-t border-slate-200/50">{isExpanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}</div>
                             </div>
                           )
                         })
                       ) : (<p className="text-xs font-bold text-slate-400 text-center py-6">등록된 이력 메모가 없습니다.</p>)}
                     </div>
                   </div>
                   <GoogleAdPlaceholder type="banner" className="mt-6 mb-2" />
                 </>
               ) : (
                 <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                   <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">신규 메모 작성</h4>
                   <div><textarea rows="5" placeholder="고객에 대한 중요한 메모나 특이사항을 기록해 주세요." value={newMemoText} onChange={e => setNewMemoText(e.target.value)} className="w-full bg-white shadow-inner border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none leading-relaxed" autoFocus></textarea></div>
                   <div className="flex gap-2 pt-2 border-t border-slate-100">
                     <button onClick={() => setIsAddingMemo(false)} className="flex-1 bg-slate-100 border border-slate-200 shadow-sm text-slate-600 py-3.5 rounded-xl font-black text-xs transition-colors active:bg-slate-200">취소</button>
                     <button onClick={handleSaveMemo} className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl font-black text-xs transition-transform active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-1.5"><CheckCircle2 size={16} /> 메모 저장하기</button>
                   </div>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderBottomNav = () => (
    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-between items-center h-[76px] pb-4 pt-1 px-6 z-40 rounded-b-[2.5rem]">
      <div className="flex gap-8">
        <button onClick={() => { setActiveTab('home'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' && !selectedCustomer && !selectedTeamMember ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Home size={22} /><span className="text-[9px] font-bold">홈</span>
        </button>
        <button onClick={() => { setActiveTab('customers'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'customers' && !selectedCustomer ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Users size={22} /><span className="text-[9px] font-bold">고객관리</span>
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex justify-center">
        <button onClick={handleOpenScanner} className="bg-indigo-600 text-white w-[60px] h-[60px] rounded-full shadow-lg shadow-indigo-300 flex flex-col items-center justify-center active:scale-95 transition-transform border-[5px] border-slate-100">
          <Camera size={24} className="mb-0.5" />
        </button>
      </div>

      <div className="flex gap-8">
        <button onClick={() => { setActiveTab('team'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'team' && !selectedCustomer && !selectedTeamMember ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Share2 size={22} /><span className="text-[9px] font-bold">팀 공유</span>
        </button>
        <button onClick={() => { setActiveTab('profile'); setSelectedCustomer(null); setSelectedTeamMember(null); }} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' && !selectedCustomer ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className="relative"><Bell size={22} /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span></div>
          <span className="text-[9px] font-bold">알림</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />

      <div className="min-h-screen bg-slate-900 flex items-center justify-center sm:p-8">
        <div className="relative w-full h-[100dvh] sm:w-[390px] sm:h-[844px] bg-black sm:rounded-[3.5rem] shadow-2xl overflow-hidden sm:p-2.5 flex-shrink-0 ring-1 ring-white/10">
          <div className="relative w-full h-full bg-slate-100 sm:rounded-[3rem] overflow-hidden flex flex-col font-sans select-none border border-slate-300/50">
            <div className="absolute top-0 inset-x-0 h-12 flex justify-between items-center px-7 z-[100] pointer-events-none text-slate-800">
              <span className="text-[13px] font-bold mt-1 tracking-tight">9:41</span>
              <div className="flex gap-1.5 items-center mt-1">
                {user ? <span className="text-[8px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md font-black mr-1 flex items-center gap-1 shadow-sm"><Wifi size={8} className="animate-pulse"/> 서버 연결됨</span> : <span className="text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-black mr-1 shadow-sm border border-slate-300">연결중...</span>}
                <Signal size={14} className="stroke-[2.5]" /><Wifi size={14} className="stroke-[2.5]" /><Battery size={16} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="absolute top-2.5 inset-x-0 flex justify-center z-[100] pointer-events-none hidden sm:flex">
               <div className="w-[120px] h-[32px] bg-black rounded-full"></div>
            </div>
            
            {appState === 'intro' && renderIntroPage()}
            {appState === 'login' && renderLoginPage()}
            {appState === 'terms' && renderTermsPage()}
            {appState === 'scan' && renderScanProfilePage()}
            {appState === 'profile_step1' && renderProfileStep1Page()}
            {appState === 'profile_step2' && renderProfileStep2Page()}
            {appState === 'main' && (
              <>
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-10 relative pb-24">
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

                {/* 내 명함 관리 */}
                {isMyCardsModalOpen && (
                  <div className="absolute inset-0 z-[200] flex items-end justify-center animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMyCardsModalOpen(false)} />
                    <div className="relative bg-slate-100 w-full rounded-t-[2.5rem] p-6 pb-8 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[90%] flex flex-col border-t border-slate-200">
                      <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-6 shrink-0" />
                      <div className="flex justify-between items-start mb-6 shrink-0">
                        <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">내 명함 관리</h3>
                          <p className="text-[11px] font-bold text-slate-500 mt-1">상황에 맞는 명함을 선택하여 활동하세요.</p>
                        </div>
                        <button onClick={() => setIsMyCardsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 active:scale-95 transition-all shadow-sm"><X size={16} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 mb-6">
                        {myBusinessCards.map((card) => (
                          <div key={card.id} onClick={() => { setUserProfile(card); setIsMyCardsModalOpen(false); showToast("활성 프로필이 변경되었습니다."); }} className={`p-5 rounded-2xl border-2 cursor-pointer relative overflow-hidden flex flex-col justify-between aspect-[1.8/1] shadow-md transition-all ${userProfile.id === card.id ? 'border-indigo-500 bg-gradient-to-br from-indigo-800 to-slate-900 text-white shadow-indigo-900/30' : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800'}`}>
                            <div className="flex justify-between items-start relative z-10">
                              <div>
                                <p className={`text-[9px] font-black ${userProfile.id === card.id ? 'text-indigo-300' : 'text-slate-400'}`}>{card.company}</p>
                                <h3 className="text-xl font-black mt-1 tracking-tight">{card.name}</h3>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {myBusinessCards.length < 5 && (
                        <button onClick={handleAddNewProfileCard} className="shrink-0 w-full py-4 border-2 border-dashed border-indigo-300 bg-white text-indigo-600 rounded-2xl font-black text-sm transition-all hover:bg-indigo-50 flex items-center justify-center gap-2 active:scale-95 shadow-sm"><Plus size={18} /> 새 명함 등록하기</button>
                      )}
                    </div>
                  </div>
                )}

                {/* 메인 카메라 모달 */}
                {isMainScanning && (
                  <div className="absolute inset-0 z-[300] bg-slate-900 flex flex-col animate-in fade-in duration-300">
                    <div className="flex justify-between items-center p-5 text-white pt-14"><h2 className="text-lg font-black">신규 고객 등록</h2><button onClick={() => setIsMainScanning(false)}><X size={24}/></button></div>
                    {mainScanStep === 'choice' && (
                      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                         <div className="w-full flex flex-col gap-4 mt-4">
                           <button onClick={() => fileInputRef.current.click()} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-900 active:scale-95 flex items-center justify-center gap-2 transition-transform"><Camera size={20} /> AI 명함 스캔하기</button>
                           <button onClick={() => setMainScanStep('manual')} className="w-full py-5 bg-slate-800 text-white border border-slate-700 rounded-2xl font-black text-base active:scale-95 flex items-center justify-center gap-2 transition-transform"><Edit2 size={20} /> 직접 입력하기</button>
                         </div>
                      </div>
                    )}
                    {mainScanStep === 'manual' && (
                      <div className="flex-1 bg-slate-100 rounded-t-[2rem] overflow-hidden flex flex-col mt-4 text-slate-800 border-t border-slate-700">
                         <div className="p-6 overflow-y-auto hide-scrollbar pb-32 flex-1 space-y-6">
                            <h3 className="text-xl font-black text-slate-800 mb-2">고객 직접 입력</h3>
                            <div className="space-y-4">
                              <div><label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">고객명 *</label><input value={manualData.name} onChange={e=>setManualData({...manualData, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" /></div>
                              <div><label className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">전화번호 *</label><input type="tel" value={manualData.phone} onChange={e=>setManualData({...manualData, phone: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" /></div>
                            </div>
                         </div>
                         <div className="p-5 bg-white border-t border-slate-200 pb-8 flex gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10">
                           <button onClick={() => setMainScanStep('choice')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm active:scale-95 shadow-sm border border-slate-200 transition-all">뒤로</button>
                           <button onClick={handleSaveManualData} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all">고객 등록하기</button>
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
                      <div className="flex-1 bg-slate-100 rounded-t-[2rem] flex flex-col mt-4 border-t border-slate-700">
                         <div className="p-6 flex-1 overflow-y-auto pb-32">
                            <h3 className="text-xl font-black text-slate-800 mb-4">인식 결과 확인</h3>
                            <input value={scannedData?.name} onChange={e=>setScannedData({...scannedData, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mb-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"/>
                            <input value={scannedData?.phone} onChange={e=>setScannedData({...scannedData, phone: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mb-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"/>
                            <input value={scannedData?.company} onChange={e=>setScannedData({...scannedData, company: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mb-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"/>
                            <input value={scannedData?.email} onChange={e=>setScannedData({...scannedData, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mb-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400" placeholder="이메일"/>
                         </div>
                         <div className="p-5 bg-white flex gap-2 border-t border-slate-200">
                           <button onClick={() => setMainScanStep('choice')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm border border-slate-200 shadow-sm active:scale-95 transition-all">다시 찍기</button>
                           <button onClick={handleSaveScannedData} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-md shadow-indigo-200">저장</button>
                         </div>
                      </div>
                    )}
                    {mainScanStep === 'detail_choice' && (
                      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                         <div className="w-full flex flex-col gap-4 mt-4">
                           <button onClick={startUpdateScan} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-900 active:scale-95 flex items-center justify-center gap-2 transition-transform"><CreditCard size={20} /> 명함 교체 (업데이트)</button>
                           <button onClick={() => { setSelectedCustomer(null); setMainScanStep('choice'); }} className="w-full py-5 bg-slate-800 text-white border border-slate-700 rounded-2xl font-black text-base active:scale-95 flex items-center justify-center gap-2 transition-transform"><UserPlus size={20} /> 전혀 다른 신규 고객 등록</button>
                         </div>
                      </div>
                    )}
                    {mainScanStep === 'update_camera' && (
                      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                         <div className="w-full aspect-[1.6/1] border-2 border-dashed border-white/50 rounded-2xl relative overflow-hidden bg-slate-800/50">
                            <div className="absolute inset-x-0 top-1/2 h-[2px] bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                         </div>
                         <p className="mt-8 text-green-400 font-black animate-pulse">명함 업데이트 중...</p>
                      </div>
                    )}
                    {mainScanStep === 'update_result' && (
                      <div className="flex-1 bg-slate-100 rounded-t-[2rem] flex flex-col mt-4 border-t border-slate-700">
                         <div className="p-6 flex-1 overflow-y-auto pb-32">
                           <p className="text-xs font-bold text-indigo-700 bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-4 shadow-sm">이전 명함은 보관되며 최신으로 교체됩니다.</p>
                           <input value={scannedData?.name} onChange={e=>setScannedData({...scannedData, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mb-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"/>
                           <input value={scannedData?.company} onChange={e=>setScannedData({...scannedData, company: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 mb-3 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"/>
                         </div>
                         <div className="p-5 bg-white flex gap-2 border-t border-slate-200">
                           <button onClick={() => setMainScanStep('detail_choice')} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm border border-slate-200 shadow-sm active:scale-95 transition-all">뒤로</button>
                           <button onClick={handleSaveUpdatedCard} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all">업데이트 완료</button>
                         </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 공유 모달 */}
                {isShareModalOpen && selectedCustomer && (
                  <div className="absolute inset-0 z-[999] flex items-end justify-center animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)} />
                    <div className="relative bg-white w-full rounded-t-[2.5rem] p-6 pb-8 shadow-2xl max-h-[90%] flex flex-col animate-in slide-in-from-bottom-8 duration-300 border-t border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <div><h3 className="text-xl font-black text-slate-800">고객 공유</h3><p className="text-[11px] font-bold text-slate-500 mt-1">공동으로 관리할 팀원을 선택하세요.</p></div>
                        <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 shadow-sm rounded-full text-slate-600 active:scale-95 transition-all"><X size={16} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                        {TEAM_MEMBERS.map(member => (
                          <label key={member.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedShareMembers.includes(member.id) ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-500 font-black">{member.name[0]}</div>
                              <div><p className="font-black text-sm text-slate-800">{member.name}</p><p className="text-[10px] font-bold text-slate-500">{member.position}</p></div>
                            </div>
                            <input type="checkbox" checked={selectedShareMembers.includes(member.id)} onChange={(e) => e.target.checked ? setSelectedShareMembers([...selectedShareMembers, member.id]) : setSelectedShareMembers(selectedShareMembers.filter(id => id !== member.id))} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          </label>
                        ))}
                      </div>
                      <button onClick={() => { updateSelectedCustomer({ sharedWith: selectedShareMembers }); setIsShareModalOpen(false); showToast("공유가 완료되었습니다."); }} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg shadow-slate-900/30 active:scale-95 transition-transform">공유 설정 저장</button>
                    </div>
                  </div>
                )}

                {/* 알림 상세 팝업 */}
                {popupData && (
                  <div className="absolute inset-0 z-[350] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPopupData(null)} />
                    <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col border border-slate-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${popupData.data.bg} ${popupData.data.color} border-${popupData.data.color.split('-')[1]}-200`}>
                            {React.createElement(popupData.data.icon, { size: 14, strokeWidth: 2.5 })}
                          </div>
                          <span className={`text-[10px] font-black px-2 py-1 rounded border shadow-sm ${popupData.data.bg} ${popupData.data.color} border-${popupData.data.color.split('-')[1]}-200`}>{popupData.data.type}</span>
                        </div>
                        <button onClick={() => setPopupData(null)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 shadow-sm rounded-full text-slate-500 active:scale-95 transition-all">
                          <X size={16} />
                        </button>
                      </div>

                      <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 tracking-tight">{popupData.data.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mb-5">{popupData.data.time}</p>

                      {popupData.type === 'notice' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{popupData.data.payload.fullText}</p>
                        </div>
                      )}

                      {popupData.type === 'appointment' && (
                        <div className="space-y-3">
                          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm">
                            <p className="text-xs font-black text-rose-700 flex items-center gap-2 mb-2"><Clock size={14} className="mr-1"/> {popupData.data.payload.time}</p>
                            <p className="text-xs font-black text-rose-700 flex items-center gap-2 mb-3"><MapPin size={14} className="mr-1"/> {popupData.data.payload.location}</p>
                            <div className="pt-3 border-t border-rose-200">
                              <p className="text-[11px] font-bold text-rose-600 leading-relaxed">{popupData.data.payload.note}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white shadow-sm">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-black text-slate-600">{popupData.data.payload.name[0]}</div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-800">{popupData.data.payload.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">{popupData.data.payload.phone}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button onClick={() => setPopupData(null)} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black text-sm mt-6 active:scale-95 transition-transform shadow-lg shadow-slate-900/30">확인했습니다</button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div className={`absolute left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all duration-300 z-[1000] w-[85%] ${toast.show ? 'bottom-[100px] opacity-100' : 'bottom-10 opacity-0 pointer-events-none'}`}>
              <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={14} /><span className="text-[11px] font-bold tracking-tight truncate">{toast.message}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}