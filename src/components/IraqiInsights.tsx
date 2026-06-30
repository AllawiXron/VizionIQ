/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  ThumbsUp, 
  Flame, 
  DollarSign, 
  Megaphone, 
  TrendingUp, 
  Users, 
  HelpCircle, 
  AlertTriangle, 
  Lightbulb, 
  Shuffle, 
  CheckCircle,
  TrendingDown,
  X
} from "lucide-react";

interface Insight {
  id: string;
  category: "ads" | "sales" | "pricing" | "content" | "customers" | "profits" | "mistakes" | "newbies";
  categoryLabel: string;
  text: string;
  lesson: string;
  practicalAction: string;
  difficulty: "بسيط" | "متوسط" | "متقدم";
}

export default function IraqiInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [randomInsight, setRandomInsight] = useState<Insight | null>(null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  // Load votes from localStorage
  useEffect(() => {
    const storedVotes = localStorage.getItem("iraqi_insights_votes");
    if (storedVotes) {
      try {
        setVotes(JSON.parse(storedVotes));
      } catch (e) {
        console.error("Error parsing votes", e);
      }
    } else {
      // Initialize some realistic seed values for votes
      const seedVotes: Record<string, number> = {};
      insightsList.forEach(insight => {
        // Seed value between 14 and 92
        seedVotes[insight.id] = Math.floor(Math.random() * 78) + 14;
      });
      setVotes(seedVotes);
      localStorage.setItem("iraqi_insights_votes", JSON.stringify(seedVotes));
    }
  }, []);

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVotes = { ...votes };
    currentVotes[id] = (currentVotes[id] || 0) + 1;
    setVotes(currentVotes);
    localStorage.setItem("iraqi_insights_votes", JSON.stringify(currentVotes));
  };

  const categories = [
    { id: "all", label: "🎯 الكل", color: "from-blue-500/20 to-indigo-500/20" },
    { id: "ads", label: "📣 الإعلانات", color: "from-amber-500/20 to-amber-600/30" },
    { id: "sales", label: "💬 المبيعات", color: "from-emerald-500/20 to-emerald-600/30" },
    { id: "pricing", label: "💰 التسعير", color: "from-purple-500/20 to-purple-600/30" },
    { id: "content", label: "🎬 المحتوى", color: "from-pink-500/20 to-pink-600/30" },
    { id: "customers", label: "👥 الزبائن", color: "from-cyan-500/20 to-cyan-600/30" },
    { id: "profits", label: "📈 الأرباح", color: "from-blue-500/20 to-blue-600/30" },
    { id: "mistakes", label: "⚠️ الأخطاء الشائعة", color: "from-red-500/20 to-red-600/30" },
    { id: "newbies", label: "🌱 المشاريع الجديدة", color: "from-teal-500/20 to-teal-600/30" }
  ];

  const insightsList: Insight[] = [
    // 1. الإعلانات (ads)
    {
      id: "ads-1",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "إذا كل الرسائل اللي تجيك تسأل عن السعر وتختفي، فغالباً المشكلة مو بطريقة الرد… المشكلة أن إعلانك دي يوصل للناس الغلط.",
      lesson: "عندما يجذب إعلانك أشخاصاً غير جادين أو يبحثون عن ترفيه فقط، ستضيع وقتك في الإجابة على الخاص دون أي جدوى حقيقية.",
      practicalAction: "راجع الاستهداف البصري للمنتج. تجنب وضع صور مبهمة تجذب الفضوليين، واجعل الفيديو يوضح وظيفة المنتج وسعره المبدئي لتصفية الجمهور مبكراً.",
      difficulty: "بسيط"
    },
    {
      id: "ads-2",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "مو كل رسالة رخيصة تعتبر نتيجة جيدة. مرات الرسالة بـ1000 دينار تطلع أربح من رسالة بـ300 دينار.",
      lesson: "تكلفة الرسالة المنخفضة قد تعني أن فيسبوك يستهدف مستخدمين يعلقون ويرسلون رسائل عشوائية دون نية شراء فعلية.",
      practicalAction: "لا تحكم على نجاح حملتك بسعر الرسالة فقط. احسب دائماً تكلفة الطلب المستلم (Cost Per Acquisition). إذا كانت الرسائل رخيصة والمبيعات صفر، أوقف الحملة فوراً.",
      difficulty: "متوسط"
    },
    {
      id: "ads-3",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "كثرة الرسائل مو معناها أن حملتك ناجحة. المهم شكد واحد منهم تحول إلى طلب مستلم فعلياً.",
      lesson: "عاصفة الرسائل التي تكتفي بالسؤال عن السعر تمثل هدراً لوقت فريق المبيعات واستنزافاً لميزانية الترويج الإعلاني.",
      practicalAction: "استخدم الخطاف البصري لفرز الزبائن الجادين بالإعلان. اكتب تفاصيل العرض الأساسية بوضوح تام لتمنع الفضوليين من الضغط العشوائي.",
      difficulty: "بسيط"
    },
    {
      id: "ads-4",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "أكو إعلانات تجيب تفاعل أكثر… وإعلانات ثانية تجيب مبيعات أكثر. مو دائماً الإعلان اللي عليه لايكات أكثر هو الأفضل.",
      lesson: "المنشور الذي يحتوي على تفاعل اجتماعي هائل (Likes/Comments/Shares) قد يكون كوميدياً أو مثيراً للجدل، ولكنه لا يغري المشاهد بطلب المنتج بماله الخاص.",
      practicalAction: "فرّق بين حملات التفاعل (Engagement Campaigns) وحملات المبيعات والرسائل (Sales/Messages Campaigns) بمدير الإعلانات. اختر دائماً هدف 'المبيعات' لضمان توجيه الإعلان للمشترين الجادين.",
      difficulty: "متقدم"
    },
    {
      id: "ads-5",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "قبل ما تكبر ميزانية إعلانك، تأكد أولاً أنه يحقق نتائج. تكبير حملة خسرانة غالباً يعني خسارة أكبر وبسرعة.",
      lesson: "تكبير الميزانية (Scaling) لحملة تعاني من نسبة تحويل ضعيفة أو سعر رسالة مرتفع يؤدي فقط لتسريع حرق رأس مالك دون تحسن في كفاءة البيع.",
      practicalAction: "لا ترفع ميزانية الحملة اليومية بأكثر من 20% دفعة واحدة، وتأكد أن العائد على الإنفاق الإعلاني (ROAS) للبيج لا يقل عن 3 أضعاف قبل التفكير بالمضاعفة.",
      difficulty: "متقدم"
    },
    {
      id: "ads-6",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "إذا عندك 100 رسالة و5 طلبات، مو شرط المشكلة بطريقة الرد. مرات المشكلة أن الإعلان جذب ناس فضوليين من البداية.",
      lesson: "إذا صممت خطافاً إعلانياً مضللاً أو عاطفياً مبالغاً فيه، ستنهال عليك الرسائل المستكشفة التي تصطدم بالحقيقة وتلغي الشراء بالخاص.",
      practicalAction: "كن صادقاً في إعلانك ولا تبالغ بالمزايا. اعرض المنتج بوضوح وبلهجة واقعية مريحة ليكون العميل مقتنعاً سلفاً بنسبة 80% قبل دخوله للخاص.",
      difficulty: "بسيط"
    },
    {
      id: "ads-7",
      category: "ads",
      categoryLabel: "الإعلانات",
      text: "أكبر خطأ يسويه أصحاب المشاريع الجدد هو أنهم يحكمون على الإعلان خلال يوم واحد فقط.",
      lesson: "خوارزميات منصات التواصل تحتاج لفترة تعلم (Learning Phase) لا تقل عن 24 إلى 48 ساعة لتجميع البيانات وتحديد شريحة الجمهور المثالية لإعلانك.",
      practicalAction: "اترك الإعلان يعمل بحد أدنى 48 ساعة دون أي تعديلات جراحية، لتعطي الذكاء الاصطناعي فرصة تحسين الصرف والوصول للزبائن الرابحين.",
      difficulty: "متوسط"
    },

    // 2. المبيعات (sales)
    {
      id: "sales-1",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "إذا منتجك يحتاج شرح طويل حتى يقتنع الزبون، فغالباً محتواك أو عرضك يحتاج تحسين.",
      lesson: "كلما طال حوار المبيعات بالخاص لإثبات منفعة المنتج، زادت احتمالية تشتت الزبون أو تراجعه عن فكرة الشراء بالكامل.",
      practicalAction: "صمم فيديو إعلاني قصير وحاسم يجيب على الأسئلة الثلاثة للزبون العراقي: (شنو المنتج؟ شسوي بيه؟ ببيش واشلون يوصلي؟) لتنهي البيعة سلفاً.",
      difficulty: "بسيط"
    },
    {
      id: "sales-2",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "الناس ما تشتري المنتج فقط… تشتري الثقة. لهذا صفحتين يبيعون نفس المنتج، لكن وحدة تبيع أكثر من الثانية.",
      lesson: "الزبون العراقي تعرض للكثير من حالات النصب سابقاً. لذا فهو يبحث عن علامات الثقة والأمان قبل المزايا والأسعار الرخيصة.",
      practicalAction: "أعلن دائماً عن ميزة (الفحص قبل الدفع والاستلام) وصور كواليس تغليف الطرود باسم الزبون لتثبت أنك بيج حقيقي ومهني وله مقر واضح.",
      difficulty: "متوسط"
    },
    {
      id: "sales-3",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "الرد المتأخر يقتل المبيعات. الزبون العراقي يرسل للبيج وهو متحمس، فإذا مرت ساعة كاملة دون إجابة، سيشتري من المنافس فوراً.",
      lesson: "الحماس لطلب المنتج هو نبضة عاطفية مؤقتة تزول بسرعة بمجرد تشتت الزبون أو قراءته لمنشورات أخرى.",
      practicalAction: "استخدم الردود السريعة المحفوظة ببرامج إدارية، وفعل خيار الموظفين المناوبين بالخاص ليكون الرد خلال أقل من 10 دقائق من استلام الرسالة.",
      difficulty: "بسيط"
    },
    {
      id: "sales-4",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "لا تنهِ رسالتك للزبون بالسكوت بعد ذكر السعر. خيره دائماً لتوجهه نحو إتمام عملية الشراء.",
      lesson: "الزبون عندما يعطى خياراً مفتوحاً مثل 'تريد تطلب؟' سيفكر بالرفض. أما تخييره بين قياسين أو لونين يوجه تفكيره لاختيار الأنسب له.",
      practicalAction: "اجعل الجملة الختامية بالخاص دائماً: (أبو جاسم الغالي، متوفر عندنا قياس لارج واكس لارج.. يا قياس تفضل نوصلك وية مندوب اليوم؟).",
      difficulty: "بسيط"
    },
    {
      id: "sales-5",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "الاتصال الهاتفي الفوري لتأكيد الطلب خلال أول نصف ساعة يمنع تراجع الزبون بنسبة تفوق 60%.",
      lesson: "التأخر في الاتصال الهاتفي لتأكيد العنوان يعطي العميل وقتاً طويلاً للشعور بالندم أو الاستجابة لبيجات ثانية تقدم عروضاً بديلة.",
      practicalAction: "عين كاشيراً أو موظف تأكيدات مخصصاً لتلقي الإشعارات الفورية والاتصال بالزبائن لتثبيت الطلبات هاتفياً بأسرع وقت ممكن.",
      difficulty: "متوسط"
    },
    {
      id: "sales-6",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "الردود الآلية الطويلة والباردة تقتل حميمية البيع في الدايركت وتجعل الزبون يشعر بالإهمال.",
      lesson: "الزبائن في العراق يكرهون التواصل مع روبوتات جافة ويرغبون بسماع الكلمات الشعبية اللطيفة والدافئة ليرتاحوا للصفحة.",
      practicalAction: "استخدم بصمات صوتية ودية مسجلة يدوياً بالواتساب لإبلاغ الزبون بحالة طلبه بصوت بشري بغدادي فخم ولبق.",
      difficulty: "بسيط"
    },
    {
      id: "sales-7",
      category: "sales",
      categoryLabel: "المبيعات",
      text: "أفضل مبيعات تتحقق عندما تبيع حزماً متكاملة لزبون وافق سلفاً على طلب منتجك الرئيسي الأول.",
      lesson: "كلفة الإعلان للحصول على العميل دفعت بالكامل للطلب الأول. أي بيع إضافي لنفس العميل (Upsell) يعتبر صافي ربح خالص وتكلفته صفر إعلانات.",
      practicalAction: "درب كاشير المبيعات بالهاتف على قول: (أخي العزيز، بما أنه طلبت هذا الجهاز، نوفر وياه الباكج الملحق الخاص بيه بنصف السعر ومجاناً الشحن.. تحب أضيفه إلك؟).",
      difficulty: "متوسط"
    },

    // 3. التسعير (pricing)
    {
      id: "pricing-1",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "إذا الناس كلها تكلك 'غالي'، لا تستعجل وتنزل السعر. مرات المشكلة أن الزبون ما فهم قيمة المنتج.",
      lesson: "الاعتراض على السعر لا يعني بالضرورة غلاء المنتج، بل يعني أن إعلانك وصورك لم تعكس القيمة والفائدة الحقيقية التي تبرر هذا السعر بذكاء.",
      practicalAction: "أعد صياغة الفيديوهات لتظهر جودة المنتج وخاماته ومقارنته بالبدائل الرخيصة سريعة التلف لتثبت أن السعر مناسب للجودة الاستثنائية.",
      difficulty: "متوسط"
    },
    {
      id: "pricing-2",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "التسعير العشوائي هو أسرع طريق للإفلاس. بيع منتجات بهامش ربح يقل عن 10,000 دينار غالباً سيؤدي لخسارتك كاشك بالكامل.",
      lesson: "هناك تكاليف مخفية كبرى بالسوق العراقي تلتهم الهامش: كلفة المرتجع، كلفة الرسالة، أجور الشحن البينية، ونسب تالف التعبئة والتغليف.",
      practicalAction: "احرص أن يكون الهامش الإجمالي بين سعر الشراء وسعر البيع لا يقل عن 15,000 إلى 20,000 دينار عراقي لتغطية كل مصاريفك ويبقى لك صافي ربح طيب.",
      difficulty: "متقدم"
    },
    {
      id: "pricing-3",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "الشحن المجاني ليس مجانياً فعلياً. يجب أن يُحسب كجزء صارم من بنية التسعير وهيكلية العرض الإجمالي.",
      lesson: "تقديم شحن مجاني عشوائي لمنتج ذي هامش ربح ضيق يلتهم كامل صافي أرباحك لشركة الشحن ويحرمك من الكاش المتبقي.",
      practicalAction: "اربط الشحن المجاني بقيمة السلة الإجمالية، مثلاً: (شحن مجاني عند طلب قطعتين أو أكثر) لترفع متوسط الطلبية وتغطي تكلفة التوصيل براحة.",
      difficulty: "متوسط"
    },
    {
      id: "pricing-4",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "حرب الأسعار مع المنافسين الكبار انتحار مالي حتمي. المنافس قد يشتري بضاعة جملة بأعداد ضخمة وسعر ضعيف جداً لا تطيقه أنت.",
      lesson: "محاولة كسب الزبون عبر تقديم السعر الأرخص تجعلك تعمل بلا أرباح فعلية، مما يمنعك من تحسين جودة التعبئة أو ترويج إعلانات محترمة.",
      practicalAction: "تميز عنهم بالتغليف الفخم الهدية، وتقديم كفالة وضمان استبدال حقيقي 6 أشهر، وسرعة الرد والتوصيل لتبرر السعر الأعلى بثقة.",
      difficulty: "متوسط"
    },
    {
      id: "pricing-5",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "التسعير بالكسور البسيطة مثل 24,000 د.ع أو 39,000 د.ع يثير رغبة الشراء النفسية بشكل أفضل بكثير من الأرقام الدائرية المغلقة.",
      lesson: "عقل الزبون العراقي مبرمج على رؤية الرقم الأول من اليسار وتفسيره على أنه صفقة موفرة وأقل تكلفة مما يعتقد باللاوعي.",
      practicalAction: "استبدل تسعير الـ 40,000 دينار بـ 39,000 دينار. هذا التغيير الطفيف يرفع نسبة طلبات البيج بأكثر من 20% دون التأثير الفعلي على أرباحك.",
      difficulty: "بسيط"
    },
    {
      id: "pricing-6",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "الزبون العراقي يكره بشدة الرسوم الإضافية غير المعلنة. إبلاغه بوجود 5,000 دينار أجور توصيل عند التثبيت بالخاص قد يجعله يلغي الطلب فوراً.",
      lesson: "المفاجآت الحسابية السلبية عند نهاية حوار المبيعات تشعر الزبون بالنصب وتدفعه لإلغاء المعاملة تلافياً للشعور بالخديعة.",
      practicalAction: "أعلن عن السعر شاملاً للتوصيل، أو اذكر عبارة (التوصيل 5,000 لجميع المحافظات) بوضوح في بداية البوست الترويجي لمنع الصدمات بالخاص.",
      difficulty: "بسيط"
    },
    {
      id: "pricing-7",
      category: "pricing",
      categoryLabel: "التسعير",
      text: "الخصومات النقدية المباشرة (مثل وفر 10 آلاف اليوم) أكثر إقناعاً للزبون العراقي من نسب الخصم المئوية المبهمة.",
      lesson: "الزبائن يفضلون معرفة المقدار الفعلي للفلوس التي ستبقى بجيبهم فوراً بدلاً من حساب النسبة المئوية التي قد يجهلون قيمتها الحقيقية.",
      practicalAction: "بدلاً من كتابة (خصم 25% على الباكج)، اكتب بخط عريض: (وفر 15,000 دينار عراقي اليوم واحصل على العرض الذهبي).",
      difficulty: "بسيط"
    },

    // 4. المحتوى (content)
    {
      id: "content-1",
      category: "content",
      categoryLabel: "المحتوى",
      text: "الإعلانات اللي تتصور بكاميرا موبايل عادية تجيب مبيعات وثقة أعلى بـ 3 مرات من الصور الجاهزة المستوردة.",
      lesson: "الصور المعدلة بالفوتوشوب أو لقطات المواقع الأجنبية تبدو وهمية للزبون العراقي المعتاد على النصب من البيجات الوهمية.",
      practicalAction: "خذ عينة من المنتج لبيتك، صور فيديو عفوي ومباشر بهاتفك تحت إضاءة الغرفة، واعرض خاماته ولمعته وتعبئته بيدك لتبني مصداقية خارقة.",
      difficulty: "بسيط"
    },
    {
      id: "content-2",
      category: "content",
      categoryLabel: "المحتوى",
      text: "أول 3 ثوانٍ بالفيديو (الخطاف العراقي) هي اللي تحدد نجاح حملتك بالكامل. إذا أول جملة مو جاذبة، فالناس راح تعبر وتخسر ميزانيتك.",
      lesson: "سرعة التصفح (Scrolling) هائلة، وإذا لم تجذب عين وأذن الزبون بكلمة تلامس مشكلته الحقيقية فوراً، سيعبر إعلانك للأبد دون التفكير بالضغط.",
      practicalAction: "ابدأ إعلانك بعبارات شعبية صادمة مثل: (لا تشتري عطور صينية رخيصة قبل ما تشوف هذا..) أو (إذا تعبت من حر الصيف ومكيف سيارتك ضعيف..) بدلاً من المقدمات المملة.",
      difficulty: "بسيط"
    },
    {
      id: "content-3",
      category: "content",
      categoryLabel: "المحتوى",
      text: "تجنب تماماً استخدام اللغة العربية الفصحى الجافة في إعلانات الدايركت. استخدم لهجة بغدادية حية ومحترمة تلامس عقل المشتري العراقي.",
      lesson: "النصوص الفصحى المنسوخة من مواقع أجنبية تشعر الزبون بأنه يتواصل مع شركة بعيدة أو بوت تجاري جاف، مما يفقده الرغبة في التفاعل الودي.",
      practicalAction: "اكتب نصوص الإعلان بلهجة عامية بغدادية مهذبة جداً ودافئة، كأنك تنصح صديقاً مقرباً بشراء شيء يفيده بحياته اليومية.",
      difficulty: "بسيط"
    },
    {
      id: "content-4",
      category: "content",
      categoryLabel: "المحتوى",
      text: "المحتوى الذي يركز على المشكلة اليومية التي يحلها منتجك يبيع أكثر بكثير من المحتوى الذي بس يعدد مواصفاته الفنية المملة.",
      lesson: "الزبون لا يهتم بسعة بطارية الجهاز بالأرقام بقدر ما يهتم بالسؤال: (هل هذا الجهاز راح يشغللي مروحة بغرفتي وقت انقطاع الوطنية بالصيف العراقي الحار؟).",
      practicalAction: "ركز دائماً على المزايا الحياتية العملية والسيناريوهات الواقعية التي تلامس يوميات المواطن العراقي، واجعل المواصفات الفنية تفاصيل ثانوية أسفل البوست.",
      difficulty: "متوسط"
    },
    {
      id: "content-5",
      category: "content",
      categoryLabel: "المحتوى",
      text: "المراجعات الحقيقية وآراء الزبائن السابقين (سكرينات المحادثات والواتساب) هي أقوى محتوى ترويجي مجاني لبيجك.",
      lesson: "الزبون يثق بكلام زبائن آخرين اشتروا وجربوا المنتج واستفادوا منه، أكثر بـ 100 مرة من ثقته بكلامك الترويجي الذاتي كصاحب صفحة.",
      practicalAction: "اطلب دائماً من زبائنك تقييماتهم بعد الاستلام بيومين، واعرض لقطات شكرهم بالواتساب كستوريات مثبتة أو بوستات ترويجية بالصفحة.",
      difficulty: "بسيط"
    },
    {
      id: "content-6",
      category: "content",
      categoryLabel: "المحتوى",
      text: "كثرة الكتابة والملصقات البراقة المزدحمة على صور الإعلان تخرب هيبة منتجك وتجعله يبدو رخيصاً كإعلانات السبام المزعجة.",
      lesson: "التصميم المزدحم بـ 10 خطوط وألوان فاقعة يشتت العين ويفقد الصورة تركيزها الأساسي على جمالية وفخامة السلعة المعروضة.",
      practicalAction: "حافظ على خلفية نظيفة وعالية التباين، واكتفِ بوضع شعار صفحتك بشكل هادئ مع إضاءة ممتازة تركز على تفاصيل وجاذبية المنتج نفسه.",
      difficulty: "بسيط"
    },
    {
      id: "content-7",
      category: "content",
      categoryLabel: "المحتوى",
      text: "تصوير فيديوهات تعبئة وتغليف الطرود الفعلية مع ذكر أسماء زبائن حقيقيين ومحافظاتهم ينشئ رغبة شراء جماعية وتدافعاً قوياً بالصفحة.",
      lesson: "البشر مبرمجون على تقليد سلوك القطيع (Social Proof). عندما يرون أن مئات الطرود تشحن يومياً للموصل والبصرة وبغداد، يطمئنون ويطلبون فوراً.",
      practicalAction: "انشر بشكل دوري فيديوهات مدتها 15 ثانية لمكتبك أو مستودعك وهو مزدحم بالطرود الجاهزة للشحن مع تعليق ودي حماسي بالصوت البشري.",
      difficulty: "متوسط"
    },

    // 5. الزبائن (customers)
    {
      id: "customers-1",
      category: "customers",
      categoryLabel: "الزبائن",
      text: "الزبون اللي يسأل عن السعر بالتعليقات ويختفي، غالباً هو زبون فضولي يمرر الوقت. لا تجاوبه بالسعر الجاف بالتعليق بل اسحبه للخاص.",
      lesson: "إعطاء السعر النهائي بشكل مباشر في التعليقات ينهي حوار المبيعات فوراً دون إتاحة الفرصة لشرح قيمة وعروض منتجك الرائعة.",
      practicalAction: "رد على تعليقه بلباقة: (حياك الله عيني أبو جاسم، دزينا الك تفاصيل العرض الذهبي وصور المنتج الحقيقية بالخاص.. شيك رسائلك عيوني).",
      difficulty: "بسيط"
    },
    {
      id: "customers-2",
      category: "customers",
      categoryLabel: "الزبائن",
      text: "سياسة الاسترجاع المريحة والخالية من التعقيد ترفع مبيعات بيجك للضعف وتمتص قلق الزبون المتردد تماماً.",
      lesson: "أغلب الزباين يخافون من ضياع فلوسهم بالبضائع المغشوشة. الضمان المكتوب يزيل كامل جدار التردد والخوف من الشراء الإلكتروني.",
      practicalAction: "اكتب بوضوح تام في إعلانك: (افحص البضاعة وشغلها كدام المندوب قبل ما تدفع أي دينار.. إذا ما عجبتك رجعها وية المندوب مجاناً وبدون أي تكلفة شحن!).",
      difficulty: "بسيط"
    },
    {
      id: "customers-3",
      category: "customers",
      categoryLabel: "الزبائن",
      text: "الزبون الغاضب الذي واجه مشكلة في طلبه هو كنز تسويقي مستتر إذا أحسنت معاملته وحل مشكلته فوراً بحب واحترام.",
      lesson: "تعويض العميل المتضرر بسرعة وبنبرة اعتذار محترمة يحوله من منتقد شرس بالتعليقات إلى مسوق مخلص يتحدث عن أمانتكم ومصداقيتكم لكل أقاربه.",
      practicalAction: "إذا وصل منتج تالف أو مكسور للزبون، لا تجادله أو تحظره. اتصل به فوراً واعتذر منه وأرسل له قطعة بديلة مجانية بالكامل مع شحن مجاني كتعويض.",
      difficulty: "متوسط"
    },
    {
      id: "customers-4",
      category: "customers",
      categoryLabel: "الزبائن",
      text: "الزبائن في المحافظات الجنوبية (البصرة، ذي قار، العمارة) يمتلكون سلوكاً شرائياً حماسياً وسريع الاستلام إذا عوملوا بتقدير محلي فخم.",
      lesson: "الجنوب العراقي هو سوق كاش هائل ومربح جداً، والجمهور هناك يحب التعامل الشخصي اللبق والتقدير الاجتماعي لنبرة الاتصال الهاتفي.",
      practicalAction: "تأكد من معاملة زبائن الجنوب بنبرة ترحيب بالغة الفخامة هاتفياً، واستعن بشركات شحن تمتلك مناديب من نفس مناطقهم لتضمن أعلى نسب استلام.",
      difficulty: "بسيط"
    },
    {
      id: "customers-5",
      category: "customers",
      categoryLabel: "الزبائن",
      text: "الزبون المتردد الذي يتعذر بـ 'أفكر وأرجعلك عيوني'، لا تلح عليه بالرسائل النصية المكررة بل امنحه عرضاً ذا وقت محدود لينشط حواسه الشراء.",
      lesson: "المماطلة تعني أن الزبون مهتم بالبضاعة ولكنه يفتقد لسبب مقنع وحاسم ليدفع المال الآن بدلاً من تأجيل الفكرة للمستقبل.",
      practicalAction: "رد عليه بلطف: (حقك عيني خذ وقتك.. بس حبيت أبلغك أن هذا العرض بخصم الـ 10,000 دينار ينتهي اليوم بالليل لأن الكمية بالمخزن حيل محدودة.. تحجز قطعة هسة؟).",
      difficulty: "متوسط"
    },
    {
      id: "customers-6",
      category: "customers",
      categoryLabel: "الزبائن",
      text: "الزبون العراقي يبحث عن الحل لكسله وراحته اليومية. ركز دائماً في كلامك على مقدار الراحة وتوفير الوقت والتعب الذي يوفره منتجك له ولعائلته.",
      lesson: "الحديث عن الراحة اليومية والتحرر من منغصات روتين الصيف والكهرباء يلامس وتراً حساساً ويدفع الزبون للشراء مهما كان سعرك.",
      practicalAction: "صغ محتواك التسويقي ليعرض السيناريو الصعب والمرهق للمواطن، ثم اعرض السلعة كالحل المنقذ والسحري والسهل لراحته بلمسة زر واحدة.",
      difficulty: "بسيط"
    },

    // 6. الأرباح (profits)
    {
      id: "profits-1",
      category: "profits",
      categoryLabel: "الأرباح",
      text: "مرات المشروع يخسر مو لأن المبيعات قليلة… وإنما لأن صاحبه ما يحسب تكلفة الإعلانات والطلبات المرتجعة.",
      lesson: "قد تكون سعيداً بشحن 100 كرتونة، ولكن إذا رجعت منها 30 كرتونة مرتجعة، فتكاليف الشحن المزدوج وتلفيات التغليف قد تقضي على كامل هوامش ربح الطرود الـ 70 المستلمة.",
      practicalAction: "استخدم حاسبة كاشف تسرب الأرباح بانتظام. طابق الكشوف المالية أسبوعياً، واخصم تكلفة كل شحنة راجعة من الأرباح الصافية لتكتشف ربحيتك الفعلية بدقة.",
      difficulty: "متقدم"
    },
    {
      id: "profits-2",
      category: "profits",
      categoryLabel: "الأرباح",
      text: "مو كل زيادة بالمبيعات تعني زيادة بالأرباح. زيادة المبيعات عبر مضاعفة الصرف الإعلاني العشوائي قد تؤدي لتقليص صافي هامش ربحك الفعلي.",
      lesson: "تكلفة الرسالة قد ترتفع بشكل حاد عند زيادة صرف الميزانية اليومية دون تهيئة الإعلان، مما يعني أنك تصرف كاشاً أعلى للحصول على نفس أرباحك السابقة.",
      practicalAction: "توسع بشكل تدريجي ومدروس في الترويج. لا تقم بمضاعفة الصرف الإعلاني إلا إذا تأكدت أن تكلفة الحصول على الزبون مستقرة ومربحة على مدى أسبوع كامل.",
      difficulty: "متقدم"
    },
    {
      id: "profits-3",
      category: "profits",
      categoryLabel: "الأرباح",
      text: "أكو مشاريع تربح من 20 رسالة أكثر من مشاريع تجيها 200 رسالة.",
      lesson: "الربح الصافي لا يعتمد على حجم التفاعل والصخب الإعلاني بالخاص، بل على جودة المستفسرين ونسبة إغلاق الصفقات وهوامش الربح العالية للمنتج.",
      practicalAction: "ابحث عن السلع النادرة وذات القيمة العالية (High-ticket items) التي تستهدف شريحة ميسورة، حيث تبيع كميات قليلة بهامش ربح فخم يغطي الصرف ويزيد.",
      difficulty: "متوسط"
    },
    {
      id: "profits-4",
      category: "profits",
      categoryLabel: "الأرباح",
      text: "إذا ما تعرف شكد تربح من كل طلب بالضبط وتفصيلياً، فأنت فعلياً تدير مشروعك بالتخمين والبركة العشوائية.",
      lesson: "الافتقار للأرقام الصارمة يجعلك تظن أنك رابح لتوفر كاش بيدك، بينما أنت تسحب فعلياً من رأس مالك المخصص للمخزون والتسويق دون علمك.",
      practicalAction: "أنشئ جدول إكسل أو استخدم حاسبات فيزيون المدمجة لتسجيل: (سعر المنتج، تكلفة إعلانه، أجور شحنه، الخسارة المقدرة من المرتجع) لتستخرج هامش ربحك الصافي لكل قطعة.",
      difficulty: "بسيط"
    },
    {
      id: "profits-5",
      category: "profits",
      categoryLabel: "الأرباح",
      text: "الذهب الحقيقي والكاش الصافي يكمن في 'إعادة البيع' لزبائنك السابقين الذين وثقوا بصفحتك وجودة بضاعتك مجاناً.",
      lesson: "تكلفة الاستحواذ على زبون جديد غالية ومستمرة بالتصاعد بمدير الإعلانات. بينما كلفة بيع منتج ثانٍ لزبون قديم راضٍ هي صفر دينار عراقي.",
      practicalAction: "تواصل مع زبائنك القدامى على الواتساب كل 3 أشهر بلهجة شخصية ودية واعرض عليهم عروضاً حصرية لمنتجات جديدة تناسب اهتماماتهم السابقة.",
      difficulty: "متوسط"
    },
    {
      id: "profits-6",
      category: "profits",
      categoryLabel: "الأرباح",
      text: "تلف الغلاف الخارجي وعلب السلعة الراجعة من الزبائن يمثل خسارة مالية مخفية تلتهم أرباح البيج بمرور الوقت دون انتباه.",
      lesson: "المرتجعات التي تعود مبهذلة أو ممزقة بسبب إهمال شركات الشحن تفقد قيمتها التجارية وتصبح بضاعة تالفة غير صالحة للبيع لزبائن آخرين.",
      practicalAction: "استخدم كارتونات تغليف متينة ومطبوعاً عليها شعار صفحتك وثبت السلعة بالفقاعات الحامية لتضمن عودة الطرد الراجع سالماً وإعادة شحنه فوراً.",
      difficulty: "بسيط"
    },

    // 7. الأخطاء الشائعة (mistakes)
    {
      id: "mistakes-1",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "أغلب أصحاب المشاريع يغيرون التصميم أولاً… بينما المشكلة الحقيقية تكون بالاستهداف أو ضعف طريقة الرد بالخاص.",
      lesson: "التسرع في تغيير كروت الإعلان وتصاميم البوستات دون فحص أرقام الإعلان ومتابعة محادثات الكاشير بالخاص يجعلك تعالج العرض الخطأ وتفقد الصبر.",
      practicalAction: "حلل أرقامك أولاً: إذا كان الـ CTR فوق 2% والرسائل رخيصة والمبيعات صفر، فالخلل ليس بالإعلان ولا بالاستهداف، بل بطريقة رد موظف المبيعات بالخاص.",
      difficulty: "متوسط"
    },
    {
      id: "mistakes-2",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "شحن البضاعة للزبون دون مكالمة تأكيد هاتفية صارمة وتثبيت العنوان الثلاثي هو انتحار مالي حتمي ونهايته مرتجع تالف.",
      lesson: "الزبون قد يطلب السلعة بكبسة زر طائشة وهو سكران بالتصفح، وإذا لم يسمع صوتاً بشرياً يؤكد جديته وجاهزية كاشه، فسيتجاهل اتصال المندوب بالتأكيد.",
      practicalAction: "لا تشحن أي كرتونة لشركة التوصيل إلا بعد إجراء مكالمة هاتفية مدتها دقيقة كاملة مع الزبون لتأكيد رغبته وعنوانه وتواجد رقمين فعالين للتواصل.",
      difficulty: "بسيط"
    },
    {
      id: "mistakes-3",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "الاعتماد على شركة شحن وتوصيل رخيصة وغير موثوقة لمجرد توفير 1000 دينار عراقي في تسعيرة الطرد الواحد.",
      lesson: "شركات الشحن السيئة تمتلك مناديب مهملين يتصلون بالزبون مرة واحدة فقط ويسجلون الطرد راجعاً لتوفير مجهودهم، مما يرفع مرتجعاتك لـ 40%.",
      practicalAction: "تعاقد مع شركات توصيل محترفة ولها تطبيق تتبع ذكي وكشوفات مالية أسبوعية منتظمة، حتى لو كانت تسعيرتها أعلى بـ 1,000 دينار، فاستلام الطرود أهم بكثير.",
      difficulty: "متوسط"
    },
    {
      id: "mistakes-4",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "تجاهل الشكاوى والتقييمات السلبية للزبائن وحظرهم من الصفحة بدلاً من الاستماع لعيوب المنتج وتصليحها.",
      lesson: "التقييمات السلبية هي منجم ذهب مجاني لمعرفة عيوب الخامة أو مشاكل الاستخدام قبل أن تخسر سمعة بيجك بالكامل بالسوق العراقي وتفقد ثقة الناس.",
      practicalAction: "تواصل مع كل عميل يشتكي بلطف وصداقة، وافهم منه الخلل الحقيقي بالبضاعة، واستبدلها له مجاناً، واستخدم هذه التغذية لمراجعة جودة التوريد من المصدر.",
      difficulty: "بسيط"
    },
    {
      id: "mistakes-5",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "التمسك بمنتج واحد ترند لفترة طويلة جداً دون التخطيط لتقديم منتجات بديلة تغذي البيج عند موت الترند بالسوق.",
      lesson: "عمر المنتجات الترند والسلع الموسمية قصير وحاد جداً، والاعتماد المطلق عليها يجعل مبيعاتك تنهار للصفر فجأة بمجرد تشبع السوق ودخول مئات المنافسين بأسعار رخيصة.",
      practicalAction: "خصص دائماً 15% من أرباحك الصافية الشهرية لاختبار وتجربة عينات لمنتجات جديدة لتضمن وجود بدائل رابحة جاهزة للانطلاق فوراً عند هبوط المنتج الأول.",
      difficulty: "متوسط"
    },
    {
      id: "mistakes-6",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "كتابة رقم هاتف واحد فقط للزبون عند شحن الطرد. إذا كان هذا الرقم مغلقاً أو خارج التغطية، فالشحنة ستفشل حتماً وتعود كمرتجع.",
      lesson: "شبكات الاتصال بالعراق تعاني من ضعف التغطية والازدحام ببعض المناطق، ووجود رقم هاتف بديل هو المنقذ الوحيد ليتواصل المندوب مع العائلة وإتمام التسليم.",
      practicalAction: "اجعل تسجيل رقم الهاتف الثاني (رقم كفيل أو رقم الأخ/الزوج) شرطاً إلزامياً بالخاص لإتمام شحن الطرد وتسجيله بالمنظومة للوقاية من المرتجعات.",
      difficulty: "بسيط"
    },
    {
      id: "mistakes-7",
      category: "mistakes",
      categoryLabel: "الأخطاء الشائعة",
      text: "إطلاق حملات إعلانية ترويجية دون تفعيل الحدود اليومية أو القصوى للصرف (Ad Account Limits) ومراقبة الفواتير بانتظام.",
      lesson: "السهو عن مراقبة فواتير الحساب الإعلاني قد يؤدي لسحب مبالغ كبرى عشوائياً من بطاقتك الائتمانية لحملات منتهية أو متوقفة بالخطأ دون علمك.",
      practicalAction: "اضبط منبهات بريدك الإلكتروني والحدود الإعلانية الصارمة بمدير الإعلانات، وطابق مسحوبات بطاقة (زين كاش / فيزا كارد) مع تقارير صرف فيسبوك أسبوعياً.",
      difficulty: "متقدم"
    },

    // 8. المشاريع الجديدة (newbies)
    {
      id: "newbies-1",
      category: "newbies",
      categoryLabel: "المشاريع الجديدة",
      text: "لا تشتري مخزون ضخم بمليون دينار لمنتج جديد قبل ما تختبر الطلب عليه وتطلق حملة تجريبية بـ 15$ أو 20$.",
      lesson: "شراء البضاعة بكميات كبرى اعتماداً على حماسك الشخصي دون اختبار رغبة السوق العراقي الفعلية هو تذكرة مضمونة لتكديس بضاعة راكدة وخسارة كاش مشروعك.",
      practicalAction: "خذ صوراً حقيقية من المورد، صغ عرضاً ممتازاً واعرضه كحملة تجريبية بالخاص بـ 15 دولار فقط. إذا استقبلت عشرات الرسائل الجادة، اذهب واشترِ البضاعة فوراً وابدأ التوصيل.",
      difficulty: "بسيط"
    },
    {
      id: "newbies-2",
      category: "newbies",
      categoryLabel: "المشاريع الجديدة",
      text: "تظن أنك بحاجة لموقع إلكتروني معقد بـ 500$ لتبدأ. بالبراق، حملة رسائل بسيطة على انستغرام وفيسبوك مع الرد اليدوي الودود تجيب مبيعات أسرع.",
      lesson: "الزبون العراقي العادي يفضل التحدث بالدردشة والخاص والحصول على معاملة دافئة بدلاً من التنقل بموقع إلكتروني بارد وتعبئة استمارات مجهولة.",
      practicalAction: "ابدأ بصفحات مرتبة على انستغرام وفيسبوك، واستخدم حملات الرسائل المباشرة بمدير الإعلانات، وأغلق صفقاتك يدوياً لتبني ثقة حقيقية وقوية مع أول 100 زبون.",
      difficulty: "بسيط"
    },
    {
      id: "newbies-3",
      category: "newbies",
      categoryLabel: "المشاريع الجديدة",
      text: "لا تشتت روحك ببيع 20 منتج مختلف بصفحة وحدة بالبداية. ركز على منتج واحد أو منتجين يحلون مشكلة حقيقية واصنع لهم هوية واضحة جداً.",
      lesson: "تحويل البيج الجديد لـ 'سوق شورجة مصغر' يعرض ملابس وعطوراً وإلكترونيات يفقد الصفحة تخصصها ويشعر الزبون أنكم هواة وغير محترفين بالسلعة.",
      practicalAction: "اختر منتجاً بطلاً واحداً (Hero Product)، ركز عليه كل ميزانيتك ومجهود تصويرك الإعلاني، واصنع له اسماً وهوية تجارية متخصصة ومميزة تكتسح بها السوق.",
      difficulty: "بسيط"
    },
    {
      id: "newbies-4",
      category: "newbies",
      categoryLabel: "المشاريع الجديدة",
      text: "البداية تحتاج صبراً والتزاماً عالياً. أول أسبوع يمكن ما تحقق أرباح وتتعلم شلون ترد وتصيغ الإعلان، فلا تستسلم وتظن أن التجارة فاشلة بالعراق.",
      lesson: "عقبة التجارة الإلكترونية هي منحنى التعلم بالبداية (Learning Curve). الخسائر الطفيفة الأولى هي في الحقيقة رسوم تعليمية ضرورية لتصليح أسلوبك ومعرفة خفايا السوق.",
      practicalAction: "تعامل مع أول شهر كمرحلة دراسة وتدريب عملي. دوّن المشاكل اليومية بالردود، عدّل فيديوهات إعلانك بناء على آراء المستفسرين، وسترى المبيعات تنفجر حتماً بالأسبوع الثالث.",
      difficulty: "بسيط"
    },
    {
      id: "newbies-5",
      category: "newbies",
      categoryLabel: "المشاريع الجديدة",
      text: "لا تسحب أرباح مشروعك بالشهور الأولى لتصرفها على التزاماتك الشخصية. أعد استثمار كل دينار يرجعلك لتوسيع مشروعك.",
      lesson: "سحب سيولة البيج لشراء كماليات شخصية بالبداية يقزم نمو مشروعك ويحرمك من الكاش الضروري لتوسيع المخزون أو رفع ميزانية ترويج الإعلانات المنافسة.",
      practicalAction: "افصل تماماً بين حساباتك الشخصية وحساب البيج. خصص لنفسك راتباً بسيطاً جداً إن لزم، وأعد ضخ كامل الأرباح في شراء بضاعة إضافية وتفعيل حملات إعلانية كبرى لتتوسع بسرعة.",
      difficulty: "متوسط"
    },
    {
      id: "newbies-6",
      category: "newbies",
      categoryLabel: "المشاريع الجديدة",
      text: "مو كل منتج ينفع يتروج بنفس الطريقة. إعلان ينجح مع الملابس ممكن يفشل تماماً مع العطور أو المطاعم.",
      lesson: "الملابس تباع بالنظر والمظهر والألوان، أما العطور فتباع بالضمان والثبات والفوحان، بينما الإلكترونيات تباع بالكفالة ومقاطع الفيديو التوضيحية للتشغيل الفعلي.",
      practicalAction: "ادرس زوايا جاذبية منتجك الخاص قبل تصوير البوست. لا تنسخ تكتيكات إعلانات بيجات ثانية تعمل في تخصصات مختلفة تماماً عن تخصصك.",
      difficulty: "متوسط"
    }
  ];

  // Filter insights based on Search and Category
  const filteredInsights = insightsList.filter(insight => {
    const matchesSearch = 
      insight.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      insight.lesson.toLowerCase().includes(searchTerm.toLowerCase()) || 
      insight.practicalAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || insight.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * insightsList.length);
    setRandomInsight(insightsList[randomIndex]);
    setShowRandomModal(true);
  };

  const toggleExpand = (id: string) => {
    if (expandedInsightId === id) {
      setExpandedInsightId(null);
    } else {
      setExpandedInsightId(id);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      
      {/* SECTION HEADER BANNER - Sleek Dark Aesthetic with Gold Accents */}
      <div className="relative rounded-3xl p-6 md:p-10 border border-[#D4A017]/30 bg-gradient-to-br from-[#0F1735] via-[#040B24] to-[#0D1B56] overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#D4A017]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-3 right-3 text-[10px] text-white/20 font-mono tracking-wider">VIZION INSIGHTS ENGINE v2.0</div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 justify-between relative z-10">
          <div className="space-y-4 text-right max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/40 text-xs text-[#F0C040] font-black tracking-wide animate-pulse">
              <Flame className="w-4 h-4 text-[#F0C040] fill-[#D4A017]/50" />
              <span>حقائق يكتشفها أغلب التجار بعد ما يخسرون</span>
            </span>
            <h3 className="text-2xl md:text-4xl font-black text-white leading-tight">
              دروس وعبَر واقعية من قلب السوق العراقي اليومي
            </h3>
            <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed">
              هذه الدروس ليست نظريات كتب تسويقية مترجمة من الغرب، بل هي عصارة مشاهدات وتجارب عملية لملايين الدنانير التي تم صرفها وخسارتها في محافظات العراق لانتزاع أعلى نسب استلام وحماية هوامش الربح الصافية.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0 items-center">
            <span className="text-5xl md:text-6xl filter drop-shadow-[0_0_15px_#D4A017] mb-2">💡⚔️📈</span>
            <button
              onClick={handleRandomize}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A017] to-amber-500 hover:from-amber-500 hover:to-[#D4A017] text-[#040B24] font-black text-xs transition-all duration-300 shadow-lg hover:shadow-[#D4A017]/20 flex items-center gap-2 cursor-pointer scale-100 hover:scale-105 active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>أعطني حقيقة عشوائية 🎲</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#0F1735]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="ابحث عن حقيقة، خطأ شائع، أو كلمة تسويقية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/60 transition-all text-right"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-3 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Counter Display */}
          <span className="text-xs text-white/50 font-bold">
            عدد الحقائق المكتشفة:{" "}
            <span className="text-[#F0C040] font-mono font-black text-sm">
              {filteredInsights.length}
            </span>{" "}
            من أصل <span className="font-mono">{insightsList.length}</span>
          </span>
        </div>

        {/* Categories Pills Grid */}
        <div className="flex flex-wrap gap-2 pt-2 justify-start">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = cat.id === "all" 
              ? insightsList.length 
              : insightsList.filter(i => i.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4A017]/20 to-amber-500/10 border-[#D4A017] text-[#F0C040] shadow-md shadow-[#D4A017]/5"
                    : "bg-white/[0.01] border-white/5 text-white/60 hover:bg-white/[0.03] hover:text-white hover:border-white/10"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${isActive ? "bg-[#D4A017] text-[#040B24]" : "bg-white/5 text-white/40"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INSIGHTS GRID LAYOUT - 2 Column Layout with Stunning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInsights.map((insight, index) => {
          const isExpanded = expandedInsightId === insight.id;
          const voteCount = votes[insight.id] || 0;
          
          return (
            <div
              key={insight.id}
              onClick={() => toggleExpand(insight.id)}
              className={`group rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg ${
                isExpanded
                  ? "bg-gradient-to-b from-[#0F1735]/90 to-[#040B24] border-[#D4A017]/70 shadow-[#D4A017]/5 scale-[1.01]"
                  : "bg-gradient-to-b from-[#0F1735]/40 to-black/60 border-white/5 hover:border-white/20 hover:-translate-y-0.5"
              }`}
            >
              <div className="p-6 space-y-4">
                
                {/* Card Top Information */}
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                    insight.category === "ads" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                    insight.category === "sales" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                    insight.category === "pricing" ? "bg-purple-500/10 text-purple-300 border-purple-500/20" :
                    insight.category === "content" ? "bg-pink-500/10 text-pink-300 border-pink-500/20" :
                    insight.category === "customers" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" :
                    insight.category === "profits" ? "bg-blue-500/10 text-blue-300 border-blue-500/20" :
                    insight.category === "mistakes" ? "bg-red-500/10 text-red-300 border-red-500/20" :
                    "bg-teal-500/10 text-teal-300 border-teal-500/20"
                  }`}>
                    {insight.categoryLabel}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/30 font-mono">درجة الصعوبة:</span>
                    <span className={`text-[10px] font-black ${
                      insight.difficulty === "بسيط" ? "text-emerald-400" :
                      insight.difficulty === "متوسط" ? "text-[#F0C040]" :
                      "text-red-400"
                    }`}>
                      {insight.difficulty}
                    </span>
                  </div>
                </div>

                {/* Insight Quote Text */}
                <div className="text-right">
                  <p className="text-sm md:text-base font-extrabold text-white leading-relaxed group-hover:text-[#F0C040] transition-colors">
                    "{insight.text}"
                  </p>
                </div>

                {/* EXPANDABLE CORNER (DIAGNOSTIC DETAILED LESSON) */}
                {isExpanded && (
                  <div className="pt-4 border-t border-white/10 space-y-3.5 text-right animate-[fadeIn_0.3s_ease]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-white/40 block">🤔 تحليل العطل والسبب المكتوم:</span>
                      <p className="text-xs text-white/80 leading-relaxed font-light">
                        {insight.lesson}
                      </p>
                    </div>

                    <div className="space-y-1 bg-[#D4A017]/5 border border-[#D4A017]/20 p-3 rounded-xl">
                      <span className="text-[10px] font-black text-[#F0C040] block">🛠️ الحل والخطوة العملية فوراً:</span>
                      <p className="text-xs text-white/90 leading-relaxed font-bold">
                        {insight.practicalAction}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Card Footer controls */}
              <div className="px-6 py-3.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                
                {/* Interactive VOTE button - 'والله هاي صارت وياي' */}
                <button
                  onClick={(e) => handleVote(insight.id, e)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#D4A017]/15 hover:text-[#F0C040] border border-white/5 hover:border-[#D4A017]/30 transition-all duration-200 flex items-center gap-1.5 font-bold cursor-pointer active:scale-95"
                  title="نعم، لقد واجهت هذا الموقف في مشروعي سابقاً"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>والله هاي صارت وياي! 🙋‍♂️</span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold bg-white/5 px-1.5 py-0.5 rounded-full">
                    {voteCount}
                  </span>
                </button>

                <span className="text-[10px] font-bold text-[#F0C040]/70 group-hover:text-[#F0C040] transition-colors flex items-center gap-1">
                  <span>{isExpanded ? "اضغط لإغلاق التفاصيل" : "اضغط لكشف الحل العملي"}</span>
                  <span>{isExpanded ? "▲" : "▼"}</span>
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty Search Result feedback */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
          <span className="text-4xl block">🔍🏜️</span>
          <h4 className="text-sm font-bold text-white">لم نجد أي حقيقة تطابق بحثك</h4>
          <p className="text-xs text-white/40 max-w-xs mx-auto">
            جرب كتابة كلمات مختلفة مثل 'إعلان'، 'سعر'، 'مرتجع'، أو اختر تبويب تصنيف آخر أعلاه.
          </p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
            className="text-xs text-[#F0C040] font-black underline hover:text-white transition-colors cursor-pointer mt-2"
          >
            إعادة تعيين البحث والتصنيف
          </button>
        </div>
      )}

      {/* RANDOM INSIGHT FEATURE MODAL */}
      {showRandomModal && randomInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#0F1735] to-[#040B24] border border-[#D4A017]/50 rounded-3xl p-6 md:p-8 shadow-2xl text-right space-y-6">
            
            {/* Modal top decor */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <button
                onClick={() => setShowRandomModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-[#F0C040]">
                <Sparkles className="w-5 h-5 animate-spin [animation-duration:10s]" />
                <span className="text-sm font-black tracking-wide">حقيقة عشوائية مميزة من واقع السوق</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <span className="inline-block px-2.5 py-1 text-[10px] font-black bg-[#D4A017]/10 text-[#F0C040] border border-[#D4A017]/30 rounded-lg">
                📁 {randomInsight.categoryLabel}
              </span>

              <p className="text-base md:text-xl font-black text-white leading-relaxed">
                "{randomInsight.text}"
              </p>

              <div className="w-full h-[1px] bg-white/10 my-4" />

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-white/40 block">🤔 المشكلة والخلل الخفي:</span>
                  <p className="text-xs text-white/80 leading-relaxed font-light">
                    {randomInsight.lesson}
                  </p>
                </div>

                <div className="space-y-1 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-black text-emerald-400 block">🛠️ الحل التكتيكي الفوري:</span>
                  <p className="text-xs text-white/95 leading-relaxed font-bold">
                    {randomInsight.practicalAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal action footer */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={(e) => handleVote(randomInsight.id, e)}
                className="px-4 py-2 rounded-xl bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#F0C040] border border-[#D4A017]/30 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>والله هاي صارت وياي!</span>
                <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded-full text-[10px]">
                  {votes[randomInsight.id] || 0}
                </span>
              </button>

              <button
                onClick={handleRandomize}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5 text-white/60" />
                <span>عشوائي آخر</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
