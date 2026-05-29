/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ChevronRight, Info } from 'lucide-react';

interface Scene {
  id: number;
  name: string;
  description: string;
  image: string;
  coordinates: { x: number; y: number };
  time: string;
}

const SCENES: Scene[] = [
  { id: 1, name: '彩调', description: '龙脊彩调剧是当地重要的传统戏曲形式，常在节日或庆典时演出。', image: 'https://picsum.photos/seed/opera/800/600', coordinates: { x: 28, y: 19 }, time: '20:00' },
  { id: 2, name: '建房', description: '传统的吊脚楼建筑技艺，体现了人与自然的和谐共生。', image: 'https://picsum.photos/seed/building/800/600', coordinates: { x: 21, y: 28 }, time: '14:00' },
  { id: 3, name: '火锅', description: '围炉而坐，品尝地道的山间美味，是村落社交的核心场景。', image: 'https://picsum.photos/seed/hotpot/800/600', coordinates: { x: 47, y: 37 }, time: '18:00' },
  { id: 4, name: '晒谷', description: '因为龙脊十三寨常云雾缭绕，日照不足，天气潮湿，稻谷须经充分干燥后方能入仓。村寨内很少平地，室外晒场很有限，于是龙脊人充分发挥干栏住宅搭建灵活的优势，在日照最好的方向紧贴建筑外墙用木头搭个与建筑二层地面等高的架子，平铺一层竹蔑，就搭好了一个晒排，专门用来晾晒禾把和辣椒、干菜等。——孙娜 罗德胤《龙脊十三寨》', image: '/pictures/scene4.png', coordinates: { x: 40, y: 46 }, time: '12:00' },
  { id: 5, name: '耦耕', description: '梯田稻作系统是世界农业文化遗产，体现了高超的农耕智慧。', image: '/pictures/scene5.png', coordinates: { x: 37, y: 86 }, time: '11:00' },
  { id: 6, name: '赶圩', description: '定期的市集贸易，是村落与外界物资交换和情感连接的纽带。', image: 'https://picsum.photos/seed/market/800/600', coordinates: { x: 76, y: 88 }, time: '06:00' },
  { id: 7, name: '会期', description: '会期是龙脊村落重要且盛大的民俗节日集会，全村乃至邻村的乡邻亲友共同庆祝，充满浓厚的民俗风情。', image: 'https://picsum.photos/seed/festival/800/600', coordinates: { x: 66, y: 72 }, time: '09:00' },
];

const timeToPercent = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = 6 * 60; // 06:00
  const endMinutes = 22 * 60; // 22:00
  return Math.min(Math.max(((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100, 0), 100);
};

const formatChineseTime = (timeStr: string) => {
  const [hourStr] = timeStr.split(':');
  const hour = parseInt(hourStr);
  
  if (hour === 6) return '早6';
  if (hour === 9) return '早9';
  if (hour === 11) return '早11';
  if (hour === 12) return '午12';
  if (hour === 14) return '午2';
  if (hour === 18) return '晚6';
  if (hour === 20) return '晚8';
  if (hour === 22) return '晚10';
  
  const hour12 = hour > 12 ? hour - 12 : hour;
  const prefix = hour < 12 ? '早' : (hour < 18 ? '午' : '晚');
  return `${prefix}${hour12}`;
};

export default function App() {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [isSticker1Placed, setIsSticker1Placed] = useState(false);
  const [isSticker2Placed, setIsSticker2Placed] = useState(false);
  const [isS2Sticker1_1Placed, setIsS2Sticker1_1Placed] = useState(false);
  const [isS2Sticker1_2Placed, setIsS2Sticker1_2Placed] = useState(false);
  const [isS2Sticker1_3Placed, setIsS2Sticker1_3Placed] = useState(false);
  const [isS2Sticker1_4Placed, setIsS2Sticker1_4Placed] = useState(false);
  const [isS2Layer1_1Placed, setIsS2Layer1_1Placed] = useState(false);
  const [isS2Sticker2Placed, setIsS2Sticker2Placed] = useState(false);
  const [isS2Layer2_1Placed, setIsS2Layer2_1Placed] = useState(false);
  const [isS2Sticker3Placed, setIsS2Sticker3Placed] = useState(false);
  const [isS2Sticker4Placed, setIsS2Sticker4Placed] = useState(false);
  const [isS2Step6Active, setIsS2Step6Active] = useState(false);
  const [isS3Sticker1Placed, setIsS3Sticker1Placed] = useState(false);
  const [isS3Sticker2Placed, setIsS3Sticker2Placed] = useState(false);
  const [isS3Sticker3Placed, setIsS3Sticker3Placed] = useState(false);
  const [isS5Sticker1Placed, setIsS5Sticker1Placed] = useState(false);
  const [isS5Sticker2Placed, setIsS5Sticker2Placed] = useState(false);
  const [isS5Sticker3Placed, setIsS5Sticker3Placed] = useState(false);
  const [isS6StickerPlaced, setIsS6StickerPlaced] = useState(false);
  const [isS7Sticker1Placed, setIsS7Sticker1Placed] = useState(false);
  const [isS7Sticker2Placed, setIsS7Sticker2Placed] = useState(false);
  const dropTargetRef = useRef<HTMLDivElement>(null);
  const wasFromMapRef = useRef(true);

  const handleSelectScene = (scene: Scene | null) => {
    wasFromMapRef.current = (selectedScene === null);
    setSelectedScene(scene);
  };

  // Reset puzzle when switching scenes
  useEffect(() => {
    setIsPuzzleSolved(false);
    setIsSticker1Placed(false);
    setIsSticker2Placed(false);
    setIsS2Sticker1_1Placed(false);
    setIsS2Sticker1_2Placed(false);
    setIsS2Sticker1_3Placed(false);
    setIsS2Sticker1_4Placed(false);
    setIsS2Layer1_1Placed(false);
    setIsS2Sticker2Placed(false);
    setIsS2Layer2_1Placed(false);
    setIsS2Sticker3Placed(false);
    setIsS2Sticker4Placed(false);
    setIsS2Step6Active(false);
    setIsS3Sticker1Placed(false);
    setIsS3Sticker2Placed(false);
    setIsS3Sticker3Placed(false);
    setIsS5Sticker1Placed(false);
    setIsS5Sticker2Placed(false);
    setIsS5Sticker3Placed(false);
    setIsS6StickerPlaced(false);
    setIsS7Sticker1Placed(false);
    setIsS7Sticker2Placed(false);
    if (selectedScene === null) {
      dropTargetRef.current = null;
    }
  }, [selectedScene]);

  // Handle automatic transition for Scene 2 Step 6
  useEffect(() => {
    if (isS2Sticker4Placed) {
      const timer = setTimeout(() => {
        setIsS2Step6Active(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isS2Sticker4Placed]);

  const handleDragEnd = (_: any, info: any, type?: string) => {
    if (!dropTargetRef.current) return;
    
    const targetRect = dropTargetRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    // Detection area: for Scene 1 and 2, we use the whole right container
    const isInside = 
      dropX >= targetRect.left &&
      dropX <= targetRect.right &&
      dropY >= targetRect.top &&
      dropY <= targetRect.bottom;

    if (isInside) {
      if (selectedScene?.id === 4) {
        // More specific area for Scene 4
        const isInsideSpecific = 
          dropX >= targetRect.left + (targetRect.width * 0.2) &&
          dropX <= targetRect.right - (targetRect.width * 0.5) &&
          dropY >= targetRect.top + (targetRect.height * 0.3) &&
          dropY <= targetRect.bottom - (targetRect.height * 0.3);
        if (isInsideSpecific) setIsPuzzleSolved(true);
      } else if (selectedScene?.id === 1) {
        if (type === 'sticker1') {
          setIsSticker1Placed(true);
        } else if (type === 'sticker2' && isSticker1Placed) {
          setIsSticker2Placed(true);
        }
      } else if (selectedScene?.id === 2) {
        if (type === 's2_sticker1_1') {
          setIsS2Sticker1_1Placed(true);
        } else if (type === 's2_sticker1_2' && isS2Sticker1_1Placed) {
          setIsS2Sticker1_2Placed(true);
        } else if (type === 's2_sticker1_3' && isS2Sticker1_2Placed) {
          setIsS2Sticker1_3Placed(true);
        } else if (type === 's2_sticker1_4' && isS2Sticker1_3Placed) {
          setIsS2Sticker1_4Placed(true);
        } else if (type === 's2_layer1_1' && isS2Sticker1_4Placed) {
          setIsS2Layer1_1Placed(true);
        } else if (type === 's2_sticker2' && isS2Layer1_1Placed) {
          setIsS2Sticker2Placed(true);
        } else if (type === 's2_layer2_1' && isS2Sticker2Placed) {
          setIsS2Layer2_1Placed(true);
        } else if (type === 's2_sticker3' && isS2Layer2_1Placed) {
          setIsS2Sticker3Placed(true);
        } else if (type === 's2_sticker4' && isS2Sticker3Placed) {
          setIsS2Sticker4Placed(true);
        }
      } else if (selectedScene?.id === 3) {
        if (type === 's3_sticker1') {
          setIsS3Sticker1Placed(true);
        } else if (type === 's3_sticker2' && isS3Sticker1Placed) {
          setIsS3Sticker2Placed(true);
        } else if (type === 's3_sticker3' && isS3Sticker2Placed) {
          setIsS3Sticker3Placed(true);
        }
      } else if (selectedScene?.id === 5) {
        if (type === 's5_sticker1') {
          setIsS5Sticker1Placed(true);
        } else if (type === 's5_sticker2' && isS5Sticker1Placed) {
          setIsS5Sticker2Placed(true);
        } else if (type === 's5_sticker3' && isS5Sticker2Placed) {
          setIsS5Sticker3Placed(true);
        }
      } else if (selectedScene?.id === 6) {
        if (type === 's6_sticker') {
          setIsS6StickerPlaced(true);
        }
      } else if (selectedScene?.id === 7) {
        if (type === 's7_sticker1') {
          setIsS7Sticker1Placed(true);
        } else if (type === 's7_sticker2' && isS7Sticker1Placed) {
          setIsS7Sticker2Placed(true);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-[#000000]">
      <main 
        className="relative w-full max-w-[932px] h-[430px] border border-ink/20 shadow-2xl flex overflow-hidden !bg-cover !bg-center"
        style={{ backgroundImage: "url('/pictures/background.png')" }}
      >
        {/* Left Sidebar: Life Scenes (Single Column) */}
        <section className="w-[120px] p-4 flex flex-col justify-between gap-3 shrink-0 z-10">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(scene)}
              className={`scene-button flex-1 min-h-0 ${selectedScene?.id === scene.id ? 'active' : ''}`}
            >
              <img 
                src={selectedScene?.id === scene.id ? `/name/${scene.id}bl.png` : `/name/${scene.id}br.png`} 
                alt={scene.name} 
                className="h-[40%] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </section>

        {/* Middle Section: Info Display */}
        <section className="flex-1 py-4 flex flex-col relative z-20">
          {/* Content Area */}
          <div className="flex flex-col h-full">
            {selectedScene ? (
              <div className="flex flex-col h-full min-h-0 mt-2 px-4 text-ink">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <img 
                    src={`/name/${selectedScene.id}bl.png`} 
                    alt={selectedScene.name} 
                    className="h-[28px] w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => handleSelectScene(null)}
                    className="text-[14px] flex items-center gap-1 text-ink/40 hover:text-accent transition-colors font-serif"
                  >
                    返回全景大图 <ChevronRight size={10} />
                  </button>
                </div>
                
                {/* Content Split */}
                <div className="flex-1 flex gap-4 mb-2 min-h-0">
                  {selectedScene.id === 1 ? (
                    <>
                      {/* Scene 1 Layout */}
                      <div className="w-1/2 flex flex-col gap-[10px] h-[calc(100%-51px)] mt-[15px] mb-[36px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Plan Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene1_plan.png" 
                            alt="平面图" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Section Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene1_section.png" 
                            alt="剖面图" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          在住宅中表演彩调剧时，在堂屋中用八仙桌拼成舞台，左右两侧的房间作为后台，村民围坐在周围和三层跑马廊上观看。
                        </p>

                        {/* Paragraph 2 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          彩调剧是龙脊的主要戏种，很受当地人欢迎，几乎每寨都有自己的彩调班。彩调源于民间采茶歌舞，清中叶受湖南花鼓戏、江西采茶戏的影响，逐渐衍变为广西各族人民喜闻乐见的地方戏曲，扎根于桂北。
                        </p>

                        {/* Paragraph 3 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          彩调剧大多是些情节简单的喜剧小剧目。唱词采用桂林话，演员都是本寨的农民。龙脊并无专门的戏台，一般都在干栏住宅里临时搭台演出。
                        </p>

                        {/* Picture 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene1_pic1.png" 
                            alt="实景图" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col items-center gap-2 mt-[15px]">
                        <div className="text-[14px] text-[#b8a67f] font-serif mb-1">按照顺序拖动到右边</div>
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="h-[70px] flex items-center justify-center relative overflow-visible w-full">
                            {!isSticker1Placed ? (
                              <motion.div drag dragSnapToOrigin onDragEnd={(_, info) => handleDragEnd(_, info, 'sticker1')} className="cursor-grab active:cursor-grabbing z-[1000]">
                                <img src="/pictures/scene1_layer1.png" alt="Sticker 1" className="w-[120px] h-auto object-contain pointer-events-none drop-shadow-lg" referrerPolicy="no-referrer" />
                              </motion.div>
                            ) : <div className="text-[10px] text-ink/20 font-serif italic">已放置</div>}
                          </div>
                          <span className="text-[14px] text-ink/60 font-zh" style={{ fontFamily: 'Times New Roman' }}>彩调剧舞台</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 w-full mt-2">
                          <div className="h-[70px] flex items-center justify-center relative overflow-visible w-full">
                            {!isSticker2Placed ? (
                              <motion.div drag dragSnapToOrigin onDragEnd={(_, info) => handleDragEnd(_, info, 'sticker2')} className={`cursor-grab active:cursor-grabbing z-[1000] ${!isSticker1Placed ? 'opacity-30 grayscale cursor-not-allowed' : ''}`} dragConstraints={!isSticker1Placed ? { top: 0, left: 0, right: 0, bottom: 0 } : false}>
                                <img src="/pictures/scene1_layer2.png" alt="Sticker 2" className="w-[120px] h-auto object-contain pointer-events-none drop-shadow-lg" referrerPolicy="no-referrer" />
                              </motion.div>
                            ) : <div className="text-[10px] text-ink/20 font-serif italic">已放置</div>}
                          </div>
                          <span className="text-[14px] text-ink/60 font-zh" style={{ fontFamily: 'Times New Roman' }}>三层楼板和观看的人们</span>
                        </div>
                      </div>
                    </>
                  ) : selectedScene.id === 2 ? (
                    <>
                      {/* Scene 2 Layout */}
                      <div className="w-[55%] flex flex-col gap-[10px] h-[calc(100%-26px)] mb-[26px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Pic 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene2_pic1.png" 
                            alt="建房实景1" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          龙脊十三寨沿袭了传统的干栏住宅的建造方式和建造习俗。十三寨内没有专职木匠，而是由各寨会做木匠活儿的农民在农闲时兼职的，而伐木、上梁等需要大量人力的工序也是由村民“打背工”完成的，住宅建造的时间多在农历八月秋分以后。
                        </p>

                        {/* Paragraph 2 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          一家需要帮忙时，只要在村中振臂一呼，有时间有能力的村民都会来帮忙。帮工不计报酬，主家只需酌情招待大家吃一至两顿酒饭。今天你帮我做了工，明天你家有事，我也会去帮忙。因为有充足的人力支援，通常活动的完成质量也比较好，比如龙脊壮寨的干栏住宅质量比周边地区住宅质量好得多。打背工虽然是一种劳力互换，但却充满了人情味儿。
                        </p>

                        {/* Pic 2 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene2_pic2.png" 
                            alt="建房实景2" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Pic 3 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene2_pic3.png" 
                            alt="建房实景3" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-[45%] flex flex-col items-center gap-0.5 h-full justify-start select-none">
                        <div className="text-[14px] text-[#b8a67f] font-serif mb-0.5 tracking-wide whitespace-nowrap">按顺序拖动建造房屋</div>
                        
                        {/* Row 1: Column Frames */}
                        <div className="flex flex-col items-center gap-0.5 w-full shrink-0">
                          <div className="flex justify-center -space-x-6 w-full relative">
                            {[
                              { id: 's2_sticker1_1', active: true, placed: isS2Sticker1_1Placed },
                              { id: 's2_sticker1_2', active: isS2Sticker1_1Placed, placed: isS2Sticker1_2Placed },
                              { id: 's2_sticker1_3', active: isS2Sticker1_2Placed, placed: isS2Sticker1_3Placed },
                              { id: 's2_sticker1_4', active: isS2Sticker1_3Placed, placed: isS2Sticker1_4Placed },
                            ].map((s, idx) => (
                              <div key={s.id} className="h-[44px] w-[44px] flex items-center justify-center relative overflow-visible" style={{ zIndex: 40 - idx * 10 }}>
                                {!s.placed ? (
                                  <motion.div drag dragSnapToOrigin onDragEnd={(_, info) => handleDragEnd(_, info, s.id)} className={`cursor-grab active:cursor-grabbing ${!s.active ? 'opacity-30 grayscale cursor-not-allowed' : ''} mt-[15px]`} dragConstraints={!s.active ? { top: 0, left: 0, right: 0, bottom: 0 } : false} whileHover={s.active ? { scale: 1.1 } : {}} whileDrag={{ zIndex: 1000 }}>
                                    <img src="/pictures/scene2_layer1.png" alt="柱架" className="w-[43px] h-auto object-contain pointer-events-none drop-shadow-md" referrerPolicy="no-referrer" />
                                  </motion.div>
                                ) : <div className="text-[10px] text-ink/20 font-serif mt-[15px]">已放</div>}
                              </div>
                            ))}
                          </div>
                          <span className="text-[14px] text-ink/60 font-zh leading-none mt-[15px] block" style={{ fontFamily: 'Times New Roman' }}>柱架</span>
                        </div>

                        {/* Row 2: Villagers Carrying Backs */}
                        <div className="flex flex-col items-center gap-0 w-full shrink-0 -mt-2">
                          <div className="h-[52px] flex items-center justify-center relative overflow-visible w-full">
                            {!isS2Layer1_1Placed ? (
                              <motion.div 
                                drag 
                                dragSnapToOrigin 
                                onDragEnd={(_, info) => handleDragEnd(_, info, 's2_layer1_1')} 
                                className={`cursor-grab active:cursor-grabbing z-[1000] ${!isS2Sticker1_4Placed ? 'opacity-30 grayscale cursor-not-allowed' : ''}`} 
                                dragConstraints={!isS2Sticker1_4Placed ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                whileHover={isS2Sticker1_4Placed ? { scale: 1.1 } : {}}
                              >
                                <img src="/pictures/scene2_layer1-1.png" alt="村民打背工" className="w-[72px] h-auto object-contain pointer-events-none drop-shadow-md" referrerPolicy="no-referrer" />
                              </motion.div>
                            ) : <div className="text-[10px] text-ink/20 font-serif italic">已放置</div>}
                          </div>
                          <span className="text-[14px] text-ink/60 font-zh leading-none -mt-[10px] block" style={{ fontFamily: 'Times New Roman' }}>村民打背工</span>
                        </div>

                        {/* Row 3: Purlins & Beam Ceremony side by side */}
                        <div className="flex justify-around items-center w-full gap-1 shrink-0 px-2 -mt-1.5">
                          {/* Sticker 3: Purlins */}
                          <div className="flex flex-col items-center gap-0.5 flex-1 w-1/2">
                            <div className="h-[48px] flex items-center justify-center relative overflow-visible w-full">
                              {!isS2Sticker2Placed ? (
                                <motion.div 
                                  drag 
                                  dragSnapToOrigin 
                                  onDragEnd={(_, info) => handleDragEnd(_, info, 's2_sticker2')} 
                                  className={`cursor-grab active:cursor-grabbing z-[1000] ${!isS2Layer1_1Placed ? 'opacity-30 grayscale cursor-not-allowed' : ''} mt-[10px]`} 
                                  dragConstraints={!isS2Layer1_1Placed ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                  whileHover={isS2Layer1_1Placed ? { scale: 1.1 } : {}}
                                >
                                  <img src="/pictures/scene2_layer2.png" alt="檩条" className="w-[68px] h-auto object-contain pointer-events-none drop-shadow-md" referrerPolicy="no-referrer" />
                                </motion.div>
                              ) : <div className="text-[10px] text-ink/20 font-serif italic mt-[10px]">已放置</div>}
                            </div>
                            <span className="text-[14px] text-ink/60 font-zh leading-none text-center -mt-0.5" style={{ fontFamily: 'Times New Roman' }}>檩条</span>
                          </div>

                          {/* Sticker 4: Beam Ceremony */}
                          <div className="flex flex-col items-center gap-0.5 flex-1 w-1/2">
                            <div className="h-[48px] flex items-center justify-center relative overflow-visible w-full">
                              {!isS2Layer2_1Placed ? (
                                <motion.div 
                                  drag 
                                  dragSnapToOrigin 
                                  onDragEnd={(_, info) => handleDragEnd(_, info, 's2_layer2_1')} 
                                  className={`cursor-grab active:cursor-grabbing z-[1000] ${!isS2Sticker2Placed ? 'opacity-30 grayscale cursor-not-allowed' : ''} mt-[10px]`} 
                                  dragConstraints={!isS2Sticker2Placed ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                  whileHover={isS2Sticker2Placed ? { scale: 1.1 } : {}}
                                >
                                  <img src="/pictures/scene2_layer2-1.png" alt="上梁仪式" className="w-[68px] h-auto object-contain pointer-events-none drop-shadow-md" referrerPolicy="no-referrer" />
                                </motion.div>
                              ) : <div className="text-[10px] text-ink/20 font-serif italic mt-[10px]">已放置</div>}
                            </div>
                            <span className="text-[14px] text-ink/60 font-zh leading-none text-center -mt-0.5" style={{ fontFamily: 'Times New Roman' }}>上梁仪式</span>
                          </div>
                        </div>

                        {/* Row 4: Facades & Roof side by side */}
                        <div className="flex justify-around items-center w-full gap-1 shrink-0 px-2 -mt-1.5">
                          {/* Sticker 5: Facade */}
                          <div className="flex flex-col items-center gap-0.5 flex-1 w-1/2">
                            <div className="h-[48px] flex items-center justify-center relative overflow-visible w-full">
                              {!isS2Sticker3Placed ? (
                                <motion.div 
                                  drag 
                                  dragSnapToOrigin 
                                  onDragEnd={(_, info) => handleDragEnd(_, info, 's2_sticker3')} 
                                  className={`cursor-grab active:cursor-grabbing z-[1000] ${!isS2Layer2_1Placed ? 'opacity-30 grayscale cursor-not-allowed' : ''} mt-[50px]`} 
                                  dragConstraints={!isS2Layer2_1Placed ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                  whileHover={isS2Layer2_1Placed ? { scale: 1.1 } : {}}
                                >
                                  <img src="/pictures/scene2_layer3.png" alt="立面" className="w-[68px] h-auto object-contain pointer-events-none drop-shadow-md" referrerPolicy="no-referrer" />
                                </motion.div>
                              ) : <div className="text-[10px] text-ink/20 font-serif italic mt-[50px]">已放置</div>}
                            </div>
                            <span className="text-[14px] text-ink/60 font-zh leading-none text-center mt-[40px] block" style={{ fontFamily: 'Times New Roman' }}>立面</span>
                          </div>

                          {/* Sticker 6: Roof */}
                          <div className="flex flex-col items-center gap-0.5 flex-1 w-1/2">
                            <div className="h-[48px] flex items-center justify-center relative overflow-visible w-full">
                              {!isS2Sticker4Placed ? (
                                <motion.div 
                                  drag 
                                  dragSnapToOrigin 
                                  onDragEnd={(_, info) => handleDragEnd(_, info, 's2_sticker4')} 
                                  className={`cursor-grab active:cursor-grabbing z-[1000] ${!isS2Sticker3Placed ? 'opacity-30 grayscale cursor-not-allowed' : ''} mt-[50px]`} 
                                  dragConstraints={!isS2Sticker3Placed ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                  whileHover={isS2Sticker3Placed ? { scale: 1.1 } : {}}
                                >
                                  <img src="/pictures/scene2_layer4.png" alt="屋顶" className="w-[68px] h-auto object-contain pointer-events-none drop-shadow-md" referrerPolicy="no-referrer" />
                                </motion.div>
                              ) : <div className="text-[10px] text-ink/20 font-serif italic mt-[50px]">已放置</div>}
                            </div>
                            <span className="text-[14px] text-ink/60 font-zh leading-none text-center mt-[40px] block" style={{ fontFamily: 'Times New Roman' }}>屋顶</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedScene.id === 3 ? (
                    <>
                      {/* Scene 3 Layout */}
                      <div className="w-[243px] shrink-0 flex flex-col gap-[10px] h-[calc(100%-36px)] mb-[36px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Pic 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene3_pic1.png" 
                            alt="火塘实景1" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          如果说堂屋是壮族家庭的礼仪中心，那么火塘间就是龙脊壮宅当之无愧的生活中心。一家人围坐在火塘边吃火锅；冬季，人们在火塘边取暖御寒；婚礼之夜，男女方的宾客在火塘边“坐夜”对歌；淋湿的衣服、鞋挂在火塘边烘干；杀了猪，切成一条条的猪肉挂在火塘上方，熏制成腊肉；收获季节，将禾把收入禾炕悬于火塘上方......
                        </p>

                        {/* Paragraph 2 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          火塘出现在壮族人生活的方方面面，恐怕还没有哪个空间像壮族的火塘间一样综合了这么多的功能。由于火塘具有的多种功能，火塘间成为壮族人主要的起居生活空间。
                        </p>

                        {/* Pic 2 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene3_pic2.png" 
                            alt="火塘实景2" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col items-center justify-center h-full py-2 -mt-[20px] select-none">
                        <div className="text-[14px] text-[#b8a67f] font-serif mt-[12px] mb-0 text-center">拖动火塘部件</div>
                        
                        <div className="flex-1 flex flex-col items-center justify-evenly w-full">
                          {[
                            { id: 's3_sticker1', name: '帮', img: '/pictures/scene3_layer1.png', active: true, placed: isS3Sticker1Placed, width: 'w-[84px]' },
                            { id: 's3_sticker2', name: '禾炕', img: '/pictures/scene3_layer2.png', active: isS3Sticker1Placed, placed: isS3Sticker2Placed, width: 'w-[44px]' },
                            { id: 's3_sticker3', name: '火塘', img: '/pictures/scene3_layer3.png', active: isS3Sticker2Placed, placed: isS3Sticker3Placed, width: 'w-[84px]' },
                          ].map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-1 w-full">
                              <div className="h-[60px] flex items-center justify-center relative overflow-visible w-full">
                                {!s.placed ? (
                                  <motion.div 
                                    drag 
                                    dragSnapToOrigin 
                                    onDragEnd={(_, info) => handleDragEnd(_, info, s.id)} 
                                    className={`cursor-grab active:cursor-grabbing z-[1000] ${!s.active ? 'opacity-30 grayscale cursor-not-allowed' : ''}`} 
                                    dragConstraints={!s.active ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                    whileHover={s.active ? { scale: 1.05 } : {}}
                                  >
                                    <img src={s.img} alt={s.name} className={`${s.width} h-auto object-contain pointer-events-none drop-shadow-md`} referrerPolicy="no-referrer" />
                                  </motion.div>
                                ) : <div className="text-[8px] text-ink/20 font-serif italic">已放置</div>}
                              </div>
                              <span className="text-[14px] text-ink/60 font-zh" style={{ fontFamily: 'Times New Roman' }}>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : selectedScene.id === 4 ? (
                    <>
                      {/* Scene 4 Layout */}
                      <div className="w-[56%] flex flex-col gap-[10px] h-[calc(100%-36px)] mb-[36px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Pic 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene4_pic1.png" 
                            alt="晒谷实景" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          因为龙脊十三寨常云雾缭绕，日照不足，天气潮湿，稻谷须经充分干燥后方能入仓。村寨内很少平地，室外晒场很有限，于是龙脊人充分发挥干栏住宅搭建灵活的优势，在日照最好的方向紧贴建筑外墙用木头搭个与建筑二层地面等高的架子，平铺一层竹蔑，就搭好了一个晒排，专门用来晾晒禾把和辣椒、干菜等。
                        </p>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-[44%] flex flex-col items-center justify-center h-full select-none pb-8 pl-[10px]">
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 relative overflow-visible w-full">
                          <div className="text-[14px] text-[#b8a67f] font-serif text-center">拖动晒排补齐场景</div>
                          {!isPuzzleSolved ? (
                            <motion.div 
                              drag 
                              dragSnapToOrigin 
                              onDragEnd={handleDragEnd} 
                              className="cursor-grab active:cursor-grabbing z-[1000] relative"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img src="/pictures/scene4_layer2.png" alt="晒排" className="w-[124px] h-auto object-contain pointer-events-none drop-shadow-xl" referrerPolicy="no-referrer" />
                            </motion.div>
                          ) : (
                            <div className="text-[11px] text-ink/20 font-serif italic">已放置</div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : selectedScene.id === 5 ? (
                    <>
                      {/* Scene 5 Layout */}
                      <div className="w-[60%] flex flex-col gap-[10px] h-[calc(100%-36px)] mb-[36px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Pic 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene5_pic1.png" 
                            alt="耦耕实景" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          龙脊梯田的田块很窄，牛在田中无法回转，还会践踏田埂，造成破坏，因此这里用的是古老的“耦耕”来犁田。夫妻或兄弟两人，一个在前面拉犁，一个在后面扶犁，一趟趟将田土翻松。
                        </p>

                        {/* Paragraph 2 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          20世纪50年代，扶贫工作组曾在龙脊推广牛耕，当时编山歌来形容耦耕的辛苦：“你一头来我一头，老婆在前当黄牛，老公在后麻直呸（喊一声往前走），夫妻双双汗流流。”由于地理条件所限，牛耕终究不适用于高山窄田，这次技术革新以失败告终。龙脊现在虽有不少人家蓄养黄牛、也仅是取牛粪肥田，其次食用而已。
                        </p>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-[40%] flex flex-col items-center justify-center gap-1.5 h-full select-none -mt-[15px]">
                        <div className="text-[14px] text-[#b8a67f] font-serif mt-[13px] mb-[-10px]">将村民拖动进行耕作</div>
                        
                        <div className="flex-1 flex flex-col items-center justify-evenly w-full">
                          {[
                            { id: 's5_sticker1', name: '国胜一家人', img: '/pictures/scene5_layer1.png', active: true, placed: isS5Sticker1Placed, width: 'w-[80px]' },
                            { id: 's5_sticker2', name: '阿菊夫妇', img: '/pictures/scene5_layer2.png', active: isS5Sticker1Placed, placed: isS5Sticker2Placed, width: 'w-[80px]' },
                            { id: 's5_sticker3', name: '杜丽嫂', img: '/pictures/scene5_layer3.png', active: isS5Sticker2Placed, placed: isS5Sticker3Placed, width: 'w-[40px]' },
                          ].map((s) => (
                            <div key={s.id} className="flex flex-col items-center gap-0.5 w-full">
                              <div className="h-[55px] flex items-center justify-center relative overflow-visible w-full">
                                {!s.placed ? (
                                  <motion.div 
                                    drag 
                                    dragSnapToOrigin 
                                    onDragEnd={(_, info) => handleDragEnd(_, info, s.id)} 
                                    className={`cursor-grab active:cursor-grabbing z-[1000] ${!s.active ? 'opacity-30 grayscale cursor-not-allowed' : ''}`} 
                                    dragConstraints={!s.active ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                    whileHover={s.active ? { scale: 1.05 } : {}}
                                  >
                                    <img src={s.img} alt={s.name} className={`${s.width} h-auto object-contain pointer-events-none drop-shadow-md`} referrerPolicy="no-referrer" />
                                  </motion.div>
                                ) : <div className="text-[8px] text-ink/20 font-serif italic">已放置</div>}
                              </div>
                              <span className="text-[14px] text-ink/60 font-zh" style={{ fontFamily: 'Times New Roman' }}>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : selectedScene.id === 6 ? (
                    <>
                      {/* Scene 6 Layout */}
                      <div className="w-1/2 flex flex-col gap-[10px] h-[calc(100%-48px)] mt-[12px] mb-[36px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Plan Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene6_plan.png" 
                            alt="风雨桥平面图" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Section Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene6_section.png" 
                            alt="风雨桥剖面图" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          贸易商品在龙脊村民的生活物资中所占比例很小，一般人家每年只赶两三次圩。圩场交易以物物交换为主。龙脊除了辣椒、龙脊茶等名产，还有禾杆、禾把、竹纸等土特产可以用作交易。
                        </p>

                        {/* Paragraph 2 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          当地没有骡马等可用于载货代步的牲畜，物资的运输只能依靠背扛肩挑。村民出村赶圩时需要经过村口，村口或者常有村民聚集的石桥处，村民就集资在桥上建造桥亭，使其成为风雨桥。
                        </p>

                        {/* Pic 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene6_pic1.png" 
                            alt="风雨桥实景" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col items-center justify-center gap-2 h-full select-none">
                        <div className="text-[14px] text-[#b8a67f] font-serif mb-4">拖动建造风雨桥</div>
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="h-[120px] flex items-center justify-center relative overflow-visible w-full">
                            {!isS6StickerPlaced ? (
                              <motion.div 
                                drag 
                                dragSnapToOrigin 
                                onDragEnd={(_, info) => handleDragEnd(_, info, 's6_sticker')} 
                                className="cursor-grab active:cursor-grabbing z-[1000]"
                                whileHover={{ scale: 1.05 }}
                              >
                                <img src="/pictures/scene6_layer1.png" alt="风雨桥" className="w-[140px] h-auto object-contain pointer-events-none drop-shadow-xl" referrerPolicy="no-referrer" />
                              </motion.div>
                            ) : <div className="text-[10px] text-ink/20 font-serif italic">已放置</div>}
                          </div>
                          <span className="text-[14px] text-ink/60 font-zh" style={{ fontFamily: 'Times New Roman' }}>风雨桥</span>
                        </div>
                      </div>
                    </>
                  ) : selectedScene.id === 7 ? (
                    <>
                      {/* Scene 7 Layout */}
                      <div className="w-[60%] flex flex-col gap-[10px] h-[calc(100%-36px)] mb-[36px] overflow-y-auto pr-2 custom-scrollbar select-none">
                        {/* Pic 1 Image */}
                        <div className="w-full shrink-0">
                          <img 
                            src="/info/scene7_pic1.png" 
                            alt="会期实景" 
                            className="w-full h-auto object-contain" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>

                        {/* Paragraph 1 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          会期和逢年过节举行的体育娱乐活动，是龙脊壮族农耕生活中的调剂。
                        </p>

                        {/* Paragraph 2 */}
                        <p className="font-serif text-[14px] leading-relaxed text-ink/80 text-justify">
                          每次平段会期，由1~3个寨子主办。文娱活动项目有彩调剧表演和各种体育比赛。体育比赛的项目都比较简单，工具也都是就地取材的，以考验农民的体力为目的。主要项目有提石磨、扔猪脚、拔河、掰手腕、挑重担、推竹杠等。会期还是年轻人对歌、谈情说爱的时机。平段寨村口的平地，被蜿蜒的小溪切割成几块。表演彩调剧时，就在小溪上铺木板，形成一块较大的平地。
                        </p>

                        {/* Source Credit */}
                        <div className="text-[11px] text-ink/40 font-serif text-right mt-1 pb-4 leading-normal">
                          <div>图文来源：</div>
                          <div>孙娜 罗德胤《龙脊十三寨》</div>
                        </div>
                      </div>
                      <div className="w-[40%] flex flex-col items-center justify-center h-full select-none py-1">
                        <div className="text-[14px] text-[#b8a67f] font-serif mb-2">拖动展开会期活动</div>
                        
                        <div className="flex-1 flex flex-col items-center justify-around w-full">
                          {[
                            { id: 's7_sticker1', name: '聚会聊天', img: '/pictures/scene7_layer1.png', active: true, placed: isS7Sticker1Placed, width: 'w-[80px]' },
                            { id: 's7_sticker2', name: '扔猪脚', img: '/pictures/scene7_layer2.png', active: isS7Sticker1Placed, placed: isS7Sticker2Placed, width: 'w-[40px]' },
                          ].map((s) => (
                            <div key={s.id} className={`flex flex-col items-center gap-1 w-full ${s.id === 's7_sticker2' ? '-mt-[15px]' : ''}`}>
                              <div className="h-[70px] flex items-center justify-center relative overflow-visible w-full">
                                {!s.placed ? (
                                  <motion.div 
                                    drag 
                                    dragSnapToOrigin 
                                    onDragEnd={(_, info) => handleDragEnd(_, info, s.id)} 
                                    className={`cursor-grab active:cursor-grabbing z-[1000] ${!s.active ? 'opacity-30 grayscale cursor-not-allowed' : ''}`} 
                                    dragConstraints={!s.active ? { top: 0, left: 0, right: 0, bottom: 0 } : false}
                                    whileHover={s.active ? { scale: 1.05 } : {}}
                                  >
                                    <img src={s.img} alt={s.name} className={`${s.width} h-auto object-contain pointer-events-none drop-shadow-md`} referrerPolicy="no-referrer" />
                                  </motion.div>
                                ) : <div className="text-[8px] text-ink/20 font-serif italic">已放置</div>}
                              </div>
                              <span className={`text-[14px] text-ink/60 font-zh ${s.id === 's7_sticker1' ? 'mt-[20px]' : ''}`} style={{ fontFamily: 'Times New Roman' }}>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Default Fallback */}
                      <div className="w-full flex items-center justify-center h-full">
                        <p className="font-serif text-sm text-ink/40">加载中...</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 w-full">
                <img 
                  src="/pictures/location.png" 
                  alt="Location Map" 
                  className="object-cover"
                  style={{
                    borderWidth: '0px',
                    borderStyle: 'none',
                    height: '348.5px',
                    paddingTop: '0px',
                    marginTop: '10px',
                    width: '342px',
                    marginLeft: '19px'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Timeline persistent */}
            <div className="px-4 mt-auto pb-[1.5px]">
              <div className="relative h-px bg-ink/20 w-full">
                {!selectedScene && (
                  <>
                    <div className="absolute -top-6 left-0 text-[14px] font-bold text-ink/30 font-serif">早6</div>
                    <div className="absolute -top-6 right-0 text-[14px] font-bold text-ink/30 font-serif">晚10</div>
                  </>
                )}
                {SCENES.map((scene) => {
                  const isActive = selectedScene?.id === scene.id;
                  const position = timeToPercent(scene.time);
                  return (
                    <div key={`point-${scene.id}`} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center" style={{ left: `${position}%` }}>
                      <div className={`transition-all duration-300 rounded-full ${isActive ? 'w-1.5 h-1.5 bg-[#b8a67f] shadow-[0_0_8px_rgba(184,166,127,0.5)]' : 'w-1.5 h-1.5 border border-accent/40 bg-white/50'}`} />
                      <AnimatePresence>
                        {isActive && (
                          <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-6 font-serif text-[#b8a67f] text-[14px] font-bold whitespace-nowrap">
                            {formatChineseTime(scene.time)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Scene Display */}
        <section className="aspect-square h-full relative p-4 bg-transparent overflow-hidden shrink-0">
          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence custom={selectedScene}>
              {!selectedScene ? (
                <motion.div 
                  key="total-map" 
                  variants={{
                    exit: (target: any) => {
                      if (!target) return { opacity: 0 };
                      const tx = (50 - target.coordinates.x) * 4;
                      const ty = (50 - target.coordinates.y) * 4;
                      return { opacity: 0, scale: 4, x: `${tx}%`, y: `${ty}%`, transition: { scale: { duration: 2, ease: "linear" }, x: { duration: 2, ease: "linear" }, y: { duration: 2, ease: "linear" }, opacity: { duration: 1, delay: 2, ease: "easeInOut" } } };
                    }
                  }}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit="exit"
                  custom={selectedScene}
                  className="absolute inset-0"
                >
                  <img src="/total_map.png" alt="Total Map" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=2070"; }} />
                  <div className="absolute inset-0">
                    {SCENES.map((scene) => (
                      <button key={scene.id} onClick={() => handleSelectScene(scene)} className="absolute -ml-5 -mt-5 marker-number" style={{ left: `${scene.coordinates.x}%`, top: `${scene.coordinates.y}%` }}>{scene.id}</button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`scene-${selectedScene.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: wasFromMapRef.current ? 2 : 0, duration: 1, ease: "easeInOut" } }} exit={{ opacity: 0, transition: { duration: 0.5 } }} className="absolute inset-0 z-10">
                  <div className="w-full h-full relative" ref={(el) => {
                    const isDropTarget = (selectedScene.id === 4 || selectedScene.id === 1 || selectedScene.id === 2 || selectedScene.id === 3 || selectedScene.id === 5 || selectedScene.id === 6 || selectedScene.id === 7);
                    if (isDropTarget && el) {
                      dropTargetRef.current = el;
                    }
                  }}>
                    {selectedScene.id === 4 ? (
                      <>
                        <img src="/pictures/scene4_layer1.png" alt="S4 L1" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene4.png" initial={{ opacity: 0 }} animate={{ opacity: isPuzzleSolved ? 1 : 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </>
                    ) : selectedScene.id === 1 ? (
                      <div className="w-full h-full relative">
                        <img src="/pictures/scene1_1.png" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene1_2.png" initial={{ opacity: 0 }} animate={{ opacity: isSticker1Placed ? 1 : 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene1_3.png" initial={{ opacity: 0 }} animate={{ opacity: isSticker2Placed ? 1 : 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : selectedScene.id === 2 ? (
                      <div className="w-full h-full relative">
                        <img src="/pictures/scene2_1.png" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        
                        <motion.img src="/pictures/scene2_2-1.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker1_1Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_2-2.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker1_2Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_2-3.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker1_3Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_2-4.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker1_4Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_2-5.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Layer1_1Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_3.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker2Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_3-1.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Layer2_1Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_4.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker3Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_5.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Sticker4Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene2_6.png" initial={{ opacity: 0 }} animate={{ opacity: isS2Step6Active ? 1 : 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : selectedScene.id === 3 ? (
                      <div className="w-full h-full relative">
                        <img src="/pictures/scene3_1-1.png" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene3_1-2.png" initial={{ opacity: 0 }} animate={{ opacity: isS3Sticker1Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene3_1-3.png" initial={{ opacity: 0 }} animate={{ opacity: isS3Sticker2Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene3_2.png" initial={{ opacity: 0 }} animate={{ opacity: isS3Sticker3Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : selectedScene.id === 5 ? (
                      <div className="w-full h-full relative">
                        <img src="/pictures/scene5_1.png" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene5_2.png" initial={{ opacity: 0 }} animate={{ opacity: isS5Sticker1Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene5_3.png" initial={{ opacity: 0 }} animate={{ opacity: isS5Sticker2Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene5_4.png" initial={{ opacity: 0 }} animate={{ opacity: isS5Sticker3Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : selectedScene.id === 6 ? (
                      <div className="w-full h-full relative">
                        <img src="/pictures/scene6_1.png" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene6_2.png" initial={{ opacity: 0 }} animate={{ opacity: isS6StickerPlaced ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : selectedScene.id === 7 ? (
                      <div className="w-full h-full relative">
                        <img src="/pictures/scene7_1.png" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene7_2.png" initial={{ opacity: 0 }} animate={{ opacity: isS7Sticker1Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <motion.img src="/pictures/scene7_3.png" initial={{ opacity: 0 }} animate={{ opacity: isS7Sticker2Placed ? 1 : 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <img src={selectedScene.image} alt={selectedScene.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedScene.id}/800/600`; }} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(44, 36, 30, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
