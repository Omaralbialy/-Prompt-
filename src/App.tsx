/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PenTool, 
  Zap, 
  Target, 
  RefreshCw, 
  Copy, 
  Check, 
  Loader2, 
  ArrowRight,
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { generateContent } from './lib/gemini';

type Stage = 'strategic' | 'writer' | 'optimizer' | 'conversion' | 'update';

interface PromptTemplate {
  id: Stage;
  title: string;
  icon: React.ReactNode;
  description: string;
  inputLabel: string;
  placeholder: string;
  prompt: (input: string) => string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'strategic',
    title: 'الـ Prompt الاستراتيجي',
    icon: <Search className="w-5 h-5" />,
    description: 'مرحلة التخطيط العميق قبل الكتابة لبناء هيكل السلطة (Authority Guide).',
    inputLabel: 'الموضوع (Topic)',
    placeholder: 'مثال: الربح من العمل الحر في 2026...',
    prompt: (topic) => `أنت الآن مستشار SEO واستراتيجي محتوى. أريد بناء 'دليل سلطة' (Authority Guide) حول [${topic}]. 
1. حلل الفجوات في أفضل 5 مقالات متصدرة حالياً (ما الذي ينقصهم؟).
2. صمم هيكل مقال (Outline) يغطي الموضوع من زوايا لم يغطها المنافسون (استخدم تقنية Topic Clusters).
3. اقترح 5 زوايا 'فريدة' (Unique Value Propositions) للمقال تجعل القارئ يقرر أن هذا هو المرجع النهائي.
4. استخرج الأسئلة الأكثر تعقيداً التي يطرحها الجمهور في منتديات Reddit وQuora حول هذا الموضوع لدمجها في المقال.`
  },
  {
    id: 'writer',
    title: 'الـ Prompt الكاتب السيكولوجي',
    icon: <PenTool className="w-5 h-5" />,
    description: 'مرحلة التفاعل والـ Hook لكتابة محتوى يحبس أنفاس القارئ (Viral Style).',
    inputLabel: 'الهيكل أو السياق (Outline/Context)',
    placeholder: 'الصق الهيكل المقترح هنا...',
    prompt: (context) => `اكتب المقال بناءً على الهيكل التالي بأسلوب (Copywriting) احترافي:
[${context}]

المتطلبات:
- المقدمة: ابدأ بأسلوب 'Open Loop' (إثارة فضول لا تُحل إلا بإكمال القراءة).
- جسم المقال: استخدم أسلوب 'الفقرات القتالية' (جمل قصيرة، جمل متوسطة، وجملة واحدة سريعة). 
- التنسيق: استخدم (Bullet points) و(Tables) للمقارنات و(Info-boxes) للملاحظات المهمة.
- النبرة: نبرة صوت 'خبير موثوق ولكن بأسلوب سهل'.
- الهدف: لا تكتب محتوى عاماً، بل قدم (Actionable Advice) - نصائح قابلة للتنفيذ فوراً. اجعل القارئ يشعر أن لديه 'سر' لا يعرفه الآخرون.`
  },
  {
    id: 'optimizer',
    title: 'الـ Prompt مُحسن الخوارزميات',
    icon: <Zap className="w-5 h-5" />,
    description: 'مرحلة الـ SEO الدقيق لضمان التوافق مع تحديثات جوجل (Helpful Content Update).',
    inputLabel: 'نص المقال (Article Content)',
    placeholder: 'الصق المقال الذي تريد تحسينه هنا...',
    prompt: (content) => `الآن، قم بمراجعة المقال التالي وأجرِ عليه 'عملية جراحية للـ SEO':
[${content}]

المهام المطلوبة:
1. أضف كلمات مفتاحية دلالية (LSI Keywords) بشكل طبيعي.
2. أضف فقرة (FAQ) في نهاية المقال تستهدف البحث الصوتي (Voice Search) وتكون بصيغة سؤال وجواب.
3. أعد صياغة العناوين الفرعية (H2, H3) لتكون أكثر إثارة وتحفيزاً للنقر.
4. اقترح 3 روابط داخلية (Internal Links) لمواضيع ذات صلة.
5. اكتب Meta Description (أقل من 155 حرف) يتضمن حافزاً (Call to Action) وقوة إقناع عالية.`
  },
  {
    id: 'conversion',
    title: 'الـ Prompt التحويل',
    icon: <Target className="w-5 h-5" />,
    description: 'لتحويل الزائر إلى عميل باستخدام إطار عمل (PAS) دون أن يبدو المقال كإعلان.',
    inputLabel: 'الجزء الخاص بالحلول أو المنتج',
    placeholder: 'اكتب تفاصيل الحل أو المنتج هنا...',
    prompt: (input) => `أعد كتابة الأجزاء الخاصة بالحلول التالية باستخدام إطار عمل (PAS):
[${input}]

المتطلبات:
- P (Problem): تضخيم الألم الذي يشعر به القارئ.
- A (Agitation): توضيح ما سيحدث إذا استمرت المشكلة (إثارة المخاوف).
- S (Solution): تقديم خدمتنا/منتجنا كجسر آمن للنجاة.
اجعل الانتقال للمنتج يبدو طبيعياً جداً (Contextual) وليس دفعاً بيعياً فجاً.`
  },
  {
    id: 'update',
    title: 'الـ Prompt التحديث الجذري',
    icon: <RefreshCw className="w-5 h-5" />,
    description: 'إعادة إحياء المحتوى الميت ودمج آخر التطورات لعام 2025/2026.',
    inputLabel: 'المقال القديم (Old Article)',
    placeholder: 'الصق المقال القديم هنا...',
    prompt: (content) => `أنت خبير في 'إنعاش المقالات'. هذا المقال قديم:
[${content}]

المهام المطلوبة:
1. أضف له 'حداثة' (Freshness) من خلال دمج آخر التطورات لعام 2025/2026.
2. احذف الحشو وأضف فقرات تحليلية عميقة.
3. أعد كتابة الفقرات المملة بأسلوب قصصي (Storytelling).
4. اجعل المقال يمر عبر 'اختبار القراءة' بحيث يكون مفهوماً لطالب في المرحلة المتوسطة مع الحفاظ على عمق المعلومات.`
  }
];

export default function App() {
  const [activeStage, setActiveStage] = useState<Stage>('strategic');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentTemplate = PROMPT_TEMPLATES.find(t => t.id === activeStage)!;

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateContent(currentTemplate.prompt(input));
      setOutput(result);
    } catch (error) {
      console.error(error);
      setOutput("حدث خطأ أثناء توليد المحتوى. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-[#1a1a1a] overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        className="bg-white border-r border-[#e5e7eb] flex flex-col relative z-20"
      >
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight">SGE Master</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-2 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            مراحل صناعة المحتوى
          </div>
          {PROMPT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setActiveStage(template.id);
                setInput('');
                setOutput('');
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                activeStage === template.id 
                  ? 'bg-black text-white shadow-lg shadow-black/10' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <div className={`${activeStage === template.id ? 'text-white' : 'text-gray-400 group-hover:text-black'}`}>
                {template.icon}
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className="font-semibold text-sm whitespace-nowrap">{template.title}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#e5e7eb] space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">المساعدة</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">الإعدادات</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-bold text-lg">{currentTemplate.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              متصل بالذكاء الاصطناعي
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Description Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-xl text-black">
                  {currentTemplate.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{currentTemplate.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {currentTemplate.description}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {currentTemplate.inputLabel}
                  </label>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentTemplate.placeholder}
                  className="w-full h-[400px] p-6 bg-white border border-[#e5e7eb] rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none font-sans text-sm leading-relaxed shadow-sm"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>توليد المحتوى الذكي</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>

              {/* Output Section */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    النتيجة (Output)
                  </label>
                  {output && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'تم النسخ' : 'نسخ النتيجة'}
                    </button>
                  )}
                </div>
                <div className="w-full h-[460px] bg-white border border-[#e5e7eb] rounded-2xl overflow-y-auto p-8 shadow-sm relative group">
                  {!output && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
                      <FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium">سيظهر المحتوى المولد هنا بعد الضغط على زر التوليد</p>
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
                      <p className="text-sm font-bold animate-pulse">جاري صياغة المحتوى باحترافية...</p>
                    </div>
                  )}
                  <div className="markdown-body rtl">
                    <Markdown>{output}</Markdown>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Styles for RTL support in Markdown */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rtl {
          direction: rtl;
          text-align: right;
        }
        .markdown-body.rtl ul, .markdown-body.rtl ol {
          padding-left: 0;
          padding-right: 1.5rem;
        }
        .markdown-body.rtl blockquote {
          border-left: none;
          border-right: 4px solid #e5e7eb;
          padding-left: 0;
          padding-right: 1rem;
        }
      `}} />
    </div>
  );
}
