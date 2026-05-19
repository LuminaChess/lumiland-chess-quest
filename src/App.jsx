import { useEffect, useMemo, useState } from "react";
import "./App.css";

import tavernBg from "./assets/backgrounds/medieval_tavern_with_chess_motifs.png";
import gambitBg from "./assets/backgrounds/gothic_chess_temple_in_stormy_gloom.png";
import positionalBg from "./assets/backgrounds/majestic_war_room_with_chess_elements.png";
import attackerBg from "./assets/backgrounds/ruins_of_a_chess_themed_fortress.png";
import blitzBg from "./assets/backgrounds/stormy_chess_cathedral_at_twilight.png";
import endgameBg from "./assets/backgrounds/frozen_chess_hall_of_grandeur.png";
import chaosBg from "./assets/backgrounds/ruins_of_the_enchanted_chess_realm.png";

const MAX_LIVES = 5;
const LIFE_REGEN_MS = 10 * 60 * 1000;

const XP_BY_DIFFICULTY = {
  Fácil: 100,
  Médio: 300,
  Difícil: 600,
  Lendário: 1000,
  Impossível: 2000,
};

const DIFFICULTY_UNLOCK_LEVEL = {
  Fácil: 1,
  Médio: 2,
  Difícil: 3,
  Lendário: 4,
  Impossível: 5,
};

const levels = [
  { level: 1, minXp: 0, name: "Fácil", label: "Nível 1", emoji: "🌱" },
  { level: 2, minXp: 300, name: "Médio", label: "Nível 2", emoji: "⚔️" },
  { level: 3, minXp: 1500, name: "Difícil", label: "Nível 3", emoji: "🔥" },
  { level: 4, minXp: 4500, name: "Lendário", label: "Nível 4", emoji: "👑" },
  { level: 5, minXp: 9000, name: "Impossível", label: "Nível 5", emoji: "💀" },
  { level: 6, minXp: 15000, name: "Platina", label: "Nível Máximo", emoji: "🏆" },
];

const ranks = [
  { minXp: 0, name: "Bronze", title: "Aprendiz da Quest", emoji: "🥉" },
  { minXp: 300, name: "Prata", title: "Caçador de Táticas", emoji: "🥈" },
  { minXp: 1500, name: "Ouro", title: "Guerreiro do Tabuleiro", emoji: "🥇" },
  { minXp: 4500, name: "Épico", title: "Mestre das Missões", emoji: "💎" },
  { minXp: 9000, name: "Lendário", title: "Lenda da Campanha", emoji: "👑" },
  { minXp: 15000, name: "Mítico", title: "Platinador Impossível", emoji: "💀" },
];

const questions = [
  {
    id: 1,
    text: "Quando você vê uma chance de sacrificar uma peça...",
    answers: [
      { text: "Eu sacrifico primeiro e calculo depois.", type: "gambit" },
      { text: "Eu calculo tudo antes de decidir.", type: "positional" },
      { text: "Eu tento achar mate imediatamente.", type: "attacker" },
      { text: "Eu evito confusão e simplifico.", type: "endgame" },
    ],
  },
  {
    id: 2,
    text: "Qual frase mais combina com você no xadrez?",
    answers: [
      { text: "Se o rei inimigo respira, eu ataco.", type: "attacker" },
      { text: "Pequenas vantagens viram grandes vitórias.", type: "positional" },
      { text: "Final ganho é arte.", type: "endgame" },
      { text: "Teoria? Eu jogo o que dá conteúdo.", type: "chaos" },
    ],
  },
  {
    id: 3,
    text: "Sua abertura ideal seria...",
    answers: [
      { text: "Uma gambitada suspeita, mas divertida.", type: "gambit" },
      { text: "Uma linha sólida que não perde no lance 8.", type: "positional" },
      { text: "Roques opostos e guerra total.", type: "attacker" },
      { text: "Qualquer uma, desde que o adversário fique confuso.", type: "chaos" },
    ],
  },
  {
    id: 4,
    text: "Quando você está com pouco tempo no relógio...",
    answers: [
      { text: "Eu começo a jogar no puro instinto.", type: "blitz" },
      { text: "Eu busco xeques e ameaças.", type: "attacker" },
      { text: "Eu simplifico para um final fácil.", type: "endgame" },
      { text: "Eu clico qualquer coisa e aceito o destino.", type: "chaos" },
    ],
  },
  {
    id: 5,
    text: "O que mais te irrita em uma partida?",
    answers: [
      { text: "Adversário que troca tudo.", type: "attacker" },
      { text: "Posição sem plano claro.", type: "positional" },
      { text: "Perder final ganho.", type: "endgame" },
      { text: "Cair em tática besta.", type: "blitz" },
    ],
  },
  {
    id: 6,
    text: "Se você pudesse escolher uma super habilidade no xadrez...",
    answers: [
      { text: "Ver táticas instantaneamente.", type: "attacker" },
      { text: "Nunca pendurar peça.", type: "positional" },
      { text: "Ganhar todo final igualado.", type: "endgame" },
      { text: "Confundir qualquer adversário.", type: "chaos" },
    ],
  },
  {
    id: 7,
    text: "Seu tipo favorito de vitória é...",
    answers: [
      { text: "Mate bonito.", type: "attacker" },
      { text: "Espremer o adversário por 40 lances.", type: "positional" },
      { text: "Virar um final perdido.", type: "endgame" },
      { text: "Ganhar uma partida completamente absurda.", type: "chaos" },
    ],
  },
  {
    id: 8,
    text: "Quando você perde, geralmente é porque...",
    answers: [
      { text: "Eu ataquei demais.", type: "gambit" },
      { text: "Eu fiquei passivo.", type: "positional" },
      { text: "Eu joguei rápido demais.", type: "blitz" },
      { text: "Eu inventei moda.", type: "chaos" },
    ],
  },
];

const archetypes = {
  gambit: {
    title: "Gambiteiro Psicopata",
    emoji: "🔥",
    subtitle: "Você não joga xadrez. Você assina um termo de risco no lance 3.",
    strengths: ["Criatividade", "Coragem", "Pressão psicológica"],
    weaknesses: ["Excesso de sacrifícios", "Rei aberto", "Confiança ilegal"],
    quote: "Material é temporário. Ataque é eterno.",
    campaignName: "A Trilha do Sacrifício",
    guideName: "Contratante do Sacrifício",
    guideLine:
      "Nesta campanha, material é só uma moeda. Escolha uma missão, entre no tabuleiro e prove que caos também pode ser plano.",
  },
  attacker: {
    title: "Caçador de Reis",
    emoji: "⚔️",
    subtitle: "Você olha para o tabuleiro e vê apenas uma missão: derrubar o rei inimigo.",
    strengths: ["Iniciativa", "Táticas", "Ataque ao rei"],
    weaknesses: ["Defesa", "Paciência", "Trocas ruins"],
    quote: "Se o rei inimigo ainda está seguro, o ataque ainda não começou.",
    campaignName: "Caçada ao Rei",
    guideName: "Capitão da Caçada",
    guideLine:
      "O rei inimigo está marcado. Cada missão aqui testa sua coragem, sua mira tática e sua fome por ataque.",
  },
  positional: {
    title: "Posicional Frio",
    emoji: "🧊",
    subtitle: "Você ganha partidas como quem fecha uma porta lentamente e apaga a luz.",
    strengths: ["Planos", "Estrutura", "Controle"],
    weaknesses: ["Falta de agressividade", "Pouco risco", "Perde chances táticas"],
    quote: "Não preciso atacar. A posição ataca por mim.",
    campaignName: "Controle Absoluto",
    guideName: "Arquiteto da Posição",
    guideLine:
      "Nada de pressa. Nesta campanha, você vence dominando casas, criando fraquezas e sufocando o adversário lentamente.",
  },
  endgame: {
    title: "Finalista Gelado",
    emoji: "♔",
    subtitle: "Você troca as peças e leva o adversário para um lugar onde só você sabe respirar.",
    strengths: ["Técnica", "Paciência", "Conversão"],
    weaknesses: ["Ataque rápido", "Abertura passiva", "Pouca iniciativa"],
    quote: "Final empatado? Para mim parece ganho.",
    campaignName: "O Reino dos Finais",
    guideName: "Guardião dos Finais",
    guideLine:
      "A maioria foge dos finais. Você vai entrar neles de propósito. Cada missão é um teste de técnica, frieza e conversão.",
  },
  chaos: {
    title: "Agente do Caos",
    emoji: "🌀",
    subtitle: "Nem você sabe seu plano. E é exatamente por isso que funciona.",
    strengths: ["Imprevisibilidade", "Criatividade", "Conteúdo"],
    weaknesses: ["Consistência", "Cálculo", "Sanidade"],
    quote: "Se eu não sei o que estou fazendo, meu adversário também não sabe.",
    campaignName: "Caos Controlado",
    guideName: "Arauto do Caos",
    guideLine:
      "Aqui, o normal não entra. Suas missões são estranhas, imprevisíveis e perfeitas para criar partidas memoráveis.",
  },
  blitz: {
    title: "Blitzeiro Tiltado",
    emoji: "⏱️",
    subtitle: "Você joga rápido, pensa depois e às vezes chama isso de intuição.",
    strengths: ["Velocidade", "Truques", "Pressão no tempo"],
    weaknesses: ["Blunders", "Impulsividade", "Finais jogados no susto"],
    quote: "Não foi erro. Foi premove emocional.",
    campaignName: "Corrida Contra o Relógio",
    guideName: "Mestre do Relógio",
    guideLine:
      "Nesta campanha, cada segundo importa. Jogue rápido, sobreviva à pressão e transforme o relógio em arma.",
  },
};

const rawMissions = {
  gambit: [
    ["Ganhe com um gambito.", "Fácil"],
    ["Veja um vídeo do Witty Alien.", "Fácil"],
    ["Ganhe uma partida sem pensar mais de 30 segundos por lance.", "Fácil"],
    ["Ganhe sem mover uma peça.", "Fácil"],
    ["Ganhe movendo a dama na abertura 3 vezes.", "Fácil"],
    ["Ganhe deixando o adversário jogar 2 lances a mais.", "Fácil"],
    ["Ganhe com o Gambito da Dama.", "Médio"],
    ["Ganhe uma partida no modo Giveaway.", "Médio"],
    ["Ganhe sacrificando uma qualidade.", "Médio"],
    ["Ganhe com o Gambito Magnus: você com 1 minuto contra 3/5 minutos.", "Médio"],
    ["Ganhe uma partida sem pensar mais de 10 segundos por lance.", "Médio"],
    ["Ganhe com o Gambito do Rei.", "Difícil"],
    ["Ganhe sacrificando uma peça.", "Difícil"],
    ["Ganhe mexendo os 8 peões pelo menos 2 casas.", "Difícil"],
    ["Faça um brilhante!", "Difícil"],
    ["Ganhe com o Alien Gambit.", "Lendário"],
    ["Ganhe entregando todos os peões.", "Lendário"],
    ["Ganhe sacrificando três peças.", "Lendário"],
    ["Ganhe com o Botez Gambit: sacrifique a dama.", "Impossível"],
    ["Ganhe com o Dorian’s Gambit.", "Impossível"],
  ],

  attacker: [
    ["Ganhe com roques de lados opostos.", "Fácil"],
    ["Jogue h4, h5 e dê mate.", "Fácil"],
    ["Ganhe uma partida no modo 3 Xeques.", "Fácil"],
    ["Ganhe uma partida no modo King of the Hill.", "Fácil"],
    ["Dê um xeque de cavalo e ganhe a partida.", "Fácil"],
    ["Dê um xeque de bispo e ganhe a partida.", "Fácil"],
    ["Ganhe uma partida no modo Atomic Chess.", "Médio"],
    ["Dê mate com alguma bateria: dama-bispo ou dama-torre.", "Médio"],
    ["Dê mate com alguma peça menor.", "Médio"],
    ["Dê 5 xeques de cavalo e ganhe a partida.", "Médio"],
    ["Dê 5 xeques de bispo e ganhe a partida.", "Médio"],
    ["Dê um xeque com uma peça de cada tipo e depois mate.", "Difícil"],
    ["Dê um mate sacrificando uma peça.", "Difícil"],
    ["Dê mate de peão.", "Difícil"],
    ["Dê mate só com peças menores.", "Difícil"],
    ["Dê mate em 10 lances ou menos.", "Lendário"],
    ["Ganhe uma partida só mexendo as peças para frente.", "Lendário"],
    ["Sacrifique a dama para dar mate.", "Lendário"],
    ["Faça o rei adversário chegar na primeira fileira. Finais não contam.", "Impossível"],
    ["Dê o mate de Philidor.", "Impossível"],
  ],

  positional: [
    ["Analise estrategicamente uma partida sua de xadrez.", "Fácil"],
    ["Consiga o par de bispos.", "Fácil"],
    ["Domine uma coluna aberta.", "Fácil"],
    ["Veja uma partida do Karpov.", "Fácil"],
    ["Ataque uma fraqueza do oponente.", "Fácil"],
    ["Tenha 5 peças controlando o centro.", "Fácil"],
    ["Ganhe uma partida no modo Fog of War.", "Médio"],
    ["Coloque as duas torres na sétima.", "Médio"],
    ["Faça um ataque da minoria.", "Médio"],
    ["Tenha um bispo bom contra bispo mau.", "Médio"],
    ["Faça o Canhão de Alekhine.", "Médio"],
    ["Crie um peão passado.", "Difícil"],
    ["Coloque um cavalo protegido por peão na quinta horizontal.", "Difícil"],
    ["Crie três fraquezas para seu adversário.", "Difícil"],
    ["Antecipe o plano do seu adversário e previna-o.", "Difícil"],
    ["Coloque um cavalo protegido por peão na sexta horizontal.", "Lendário"],
    ["Prenda uma peça do seu adversário.", "Lendário"],
    ["Ganhe sem trocar nenhuma peça, exceto peões.", "Lendário"],
    ["Deixe o adversário em zugzwang.", "Impossível"],
    ["Ganhe sem trocar nenhuma peça.", "Impossível"],
  ],

  endgame: [
    ["Ganhe em um final.", "Fácil"],
    ["Ganhe com uma oposição.", "Fácil"],
    ["Ganhe um final de peões.", "Fácil"],
    ["Ganhe com mate de dama.", "Fácil"],
    ["Empate por material insuficiente.", "Fácil"],
    ["Aprenda e aplique a regra do quadrado.", "Fácil"],
    ["Ganhe promovendo um peão.", "Médio"],
    ["Ganhe um final de torres.", "Médio"],
    ["Ganhe um final de peças menores.", "Médio"],
    ["Ganhe um final empatado.", "Médio"],
    ["Ganhe com mate de torre.", "Médio"],
    ["Aprenda e ganhe um final de Philidor. Pode ser contra bot.", "Difícil"],
    ["Aprenda e ganhe um final de Lucena. Pode ser contra bot.", "Difícil"],
    ["Ganhe um final perdido.", "Difícil"],
    ["Ganhe com mate de dois bispos.", "Difícil"],
    ["Ganhe um final sem mexer o rei.", "Lendário"],
    ["Empate uma partida por afogamento.", "Lendário"],
    ["Ganhe com mate de bispo e cavalo.", "Lendário"],
    ["Dê mate com todas as peças na posição inicial, tirando peões.", "Impossível"],
    ["Ganhe com mate de dois cavalos.", "Impossível"],
  ],

  chaos: [
    ["Ganhe uma partida no xadrez 960.", "Fácil"],
    ["Dê um garfo.", "Fácil"],
    ["Ganhe uma partida com a Grob.", "Fácil"],
    ["Ganhe uma peça com uma cravada.", "Fácil"],
    ["Faça o Daily Puzzle.", "Fácil"],
    ["Faça o Guess The Elo diário.", "Fácil"],
    ["Ganhe uma partida sem rocar.", "Médio"],
    ["Ganhe uma partida no modo Crazyhouse.", "Médio"],
    ["Ganhe uma partida no modo Spell Chess.", "Médio"],
    ["Ganhe uma partida sem deixar o adversário rocar.", "Médio"],
    ["Chegue em 40 no Puzzle Rush Sobrevivência.", "Médio"],
    ["Ganhe uma partida em 10 lances ou menos.", "Difícil"],
    ["Ganhe uma partida depois de ter levado 5 xeques.", "Difícil"],
    ["Faça um brilhante!", "Difícil"],
    ["Ganhe só mexendo os peões até o lance 10.", "Difícil"],
    ["Ganhe uma partida só mexendo as peças para frente.", "Lendário"],
    ["Ganhe sem mexer o rei.", "Lendário"],
    ["Ganhe com 8 bispos ou 8 cavalos.", "Lendário"],
    ["Chegue com o rei na última fileira. Finais não contam.", "Impossível"],
    ["Dê um mate rocando.", "Impossível"],
  ],

  blitz: [
    ["Consiga 15 acertos no Puzzle Rush 3 minutos.", "Fácil"],
    ["Ganhe uma partida de blitz sem pendurar uma peça.", "Fácil"],
    ["Ganhe 3 partidas seguidas.", "Fácil"],
    ["Ganhe uma partida de blitz com 80%+ de precisão.", "Fácil"],
    ["Ganhe um Puzzle Battle.", "Fácil"],
    ["Ganhe uma partida de bullet.", "Fácil"],
    ["Ganhe uma partida no tempo.", "Médio"],
    ["Consiga 20 acertos no Puzzle Rush 3 minutos.", "Médio"],
    ["Ganhe uma partida de blitz sem cometer erros.", "Médio"],
    ["Ganhe uma partida de hyperbullet.", "Médio"],
    ["Ganhe utilizando 10 premoves seguidos.", "Médio"],
    ["Ganhe 5 partidas seguidas.", "Difícil"],
    ["Consiga 25 acertos no Puzzle Rush 3 minutos.", "Difícil"],
    ["Ganhe uma partida de blitz sem cometer imprecisão.", "Difícil"],
    ["Ganhe uma partida de blitz com 90%+ de precisão.", "Difícil"],
    ["Ganhe uma partida de bullet com 90%+ de precisão.", "Lendário"],
    ["Ganhe 10 partidas seguidas.", "Lendário"],
    ["Consiga 30 acertos no Puzzle Rush 3 minutos.", "Lendário"],
    ["Consiga 35 acertos no Puzzle Rush 3 minutos.", "Impossível"],
    ["Ganhe um hyperbullet com mais de 95% de precisão.", "Impossível"],
  ],
};

const classBackgrounds = {
  default: tavernBg,
  gambit: gambitBg,
  attacker: attackerBg,
  positional: positionalBg,
  endgame: endgameBg,
  chaos: chaosBg,
  blitz: blitzBg,
};

function buildMissions(type) {
  const selectedType = type || "gambit";

  return rawMissions[selectedType].map(([text, difficulty], index) => ({
    id: `${selectedType}-${index + 1}`,
    text,
    difficulty,
    xp: XP_BY_DIFFICULTY[difficulty],
    unlockLevel: DIFFICULTY_UNLOCK_LEVEL[difficulty],
  }));
}

function readJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSavedResultType() {
  const saved = localStorage.getItem("chessQuestResultType");
  return saved && archetypes[saved] ? saved : null;
}

function getSavedActiveClass() {
  const saved = localStorage.getItem("chessQuestActiveClass");
  return saved && archetypes[saved] ? saved : null;
}

function getCurrentLevel(totalXp) {
  return [...levels].reverse().find((level) => totalXp >= level.minXp) || levels[0];
}

function getNextLevel(totalXp) {
  return levels.find((level) => level.minXp > totalXp) || null;
}

function getPlayerStats(totalXp) {
  const currentLevel = getCurrentLevel(totalXp);
  const nextLevel = getNextLevel(totalXp);

  const levelStartXp = currentLevel.minXp;
  const levelEndXp = nextLevel ? nextLevel.minXp : currentLevel.minXp;
  const xpInsideLevel = totalXp - levelStartXp;
  const xpNeededInsideLevel = nextLevel ? levelEndXp - levelStartXp : 1;

  const levelProgressPercent = nextLevel
    ? Math.round((xpInsideLevel / xpNeededInsideLevel) * 100)
    : 100;

  const currentRank =
    [...ranks].reverse().find((rank) => totalXp >= rank.minXp) || ranks[0];

  return {
    totalXp,
    currentLevel,
    nextLevel,
    levelProgressPercent,
    xpInsideLevel,
    xpNeededInsideLevel,
    currentRank,
  };
}

function getDifficultyClass(difficulty) {
  if (difficulty === "Fácil") return "easy";
  if (difficulty === "Médio") return "medium";
  if (difficulty === "Difícil") return "hard";
  if (difficulty === "Lendário") return "legendary";
  return "impossible";
}

function getClassProgress(classKey, progressByClass) {
  const missions = buildMissions(classKey);
  const progress = progressByClass[classKey] || {};
  const completedMissions = missions.filter((mission) => progress[mission.id]);
  const totalXp = completedMissions.reduce((sum, mission) => sum + mission.xp, 0);

  return {
    missions,
    completed: completedMissions.length,
    total: missions.length,
    totalXp,
    percent: Math.round((completedMissions.length / missions.length) * 100),
    isComplete: completedMissions.length === missions.length,
    level: getCurrentLevel(totalXp),
  };
}

function normalizeLivesState(savedLivesState) {
  const now = Date.now();

  const fallback = {
    amount: MAX_LIVES,
    lastUpdatedAt: now,
  };

  if (!savedLivesState || typeof savedLivesState.amount !== "number") {
    return fallback;
  }

  const currentAmount = Math.min(MAX_LIVES, Math.max(0, savedLivesState.amount));
  const lastUpdatedAt = savedLivesState.lastUpdatedAt || now;

  if (currentAmount >= MAX_LIVES) {
    return {
      amount: MAX_LIVES,
      lastUpdatedAt: now,
    };
  }

  const elapsed = now - lastUpdatedAt;
  const recoveredLives = Math.floor(elapsed / LIFE_REGEN_MS);

  if (recoveredLives <= 0) {
    return {
      amount: currentAmount,
      lastUpdatedAt,
    };
  }

  const newAmount = Math.min(MAX_LIVES, currentAmount + recoveredLives);

  return {
    amount: newAmount,
    lastUpdatedAt:
      newAmount >= MAX_LIVES ? now : lastUpdatedAt + recoveredLives * LIFE_REGEN_MS,
  };
}

function formatCountdown(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    gambit: 0,
    attacker: 0,
    positional: 0,
    endgame: 0,
    chaos: 0,
    blitz: 0,
  });

  const [resultType, setResultType] = useState(getSavedResultType);
  const [activeClass, setActiveClass] = useState(getSavedActiveClass);
  const [revealedClasses, setRevealedClasses] = useState(
    readJson("chessQuestRevealedClasses", getSavedActiveClass() ? [getSavedActiveClass()] : [])
  );
  const [progressByClass, setProgressByClass] = useState(
    readJson("chessQuestProgressByClass", {})
  );
  const [gems, setGems] = useState(readJson("chessQuestGems", 0));
  const [level4RewardsClaimed, setLevel4RewardsClaimed] = useState(
    readJson("chessQuestLevel4RewardsClaimed", [])
  );
  const [refundedClasses, setRefundedClasses] = useState(
    readJson("chessQuestRefundedClasses", [])
  );
  const [selectedQuestByClass, setSelectedQuestByClass] = useState(
    readJson("chessQuestSelectedQuestByClass", {})
  );
  const [campaignReceived, setCampaignReceived] = useState(
    readJson("chessQuestCampaignReceived", false)
  );

  const [livesState, setLivesState] = useState(() =>
    normalizeLivesState(readJson("chessQuestLivesState", null))
  );
  const [nowTick, setNowTick] = useState(Date.now());

  const [randomMission, setRandomMission] = useState(null);
  const [randomMissionBag, setRandomMissionBag] = useState([]);
  const [achievementPopup, setAchievementPopup] = useState(null);
  const [homeNpcOpen, setHomeNpcOpen] = useState(false);
  const [campaignGuideOpen, setCampaignGuideOpen] = useState(false);
  const [pendingQuizCost, setPendingQuizCost] = useState(0);

  const campaignKey = activeClass || "gambit";
  const result = activeClass ? archetypes[activeClass] : null;

  const allMissions = useMemo(() => {
    return buildMissions(campaignKey);
  }, [campaignKey]);

  const currentProgress = progressByClass[campaignKey] || {};
  const completedMissions = allMissions.filter((mission) => currentProgress[mission.id]);
  const totalXp = completedMissions.reduce((sum, mission) => sum + mission.xp, 0);

  const playerStats = getPlayerStats(totalXp);
  const currentLevel = playerStats.currentLevel;
  const nextLevel = playerStats.nextLevel;

  const unlockedMissions = allMissions.filter(
    (mission) => mission.unlockLevel <= currentLevel.level
  );

  const lockedMissions = allMissions.filter(
    (mission) => mission.unlockLevel > currentLevel.level
  );

  const selectedQuestData = selectedQuestByClass[campaignKey] || null;
  const selectedQuestId =
    typeof selectedQuestData === "string" ? selectedQuestData : selectedQuestData?.id || null;

  const selectedQuest = unlockedMissions.find((mission) => mission.id === selectedQuestId);

  const completedCount = completedMissions.length;
  const completedUnlockedCount = unlockedMissions.filter(
    (mission) => currentProgress[mission.id]
  ).length;

  const progressPercent =
    allMissions.length > 0 ? Math.round((completedCount / allMissions.length) * 100) : 0;

  const xpToNextLevel = nextLevel ? nextLevel.minXp - totalXp : 0;
  const hasFinishedCampaign = completedCount === allMissions.length;
  const hasReachedLevel4Before = level4RewardsClaimed.length > 0;

  const hasStartedBefore =
    revealedClasses.length > 0 ||
    refundedClasses.length > 0 ||
    gems > 0 ||
    level4RewardsClaimed.length > 0 ||
    Boolean(activeClass);

  const canAnnulCampaign = Boolean(activeClass) && !hasFinishedCampaign;
  const canShowFullNav = campaignReceived;

  const themeClass = activeClass ? `theme-${activeClass}` : "theme-default";
  const currentBackground =
    screen === "home" || screen === "quiz"
      ? classBackgrounds.default
      : activeClass
      ? classBackgrounds[activeClass] || classBackgrounds.default
      : classBackgrounds.default;

  const livesAmount = livesState.amount;
  const isOutOfLives = livesAmount <= 0;
  const timeToNextLife =
    livesAmount >= MAX_LIVES
      ? 0
      : Math.max(0, LIFE_REGEN_MS - (nowTick - livesState.lastUpdatedAt));
  const livesText = `${livesAmount}/${MAX_LIVES}`;

  const unlockedRandomMissions = useMemo(() => {
    const classKeys = Array.from(new Set([...revealedClasses, activeClass].filter(Boolean)));

    return classKeys.flatMap((classKey) => {
      const classProgress = getClassProgress(classKey, progressByClass);

      return classProgress.missions
        .filter((mission) => mission.unlockLevel <= classProgress.level.level)
        .map((mission) => ({
          ...mission,
          classKey,
          classTitle: archetypes[classKey].title,
          campaignName: archetypes[classKey].campaignName,
        }));
    });
  }, [revealedClasses, activeClass, progressByClass]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());

      setLivesState((currentLivesState) => {
        const updated = normalizeLivesState(currentLivesState);

        if (
          updated.amount !== currentLivesState.amount ||
          updated.lastUpdatedAt !== currentLivesState.lastUpdatedAt
        ) {
          writeJson("chessQuestLivesState", updated);
          return updated;
        }

        return currentLivesState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updated = normalizeLivesState(livesState);
    setLivesState(updated);
    writeJson("chessQuestLivesState", updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeClass) return;

    const classProgress = getClassProgress(activeClass, progressByClass);
    const reachedLevel4 = classProgress.level.level >= 4;
    const alreadyClaimed = level4RewardsClaimed.includes(activeClass);

    if (!reachedLevel4 || alreadyClaimed) return;

    const updatedClaims = [...level4RewardsClaimed, activeClass];
    setLevel4RewardsClaimed(updatedClaims);
    writeJson("chessQuestLevel4RewardsClaimed", updatedClaims);

    setGems((currentGems) => {
      const updatedGems = currentGems + 1;
      writeJson("chessQuestGems", updatedGems);
      return updatedGems;
    });

    setAchievementPopup({
      mission: `Você chegou ao Nível 4 com ${archetypes[activeClass].title}!`,
      detail: "+1 Gema",
    });

    setTimeout(() => {
      setAchievementPopup(null);
    }, 3500);
  }, [activeClass, progressByClass, level4RewardsClaimed]);

  useEffect(() => {
    if (screen !== "home") {
      setHomeNpcOpen(false);
    }

    if (screen !== "missions") {
      setCampaignGuideOpen(false);
    }
  }, [screen]);

  function saveActiveClass(classKey) {
    setActiveClass(classKey);
    localStorage.setItem("chessQuestActiveClass", classKey);
  }

  function revealClass(classKey) {
    const updated = Array.from(new Set([...revealedClasses, classKey]));
    setRevealedClasses(updated);
    writeJson("chessQuestRevealedClasses", updated);
  }

  function updateGems(newAmount) {
    setGems(newAmount);
    writeJson("chessQuestGems", newAmount);
  }

  function updateSelectedQuest(classKey, questId, extraData = {}) {
    const updated = {
      ...selectedQuestByClass,
    };

    if (!questId) {
      delete updated[classKey];
    } else {
      updated[classKey] = {
        id: questId,
        startedAt: extraData.startedAt || Date.now(),
      };
    }

    setSelectedQuestByClass(updated);
    writeJson("chessQuestSelectedQuestByClass", updated);
  }

  function spendLife() {
    const freshLivesState = normalizeLivesState(livesState);

    if (freshLivesState.amount <= 0) {
      setLivesState(freshLivesState);
      writeJson("chessQuestLivesState", freshLivesState);
      return false;
    }

    const updatedLivesState = {
      amount: freshLivesState.amount - 1,
      lastUpdatedAt:
        freshLivesState.amount >= MAX_LIVES ? Date.now() : freshLivesState.lastUpdatedAt,
    };

    setLivesState(updatedLivesState);
    writeJson("chessQuestLivesState", updatedLivesState);
    return true;
  }

  function showNoLivesWarning() {
    setAchievementPopup({
      mission: "Você está sem vidas.",
      detail: `Recupere 1 vida antes de voltar a jogar. Próxima vida em ${formatCountdown(
        timeToNextLife
      )}`,
    });

    setTimeout(() => {
      setAchievementPopup(null);
    }, 3500);
  }

  function startQuiz(cost = 0) {
    setPendingQuizCost(cost);

    setCurrentQuestion(0);
    setScores({
      gambit: 0,
      attacker: 0,
      positional: 0,
      endgame: 0,
      chaos: 0,
      blitz: 0,
    });

    setScreen("quiz");
  }

  function startFirstQuiz() {
    if (hasStartedBefore) {
      startRerollQuiz();
      return;
    }

    startQuiz(0);
  }

  function startRerollQuiz() {
    if (gems <= 0) {
      setAchievementPopup({
        mission: "Você precisa de 1 gema para refazer o quiz.",
        detail: "Anule uma campanha ou chegue ao nível 4 com uma classe.",
      });

      setTimeout(() => {
        setAchievementPopup(null);
      }, 3200);

      return;
    }

    setRandomMission(null);
    setRandomMissionBag([]);
    startQuiz(1);
  }

  function answerQuestion(type) {
    const updatedScores = {
      ...scores,
      [type]: scores[type] + 1,
    };

    setScores(updatedScores);

    if (currentQuestion + 1 >= questions.length) {
      const winner = Object.entries(updatedScores).sort((a, b) => b[1] - a[1])[0][0];

      if (pendingQuizCost > 0) {
        updateGems(Math.max(0, gems - pendingQuizCost));
        setPendingQuizCost(0);
      }

      setResultType(winner);
      localStorage.setItem("chessQuestResultType", winner);

      revealClass(winner);
      saveActiveClass(winner);

      setRandomMission(null);
      setRandomMissionBag([]);

      setScreen("result");
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function receiveCampaign() {
    if (!activeClass) return;

    setCampaignReceived(true);
    writeJson("chessQuestCampaignReceived", true);
    setCampaignGuideOpen(true);
    setScreen("missions");
  }

  function chooseClass(classKey) {
    if (!revealedClasses.includes(classKey)) return;

    saveActiveClass(classKey);
    setRandomMission(null);
    setRandomMissionBag([]);
    setScreen("missions");
  }

  function buyClass(classKey) {
    if (gems <= 0 || !hasReachedLevel4Before || revealedClasses.includes(classKey)) return;

    updateGems(gems - 1);
    revealClass(classKey);
    saveActiveClass(classKey);
    setRandomMission(null);
    setRandomMissionBag([]);

    setAchievementPopup({
      mission: `${archetypes[classKey].title} desbloqueado!`,
      detail: "-1 Gema",
    });

    setTimeout(() => {
      setAchievementPopup(null);
    }, 3000);

    setScreen("missions");
  }

  function annulCurrentCampaign() {
    if (!canAnnulCampaign) return;

    const abandonedClass = activeClass;

    const updatedProgressByClass = {
      ...progressByClass,
      [abandonedClass]: {},
    };

    const updatedRefunded = Array.from(new Set([...refundedClasses, abandonedClass]));
    const updatedRevealedClasses = revealedClasses.filter(
      (classKey) => classKey !== abandonedClass
    );

    const updatedSelectedQuestByClass = {
      ...selectedQuestByClass,
    };
    delete updatedSelectedQuestByClass[abandonedClass];

    setProgressByClass(updatedProgressByClass);
    setRefundedClasses(updatedRefunded);
    setRevealedClasses(updatedRevealedClasses);
    setSelectedQuestByClass(updatedSelectedQuestByClass);

    writeJson("chessQuestProgressByClass", updatedProgressByClass);
    writeJson("chessQuestRefundedClasses", updatedRefunded);
    writeJson("chessQuestRevealedClasses", updatedRevealedClasses);
    writeJson("chessQuestSelectedQuestByClass", updatedSelectedQuestByClass);

    updateGems(gems + 1);

    localStorage.removeItem("chessQuestActiveClass");

    if (resultType === abandonedClass) {
      setResultType(null);
      localStorage.removeItem("chessQuestResultType");
    }

    setActiveClass(null);
    setRandomMission(null);
    setRandomMissionBag([]);

    setAchievementPopup({
      mission: "Campanha anulada. Você ganhou 1 gema para refazer o quiz.",
      detail: "+1 Gema",
    });

    setTimeout(() => {
      setAchievementPopup(null);
    }, 3500);

    setScreen("classes");
  }

  function selectQuest(mission) {
    if (!activeClass) return;
    if (currentProgress[mission.id]) return;
    if (mission.unlockLevel > currentLevel.level) return;

    if (isOutOfLives) {
      showNoLivesWarning();
      return;
    }

    updateSelectedQuest(campaignKey, mission.id, {
      startedAt: Date.now(),
    });
  }

  function completeMission(mission) {
    if (!mission) return;
    if (!activeClass) return;
    if (currentProgress[mission.id]) return;
    if (mission.unlockLevel > currentLevel.level) return;

    if (isOutOfLives && selectedQuestId !== mission.id) {
      showNoLivesWarning();
      return;
    }

    const updatedProgressForClass = {
      ...currentProgress,
      [mission.id]: true,
    };

    const updatedProgressByClass = {
      ...progressByClass,
      [campaignKey]: updatedProgressForClass,
    };

    setProgressByClass(updatedProgressByClass);
    writeJson("chessQuestProgressByClass", updatedProgressByClass);

    if (selectedQuestId === mission.id) {
      updateSelectedQuest(campaignKey, null);
    }

    setRandomMissionBag([]);

    setAchievementPopup({
      mission: mission.text,
      detail: `+${mission.xp} XP`,
    });

    setTimeout(() => {
      setAchievementPopup(null);
    }, 3000);
  }

  function completeSelectedQuest() {
    if (!selectedQuest) return;
    completeMission(selectedQuest);
  }

  function failSelectedQuest() {
    if (!selectedQuest) return;

    const lostLife = spendLife();

    if (!lostLife) {
      showNoLivesWarning();
      return;
    }

    updateSelectedQuest(campaignKey, null);

    setAchievementPopup({
      mission: "Você perdeu 1 vida.",
      detail: "Tentativa encerrada",
    });

    setTimeout(() => {
      setAchievementPopup(null);
    }, 3000);
  }

  function generateRandomMission() {
    const classKeys = Array.from(new Set([...revealedClasses, activeClass].filter(Boolean)));

    const fullUnlockedPool = classKeys.flatMap((classKey) => {
      const classProgress = getClassProgress(classKey, progressByClass);
      const unlockedLevel = classProgress.level.level;

      return buildMissions(classKey)
        .filter((mission) => mission.unlockLevel <= unlockedLevel)
        .map((mission) => ({
          ...mission,
          classKey,
          classTitle: archetypes[classKey].title,
          campaignName: archetypes[classKey].campaignName,
        }));
    });

    const fallbackPool = unlockedMissions.map((mission) => ({
      ...mission,
      classKey: campaignKey,
      classTitle: result?.title || "Classe atual",
      campaignName: result?.campaignName || "Campanha atual",
    }));

    const pool = fullUnlockedPool.length > 0 ? fullUnlockedPool : fallbackPool;

    if (pool.length === 0) {
      setAchievementPopup({
        mission: "Nenhuma missão disponível.",
        detail: "Comece uma campanha primeiro.",
      });

      setTimeout(() => {
        setAchievementPopup(null);
      }, 3000);

      return;
    }

    const poolIds = new Set(pool.map((mission) => `${mission.classKey}-${mission.id}`));

    let bag = randomMissionBag.filter((mission) =>
      poolIds.has(`${mission.classKey}-${mission.id}`)
    );

    if (bag.length === 0) {
      bag = shuffleArray(pool);

      if (
        randomMission &&
        bag.length > 1 &&
        `${bag[0].classKey}-${bag[0].id}` === `${randomMission.classKey}-${randomMission.id}`
      ) {
        [bag[0], bag[1]] = [bag[1], bag[0]];
      }
    }

    const [nextMission, ...remainingBag] = bag;

    setRandomMission(nextMission);
    setRandomMissionBag(remainingBag);
  }

  function resetCurrentCampaign() {
    const updatedProgressByClass = {
      ...progressByClass,
      [campaignKey]: {},
    };

    const updatedSelectedQuestByClass = {
      ...selectedQuestByClass,
    };
    delete updatedSelectedQuestByClass[campaignKey];

    setProgressByClass(updatedProgressByClass);
    setSelectedQuestByClass(updatedSelectedQuestByClass);

    writeJson("chessQuestProgressByClass", updatedProgressByClass);
    writeJson("chessQuestSelectedQuestByClass", updatedSelectedQuestByClass);

    setRandomMission(null);
    setRandomMissionBag([]);
  }

  function resetEverything() {
    localStorage.removeItem("chessQuestResultType");
    localStorage.removeItem("chessQuestActiveClass");
    localStorage.removeItem("chessQuestRevealedClasses");
    localStorage.removeItem("chessQuestProgressByClass");
    localStorage.removeItem("chessQuestGems");
    localStorage.removeItem("chessQuestLevel4RewardsClaimed");
    localStorage.removeItem("chessQuestRefundedClasses");
    localStorage.removeItem("chessQuestSelectedQuestByClass");
    localStorage.removeItem("chessQuestLivesState");
    localStorage.removeItem("chessQuestCampaignReceived");

    setResultType(null);
    setActiveClass(null);
    setRevealedClasses([]);
    setProgressByClass({});
    setGems(0);
    setLevel4RewardsClaimed([]);
    setRefundedClasses([]);
    setSelectedQuestByClass({});
    setCampaignReceived(false);
    setRandomMission(null);
    setRandomMissionBag([]);
    setAchievementPopup(null);
    setHomeNpcOpen(false);
    setCampaignGuideOpen(false);
    setPendingQuizCost(0);
    setLivesState({
      amount: MAX_LIVES,
      lastUpdatedAt: Date.now(),
    });

    setCurrentQuestion(0);
    setScores({
      gambit: 0,
      attacker: 0,
      positional: 0,
      endgame: 0,
      chaos: 0,
      blitz: 0,
    });

    setScreen("home");
  }

  return (
    <main className={`app ${themeClass} screen-${screen}`}>
      <div
        className="background-image-layer"
        style={{ backgroundImage: `url(${currentBackground})` }}
      ></div>
      <div className="background-dark-overlay"></div>
      <div className="background-vignette"></div>

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <nav className="nav">
        <button className="logo-button" onClick={() => setScreen("home")}>
          <span className="logo-icon">♟</span>
          <span>Chess Quest</span>
        </button>

        <div className="nav-actions">
          <button onClick={() => setScreen("home")}>Início</button>

          {canShowFullNav && (
            <>
              <button onClick={startRerollQuiz} disabled={gems <= 0}>
                Quiz -1 💎
              </button>
              <button onClick={() => setScreen("missions")}>Missões</button>
              <button onClick={() => setScreen("classes")}>Classes</button>
              <button onClick={() => setScreen("random")}>Aleatório</button>
              <button className="danger-nav-button" onClick={resetEverything}>
                Resetar Tudo
              </button>
            </>
          )}
        </div>
      </nav>

      {screen === "home" && (
        <section className="tavern-home">
          <div className="tavern-stage">
            <aside className="npc-zone" aria-label="Mestre da Taverna">
              <button
                className={`npc-clickable ${homeNpcOpen ? "open" : ""}`}
                onClick={() => setHomeNpcOpen((value) => !value)}
                aria-label="Falar com o Mestre da Taverna"
              >
                <div className="npc-character" aria-hidden="true">
                  <div className="npc-shadow"></div>
                  <div className="npc-arm npc-arm-left"></div>
                  <div className="npc-arm npc-arm-right"></div>
                  <div className="npc-body">
                    <div className="npc-collar"></div>
                    <div className="npc-medal">♟</div>
                  </div>
                  <div className="npc-head">
                    <div className="npc-hair"></div>
                    <div className="npc-face">
                      <span className="npc-eye npc-eye-left"></span>
                      <span className="npc-eye npc-eye-right"></span>
                      <span className="npc-smile"></span>
                    </div>
                  </div>
                  <div className="npc-glow"></div>
                </div>

                <span className="npc-click-label">Falar</span>
              </button>

              {(homeNpcOpen || !hasStartedBefore) && (
                <div className="npc-dialogue">
                  <span>Mestre da Taverna</span>
                  <p>
                    {!hasStartedBefore
                      ? "Ah... um novo aventureiro. Seu primeiro quiz é gratuito. Depois disso, toda nova avaliação custa 1 gema."
                      : activeClass && !campaignReceived
                      ? `Sua classe foi revelada: ${result.title}. Agora aceite sua campanha para abrir a guilda.`
                      : activeClass
                      ? `Vejo que voltou, ${result.title}. A guilda já tem novas missões para você.`
                      : "Você anulou sua campanha. Use 1 gema para pedir uma nova avaliação."}
                  </p>

                  {!hasStartedBefore ? (
                    <button className="dialogue-action" onClick={startFirstQuiz}>
                      Começar Quiz Grátis
                    </button>
                  ) : activeClass && !campaignReceived ? (
                    <button className="dialogue-action" onClick={receiveCampaign}>
                      Receber Campanha
                    </button>
                  ) : (
                    <button
                      className="dialogue-action"
                      onClick={startRerollQuiz}
                      disabled={gems <= 0}
                    >
                      Refazer Quiz — 1 Gema
                    </button>
                  )}
                </div>
              )}
            </aside>

            <div className="guild-board">
              <div className="board-rope board-rope-left"></div>
              <div className="board-rope board-rope-right"></div>
              <div className="board-nail board-nail-left"></div>
              <div className="board-nail board-nail-right"></div>

              <div className="board-heading">
                <div>
                  <span className="board-kicker">Beta 3.0 • Taverna RPG</span>
                  <h1>Sua campanha começa na taverna.</h1>
                </div>
                <div className="board-emblem">♜</div>
              </div>

              <p className="board-intro">
                Escolha uma quest antes da partida, evolua sua classe e transforme cada jogo
                em uma missão de campanha.
              </p>

              <div className="parchment-card main-parchment">
                <span>Próxima ação</span>
                <strong>
                  {!hasStartedBefore
                    ? "Descobrir sua primeira classe"
                    : isOutOfLives && campaignReceived
                    ? "Recupere uma vida antes de voltar a jogar"
                    : activeClass && !campaignReceived
                    ? "Receber sua campanha"
                    : selectedQuest
                    ? selectedQuest.text
                    : activeClass
                    ? "Escolher uma missão no quadro"
                    : "Refazer o quiz com uma gema"}
                </strong>
                <p>
                  {!hasStartedBefore
                    ? "O primeiro quiz é gratuito. Depois disso, novas avaliações custam 1 gema."
                    : isOutOfLives && campaignReceived
                    ? `Você está sem vidas. Próxima vida em ${formatCountdown(timeToNextLife)}.`
                    : activeClass && !campaignReceived
                    ? "Clique em Receber Campanha para liberar as abas e começar sua jornada."
                    : selectedQuest
                    ? `Quest ativa • ${selectedQuest.difficulty} • ${selectedQuest.xp} XP`
                    : activeClass
                    ? "Entre em Missões, selecione uma quest e jogue a partida valendo."
                    : "Você está sem campanha ativa. Use 1 gema para fazer o quiz novamente."}
                </p>
              </div>

              <div className="board-actions">
                {!hasStartedBefore ? (
                  <button className="primary-button" onClick={startFirstQuiz}>
                    Começar Quiz Grátis
                  </button>
                ) : activeClass && !campaignReceived ? (
                  <button className="primary-button" onClick={receiveCampaign}>
                    Receber Campanha
                  </button>
                ) : selectedQuest ? (
                  <button className="primary-button" onClick={() => setScreen("missions")}>
                    Ver Quest Ativa
                  </button>
                ) : activeClass ? (
                  <button className="primary-button" onClick={() => setScreen("missions")}>
                    Abrir Quadro de Missões
                  </button>
                ) : (
                  <button className="primary-button" onClick={startRerollQuiz} disabled={gems <= 0}>
                    Refazer Quiz — 1 Gema
                  </button>
                )}

                {campaignReceived && (
                  <button className="secondary-button" onClick={() => setScreen("classes")}>
                    Galeria de Classes
                  </button>
                )}
              </div>

              {campaignReceived && (
                <>
                  <div className="home-hud-grid">
                    <div className="hud-tile lives-tile">
                      <span>Vidas</span>
                      <strong>{livesText}</strong>
                      <small>
                        {livesAmount >= MAX_LIVES
                          ? "Cheias"
                          : `${formatCountdown(timeToNextLife)} para +1`}
                      </small>
                    </div>

                    <div className="hud-tile">
                      <span>Gemas</span>
                      <strong>{gems}</strong>
                      <small>Quiz / classes</small>
                    </div>

                    <div className="hud-tile">
                      <span>Classe</span>
                      <strong>{result ? result.emoji : "🏰"}</strong>
                      <small>{result ? result.title : "Sem classe"}</small>
                    </div>
                  </div>

                  <div className="home-progress-strip">
                    <div className="progress-top">
                      <span>{result ? result.campaignName : "Progresso inicial"}</span>
                      <strong>{progressPercent}%</strong>
                    </div>
                    <div className="progress-bar">
                      <div style={{ width: `${progressPercent}%` }}></div>
                    </div>

                    <div className="home-progress-meta">
                      <span>
                        {currentLevel.label} — {currentLevel.name}
                      </span>
                      <span>{playerStats.totalXp} XP</span>
                      <span>{revealedClasses.length}/6 classes</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {screen === "quiz" && (
        <section className="panel quiz-panel">
          <div className="section-header">
            <span className="tag">
              Pergunta {currentQuestion + 1}/{questions.length}
            </span>
            <h2>{questions[currentQuestion].text}</h2>
          </div>

          <div className="answers-grid">
            {questions[currentQuestion].answers.map((answer) => (
              <button
                key={answer.text}
                className="answer-card"
                onClick={() => answerQuestion(answer.type)}
              >
                {answer.text}
              </button>
            ))}
          </div>
        </section>
      )}

      {screen === "result" && result && (
        <section className="panel result-panel">
          <div className="result-emoji">{result.emoji}</div>
          <span className="tag">Sua classe ativa</span>
          <h2>{result.title}</h2>
          <p className="result-subtitle">{result.subtitle}</p>

          <div className="quote">“{result.quote}”</div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Pontos fortes</h3>
              {result.strengths.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="stat-card danger">
              <h3>Fraquezas</h3>
              {result.weaknesses.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="hero-buttons center">
            <button className="primary-button" onClick={receiveCampaign}>
              Receber Campanha
            </button>
            <button className="secondary-button" onClick={() => setScreen("home")}>
              Voltar para Taverna
            </button>
          </div>
        </section>
      )}

      {screen === "missions" && !activeClass && (
        <section className="panel result-panel">
          <div className="result-emoji">🏰</div>
          <span className="tag">Taverna inicial</span>
          <h2>Você ainda não tem uma campanha ativa.</h2>
          <p className="result-subtitle">
            O primeiro quiz é gratuito. Depois disso, refazer o quiz custa 1 gema.
          </p>

          <div className="hero-buttons center">
            {!hasStartedBefore ? (
              <button className="primary-button" onClick={startFirstQuiz}>
                Fazer Quiz Grátis
              </button>
            ) : (
              <button className="primary-button" onClick={startRerollQuiz} disabled={gems <= 0}>
                Refazer Quiz — 1 Gema
              </button>
            )}
            <button className="secondary-button" onClick={() => setScreen("home")}>
              Voltar para Taverna
            </button>
          </div>
        </section>
      )}

      {screen === "missions" && activeClass && (
        <section className="campaign-world">
          <div className="campaign-layout">
            <aside className="campaign-guide-zone">
              <button
                className={`campaign-guide-clickable ${campaignGuideOpen ? "open" : ""}`}
                onClick={() => setCampaignGuideOpen((value) => !value)}
                aria-label="Falar com guia da campanha"
              >
                <div className="npc-character campaign-guide-character" aria-hidden="true">
                  <div className="npc-shadow"></div>
                  <div className="npc-arm npc-arm-left"></div>
                  <div className="npc-arm npc-arm-right"></div>
                  <div className="npc-body">
                    <div className="npc-collar"></div>
                    <div className="npc-medal">{result.emoji}</div>
                  </div>
                  <div className="npc-head">
                    <div className="npc-hair"></div>
                    <div className="npc-face">
                      <span className="npc-eye npc-eye-left"></span>
                      <span className="npc-eye npc-eye-right"></span>
                      <span className="npc-smile"></span>
                    </div>
                  </div>
                  <div className="npc-glow"></div>
                </div>

                <span className="npc-click-label">Guia</span>
              </button>

              {campaignGuideOpen && (
                <div className="campaign-guide-dialogue">
                  <span>{result.guideName}</span>
                  <p>
                    {isOutOfLives
                      ? "Você está sem vidas. Recupere 1 vida antes de aceitar uma nova missão."
                      : result.guideLine}
                  </p>
                  {selectedQuest ? (
                    <small>
                      Quest ativa: <strong>{selectedQuest.text}</strong>
                    </small>
                  ) : isOutOfLives ? (
                    <small>
                      Próxima vida em <strong>{formatCountdown(timeToNextLife)}</strong>.
                    </small>
                  ) : (
                    <small>Escolha uma missão antes da próxima partida.</small>
                  )}
                </div>
              )}
            </aside>

            <section className="panel missions-panel campaign-board-panel">
              <div className="campaign-banner">
                <div
                  className="campaign-banner-image"
                  style={{ backgroundImage: `url(${currentBackground})` }}
                ></div>
                <div className="campaign-banner-overlay"></div>

                <div className="campaign-banner-content">
                  <div>
                    <span className="tag">{result.campaignName}</span>
                    <h2>{result.title}</h2>
                    <p>{result.subtitle}</p>
                  </div>

                  <div className="campaign-banner-stats">
                    <div>
                      <span>Nível</span>
                      <strong>{currentLevel.name}</strong>
                    </div>
                    <div>
                      <span>Vidas</span>
                      <strong>{livesText}</strong>
                    </div>
                    <div>
                      <span>Progresso</span>
                      <strong>{progressPercent}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {isOutOfLives && (
                <div className="completion-banner">
                  <span>❤️‍🩹</span>
                  <div>
                    <strong>Você está sem vidas.</strong>
                    <p>
                      Recupere 1 vida antes de voltar a jogar. Próxima vida em{" "}
                      {formatCountdown(timeToNextLife)}.
                    </p>
                  </div>
                </div>
              )}

              <div className="section-header">
                <span className="tag">{result ? result.campaignName : "Campanha Geral"}</span>
                <h2>Suas missões de xadrez</h2>
                <p>
                  Escolha uma única quest antes da partida. Se quiser jogar no modo difícil,
                  perdeu a tentativa? Tire 1 vida manualmente. Dois cliques em uma missão
                  completam ela direto.
                </p>
              </div>

              {hasFinishedCampaign && (
                <div className="completion-banner">
                  <span>👑</span>
                  <div>
                    <strong>Campanha platinada</strong>
                    <p>Você completou essa classe. Agora pode ir atrás de outra campanha.</p>
                  </div>
                </div>
              )}

              <div className="player-dashboard">
                <div className="player-main-card">
                  <div className="rank-emblem">{result ? result.emoji : currentLevel.emoji}</div>
                  <div>
                    <span>Classe atual</span>
                    <strong>{result ? result.title : "Sem classe"}</strong>
                    <p>
                      {currentLevel.label} • {currentLevel.name}
                    </p>
                  </div>
                </div>

                <div className="player-stat-card">
                  <span>XP Total</span>
                  <strong>{playerStats.totalXp}</strong>
                </div>

                <div className="player-stat-card">
                  <span>Gemas</span>
                  <strong>{gems}</strong>
                </div>

                <div className="player-stat-card">
                  <span>Vidas</span>
                  <strong>{livesText}</strong>
                </div>
              </div>

              <div className="active-quest-panel">
                {selectedQuest ? (
                  <>
                    <div>
                      <span className="tag">Quest ativa</span>
                      <h3>{selectedQuest.text}</h3>
                      <p>
                        {selectedQuest.difficulty} • +{selectedQuest.xp} XP
                      </p>
                    </div>

                    <div className="active-quest-actions">
                      <button className="primary-button" onClick={completeSelectedQuest}>
                        Concluir Quest
                      </button>
                      <button
                        className="danger-button"
                        onClick={failSelectedQuest}
                        disabled={livesAmount <= 0}
                      >
                        Perdi / Tirar 1 Vida
                      </button>
                    </div>
                  </>
                ) : isOutOfLives ? (
                  <div>
                    <span className="tag">Sem vidas</span>
                    <h3>Recupere uma vida antes de voltar a jogar.</h3>
                    <p>Próxima vida em {formatCountdown(timeToNextLife)}.</p>
                  </div>
                ) : (
                  <div>
                    <span className="tag">Antes da partida</span>
                    <h3>Escolha uma quest para tentar.</h3>
                    <p>Clique em uma missão disponível para marcar como quest ativa.</p>
                  </div>
                )}
              </div>

              <div className="xp-panel">
                <div className="progress-top">
                  <span>
                    {nextLevel
                      ? `Progresso para ${nextLevel.label}: ${playerStats.totalXp}/${nextLevel.minXp} XP`
                      : "Todos os níveis foram desbloqueados"}
                  </span>
                  <strong>{playerStats.levelProgressPercent}%</strong>
                </div>
                <div className="progress-bar xp-bar">
                  <div style={{ width: `${playerStats.levelProgressPercent}%` }}></div>
                </div>

                <div className="rank-next">
                  {nextLevel ? (
                    <>
                      Faltam <strong>{xpToNextLevel} XP</strong> para desbloquear missões{" "}
                      <strong>{nextLevel.name}</strong>.
                    </>
                  ) : (
                    <>
                      Todos os níveis estão liberados. Agora é hora de <strong>platinar</strong>.
                    </>
                  )}
                </div>
              </div>

              <div className="unlock-panel">
                <div>
                  <span>Missões desbloqueadas</span>
                  <strong>
                    {unlockedMissions.length}/{allMissions.length}
                  </strong>
                </div>
                <div>
                  <span>Disponíveis completas</span>
                  <strong>
                    {completedUnlockedCount}/{unlockedMissions.length}
                  </strong>
                </div>
                <div>
                  <span>Próximo desbloqueio</span>
                  <strong>{nextLevel ? nextLevel.name : "Tudo liberado"}</strong>
                </div>
              </div>

              <div className="progress-large">
                <div className="progress-top">
                  <span>
                    Classe atual: {completedCount}/{allMissions.length} conquistas
                  </span>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className="progress-bar">
                  <div style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="missions-section-title">
                <h3>Missões disponíveis</h3>
                <span>
                  {currentLevel.emoji} Até {currentLevel.name}
                </span>
              </div>

              <div className="missions-grid">
                {unlockedMissions.map((mission, index) => {
                  const isCompleted = currentProgress[mission.id];
                  const isSelected = selectedQuestId === mission.id;
                  const isDisabled = isCompleted || (isOutOfLives && !isSelected);

                  return (
                    <button
                      key={mission.id}
                      className={`mission-card ${isCompleted ? "completed" : ""} ${
                        isSelected ? "selected-mission" : ""
                      }`}
                      onClick={() => selectQuest(mission)}
                      onDoubleClick={() => completeMission(mission)}
                      disabled={isDisabled}
                    >
                      <div className="mission-number">
                        {isCompleted ? "✓" : isSelected ? "★" : index + 1}
                      </div>
                      <div className="mission-content">
                        <div className="mission-meta">
                          <span className={`difficulty ${getDifficultyClass(mission.difficulty)}`}>
                            {mission.difficulty}
                          </span>
                          <span>+{mission.xp} XP</span>
                        </div>
                        <p>{mission.text}</p>
                        <small>
                          {isCompleted
                            ? "Completa"
                            : isOutOfLives && !isSelected
                            ? "Recupere 1 vida para jogar"
                            : isSelected
                            ? "Quest ativa"
                            : "1 clique escolhe • 2 cliques completa"}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>

              {lockedMissions.length > 0 && (
                <>
                  <div className="missions-section-title locked-title">
                    <h3>Missões bloqueadas</h3>
                    <span>Desbloqueie ganhando XP</span>
                  </div>

                  <div className="missions-grid">
                    {lockedMissions.map((mission) => (
                      <div key={mission.id} className="mission-card locked-mission">
                        <div className="mission-number lock-icon">🔒</div>
                        <div className="mission-content">
                          <div className="mission-meta">
                            <span className={`difficulty ${getDifficultyClass(mission.difficulty)}`}>
                              {mission.difficulty}
                            </span>
                            <span>+{mission.xp} XP</span>
                          </div>
                          <p>Missão secreta bloqueada</p>
                          <small>
                            Desbloqueia ao chegar no nível{" "}
                            {levels.find((level) => level.level === mission.unlockLevel)?.name}.
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="hero-buttons center">
                <button
                  className="danger-button"
                  onClick={annulCurrentCampaign}
                  disabled={!canAnnulCampaign}
                >
                  Anular Campanha +1 Gema
                </button>
                <button className="secondary-button" onClick={resetCurrentCampaign}>
                  Resetar Campanha
                </button>
                <button className="secondary-button" onClick={() => setScreen("classes")}>
                  Galeria de Classes
                </button>
                <button className="primary-button" onClick={() => setScreen("random")}>
                  Gerar Desafio Aleatório
                </button>
              </div>
            </section>
          </div>
        </section>
      )}

      {screen === "classes" && (
        <section className="panel">
          <div className="section-header">
            <span className="tag">Galeria de Classes</span>
            <h2>Classes escondidas</h2>
            <p>
              Depois que alguma classe chega ao nível 4, todas as classes ficam visíveis para
              compra direta. Cada compra custa 1 gema.
            </p>
          </div>

          <div className="gallery-toolbar">
            <div className="gem-pill">💎 {gems} gemas</div>
            <div className="gem-pill">❤️ {livesText} vidas</div>

            <button className="primary-button" onClick={startRerollQuiz} disabled={gems <= 0}>
              Refazer Quiz — 1 Gema
            </button>

            <span className="class-requirement">
              Compra direta: {hasReachedLevel4Before ? "liberada" : "chegue ao nível 4"}
            </span>
          </div>

          <div className="class-gallery-grid">
            {Object.entries(archetypes).map(([classKey, classInfo]) => {
              const isRevealed = revealedClasses.includes(classKey);
              const isActive = activeClass === classKey;
              const classProgress = getClassProgress(classKey, progressByClass);
              const canSeeForPurchase = hasReachedLevel4Before;
              const shouldShowInfo = isRevealed || canSeeForPurchase;
              const canBuy = !isRevealed && gems > 0 && hasReachedLevel4Before;

              return (
                <div
                  key={classKey}
                  className={`class-card ${isActive ? "active-class" : ""} ${
                    !shouldShowInfo ? "hidden-class" : ""
                  }`}
                >
                  <div className="class-card-top">
                    <div className="class-emoji">{shouldShowInfo ? classInfo.emoji : "❔"}</div>
                    <div>
                      <span>{shouldShowInfo ? classInfo.campaignName : "Classe bloqueada"}</span>
                      <h3>{shouldShowInfo ? classInfo.title : "???"}</h3>
                    </div>
                  </div>

                  {shouldShowInfo ? (
                    <>
                      <p>{classInfo.subtitle}</p>

                      <div className="class-progress">
                        <div className="progress-top">
                          <span>
                            {classProgress.completed}/{classProgress.total} conquistas
                          </span>
                          <strong>{classProgress.percent}%</strong>
                        </div>
                        <div className="progress-bar">
                          <div style={{ width: `${classProgress.percent}%` }}></div>
                        </div>
                      </div>

                      <div className="class-stats">
                        <span>{classProgress.totalXp} XP</span>
                        <span>{classProgress.level.name}</span>
                        <span>{classProgress.isComplete ? "Platinada" : "Em progresso"}</span>
                      </div>

                      <div className="class-actions">
                        {isRevealed ? (
                          <button
                            className={isActive ? "secondary-button" : "primary-button"}
                            onClick={() => chooseClass(classKey)}
                          >
                            {isActive ? "Classe Ativa" : "Selecionar"}
                          </button>
                        ) : (
                          <button
                            className={canBuy ? "primary-button" : "secondary-button"}
                            disabled={!canBuy}
                            onClick={() => buyClass(classKey)}
                          >
                            {canBuy ? "Comprar — 1 Gema" : "Precisa de 1 Gema"}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Classe escondida. Chegue ao nível 4 com qualquer classe para revelar
                        as opções de compra direta.
                      </p>

                      <div className="class-progress">
                        <div className="progress-top">
                          <span>Conquistas</span>
                          <strong>??/??</strong>
                        </div>
                        <div className="progress-bar">
                          <div style={{ width: "0%" }}></div>
                        </div>
                      </div>

                      <div className="class-actions">
                        <button className="secondary-button" disabled>
                          Bloqueada
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {screen === "random" && (
        <section className="panel random-panel">
          <span className="tag">Modo Aleatório</span>
          <h2>Desafio aleatório</h2>
          <p>
            O sorteio usa todos os desafios que você já desbloqueou em todas as classes reveladas.
            Ele embaralha a pool inteira e não repete missão até terminar a sacola.
          </p>

          <div className="random-box">
            {randomMission ? (
              <>
                <span className="tag">{randomMission.campaignName}</span>
                <span className={`difficulty ${getDifficultyClass(randomMission.difficulty)}`}>
                  {randomMission.difficulty}
                </span>
                <strong>{randomMission.text}</strong>
                <small>{randomMission.classTitle}</small>
              </>
            ) : (
              "Nenhum desafio gerado ainda."
            )}
          </div>

          <button className="primary-button" onClick={generateRandomMission}>
            Sortear Desafio
          </button>
        </section>
      )}

      {achievementPopup && (
        <div className="achievement-popup">
          <div className="achievement-icon">🏆</div>
          <div>
            <span>Conquista desbloqueada</span>
            <strong>{achievementPopup.mission}</strong>
            <small>{achievementPopup.detail}</small>
          </div>
        </div>
      )}
    </main>
  );
}