// 多语言地名数据 (台风活动相关: 西北太平洋 + 东亚 + 东南亚)
// type: sea(海域) | country(国家/地区) | city(城市)
// 每项: { lat, lon, type, zh, en, ja }
window.PLACE_LABELS = [
  // ===== 海域 =====
  { lat: 10, lon: 145, type: "sea", zh: "太平洋", en: "Pacific Ocean", ja: "太平洋" },
  { lat: 15, lon: 135, type: "sea", zh: "菲律宾海", en: "Philippine Sea", ja: "フィリピン海" },
  { lat: 15, lon: 115, type: "sea", zh: "南海", en: "South China Sea", ja: "南シナ海" },
  { lat: 28, lon: 126, type: "sea", zh: "东海", en: "East China Sea", ja: "東シナ海" },
  { lat: 35, lon: 125, type: "sea", zh: "黄海", en: "Yellow Sea", ja: "黄海" },
  { lat: 38, lon: 132, type: "sea", zh: "日本海", en: "Sea of Japan", ja: "日本海" },
  { lat: 8, lon: 120, type: "sea", zh: "苏禄海", en: "Sulu Sea", ja: "スールー海" },
  { lat: 3, lon: 122, type: "sea", zh: "苏拉威西海", en: "Celebes Sea", ja: "セレベス海" },
  { lat: -18, lon: 155, type: "sea", zh: "珊瑚海", en: "Coral Sea", ja: "珊瑚海" },
  { lat: 22, lon: 118, type: "sea", zh: "台湾海峡", en: "Taiwan Strait", ja: "台湾海峡" },
  { lat: 30, lon: 122, type: "sea", zh: "杭州湾", en: "Hangzhou Bay", ja: "杭州湾" },
  { lat: 45, lon: 150, type: "sea", zh: "鄂霍次克海", en: "Sea of Okhotsk", ja: "オホーツク海" },

  // ===== 国家/地区 =====
  { lat: 35, lon: 103, type: "country", zh: "中国", en: "China", ja: "中国" },
  { lat: 36, lon: 138, type: "country", zh: "日本", en: "Japan", ja: "日本" },
  { lat: 13, lon: 122, type: "country", zh: "菲律宾", en: "Philippines", ja: "フィリピン" },
  { lat: 16, lon: 106, type: "country", zh: "越南", en: "Vietnam", ja: "ベトナム" },
  { lat: 36, lon: 128, type: "country", zh: "韩国", en: "South Korea", ja: "大韓民国" },
  { lat: 40, lon: 127, type: "country", zh: "朝鲜", en: "North Korea", ja: "朝鮮" },
  { lat: 23.5, lon: 121, type: "country", zh: "中国台湾", en: "Taiwan, China", ja: "中国台湾" },
  { lat: 22.3, lon: 114.2, type: "country", zh: "中国香港", en: "Hong Kong, China", ja: "中国香港" },
  { lat: 15, lon: 101, type: "country", zh: "泰国", en: "Thailand", ja: "タイ" },
  { lat: 4, lon: 102, type: "country", zh: "马来西亚", en: "Malaysia", ja: "マレーシア" },
  { lat: -2, lon: 116, type: "country", zh: "印度尼西亚", en: "Indonesia", ja: "インドネシア" },

  // ===== 城市 =====
  { lat: 39.9, lon: 116.4, type: "city", zh: "北京", en: "Beijing", ja: "北京" },
  { lat: 31.2, lon: 121.5, type: "city", zh: "上海", en: "Shanghai", ja: "上海" },
  { lat: 23.1, lon: 113.3, type: "city", zh: "广州", en: "Guangzhou", ja: "広州" },
  { lat: 22.5, lon: 114.1, type: "city", zh: "深圳", en: "Shenzhen", ja: "深セン" },
  { lat: 22.3, lon: 114.2, type: "city", zh: "香港", en: "Hong Kong", ja: "香港" },
  { lat: 25.0, lon: 121.5, type: "city", zh: "台北", en: "Taipei", ja: "台北" },
  { lat: 35.7, lon: 139.7, type: "city", zh: "东京", en: "Tokyo", ja: "東京" },
  { lat: 34.7, lon: 135.5, type: "city", zh: "大阪", en: "Osaka", ja: "大阪" },
  { lat: 26.2, lon: 127.7, type: "city", zh: "那霸", en: "Naha", ja: "那覇" },
  { lat: 14.6, lon: 121.0, type: "city", zh: "马尼拉", en: "Manila", ja: "マニラ" },
  { lat: 21.0, lon: 105.8, type: "city", zh: "河内", en: "Hanoi", ja: "ハノイ" },
  { lat: 37.6, lon: 127.0, type: "city", zh: "首尔", en: "Seoul", ja: "ソウル" },
  { lat: 35.1, lon: 129.0, type: "city", zh: "釜山", en: "Busan", ja: "釜山" },
  { lat: 13.8, lon: 100.5, type: "city", zh: "曼谷", en: "Bangkok", ja: "バンコク" },
  { lat: 1.35, lon: 103.8, type: "city", zh: "新加坡", en: "Singapore", ja: "シンガポール" },
  { lat: 31.2, lon: 121.5, type: "city", zh: "舟山", en: "Zhoushan", ja: "舟山" },
  { lat: 24.3, lon: 118.1, type: "city", zh: "厦门", en: "Xiamen", ja: "アモイ" },
  { lat: 33.6, lon: 130.4, type: "city", zh: "福冈", en: "Fukuoka", ja: "福岡" },
];
