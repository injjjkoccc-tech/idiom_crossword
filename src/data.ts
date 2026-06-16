import { NormalLevel, CrosswordIdiomPath, CrosswordCell } from "./types";

export const NORMAL_LEVELS: NormalLevel[] = [
  {
    id: 1,
    name: "第一關 - 初試身手 (5 組)",
    distractors: ["手", "天", "風", "地"],
    idioms: [
      { text: "畫蛇添足", missingIndex: 3, missingChar: "足", hint: "比喻多此一舉，反將事情弄糟。" },
      { text: "亡羊補牢", missingIndex: 3, missingChar: "牢", hint: "比喻犯錯後及時補救，還來得及。" },
      { text: "一舉兩得", missingIndex: 3, missingChar: "得", hint: "比喻做一件事，同時獲得兩項好處。" },
      { text: "一石二鳥", missingIndex: 3, missingChar: "鳥", hint: "比喻做一件事獲得兩種效果或好處。" },
      { text: "九牛一毛", missingIndex: 3, missingChar: "毛", hint: "比喻極大數量中極微小的部分，微不足道。" }
    ]
  },
  {
    id: 2,
    name: "第二關 - 漸入佳境 (6 組)",
    distractors: ["羊", "牛", "犬", "豬"],
    idioms: [
      { text: "自相矛盾", missingIndex: 3, missingChar: "盾", hint: "比喻言行前後不一致，相互衝突。" },
      { text: "守株待兔", missingIndex: 3, missingChar: "兔", hint: "比喻死守狹隘經驗，妄想坐收其成。" },
      { text: "飲水思源", missingIndex: 3, missingChar: "源", hint: "比喻不忘本，對施惠者心存感激。" },
      { text: "塞翁失馬", missingIndex: 3, missingChar: "馬", hint: "比喻禍福難料，一時的損失可能反而有益。" },
      { text: "胸有成竹", missingIndex: 3, missingChar: "竹", hint: "比喻在做事之前，心中已有了完整的計畫和把握。" },
      { text: "名落孫山", missingIndex: 3, missingChar: "山", hint: "指考試落榜，或選拔未被錄取。" }
    ]
  },
  {
    id: 3,
    name: "第三關 - 駕輕就熟 (7 組)",
    distractors: ["魚", "鳥", "鴨", "樹"],
    idioms: [
      { text: "鶴立雞群", missingIndex: 3, missingChar: "群", hint: "比喻人的才能或儀表突顯於眾人之上。" },
      { text: "順手牽羊", missingIndex: 3, missingChar: "羊", hint: "比喻趁機順便拿走別人的東西。" },
      { text: "呆若木雞", missingIndex: 3, missingChar: "雞", hint: "形容因極度驚恐或发愣而神色呆板。" },
      { text: "畫餅充飢", missingIndex: 3, missingChar: "飢", hint: "比喻用空想來安慰自己，無法解決實質問題。" },
      { text: "井底之蛙", missingIndex: 3, missingChar: "蛙", hint: "比喻見識狹隘、眼界短淺之人。" },
      { text: "水滴石穿", missingIndex: 3, missingChar: "穿", hint: "比喻只要有恆心，不斷努力，事情就一定能成功。" },
      { text: "投石問路", missingIndex: 3, missingChar: "路", hint: "比喻試探性地做一件事，以觀察對方的反應。" }
    ]
  },
  {
    id: 4,
    name: "第四關 - 得心應手 (8 組)",
    distractors: ["鼓", "福", "空", "山"],
    idioms: [
      { text: "對牛彈琴", missingIndex: 3, missingChar: "琴", hint: "比喻對不懂道理的人講深奧道理，徒勞無功。" },
      { text: "狐假虎威", missingIndex: 3, missingChar: "威", hint: "比喻憑藉長官或有權勢者的威風去欺負旁人。" },
      { text: "夜郎自大", missingIndex: 3, missingChar: "大", hint: "比喻見識狹隘卻狂妄自傲、自我感覺良好。" },
      { text: "盲人摸象", missingIndex: 3, missingChar: "象", hint: "比喻以偏概全，僅憑片面的了解就妄下結論。" },
      { text: "破釜沈舟", missingIndex: 3, missingChar: "舟", hint: "比喻誓死一戰，決心拼搏，不留任何後路。" },
      { text: "掩耳盜鈴", missingIndex: 3, missingChar: "鈴", hint: "比喻自欺欺人，以為自己不聽別人就不知道。" },
      { text: "驚天動地", missingIndex: 3, missingChar: "地", hint: "形容聲音極大或聲勢極其浩大，動搖天地。" },
      { text: "風捲殘雲", missingIndex: 3, missingChar: "雲", hint: "比喻速度極快，一下子就將東西清理或吃得乾乾淨淨。" }
    ]
  },
  {
    id: 5,
    name: "第五關 - 登堂入室 (9 組)",
    distractors: ["頭", "車", "花", "草"],
    idioms: [
      { text: "拔苗助長", missingIndex: 3, missingChar: "長", hint: "比喻急於求成，違反規律，反而壞了事。" },
      { text: "愚公移山", missingIndex: 3, missingChar: "山", hint: "比喻做事務求恆心耐力，不怕艱難，終成大業。" },
      { text: "鐵杵磨針", missingIndex: 3, missingChar: "針", hint: "比喻只要持之以恆，再難的任務也能順利成功。" },
      { text: "懸梁刺股", missingIndex: 3, missingChar: "股", hint: "形容刻苦學習、奮發讀書的非凡意志。" },
      { text: "水落石出", missingIndex: 3, missingChar: "出", hint: "比喻事情經過重重洗刷或查證，真相終於大白。" },
      { text: "指鹿為馬", missingIndex: 3, missingChar: "馬", hint: "比喻刻意顛倒是非黑白，欺上瞞下。" },
      { text: "班門弄斧", missingIndex: 3, missingChar: "斧", hint: "比喻在頂尖行家面前炫耀、賣弄本領。" },
      { text: "得心應手", missingIndex: 3, missingChar: "手", hint: "心裡怎麼想，手裡就能怎麼做。形容技藝純熟。" },
      { text: "名副其實", missingIndex: 3, missingChar: "實", hint: "名聲或稱號與實際相符合。" }
    ]
  },
  {
    id: 6,
    name: "第六關 - 胸有成竹 (9 組)",
    distractors: ["刀", "船", "星", "月"],
    idioms: [
      { text: "唇亡齒寒", missingIndex: 3, missingChar: "寒", hint: "比喻兩者關係至為密切，利害攸關，唇齒相依。" },
      { text: "草木皆兵", missingIndex: 3, missingChar: "兵", hint: "形容極度神經質或極其恐慌，疑神疑鬼。" },
      { text: "背水一戰", missingIndex: 3, missingChar: "戰", hint: "比喻在毫無退路的絕境下，發揮潛力拼死求勝。" },
      { text: "聞雞起舞", missingIndex: 3, missingChar: "舞", hint: "比喻有志之士奮發圖強，及時努力不偷懶。" },
      { text: "四海為家", missingIndex: 3, missingChar: "家", hint: "形容心胸開闊，志在四方，四處均可為落腳處。" },
      { text: "望梅止渴", missingIndex: 3, missingChar: "渴", hint: "比喻用幻想、空想來寬慰或滿足眼前的迫切渴求。" },
      { text: "拋磚引玉", missingIndex: 3, missingChar: "玉", hint: "謙稱自己先提出不成熟意見，以期待更高明的創見。" },
      { text: "騎虎難下", missingIndex: 3, missingChar: "下", hint: "比喻局面僵持、進退兩難，只能硬著頭皮做下去。" },
      { text: "一言九鼎", missingIndex: 3, missingChar: "鼎", hint: "比喻說話分量極重，極具信用或決定性影響。" }
    ]
  },
  {
    id: 7,
    name: "第七關 - 出類拔萃 (11 組)",
    distractors: ["石", "林", "雨", "雪"],
    idioms: [
      { text: "驚弓之鳥", missingIndex: 3, missingChar: "鳥", hint: "比喻受過慘痛打擊之人，遇到微小動靜即極度慌亂。" },
      { text: "葉公好龍", missingIndex: 3, missingChar: "龍", hint: "比喻表面極其喜愛，遇到真實的人事卻恐懼避開。" },
      { text: "螳臂擋車", missingIndex: 3, missingChar: "車", hint: "比喻低估對手、過度自滿企圖抗衡宏大的阻力。" },
      { text: "完璧歸趙", missingIndex: 3, missingChar: "趙", hint: "比喻物歸原主，完璧之身，完整圓滿。" },
      { text: "破鏡重圓", missingIndex: 3, missingChar: "圓", hint: "比喻夫妻經歷磨難後重新相聚、和好再生。" },
      { text: "投筆從戎", missingIndex: 3, missingChar: "戎", hint: "讀書人起而效尤，放棄文字，從軍為國效忠。" },
      { text: "鑿壁偷光", missingIndex: 3, missingChar: "光", hint: "形容即便處在最克難惡劣的環境下也奮勉讀書。" },
      { text: "怒氣沖天", missingIndex: 3, missingChar: "天", hint: "形容怒火極度旺盛，情緒幾乎達到頂峰。" },
      { text: "錦上添花", missingIndex: 3, missingChar: "花", hint: "比喻美上加美，讓原來就足夠優秀的局面更為壯觀。" },
      { text: "守望相助", missingIndex: 3, missingChar: "助", hint: "鄰里之間實行互相防範與看守，在有困難時相互救助。" },
      { text: "千錘百鍊", missingIndex: 3, missingChar: "鍊", hint: "比喻文章多次潤飾、修改得極其精美，或人經歷極多磨練。" }
    ]
  },
  {
    id: 8,
    name: "第八關 - 融會貫通 (12 組)",
    distractors: ["山", "海", "空", "地"],
    idioms: [
      { text: "程門立雪", missingIndex: 3, missingChar: "雪", hint: "比喻誠意拜師學藝，極度敬重師長的崇高美德。" },
      { text: "入木三分", missingIndex: 3, missingChar: "分", hint: "比喻評論深刻、觀察入微或文字功力底蘊極深。" },
      { text: "雞犬升天", missingIndex: 3, missingChar: "天", hint: "比喻一人得道高昇，其身旁親人隨從也跟著得勢。" },
      { text: "朝三暮四", missingIndex: 3, missingChar: "四", hint: "比喻想法善變無常、拿不定主意。" },
      { text: "熟能生巧", missingIndex: 3, missingChar: "巧", hint: "事情熟練了，自然而然就能掌握其間的竅門。" },
      { text: "滄海一粟", missingIndex: 3, missingChar: "粟", hint: "形容人類在恢弘的宇宙或自然界中極其微渺不足道。" },
      { text: "杞人憂天", missingIndex: 3, missingChar: "天", hint: "比喻庸人自擾，憂慮根本不會發生的多餘事物。" },
      { text: "老馬識途", missingIndex: 3, missingChar: "途", hint: "比喻有經驗的老手通曉大局，極具指引道路的能力。" },
      { text: "塞外風光", missingIndex: 3, missingChar: "光", hint: "指稱邊塞或塞北大草原獨特的壯麗自然地理景色。" },
      { text: "畫龍點睛", missingIndex: 3, missingChar: "睛", hint: "比喻在文章或說話的要害點上點破，使其靈活生動。" },
      { text: "千辛萬苦", missingIndex: 3, missingChar: "苦", hint: "形容經歷了無數的艱難與折磨。" },
      { text: "萬無一失", missingIndex: 3, missingChar: "失", hint: "指極有把握，絕對不會出現任何差錯或紕漏。" }
    ]
  },
  {
    id: 9,
    name: "第九關 - 出神入化 (13 組)",
    distractors: ["水", "林", "金", "木"],
    idioms: [
      { text: "虎頭蛇尾", missingIndex: 3, missingChar: "尾", hint: "比喻做事起頭魄力十足，結算時卻草率應付了事。" },
      { text: "杯弓蛇影", missingIndex: 3, missingChar: "影", hint: "比喻看見影子就嚇倒，自己嚇自己，徒增焦慮。" },
      { text: "順水推舟", missingIndex: 3, missingChar: "舟", hint: "比喻順隨自然大方向或趨勢，趁熱打鐵加以促成。" },
      { text: "精衛填海", missingIndex: 3, missingChar: "海", hint: "比喻意志極為堅貞不移，誓言排除萬難達成期望。" },
      { text: "黔驢技窮", missingIndex: 3, missingChar: "窮", hint: "比喻原本底牌早已洩漏，再也沒有能耐施展新點子。" },
      { text: "三顧茅廬", missingIndex: 3, missingChar: "廬", hint: "比喻真心實意、放下身段去懇請聘任重要的高人。" },
      { text: "開卷有益", missingIndex: 3, missingChar: "益", hint: "只要勤於翻閱書冊，必定能從中多獲知識與智慧。" },
      { text: "雪中送炭", missingIndex: 3, missingChar: "炭", hint: "比喻在他人陷入泥沼最困厄之時，奉上最切實的援手。" },
      { text: "走馬看花", missingIndex: 3, missingChar: "花", hint: "形容蜻蜓點水式地大致流覽，並未深入探索核心。" },
      { text: "隔岸觀火", missingIndex: 3, missingChar: "火", hint: "比喻置身事外，袖手旁觀他人的生死存亡或糾葛。" },
      { text: "狼吞虎嚥", missingIndex: 3, missingChar: "嚥", hint: "形容用餐時風捲殘雲、毫無吃相、極其急促狼狽。" },
      { text: "不勞而獲", missingIndex: 3, missingChar: "獲", hint: "自己不付出勞動，卻佔有別人的勞動成果。" },
      { text: "精打細算", missingIndex: 3, missingChar: "算", hint: "形容在使用人力、物力或錢財時極其精細，切實節約。" }
    ]
  },
  {
    id: 10,
    name: "第十關 - 登峰造極 (20 組)",
    distractors: ["骨", "酒", "肉", "竹"],
    idioms: [
      { text: "兩敗俱傷", missingIndex: 3, missingChar: "傷", hint: "比喻競爭雙方相互撕咬、意氣用事，結果全軍覆沒。" },
      { text: "金石為開", missingIndex: 3, missingChar: "開", hint: "比喻只要心存誠信跟意志，任何高牆頑鐵終能被融化。" },
      { text: "四面楚歌", missingIndex: 3, missingChar: "歌", hint: "形容身陷天羅地網、腹背受敵，面臨崩盤、孤立無援。" },
      { text: "投機取巧", missingIndex: 3, missingChar: "巧", hint: "比喻不肯依照正道勤勉，只顧藉偏門投機謀利。" },
      { text: "陽春白雪", missingIndex: 3, missingChar: "雪", hint: "比喻曲高和寡、純藝術氣息的高品味，大眾不易涉獵。" },
      { text: "下里巴人", missingIndex: 3, missingChar: "人", hint: "比喻大眾普及、琅琅上口、通俗易懂的草根文藝。" },
      { text: "孤掌難鳴", missingIndex: 3, missingChar: "鳴", hint: "比喻一人力量薄弱、沒有盟友應和，難以做成大事。" },
      { text: "乘風破浪", missingIndex: 3, missingChar: "浪", hint: "形容志向非凡開闊，敢於冒風險衝擊顛簸的未知。" },
      { text: "魚目混珠", missingIndex: 3, missingChar: "珠", hint: "比喻魚目混雜，用虛晃一槍、低劣贗品冒充高級貨。" },
      { text: "濫竽充數", missingIndex: 3, missingChar: "數", hint: "比喻實力不稱者混入優秀隊伍中冒充，或次品充裝。" },
      { text: "守口如瓶", missingIndex: 3, missingChar: "瓶", hint: "比喻口風嚴密、言談有節制，絕不隨意洩密透露。" },
      { text: "百折不撓", missingIndex: 3, missingChar: "撓", hint: "形容意志高亢、無懼任何千刀萬里的折磨與艱辛。" },
      { text: "全力以赴", missingIndex: 3, missingChar: "赴", hint: "把全部力量與精神投入進去，以求圓滿達成任務。" },
      { text: "半途而廢", missingIndex: 3, missingChar: "廢", hint: "事情做了一半就放棄，未能堅持到底達成目標。" },
      { text: "問心無愧", missingIndex: 3, missingChar: "愧", hint: "在反躬自省時感到心安理得，沒有任何對不起別人的地方。" },
      { text: "迎刃而解", missingIndex: 3, missingChar: "解", hint: "比喻核心問題一旦解決，其餘附帶的問題隨之輕意搞定。" },
      { text: "夜以繼日", missingIndex: 3, missingChar: "日", hint: "用夜晚來接續白天，形容日夜不停地勤勉工作或戰鬥。" },
      { text: "一塵不染", missingIndex: 3, missingChar: "染", hint: "形容環境極其乾淨清潔，或人品高潔不沾染世俗劣習。" },
      { text: "一帆風順", missingIndex: 3, missingChar: "順", hint: "船隻揚滿帆隨風前進。比喻旅程、事業或境遇極其平穩無阻擾。" },
      { text: "百萬雄兵", missingIndex: 3, missingChar: "兵", hint: "形容統率的軍隊、部隊陣仗聲勢浩大，人數極多且實力極強。" }
    ]
  }
];

// Challenge Level: Hand-crafted, 10x10 interlocking crossword layouts
export interface BlanksConfig {
  row: number;
  col: number;
  solution: string;
  hint: string;
}

export interface ChallengeDataset {
  paths: CrosswordIdiomPath[];
  blanks: BlanksConfig[];
  distractors: string[];
}

export const CHALLENGE_DATASETS: ChallengeDataset[] = [
  {
    distractors: ["手", "風", "得", "天", "林", "山"],
    paths: [
      { text: "畫蛇添足", row: 0, col: 1, direction: "H" },
      { text: "足不出戶", row: 0, col: 4, direction: "V" },
      { text: "不期而遇", row: 1, col: 4, direction: "H" },
      { text: "隨遇而安", row: 0, col: 7, direction: "V" },
      { text: "鋌而走險", row: 2, col: 6, direction: "H" },
      { text: "走馬看花", row: 2, col: 8, direction: "V" },
      { text: "刮目相看", row: 4, col: 5, direction: "H" },
      { text: "目瞪口呆", row: 4, col: 6, direction: "V" },
      { text: "口是心非", row: 6, col: 6, direction: "H" },
      { text: "心曠神怡", row: 6, col: 8, direction: "V" }
    ],
    blanks: [
      { row: 0, col: 4, solution: "足", hint: "畫蛇添[足] / [足]不出戶" },
      { row: 2, col: 4, solution: "出", hint: "足不[出]戶" },
      { row: 1, col: 5, solution: "期", hint: "不[期]而遇" },
      { row: 3, col: 7, solution: "安", hint: "隨遇而[安]" },
      { row: 2, col: 9, solution: "險", hint: "鋌而走[險]" },
      { row: 3, col: 8, solution: "馬", hint: "走[馬]看花" },
      { row: 4, col: 7, solution: "相", hint: "刮目[相]看" },
      { row: 5, col: 6, solution: "瞪", hint: "目[瞪]口呆" },
      { row: 6, col: 7, solution: "是", hint: "口[是]心非" },
      { row: 8, col: 8, solution: "神", hint: "心曠[神]怡" }
    ]
  },
  {
    distractors: ["竹", "心", "成", "光", "名", "物"],
    paths: [
      { text: "守株待兔", row: 0, col: 1, direction: "H" },
      { text: "兔死狐悲", row: 0, col: 4, direction: "V" },
      { text: "死裡逃生", row: 1, col: 4, direction: "H" },
      { text: "九死一生", row: 0, col: 7, direction: "V" },
      { text: "數一數二", row: 2, col: 6, direction: "H" },
      { text: "數典忘祖", row: 2, col: 8, direction: "V" },
      { text: "念念不忘", row: 4, col: 5, direction: "H" },
      { text: "忘恩負義", row: 4, col: 6, direction: "V" },
      { text: "負荊請罪", row: 6, col: 6, direction: "H" },
      { text: "請君入甕", row: 6, col: 8, direction: "V" }
    ],
    blanks: [
      { row: 0, col: 4, solution: "兔", hint: "守株待[兔] / [兔]死狐悲" },
      { row: 2, col: 4, solution: "狐", hint: "兔死[狐]悲" },
      { row: 1, col: 5, solution: "裡", hint: "死[裡]逃生" },
      { row: 3, col: 7, solution: "生", hint: "九死一[生]" },
      { row: 2, col: 9, solution: "二", hint: "數一數[二]" },
      { row: 3, col: 8, solution: "典", hint: "數[典]忘祖" },
      { row: 4, col: 7, solution: "不", hint: "念念[不]忘" },
      { row: 5, col: 6, solution: "恩", hint: "忘[恩]負義" },
      { row: 6, col: 7, solution: "荊", hint: "負[荊]請罪" },
      { row: 8, col: 8, solution: "入", hint: "請君[入]甕" }
    ]
  }
];

// Build the crossword grid (10x10) for a given dataset index
export function buildCrosswordGrid(datasetIdx: number): { grid: CrosswordCell[][]; blanksCount: number } {
  const size = 10;
  const grid: CrosswordCell[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({
      row: r,
      col: c,
      char: "",
      isIdiotSource: false,
    }))
  );

  const dataset = CHALLENGE_DATASETS[datasetIdx] || CHALLENGE_DATASETS[0];

  // 1. Fill base characters
  for (const path of dataset.paths) {
    const chars = path.text.split("");
    for (let i = 0; i < chars.length; i++) {
      const r = path.direction === "V" ? path.row + i : path.row;
      const c = path.direction === "H" ? path.col + i : path.col;
      if (r < size && c < size) {
        grid[r][c].char = chars[i];
        grid[r][c].isIdiotSource = true;
      }
    }
  }

  // 2. Dig out the blanks
  let blankIndex = 0;
  for (const blank of dataset.blanks) {
    const { row, col, solution } = blank;
    if (row < size && col < size) {
      grid[row][col].isBlank = true;
      grid[row][col].blankId = blankIndex++;
      grid[row][col].solution = solution;
      grid[row][col].char = ""; // visual empty
    }
  }

  return { grid, blanksCount: dataset.blanks.length };
}
