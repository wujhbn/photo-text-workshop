export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const morningGreetings = [
  '早安，願您今天精神滿滿',
  '早安，新的開始，新的希望',
  '早安，願陽光帶來滿滿好運',
  '早安，笑容開啟美好一天',
  '早安，平安健康就是最大的福氣'
];

const afternoonGreetings = [
  '午安，願您午後心情依然美麗',
  '午安，喝口水，放鬆一下心情',
  '午安，願好運陪您走過今天',
  '午安，保持笑容，福氣自然來',
  '午安，辛苦了，記得照顧自己'
];

const eveningGreetings = [
  '晚安，願您今晚睡得安穩',
  '晚安，放下疲憊，迎接好夢',
  '晚安，今天辛苦了，明天會更好',
  '晚安，願平安與幸福陪伴您',
  '晚安，心安就是最好的祝福'
];

const encouragements = [
  '心中有陽光，生活就有希望',
  '每一天都是新的開始',
  '笑口常開，好運自然來',
  '一步一腳印，幸福慢慢靠近',
  '保持善良與感恩，福氣會常伴左右',
  '人生路上，平安健康最珍貴',
  '願您心情開朗，萬事順心',
  '好心情會帶來好風景',
  '用微笑面對今天，好事就會靠近',
  '願每個平凡日子都有小小幸福'
];

const blessings = [
  '祝您平安健康，福氣滿滿',
  '願您事事順心，好運連連',
  '祝您身體健康，心情愉快',
  '願幸福與喜樂天天相伴',
  '祝您今天順心如意，笑容滿面',
  '願平安、健康、好運都在您身邊'
];

function getRandomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCopy(time: TimeOfDay): { title: string; message: string } {
  let greetingObj = '';
  if (time === 'morning') greetingObj = getRandomItem(morningGreetings);
  else if (time === 'afternoon') greetingObj = getRandomItem(afternoonGreetings);
  else /* evening */ greetingObj = getRandomItem(eveningGreetings);
  
  // Split title and subtitle. E.g., "早安，願您今天精神滿滿" -> title: "早安", subtitle: "願您今天精神滿滿"
  const parts = greetingObj.split('，');
  const title = parts[0] || '你好';
  const subtitle = parts[1] || '';

  const enc = getRandomItem(encouragements);
  const bless = getRandomItem(blessings);
  
  const message = [subtitle, enc, bless].filter(Boolean).join('\n');
  
  return { title, message };
}

export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  return 'evening';
}
