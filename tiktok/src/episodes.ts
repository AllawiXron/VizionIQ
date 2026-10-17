// One entry per video. The verse lines are the Qur'an text exactly as printed (simple script, with tashkeel);
// check any new verse against a mushaf (e.g. quran.com) before posting.
export type Scene = 'dawn' | 'dua' | 'rain';

export type Episode = {
  id: string;
  scene: Scene; // dawn: head bowed, lifts at the verse · dua: hands raised, a plant grows · rain: rain stops at the verse
  intro: string; // first line, dims when the list comes in
  list: string[]; // up to 3 short lines, stacked
  bridge: string; // the line just before the verse
  verse: string[]; // the verse, one string per line on screen
  ref: string; // surah and ayah
  caption: string; // TikTok caption (copy it when posting)
};

export const BRAND = { name: 'فَتَرضى', handle: '@fatarda' };

export const EPISODES: Episode[] = [
  {
    id: 'e01-yusr',
    scene: 'dawn',
    intro: 'تمرّ عليك أيام ثقيلة',
    list: ['تعبٌ لا يراه أحد', 'انتظارٌ طويل', 'وخوفٌ من القادم'],
    bridge: 'لكنّ الله وعدك',
    verse: ['فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', 'إِنَّ مَعَ الْعُسْرِ يُسْرًا'],
    ref: 'سورة الشرح · ٥ - ٦',
    caption: 'مهما طال العسر، اليسر معه 🤍 ﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ #قرآن #تذكير #اكسبلور #fyp',
  },
  {
    id: 'e02-fatarda',
    scene: 'dua',
    intro: 'تدعو كل ليلة',
    list: ['تنتظر', 'وتصبر', 'ولم ترَ الإجابة بعد'],
    bridge: 'اطمئن، فربّك يقول',
    verse: ['وَلَسَوْفَ يُعْطِيكَ', 'رَبُّكَ فَتَرْضَىٰ'],
    ref: 'سورة الضحى · ٥',
    caption: 'دعاؤك ما ضاع 🤍 ﴿وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ﴾ #دعاء #قرآن #تذكير #اكسبلور #fyp',
  },
  {
    id: 'e03-tatmain',
    scene: 'rain',
    intro: 'قلبك متعب؟',
    list: ['تفكيرٌ لا يهدأ', 'وضيقٌ بلا سبب'],
    bridge: 'والدواء أقرب مما تظن',
    verse: ['أَلَا بِذِكْرِ اللَّهِ', 'تَطْمَئِنُّ الْقُلُوبُ'],
    ref: 'سورة الرعد · ٢٨',
    caption: 'أقرب راحة: ذكر الله 🤍 ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ #ذكر_الله #قرآن #تذكير #اكسبلور #fyp',
  },
];
