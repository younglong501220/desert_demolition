import React from 'react';
import { X, AlertTriangle, Zap, Shield, Sparkles } from 'lucide-react';

interface AcmeManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcmeManualModal: React.FC<AcmeManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#2a1309] border-4 border-[#ff9100] rounded-2xl shadow-2xl text-stone-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header with ACME stamp */}
        <div className="bg-[#190902] px-6 py-4 border-b-2 border-[#ff9100]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📦</span>
            <div>
              <h2 className="font-['Bangers'] text-2xl text-[#ffeb3b] tracking-wider">
                ACME 企業特裝作戰手冊 (產品目錄 & 物理法則)
              </h2>
              <p className="text-xs text-amber-200/80 font-mono">
                ACME CORP. FIELD MANUAL & CARTOON PHYSICS GUIDE · 1995 REVISION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Cartoon Physics Laws */}
          <div className="bg-[#381c10] border border-amber-600/40 rounded-xl p-4">
            <h3 className="font-['Bangers'] text-lg text-[#ff9100] flex items-center gap-2 mb-3">
              <Sparkles size={18} />
              <span>美式卡通四大神級搞笑物理定律 (CARTOON LAWS)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20">
                <span className="font-bold text-amber-300 block mb-1">① 懸崖滯空與求救牌法則</span>
                <span>
                  威利狼跑出懸崖時<b>不會立刻掉下去</b>！他會在空中懸空停頓並拿出「HELP!」或「YIKES!」牌子向觀眾求救，低頭發現踩空後才會伴隨滑笛音效咻地墜落。
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20">
                <span className="font-bold text-amber-300 block mb-1">② 彩繪隧道悖論 (Painted Tunnel)</span>
                <span>
                  在岩壁上畫的假隧道，嗶嗶鳥可以直接像真的一樣穿過去；但威利狼衝進去時會像手風琴一樣撞扁在石壁上，滿頭金星！
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20">
                <span className="font-bold text-amber-300 block mb-1">③ 100 噸 ACME 鐵砧效應</span>
                <span>
                  懸掛在空中的超重鐵砧一旦感應到下方有生物經過，就會以極限重力加速度墜落，砸中時會將受害者壓扁成平底鍋形狀。
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded-lg border border-amber-500/20">
                <span className="font-bold text-amber-300 block mb-1">④ 嗶嗶鳥風火輪與嘲弄衝刺</span>
                <span>
                  嗶嗶鳥雙腿可化為紅色旋風輪圈，發出招牌「Beep-Beep!」雙音調並吐舌頭挑釁，隨後以超音速揚起滾滾沙塵甩開追擊！
                </span>
              </div>
            </div>
          </div>

          {/* ACME Equipment Catalog */}
          <div>
            <h3 className="font-['Bangers'] text-lg text-[#ffeb3b] mb-3 flex items-center gap-2">
              <Zap size={18} />
              <span>ACME 精選捕鳥武器庫 (操作指南)</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-red-500/30">
                <span className="text-2xl p-2 bg-red-900/50 rounded border border-red-500/40">🚀</span>
                <div>
                  <div className="font-bold text-red-400 text-sm flex items-center gap-2">
                    <span>ACME 噴射火箭鞋 (Rocket Skates)</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-200 text-[10px]">按鍵: [Z]</span>
                  </div>
                  <p className="text-stone-300 mt-1">
                    長按 [Z] 鍵噴射高能火焰，爆發極速衝刺，能瞬間拉近與嗶嗶鳥的距離。需注意火箭燃料量，可沿途拾取紅色 ACME 箱補充。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-yellow-500/30">
                <span className="text-2xl p-2 bg-yellow-900/50 rounded border border-yellow-500/40">🦘</span>
                <div>
                  <div className="font-bold text-yellow-400 text-sm flex items-center gap-2">
                    <span>ACME 彈簧靴 / 超級跳躍板 (Super Spring)</span>
                    <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-200 text-[10px]">按鍵: [X]</span>
                  </div>
                  <p className="text-stone-300 mt-1">
                    按下 [X] 鍵釋放超彈力鋼製彈簧，發出「BOING!」聲響並將威利狼彈射至高空，輕易跨越高聳岩台或深不見底的斷崖。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-rose-500/30">
                <span className="text-2xl p-2 bg-rose-900/50 rounded border border-rose-500/40">💣</span>
                <div>
                  <div className="font-bold text-rose-400 text-sm flex items-center gap-2">
                    <span>ACME 經典紅炸藥束 (TNT Bundle)</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-200 text-[10px]">按鍵: [C]</span>
                  </div>
                  <p className="text-stone-300 mt-1">
                    投擲出倒數導火線炸藥，定時引爆！爆炸可炸毀前方的滾石障礙與仙人掌，若自己離太近會被炸得滿臉焦黑！
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Controls Summary */}
          <div className="p-4 bg-black/60 rounded-xl border border-stone-700 text-xs">
            <h4 className="font-bold text-amber-300 mb-2">🕹️ 鍵盤完整控制一覽：</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div><b className="text-white">[← / →]</b> 或 <b className="text-white">[A / D]</b> 跑動</div>
              <div><b className="text-white">[空白鍵]</b> 或 <b className="text-white">[↑]</b> 跳躍</div>
              <div><b className="text-white">[Z]</b> 火箭鞋推進衝刺</div>
              <div><b className="text-white">[X]</b> 彈簧超級彈跳</div>
              <div><b className="text-white">[C]</b> 投擲 ACME 炸藥</div>
              <div><b className="text-white">[P]</b> 暫停遊戲</div>
              <div><b className="text-white">[R]</b> 重新開始關卡</div>
              <div><b className="text-white">[M]</b> 靜音切換</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#190902] px-6 py-3 border-t border-[#ff9100]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg shadow transition-all font-mono"
          >
            關閉手冊，開始追逐！
          </button>
        </div>

      </div>
    </div>
  );
};
