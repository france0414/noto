# 🗺️ llm.c 學習地圖

這是基於 Andrej Karpathy 的 `llm.c` 專案所建立的教學與實作地圖。我們的目標是理解如何用 C 語言從頭訓練一個 GPT-2 模型。

## 📍 學習階段

- [ ] **階段 1：環境準備 (Setup)**
    - [ ] 確保電腦具備 C 編譯器 (gcc/clang)。
    - [ ] (選配) 如果有 NVIDIA GPU，安裝 CUDA 工具組。
    - [ ] 下載專案原始碼：`git clone https://github.com/karpathy/llm.c.git`

- [ ] **階段 2：資料準備 (Data)**
    - [ ] 執行 `python prepro_tinyshakespeare.py` (下載並處理小型資料集)。
    - [ ] 理解資料如何被 Tokenize (標記化)。

- [ ] **階段 3：CPU 版本的原始碼解析 (train_gpt2.c)**
    - [ ] 理解記憶體配置 (Memory Allocation)。
    - [ ] 理解核心運算：權重初始化、Forward Pass (前向傳播)。
    - [ ] 理解 Backward Pass (反向傳播)。

- [ ] **階段 4：GPU 版本與效能優化 (train_gpt2.cu)**
    - [ ] 學習簡單的 CUDA Kernel 概念。
    - [ ] 比較 CPU 與 GPU 的訓練速度。

---
## 📚 參考資源
- [GitHub: karpathy/llm.c](https://github.com/karpathy/llm.c)
- [YouTube: Let's build GPT: from scratch, in code, spelled out.](https://www.youtube.com/watch?v=kCc8FmEb1nY) (Karpathy 的核心教學影片)
