import React, { useState, useEffect, useRef } from 'react';
import { Star, RefreshCw, Layers, Trophy, Volume2, VolumeX, RotateCcw, Calculator, AlertCircle, Download, Users, Presentation, ChevronRight, Play } from 'lucide-react';

/* --- Confetti Component --- */
const Confetti = ({ active, type = 'normal' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const particleCount = type === 'star' ? 100 : 40;
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: Date.now() + i,
        x: 50,
        y: 50,
        angle: Math.random() * 360,
        velocity: Math.random() * 20 + 10,
        color: ['#FFD700', '#FF6347', '#4CAF50', '#2196F3', '#9C27B0'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [active, type]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-0 animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            '--angle': `${p.angle}deg`,
            '--velocity': `${p.velocity}vmin`,
            '--rotation': `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
};

/* --- Sound Helper --- */
const playSound = (type = 'pop') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'star') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'place') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

/* --- Common Game Logic & Data --- */
const generateDeck = () => {
  const newDeck = [];
  let idCounter = 1;
  for (let i = 1; i <= 10; i++) newDeck.push({ id: idCounter++, value: i, isStar: false });
  for (let i = 11; i <= 19; i++) {
    newDeck.push({ id: idCounter++, value: i, isStar: false });
    newDeck.push({ id: idCounter++, value: i, isStar: false });
  }
  for (let i = 20; i <= 30; i++) newDeck.push({ id: idCounter++, value: i, isStar: false });
  newDeck.push({ id: idCounter++, value: '★', isStar: true });

  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const SCORE_TABLE = [
  { count: 1, score: 0 }, { count: 2, score: 1 }, { count: 3, score: 3 }, { count: 4, score: 5 },
  { count: 5, score: 7 }, { count: 6, score: 9 }, { count: 7, score: 11 }, { count: 8, score: 15 },
  { count: 9, score: 20 }, { count: 10, score: 25 }, { count: 11, score: 30 }, { count: 12, score: 35 },
  { count: 13, score: 40 }, { count: 14, score: 50 }, { count: 15, score: 60 }, { count: 16, score: 70 },
  { count: 17, score: 85 }, { count: 18, score: 100 }, { count: 19, score: 150 }, { count: 20, score: 300 },
];

const getScoreForLength = (len) => {
  const found = SCORE_TABLE.find(s => s.count === len);
  return found ? found.score : 0;
};

const getCardColor = (card) => {
  if (!card) return 'bg-slate-100 border-slate-300 border-dashed text-transparent';
  if (card.isStar) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
  if (card.value <= 10) return 'bg-sky-100 border-sky-300 text-sky-800';
  if (card.value <= 19) return 'bg-emerald-100 border-emerald-300 text-emerald-800';
  return 'bg-rose-100 border-rose-300 text-rose-800';
};

const getBigCardColor = (card) => {
  if (!card) return 'bg-indigo-50 border-indigo-200 border-dashed text-indigo-200';
  if (card.isStar) return 'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500 text-white shadow-amber-200';
  if (card.value <= 10) return 'bg-white border-sky-200 text-sky-600 shadow-sky-100';
  if (card.value <= 19) return 'bg-white border-emerald-200 text-emerald-600 shadow-emerald-100';
  return 'bg-white border-rose-200 text-rose-600 shadow-rose-100';
};

const getTextColor = (card) => {
  if (!card) return 'text-transparent';
  if (card.isStar) return 'text-yellow-500';
  if (card.value <= 10) return 'text-sky-500';
  if (card.value <= 19) return 'text-emerald-500';
  return 'text-rose-500';
};

const getTrackBorderClasses = (i) => {
  const base = "border-slate-300 ";
  if (i === 0) return base + "border-y-4 border-l-4 rounded-l-xl sm:rounded-l-2xl";
  if (i < 5) return base + "border-y-4 border-l-4";
  if (i === 5) return base + "border-y-4 border-x-4 rounded-tr-xl sm:rounded-tr-2xl";
  if (i < 14) return base + "border-b-4 border-x-4";
  if (i === 14) return base + "border-b-4 border-x-4 rounded-bl-xl sm:rounded-bl-2xl";
  if (i < 19) return base + "border-y-4 border-r-4";
  if (i === 19) return base + "border-y-4 border-r-4 rounded-r-xl sm:rounded-r-2xl";
  return base;
};

const calculateOptimalScore = (boardCards) => {
  const getSequences = (vals) => {
    const sequences = [];
    let currentSeq = { start: 0, end: 0, length: 1 };

    for (let i = 1; i < vals.length; i++) {
      if (vals[i] >= vals[i - 1]) {
        currentSeq.end = i;
        currentSeq.length++;
      } else {
        sequences.push(currentSeq);
        currentSeq = { start: i, end: i, length: 1 };
      }
    }
    sequences.push(currentSeq);
    return sequences;
  };

  const calcScoreFromSequences = (seqs) => {
    return seqs.reduce((sum, seq) => sum + getScoreForLength(seq.length), 0);
  };

  const starIndex = boardCards.findIndex(c => c && c.isStar);
  let bestResult = { score: -1, sequences: [], boardValues: [], starValue: null };

  if (starIndex === -1) {
    const vals = boardCards.map(c => c ? c.value : -1);
    const seqs = getSequences(vals);
    bestResult = { score: calcScoreFromSequences(seqs), sequences: seqs, boardValues: vals, starValue: null };
  } else {
    for (let v = 1; v <= 30; v++) {
      const vals = boardCards.map(c => (c && c.isStar) ? v : (c ? c.value : -1));
      const seqs = getSequences(vals);
      const score = calcScoreFromSequences(seqs);

      if (score > bestResult.score || (score === bestResult.score && v === vals[starIndex - 1])) {
        bestResult = { score, sequences: seqs, boardValues: vals, starValue: v };
      }
    }
  }
  return bestResult;
};


/* ==========================================
   STUDENT MODE COMPONENT
========================================== */
const StudentMode = ({ soundEnabled }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [deck, setDeck] = useState([]);
  const [board, setBoard] = useState(Array(20).fill(null));
  const [currentCard, setCurrentCard] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingCellIndex, setPendingCellIndex] = useState(null);

  const startGame = () => {
    const newDeck = generateDeck();
    const [firstCard, ...restDeck] = newDeck;
    setDeck(restDeck);
    setCurrentCard(firstCard);
    setBoard(Array(20).fill(null));
    setIsGameOver(false);
    setScoreResult(null);
    setHasStarted(true);
    setShowConfetti(false);
    if (soundEnabled) playSound('pop');
  };

  const handleCellClick = (index) => {
    if (!hasStarted || isGameOver || board[index] !== null || !currentCard) return;
    setPendingCellIndex(index);
  };

  const confirmPlacement = () => {
    const index = pendingCellIndex;
    if (index === null) return;

    if (soundEnabled) playSound('place');

    const newBoard = [...board];
    newBoard[index] = currentCard;
    setBoard(newBoard);
    setPendingCellIndex(null);

    if (deck.length > 0 && newBoard.includes(null)) {
      const [nextCard, ...restDeck] = deck;
      setDeck(restDeck);
      setCurrentCard(nextCard);
    } else {
      setCurrentCard(null);
      setIsGameOver(true);
      const result = calculateOptimalScore(newBoard);
      setScoreResult(result);
      setShowConfetti(true);
      if (soundEnabled) playSound('star');
    }
  };

  const resetGame = () => {
    setShowResetConfirm(false);
    setPendingCellIndex(null);
    setHasStarted(false);
    setBoard(Array(20).fill(null));
    setCurrentCard(null);
    setIsGameOver(false);
    setScoreResult(null);
  };

  const getGridStyle = (i) => {
    if (i < 6) return { gridColumn: i + 1, gridRow: 1 };
    if (i < 15) return { gridColumn: 6, gridRow: i - 4 };
    return { gridColumn: i - 8, gridRow: 10 };
  };

  const getSeqInfo = (index) => {
    if (!scoreResult) return null;
    return scoreResult.sequences.find(seq => index >= seq.start && index <= seq.end);
  };

  return (
    // 3단 가로 배치를 위한 flex-row 설정 (lg 브레이크포인트 이상에서 적용)
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-slate-50 relative">
      <Confetti active={showConfetti} type="star" />

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">다시 시작할까요?</h3>
              </div>
              <p className="text-slate-600 mb-6">진행 중인 보드가 지워집니다.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 rounded-xl text-slate-500 font-medium hover:bg-slate-100">취소</button>
                <button onClick={resetGame} className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md">다시 시작</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배치 확인 모달 */}
      {pendingCellIndex !== null && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-slate-200">
            <div className="p-6 flex flex-col items-center">
              <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-bold text-sm mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs">{pendingCellIndex + 1}</span>
                번째 칸에 배치
              </div>

              <div className={`w-24 h-32 rounded-2xl flex items-center justify-center shadow-lg border-4 mb-6 ${getBigCardColor(currentCard)}`}>
                {currentCard?.isStar ? <Star className="w-12 h-12 fill-white text-white drop-shadow-md" /> : <span className="text-5xl font-black drop-shadow-sm">{currentCard?.value}</span>}
              </div>

              <p className="text-slate-600 mb-6 text-center font-medium leading-relaxed">
                이 위치에 카드를 내려놓을까요?<br />
                <span className="text-red-500 text-sm font-bold">한 번 배치한 카드는 수정할 수 없습니다.</span>
              </p>

              <div className="flex gap-3 w-full">
                <button onClick={() => setPendingCellIndex(null)} className="flex-1 py-3 rounded-xl text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 transition-colors">취소</button>
                <button onClick={confirmPlacement} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors active:scale-95">배치하기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. LEFT PANEL: 규칙 및 점수표 (가장 중요도가 낮으므로 모바일에서는 제일 아래로) */}
      <div className="order-3 lg:order-1 w-full lg:w-72 xl:w-80 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 p-4 md:p-6 shrink-0 z-10 overflow-y-auto custom-scrollbar">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-6">
          <h3 className="font-extrabold text-lg text-indigo-800 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" /> 스트림스 규칙
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
              <div className="bg-indigo-100 text-indigo-700 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs mt-0.5">1</div>
              <p className="text-sm font-medium text-slate-700 leading-tight">다음 숫자 뽑기 전에<br /><b className="text-indigo-600">꼭 빈칸에 쓰기</b></p>
            </div>
            <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
              <div className="bg-indigo-100 text-indigo-700 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs mt-0.5">2</div>
              <p className="text-sm font-medium text-slate-700 leading-tight">이웃한 같은 숫자는<br /><b className="text-emerald-600">오름차순 인정 OK!</b></p>
            </div>
            <div className="flex items-start gap-2 bg-red-50 p-2.5 rounded-lg border border-red-100 shadow-sm">
              <div className="bg-red-200 text-red-800 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs mt-0.5">3</div>
              <p className="text-sm font-medium text-slate-700 leading-tight">한 번 쓴 숫자는<br /><b className="text-red-600">수정 절대 불가</b></p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-6">
          <h3 className="font-extrabold text-sm text-slate-500 mb-3 uppercase tracking-wider">타일 구성</h3>
          <div className="flex flex-wrap gap-2 text-sm font-bold justify-center">
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700">1~10 <span className="text-slate-400 font-normal text-xs ml-1">각 1개</span></span>
            <span className="px-2.5 py-1 bg-white border-2 border-indigo-200 rounded text-indigo-700">11~19 <span className="text-indigo-400 font-normal text-xs ml-1">각 2개</span></span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700">20~30 <span className="text-slate-400 font-normal text-xs ml-1">각 1개</span></span>
            <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-300 rounded text-yellow-700 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current" /> 조커 <span className="font-normal text-xs opacity-70 ml-1">1개</span></span>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-200 overflow-hidden shadow-sm">
          <table className="w-full text-center text-xs xl:text-sm bg-white">
            <thead>
              <tr className="bg-pink-100 text-pink-900 border-b border-pink-200">
                <th className="py-2 border-r border-pink-200 font-bold">오름차순</th>
                <th className="py-2 border-r border-pink-200 font-bold">점수</th>
                <th className="py-2 border-r border-pink-200 font-bold">오름차순</th>
                <th className="py-2 font-bold">점수</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-1.5 border-r border-slate-100 text-slate-600">{i + 1}칸</td>
                  <td className="py-1.5 border-r border-slate-200 font-semibold">{getScoreForLength(i + 1)}</td>
                  <td className="py-1.5 border-r border-slate-100 text-slate-600">{i + 11}칸</td>
                  <td className="py-1.5 font-bold text-rose-600">+{getScoreForLength(i + 11)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. CENTER PANEL: 보드판 메인 영역 */}
      <div className="order-2 lg:order-2 flex-1 p-4 md:p-6 flex flex-col items-center justify-start overflow-y-auto custom-scrollbar relative z-0">

        <div className="w-full max-w-2xl flex justify-between items-center mb-6 shrink-0 mt-2">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            학생 모드 보드판
          </h2>
          {hasStarted && (
            <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
              <RotateCcw className="w-4 h-4" /> 새로하기
            </button>
          )}
        </div>

        {/* Board Container */}
        <div className="relative w-full max-w-2xl bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex justify-center shrink-0">
          <div className="grid grid-cols-11 grid-rows-10 relative w-full min-w-[320px] max-w-[560px]" style={{ aspectRatio: '11/10' }}>
            {board.map((card, i) => {
              const seq = isGameOver ? getSeqInfo(i) : null;
              const isGroup = isGameOver && seq && seq.length > 1;
              const isStartOfGroup = isGroup && seq.start === i;
              const score = isGroup ? getScoreForLength(seq.length) : 0;

              let widths = "";
              if (i === 0) widths = "border-y-4 border-l-4 rounded-l-xl sm:rounded-l-2xl";
              else if (i < 5) widths = "border-y-4 border-l-4";
              else if (i === 5) widths = "border-y-4 border-x-4 rounded-tr-xl sm:rounded-tr-2xl";
              else if (i < 14) widths = "border-b-4 border-x-4";
              else if (i === 14) widths = "border-b-4 border-x-4 rounded-bl-xl sm:rounded-bl-2xl";
              else if (i < 19) widths = "border-y-4 border-r-4";
              else if (i === 19) widths = "border-y-4 border-r-4 rounded-r-xl sm:rounded-r-2xl";

              let colors = "";
              let customStyle = { ...getGridStyle(i) };

              if (isGroup) {
                let top = 'border-t-rose-500';
                let right = 'border-r-rose-500';
                let bottom = 'border-b-rose-500';
                let left = 'border-l-rose-500';

                if (i > seq.start) {
                  if (i <= 5) left = 'border-l-rose-100';
                  else if (i <= 14) top = 'border-t-rose-100';
                  else left = 'border-l-rose-100';
                }
                if (i < seq.end) {
                  if (i < 5) right = 'border-r-rose-100';
                  else if (i <= 13) bottom = 'border-b-rose-100';
                  else right = 'border-r-rose-100';
                }

                colors = `${top} ${right} ${bottom} ${left} bg-rose-100 text-rose-700 z-20`;

                let shadows = ['0 0 15px rgba(244,63,94,0.15)'];
                if (i === seq.start) {
                  if (i >= 6 && i <= 14) shadows.push('inset 0 4px 0 0 #f43f5e');
                  if (i >= 15 && i <= 19) shadows.push('inset 4px 0 0 0 #f43f5e');
                }
                if (i === seq.end) {
                  if (i >= 0 && i <= 4) shadows.push('inset -4px 0 0 0 #f43f5e');
                }
                customStyle.boxShadow = shadows.join(', ');

              } else if (card) {
                let borderAndBg = isGameOver ? "border-slate-200 bg-white opacity-60" : "border-slate-300 bg-white shadow-sm";
                colors = `${borderAndBg} ${getTextColor(card)} z-0`;
              } else {
                colors = `border-slate-300 ${isGameOver ? 'bg-slate-100/50 opacity-30' : 'bg-slate-50 border-dashed hover:bg-indigo-50 cursor-pointer active:scale-95 text-transparent'}`;
              }

              let badgePos = "bottom-full left-1/2 -translate-x-1/2 mb-1.5 sm:mb-2";
              if (i >= 6 && i <= 14) badgePos = "left-full top-1/2 -translate-y-1/2 ml-1.5 sm:ml-2";

              return (
                <button
                  key={i}
                  disabled={card !== null || !hasStarted || isGameOver}
                  onClick={() => handleCellClick(i)}
                  style={customStyle}
                  className={`
                    w-full h-full flex items-center justify-center font-black text-xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl transition-all relative overflow-visible
                    ${widths}
                    ${colors}
                  `}
                >
                  {isStartOfGroup && (
                    <div className={`absolute ${badgePos} bg-rose-600 text-white text-[0.7rem] sm:text-sm font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-md border-2 border-white z-40 whitespace-nowrap animate-scale-in`}>
                      +{score}
                    </div>
                  )}

                  {card && (card.isStar ? <Star className={`w-6 h-6 sm:w-8 sm:h-8 fill-current ${isGameOver && isGroup ? 'text-rose-500' : 'text-yellow-400'}`} /> : card.value)}

                  {!card && hasStarted && !isGameOver && (
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 text-indigo-600">
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-90" />
                    </span>
                  )}

                  {isGameOver && card?.isStar && scoreResult?.starValue !== null && (
                    <span className={`absolute bottom-1 right-1.5 text-[0.6rem] sm:text-sm font-bold ${isGroup ? 'text-rose-600' : 'text-slate-400'}`}>
                      {scoreResult.starValue}
                    </span>
                  )}

                  {!card && hasStarted && !isGameOver && (
                    <span className="absolute top-1 sm:top-2 left-1.5 sm:left-2 text-[0.55rem] sm:text-xs font-bold text-slate-300 pointer-events-none leading-none">{i + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: 카드 확인 및 액션 공간 (모바일에서는 맨 위로) */}
      <div className="order-1 lg:order-3 w-full lg:w-72 xl:w-80 bg-white border-b lg:border-b-0 lg:border-l border-slate-200 p-6 shrink-0 flex flex-col items-center justify-center overflow-y-auto shadow-[0_0_15px_rgba(0,0,0,0.03)] z-10 custom-scrollbar">

        {!hasStarted ? (
          <div className="flex flex-col items-center animate-fade-in-up text-center w-full">
            <h3 className="text-xl font-black text-slate-800 mb-2">게임 준비 완료!</h3>
            <p className="text-sm text-slate-500 mb-8">오름차순이 되도록<br />카드를 배치해보세요.</p>
            <button onClick={startGame} className="flex flex-col items-center justify-center w-40 h-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] shadow-xl shadow-indigo-200 transition-all hover:-translate-y-2 active:scale-95 group">
              <Play className="w-12 h-12 mb-2 fill-current opacity-90 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl">게임 시작</span>
            </button>
          </div>
        ) : isGameOver ? (
          <div className="flex flex-col items-center w-full animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold text-sm mb-6 shadow-sm border border-yellow-200">
              <Trophy className="w-4 h-4" /> 보드 완성!
            </div>

            <div className="bg-white border-4 border-indigo-100 shadow-xl rounded-3xl p-6 w-full text-center relative overflow-hidden transform transition-all hover:scale-105 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white/20 pointer-events-none"></div>
              <span className="block text-slate-500 font-extrabold mb-2 relative z-10 text-base">최종 획득 점수</span>
              <span className="text-5xl xl:text-6xl font-black text-indigo-600 leading-none relative z-10 drop-shadow-sm tracking-tighter">
                {scoreResult?.score}<span className="text-2xl xl:text-3xl ml-1 font-bold">점</span>
              </span>
            </div>

            <button onClick={resetGame} className="flex items-center justify-center w-full gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95">
              <RotateCcw className="w-5 h-5" /> 새 게임 시작
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-scale-in">
            <div className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-600 font-bold text-sm mb-6 shadow-inner border border-slate-200">
              <span>남은 타일: <span className="text-indigo-600">{deck.length}</span>장</span>
            </div>

            <span className="text-slate-500 font-bold mb-4 text-sm bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
              배치할 숫자
            </span>

            <div className={`w-36 h-48 xl:w-40 xl:h-52 rounded-3xl flex items-center justify-center shadow-lg border-[5px] mb-8 ${getBigCardColor(currentCard)}`}>
              {currentCard?.isStar ? (
                <Star className="w-20 h-20 xl:w-24 xl:h-24 fill-white text-white drop-shadow-md animate-pulse" />
              ) : (
                <span className="text-[4rem] xl:text-[5rem] font-black tracking-tighter drop-shadow-sm">{currentCard?.value}</span>
              )}
            </div>

            <p className="text-center text-indigo-600 font-bold bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 text-sm leading-relaxed">
              왼쪽 보드판에서 원하는<br />빈 칸을 선택하세요!
            </p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
};

/* ==========================================
   DEALER MODE COMPONENT
========================================== */
const DealerMode = ({ soundEnabled }) => {
  const [deck, setDeck] = useState([]);
  const [drawnCards, setDrawnCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const drawTimerRef = useRef(null);
  const historyEndRef = useRef(null);

  useEffect(() => {
    resetGame();
    return () => { if (drawTimerRef.current) clearTimeout(drawTimerRef.current); };
  }, []);

  const resetGame = () => {
    if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    setDeck(generateDeck());
    setDrawnCards([]);
    setCurrentCard(null);
    setIsAnimating(false);
    setIsGameFinished(false);
    setShowConfetti(false);
    setShowResetConfirm(false);
  };

  const handleResetRequest = () => {
    if (drawnCards.length > 0 && !isGameFinished) setShowResetConfirm(true);
    else resetGame();
  };

  const handleMainAction = () => {
    if (drawnCards.length === 20) {
      setIsGameFinished(true);
      return;
    }
    if (isAnimating || isGameFinished || drawnCards.length >= 20) return;

    setIsAnimating(true);
    setShowConfetti(false);

    drawTimerRef.current = setTimeout(() => {
      const [drawn, ...remainingDeck] = deck;
      setDeck(remainingDeck);
      const newDrawnCards = [...drawnCards, drawn];
      setDrawnCards(newDrawnCards);
      setCurrentCard(drawn);
      setIsAnimating(false);

      setShowConfetti(true);
      if (soundEnabled) playSound(drawn.isStar ? 'star' : 'pop');
    }, 400);
  };

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, [drawnCards]);

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-50">
      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">게임을 다시 시작할까요?</h3>
              </div>
              <p className="text-slate-600 mb-6">현재까지 진행된 게임 기록이 모두 사라집니다.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowResetConfirm(false)} className="px-5 py-2.5 rounded-xl text-slate-500 font-medium hover:bg-slate-100">취소</button>
                <button onClick={resetGame} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md">네, 다시 시작</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative">
        {drawnCards.length === 0 && (
          <div className="absolute top-4 left-4 z-20 animate-fade-in">
            <a href="https://drive.google.com/uc?export=download&id=1ZfW6aACsuMOcnHCPH8Qilbr4iODQmI7D" className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
              <Download className="w-3.5 h-3.5" /> 활동지 다운로드
            </a>
          </div>
        )}
        {!isGameFinished && drawnCards.length > 0 && (
          <div className="absolute top-4 left-4 z-20 animate-fade-in">
            <button onClick={handleResetRequest} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> 다시 시작
            </button>
          </div>
        )}

        <Confetti active={showConfetti} type={currentCard?.isStar ? 'star' : 'normal'} />

        {isGameFinished ? (
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col items-center animate-fade-in-up border border-slate-200 z-10">
            <div className="bg-indigo-600 w-full py-4 text-center">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-300" /> 게임 종료! 점수를 계산하세요
              </h2>
            </div>
            <div className="p-8 w-full">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {SCORE_TABLE.map((item) => (
                  <div key={item.count} className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-2 border border-slate-100">
                    <span className="font-semibold text-slate-500 text-sm">{item.count}칸</span>
                    <span className="font-bold text-indigo-600 text-lg">+{item.score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <button onClick={resetGame} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-xl hover:bg-indigo-700 shadow-lg active:scale-95">
                  <RefreshCw className="w-6 h-6" /> 새 게임 시작하기
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-full text-slate-700 font-medium text-sm mb-2 shadow-inner">
                <span>남은 타일: {deck.length}장</span>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {drawnCards.length === 0 ? "준비" : (drawnCards.length === 20 ? "모든 숫자를 뽑았습니다" : `${drawnCards.length} / 20 번째 숫자`)}
              </div>
            </div>

            <div className="relative w-72 h-96 perspective-1000 mb-12 z-10">
              {!currentCard && (
                <div className="w-full h-full rounded-[2.5rem] bg-indigo-50 border-4 border-indigo-100 border-dashed flex items-center justify-center">
                  <div className="text-indigo-200 font-bold text-xl flex flex-col items-center gap-2">
                    <span className="text-6xl mb-2">🎲</span><span>시작하기</span>
                  </div>
                </div>
              )}
              {currentCard && (
                <div key={currentCard.id} className={`w-full h-full rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 transform transition-all duration-300 ease-out ${isAnimating ? 'scale-90 opacity-80' : 'scale-100 opacity-100'} ${getBigCardColor(currentCard)}`}>
                  {currentCard.isStar ? (
                    <div className="flex flex-col items-center">
                      <Star className="w-40 h-40 fill-white text-white drop-shadow-md animate-pulse" />
                      <span className="text-white/90 font-bold text-2xl mt-4">조커 카드</span>
                    </div>
                  ) : (
                    <span className="text-[10rem] font-black tracking-tighter leading-none drop-shadow-sm">{currentCard.value}</span>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleMainAction} disabled={isAnimating} className={`relative z-10 px-16 py-5 rounded-2xl text-2xl font-bold shadow-xl transform transition-all flex items-center gap-3 ${isAnimating ? 'bg-slate-100 text-slate-400 cursor-wait scale-95 shadow-none' : (drawnCards.length === 20 ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0 active:scale-95' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 active:scale-95')}`}>
              {drawnCards.length === 0 ? '게임 시작하기' : (isAnimating ? '...' : (drawnCards.length === 20 ? <><Calculator className="w-6 h-6" /> 점수 계산하기</> : '숫자 뽑기'))}
            </button>
          </>
        )}
      </main>

      {/* Bottom History Panel */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 shrink-0 z-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">HISTORY</span> 나온 숫자들
            </h3>
            {drawnCards.length > 0 && <span className="text-xs font-medium text-slate-400">총 {drawnCards.length}개</span>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 pt-1 scrollbar-hide w-full px-1 scroll-smooth">
            {drawnCards.length === 0 ? (
              <div className="w-full py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">숫자를 뽑으면 여기에 기록됩니다</div>
            ) : (
              drawnCards.map((card, index) => (
                <div key={card.id} ref={index === drawnCards.length - 1 ? historyEndRef : null} className={`flex-shrink-0 w-14 h-20 rounded-xl flex flex-col items-center justify-center border-2 shadow-sm transition-all hover:scale-105 hover:shadow-md ${getCardColor(card)} ${index === drawnCards.length - 1 && !isGameFinished ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                  <span className="text-[0.65rem] font-bold opacity-50 mb-1">{index + 1}</span>
                  <span className="text-2xl font-black leading-none tracking-tight">{card.isStar ? <Star className="w-6 h-6 fill-current" /> : card.value}</span>
                </div>
              ))
            )}
            {drawnCards.length < 20 && !isGameFinished && (
              <div className="flex-shrink-0 w-14 h-20 rounded-xl border-2 border-slate-200 border-dashed bg-slate-100/50 flex items-center justify-center opacity-50">
                <span className="text-slate-300 text-xl font-bold">+</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};


/* ==========================================
   MAIN APP COMPONENT (Tabs Integration)
========================================== */
export default function StreamsApp() {
  const [mode, setMode] = useState('dealer'); // 'dealer' | 'student'
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden select-none">
      <style>{`
        @keyframes confetti { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 100% { transform: translate(calc(var(--velocity) * cos(var(--angle))), calc(var(--velocity) * sin(var(--angle)))) rotate(var(--rotation)); opacity: 0; } }
        .animate-confetti { animation: confetti 1s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Global Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row justify-between items-center z-[50] shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">STREAMS <span className="text-indigo-600">스트림스</span></h1>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setMode('dealer')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'dealer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Presentation className="w-4 h-4" /> 진행자 모드
          </button>
          <button
            onClick={() => setMode('student')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${mode === 'student' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" /> 학생(혼자) 모드
          </button>
        </div>

        <div className="flex items-center">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all bg-white border border-slate-100 shadow-sm">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Render both modes to keep their states active when switching tabs */}
      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-300 ${mode === 'dealer' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <DealerMode soundEnabled={soundEnabled} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${mode === 'student' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <StudentMode soundEnabled={soundEnabled} />
        </div>
      </div>
    </div>
  );
}
