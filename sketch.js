function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
// ==================== 全域變數宣告區 ====================
let weatherTypes = ['晴天', '雨天', '陰天', '下雪', '打雷', '彩虹']; // 定義六種天氣的名稱陣列
let gifImages = {}; // 用來存放外部載入的 GIF 圖片物件的字典
let dropZones = []; // 用來存放上方六個天氣圖卡（放置區）的陣列
let dragItems = []; // 用來存放下方六個可拖曳文字選項的陣列
let draggingItem = null; // 記錄目前正在被滑鼠拖曳的選項物件（沒有拖曳時為 null）
let offsetX = 0; // 記錄滑鼠點擊位置與選項中心點的 X 軸偏移量
let offsetY = 0; // 記錄滑鼠點擊位置與選項中心點的 Y 軸偏移量

let isSubmitted = false; // 記錄是否已經按下「交卷」按鈕的布林值
let score = 0; // 記錄測驗的總得分（百分比）
let confetti = []; // 用來存放及格時噴發的彩帶粒子陣列

let btnX, btnY, btnW, btnH; // 定義交卷（或再玩一次）按鈕的 X座標、Y座標、寬度、高度

// ==================== 預載入資源區 ====================
function preload() { // p5.js 的預載入函式，會在程式開始前執行
  // 【如何換成自己的 GIF 圖片？】
  // 如果你有準備好 GIF 檔（例如放在專案資料夾下），請將下面 6 行取消註解：
  // gifImages['晴天'] = loadImage('sunny.gif'); // 載入晴天的 GIF 動畫檔
  // gifImages['雨天'] = loadImage('rainy.gif'); // 載入雨天的 GIF 動畫檔
  // gifImages['陰天'] = loadImage('cloudy.gif'); // 載入陰天的 GIF 動畫檔
  // gifImages['下雪'] = loadImage('snowy.gif'); // 載入下雪的 GIF 動畫檔
  // gifImages['打雷'] = loadImage('thunder.gif'); // 載入打雷的 GIF 動畫檔
  // gifImages['彩虹'] = loadImage('rainbow.gif'); // 載入彩虹的 GIF 動畫檔
} // preload 函式結束

// ==================== 初始化設定區 ====================
function setup() { // p5.js 的初始化函式，只會在開始時執行一次
  createCanvas(windowWidth, windowHeight); // 建立一個符合瀏覽器視窗大小的全螢幕畫布
  textFont('Microsoft JhengHei'); // 設定字體為微軟正黑體，適合幼童閱讀
  initQuiz(); // 呼叫自訂的初始化測驗函式，設定題目與選項
} // setup 函式結束

// ==================== 初始化測驗資料函式 ====================
function initQuiz() { // 用來產生或重置測驗題目的函式
  dropZones = []; // 清空上方的放置區陣列
  dragItems = []; // 清空下方的拖曳選項陣列
  confetti = []; // 清空彩帶陣列
  isSubmitted = false; // 將交卷狀態重設為「尚未交卷」
  score = 0; // 將分數重設為 0

  let shuffledAnswers = shuffle([...weatherTypes]); // 複製一份天氣陣列並隨機打亂順序，作為下方選項的排列

  for (let i = 0; i < 6; i++) { // 使用迴圈建立 6 個放置區與 6 個拖曳選項
    dropZones.push({ // 將一個新的放置區物件加入 dropZones 陣列中
      type: weatherTypes[i], // 設定這個放置區代表的正確天氣名稱
      x: 0, // 放置區的左上角 X 座標（稍後由 calculateLayout 計算）
      y: 0, // 放置區的左上角 Y 座標
      w: 0, // 放置區的總寬度
      h: 0, // 放置區的總高度
      boxX: 0, // 圖片下方虛線放置框的 X 座標
      boxY: 0, // 圖片下方虛線放置框的 Y 座標
      boxW: 0, // 圖片下方虛線放置框的寬度
      boxH: 0, // 圖片下方虛線放置框的高度
      currentItem: null // 記錄目前放進這個框框的拖曳選項（預設為沒有）
    }); // 放置區物件設定結束

    dragItems.push({ // 將一個新的拖曳選項物件加入 dragItems 陣列中
      text: shuffledAnswers[i], // 設定選項顯示的文字（使用打亂後的順序）
      x: 0, // 選項目前的中心點 X 座標
      y: 0, // 選項目前的中心點 Y 座標
      homeX: 0, // 選項原本在下方等待區的中心點 X 座標（彈回時使用）
      homeY: 0, // 選項原本在下方等待區的中心點 Y 座標（彈回時使用）
      w: 0, // 選項按鈕的寬度
      h: 0, // 選項按鈕的高度
      placedZone: null // 記錄這個選項目前被放在哪一個放置區（預設為沒有）
    }); // 拖曳選項物件設定結束
  } // for 迴圈結束

  calculateLayout(); // 呼叫版面計算函式，根據目前螢幕大小設定所有座標與尺寸
} // initQuiz 函式結束

// ==================== 響應式版面計算函式 ====================
function calculateLayout() { // 根據視窗寬高動態計算所有元件位置與大小的函式
  let isLandscape = width > height; // 判斷目前螢幕是否為橫向（寬大於高）
  let cols = isLandscape ? 3 : 2; // 如果是橫向就排 3 直欄，直向（如手機）就排 2 直欄
  let rows = 6 / cols; // 計算需要幾橫列（6 除以欄數，會是 2 列或 3 列）

  let topAreaY = height * 0.10; // 設定上方題目區從畫面高度 10% 的位置開始
  let topAreaH = height * 0.56; // 設定上方題目區佔據畫面高度的 56%
  let cellW = width / cols; // 計算每一格題目分配到的寬度
  let cellH = topAreaH / rows; // 計算每一格題目分配到的高度

  for (let i = 0; i < 6; i++) { // 使用迴圈計算 6 個放置區的實際座標與大小
    let col = i % cols; // 透過取餘數計算目前是第幾直欄
    let row = floor(i / cols); // 透過無條件捨去除法計算目前是第幾橫列
    let z = dropZones[i]; // 取得第 i 個放置區物件

    z.w = min(cellW * 0.85, 240); // 設定圖卡寬度為格子寬的 85%，但最大不超過 240 像素
    z.h = min(cellH * 0.90, 220); // 設定圖卡高度為格子高的 90%，但最大不超過 220 像素
    z.x = col * cellW + (cellW - z.w) / 2; // 計算圖卡在格子內水平置中的 X 座標
    z.y = topAreaY + row * cellH + (cellH - z.h) / 2; // 計算圖卡在格子內垂直置中的 Y 座標

    z.boxW = z.w * 0.85; // 設定圖片下方放置框的寬度為圖卡寬度的 85%
    z.boxH = z.h * 0.26; // 設定圖片下方放置框的高度為圖卡高度的 26%
    z.boxX = z.x + (z.w - z.boxW) / 2; // 計算放置框水平置中的 X 座標
    z.boxY = z.y + z.h - z.boxH - 8; // 計算放置框位於圖卡底部往上 8 像素的 Y 座標
  } // 放置區迴圈結束

  let bottomAreaY = height * 0.68; // 設定下方選項等待區從畫面高度 68% 的位置開始
  let bottomAreaH = height * 0.16; // 設定下方選項等待區佔據畫面高度的 16%
  let itemCols = isLandscape ? 6 : 3; // 橫向時選項一字排開為 6 欄，直向時排成 3 欄（共 2 列）
  let itemRows = 6 / itemCols; // 計算選項需要幾橫列
  let itemCellW = width / itemCols; // 計算每個選項格子分配到的寬度
  let itemCellH = bottomAreaH / itemRows; // 計算每個選項格子分配到的高度

  for (let i = 0; i < 6; i++) { // 使用迴圈計算 6 個拖曳選項的座標與大小
    let col = i % itemCols; // 計算該選項位於第幾直欄
    let row = floor(i / itemCols); // 計算該選項位於第幾橫列
    let item = dragItems[i]; // 取得第 i 個拖曳選項物件

    item.w = min(dropZones[0].boxW, itemCellW * 0.85); // 設定選項寬度，配合上方放置框的大小
    item.h = min(dropZones[0].boxH, itemCellH * 0.80); // 設定選項高度，配合上方放置框的大小
    item.homeX = col * itemCellW + itemCellW / 2; // 計算選項在下方等待區的中心點 X 座標
    item.homeY = bottomAreaY + row * itemCellH + itemCellH / 2; // 計算選項在下方等待區的中心點 Y 座標

    if (item.placedZone !== null) { // 如果這個選項已經被放進某個上方的放置框裡
      item.x = item.placedZone.boxX + item.placedZone.boxW / 2; // 將選項的 X 座標維持在該放置框的中心
      item.y = item.placedZone.boxY + item.placedZone.boxH / 2; // 將選項的 Y 座標維持在該放置框的中心
    } else if (item !== draggingItem) { // 如果還沒放進去，且目前也沒有正在被滑鼠拖曳
      item.x = item.homeX; // 將選項的 X 座標設回下方等待區的原位
      item.y = item.homeY; // 將選項的 Y 座標設回下方等待區的原位
    } // 條件判斷結束
  } // 拖曳選項迴圈結束

  btnW = min(width * 0.4, 220); // 設定交卷按鈕的寬度為畫面寬的 40%，最大 220 像素
  btnH = min(height * 0.08, 55); // 設定交卷按鈕的高度為畫面高的 8%，最大 55 像素
  btnX = width / 2 - btnW / 2; // 計算交卷按鈕水平置中的左上角 X 座標
  btnY = height * 0.87; // 設定交卷按鈕位於畫面高度 87% 的位置
} // calculateLayout 函式結束

// ==================== 視窗大小改變事件 ====================
function windowResized() { // 當瀏覽器視窗大小被改變時，p5.js 會自動呼叫此函式
  resizeCanvas(windowWidth, windowHeight); // 重新調整畫布大小以符合新的視窗尺寸
  calculateLayout(); // 重新計算所有元件的位置與大小，達成響應式網頁效果
} // windowResized 函式結束

// ==================== 主繪圖迴圈 ====================
function draw() { // p5.js 的主繪圖函式，每秒會重複執行約 60 次
  background(230, 245, 255); // 將畫布背景塗成柔和的天空粉藍色

  // --- 繪製上方主標題 ---
  fill(40, 80, 120); // 設定標題文字顏色為深藍色
  noStroke(); // 文字不需要外框線
  textAlign(CENTER, CENTER); // 設定文字對齊方式為水平與垂直置中
  textSize(min(width * 0.045, 34)); // 根據畫面寬度動態設定標題字體大小
  textStyle(BOLD); // 設定文字為粗體
  if (!isSubmitted) { // 如果還沒有交卷
    text("🌤️ 認識天氣小測驗：請把正確的天氣名稱拉到圖片下方！", width / 2, height * 0.05); // 顯示測驗提示標題
  } else { // 如果已經交卷了
    let msg = score >= 60 ? "🎉 太棒了！闖關成功！" : "💪 再接再厲！你可以的！"; // 根據分數是否達 60% 決定鼓勵文字
    fill(score >= 60 ? color(30, 150, 60) : color(200, 60, 60)); // 及格顯示綠色文字，不及格顯示紅色文字
    text(`總成績：${score}%  ${msg}`, width / 2, height * 0.05); // 在上方顯示總成績與鼓勵文字
  } // 標題判斷結束

  // --- 繪製 6 個天氣圖卡與放置區 ---
  for (let i = 0; i < 6; i++) { // 用迴圈逐一畫出 6 個天氣放置區
    let z = dropZones[i]; // 取得第 i 個放置區物件

    // 畫圖卡的白色底板
    fill(255); // 設定填滿顏色為白色
    stroke(180, 210, 240); // 設定邊框為淺藍色
    strokeWeight(3); // 設定邊框粗細為 3 像素
    rect(z.x, z.y, z.w, z.h, 16); // 畫出圓角矩形作為圖卡底板

    // 計算上方動畫顯示區域的中心點與大小
    let animCenterX = z.x + z.w / 2; // 動畫區的中心點 X 座標
    let animCenterY = z.y + (z.h - z.boxH) / 2 - 4; // 動畫區的中心點 Y 座標
    let animSize = min(z.w, z.h - z.boxH) * 0.75; // 計算適合放入的動畫尺寸

    // 繪製 GIF 或內建的動態天氣圖案
    if (gifImages[z.type]) { // 如果有成功載入外部的 GIF 圖片
      imageMode(CENTER); // 設定圖片以中心點對齊繪製
      image(gifImages[z.type], animCenterX, animCenterY, animSize, animSize); // 畫出 GIF 圖片
    } else { // 如果沒有外部圖片，就呼叫內建的程式動畫函式
      drawAnimatedWeather(z.type, animCenterX, animCenterY, animSize); // 繪製會動的可愛天氣圖案
    } // 圖片繪製判斷結束

    // 畫圖片下方的虛線（或變色）放置框
    if (isSubmitted) { // 如果已經交卷了，框框要顯示對錯顏色
      if (z.currentItem && z.currentItem.text === z.type) { // 如果框框內有選項，而且文字跟天氣答案一致
        fill(210, 255, 220); // 填滿淺綠色代表答對
        stroke(40, 180, 80); // 邊框設為深綠色
      } else { // 如果沒放選項，或是放錯答案了
        fill(255, 220, 220); // 填滿淺紅色代表答錯
        stroke(220, 60, 60); // 邊框設為深紅色
      } // 答題對錯判斷結束
    } else { // 如果還沒交卷
      fill(240, 248, 255); // 放置框填滿極淺的灰藍色
      stroke(150, 190, 230); // 邊框設為柔和藍色
    } // 交卷狀態判斷結束
    strokeWeight(2); // 設定放置框的邊框粗細為 2
    rect(z.boxX, z.boxY, z.boxW, z.boxH, 10); // 畫出圖片下方的放置框

    // 如果還沒放入選項，在框框內顯示淡淡的提示字
    if (z.currentItem === null && !isSubmitted) { // 當框框是空的且尚未交卷時
      fill(160, 190, 215); // 設定淺灰藍色文字
      noStroke(); // 不需要文字外框
      textSize(min(z.boxH * 0.45, 16)); // 設定提示字大小
      text("請拖曳到此", z.boxX + z.boxW / 2, z.boxY + z.boxH / 2); // 在框框中央寫上提示字
    } // 提示字繪製結束
  } // 放置區繪製迴圈結束

  // --- 繪製下方等待區的底座框（讓幼童知道選項原本在哪） ---
  for (let i = 0; i < 6; i++) { // 用迴圈畫出 6 個選項原本的家
    let item = dragItems[i]; // 取得第 i 個選項
    fill(215, 235, 250); // 設定淺藍色作為空位底座
    noStroke(); // 不畫邊框
    rect(item.homeX - item.w / 2, item.homeY - item.h / 2, item.w, item.h, 10); // 在原位畫出圓角矩形底座
  } // 等待區底座迴圈結束

  // --- 繪製 6 個可拖曳的文字選項 ---
  for (let i = 0; i < 6; i++) { // 用迴圈畫出未被拖曳的選項
    let item = dragItems[i]; // 取得第 i 個選項物件
    if (item === draggingItem) continue; // 如果這個選項正在被拖曳，先跳過，留到最後再畫才會在最上層
    drawDragItem(item, false); // 呼叫繪製選項的函式（第二個參數 false 代表沒有被放大拖曳）
  } // 選項繪製迴圈結束

  if (draggingItem !== null) { // 如果目前有選項正在被滑鼠拖曳
    drawDragItem(draggingItem, true); // 最後才畫出正在拖曳的選項，確保它浮在所有圖層的最上方
  } // 拖曳中選項繪製結束

  // --- 繪製交卷 / 再玩一次按鈕 ---
  let isHoverBtn = mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH; // 判斷滑鼠是否停留在按鈕上
  if (!isSubmitted) { // 如果還沒交卷
    fill(isHoverBtn ? color(255, 165, 0) : color(255, 140, 0)); // 滑鼠移過去時變亮橘色，平時為深橘色
  } else { // 如果已經交卷
    fill(isHoverBtn ? color(80, 190, 100) : color(60, 170, 80)); // 滑鼠移過去時變亮綠色，平時為翠綠色
  } // 按鈕顏色設定結束
  stroke(255); // 按鈕加上白色外框
  strokeWeight(3); // 外框粗細為 3
  rect(btnX, btnY, btnW, btnH, 25); // 畫出圓角膠囊狀的按鈕

  fill(255); // 設定按鈕文字為白色
  noStroke(); // 文字無外框
  textSize(min(btnH * 0.5, 24)); // 設定按鈕文字大小
  text(!isSubmitted ? "📝 交卷看成績" : "🔄 再玩一次", btnX + btnW / 2, btnY + btnH / 2); // 顯示對應的按鈕文字

  // --- 當成績高於 60% 時，更新並繪製彩帶特效 ---
  if (isSubmitted && score >= 60) { // 如果已經交卷，而且分數大於或等於 60%
    updateAndDrawConfetti(); // 呼叫更新並畫出滿天彩帶的函式
  } // 彩帶條件判斷結束
} // draw 函式結束

// ==================== 繪製單一拖曳選項函式 ====================
function drawDragItem(item, isDragging) { // 用來畫出文字選項方塊的函式
  push(); // 儲存目前的繪圖設定狀態
  translate(item.x, item.y); // 將繪圖原點移動到該選項的中心點座標
  if (isDragging) { // 如果這個選項正在被滑鼠拖曳中
    scale(1.1); // 將選項稍微放大 1.1 倍，給予幼童明顯的視覺回饋
    fill(255, 235, 150); // 拖曳時變成亮黃色
  } else { // 如果是靜止狀態
    fill(255, 248, 220); // 平時為柔和的米黃色
  } // 顏色設定結束

  stroke(240, 170, 70); // 設定選項邊框為橘黃色
  strokeWeight(2); // 邊框粗細為 2
  rectMode(CENTER); // 設定矩形以中心點為基準來繪製
  rect(0, 0, item.w, item.h, 10); // 在原點畫出選項的圓角矩形

  fill(80, 50, 20); // 設定選項內的文字為深咖啡色，對比清楚
  noStroke(); // 文字無外框
  textAlign(CENTER, CENTER); // 文字水平與垂直置中
  textSize(min(item.h * 0.55, 22)); // 根據方塊高度設定文字大小
  textStyle(BOLD); // 設定為粗體字
  text(item.text, 0, 0); // 在方塊中央印出天氣名稱

  // 如果已經交卷，且這個選項放在錯的位置，在旁邊幫幼童標示正確答案或打勾打叉
  if (isSubmitted && item.placedZone !== null) { // 如果已交卷且有被放置在框框內
    let isCorrect = (item.text === item.placedZone.type); // 判斷是否答對
    textSize(min(item.h * 0.5, 20)); // 設定勾勾或叉叉的大小
    text(isCorrect ? "✅" : "❌", item.w / 2 - 14, 0); // 在選項右側印出綠色勾勾或紅色叉叉
  } // 對錯圖示繪製結束
  pop(); // 恢復先前的繪圖設定狀態
} // drawDragItem 函式結束

// ==================== 內建動態天氣繪圖函式（替代 GIF 的動畫效果） ====================
function drawAnimatedWeather(type, cx, cy, size) { // 根據天氣類型畫出動態圖案的函式
  push(); // 儲存目前的繪圖狀態
  translate(cx, cy); // 將畫布原點移動到圖片顯示區的中心
  let s = size / 100; // 計算縮放比例，讓我們可以用 100x100 的基準來畫圖
  scale(s); // 套用縮放比例
  noStroke(); // 預設不使用外框線

  if (type === '晴天') { // 如果是晴天，畫一顆會旋轉發光的太陽
    push(); // 儲存狀態準備旋轉光芒
    rotate(frameCount * 0.02); // 根據影格數持續旋轉座標系
    stroke(255, 180, 0); // 設定光芒顏色為橘黃色
    strokeWeight(6); // 設定光芒粗細
    for (let i = 0; i < 8; i++) { // 用迴圈畫出 8 道太陽光芒
      line(0, -32, 0, -45); // 畫出一條向外延伸的光芒線段
      rotate(PI / 4); // 每次旋轉 45 度（PI/4 弳度）
    } // 光芒迴圈結束
    pop(); // 恢復未旋轉的狀態
    fill(255, 210, 0); // 設定太陽本體為亮黃色
    circle(0, 0, 50); // 在中心畫出太陽的圓形本體
    fill(80, 40, 0); // 設定眼睛與嘴巴的顏色
    circle(-10, -5, 5); // 畫左眼
    circle(10, -5, 5); // 畫右眼
    noFill(); // 嘴巴不填色
    stroke(80, 40, 0); // 設定嘴巴線條顏色
    strokeWeight(3); // 設定嘴巴線條粗細
    arc(0, 2, 16, 12, 0, PI); // 畫出微笑的弧線

  } else if (type === '雨天') { // 如果是雨天，畫烏雲和不斷落下的雨滴
    stroke(70, 150, 255); // 設定雨滴顏色為水藍色
    strokeWeight(4); // 設定雨滴粗細
    for (let i = -20; i <= 20; i += 20) { // 畫三排落下的雨滴
      let dropY = (frameCount * 2 + i * 7) % 35; // 利用取餘數讓雨滴 Y 座標不斷往下循環移動
      line(i, 5 + dropY, i - 3, 15 + dropY); // 畫出微斜的雨滴線段
    } // 雨滴迴圈結束
    noStroke(); // 雲朵不需要外框
    fill(150, 175, 200); // 設定雨雲為藍灰色
    let bob = sin(frameCount * 0.05) * 3; // 利用正弦波計算雲朵上下輕微浮動的偏移量
    circle(-18, -8 + bob, 32); // 畫雲朵左邊的圓
    circle(18, -8 + bob, 32); // 畫雲朵右邊的圓
    circle(0, -18 + bob, 40); // 畫雲朵中間較高的圓
    rectMode(CENTER); // 設定矩形以中心繪製
    rect(0, -2 + bob, 36, 20); // 將雲朵底部填平

  } else if (type === '陰天') { // 如果是陰天，畫兩朵互相交錯飄動的雲
    let shift = sin(frameCount * 0.04) * 8; // 計算左右來回飄移的距離
    fill(170, 180, 190); // 設定後層雲朵為較深的灰色
    circle(-10 - shift * 0.5, -12, 35); // 畫後層雲朵左圓
    circle(15 - shift * 0.5, -10, 30); // 畫後層雲朵右圓
    fill(220, 225, 235); // 設定前層雲朵為較亮的淺灰色
    circle(-18 + shift, 5, 32); // 畫前層雲朵左圓
    circle(18 + shift, 5, 32); // 畫前層雲朵右圓
    circle(0 + shift, -5, 42); // 畫前層雲朵中圓
    rectMode(CENTER); // 設定矩形以中心繪製
    rect(0 + shift, 11, 36, 20); // 填平前層雲朵底部

  } else if (type === '下雪') { // 如果是下雪，畫烏雲與旋轉飄落的雪花
    let bob = sin(frameCount * 0.05) * 2; // 計算雲朵微幅浮動
    fill(180, 200, 220); // 設定雪雲為淺藍灰色
    circle(-18, -12 + bob, 30); // 畫雪雲左圓
    circle(18, -12 + bob, 30); // 畫雪雲右圓
    circle(0, -20 + bob, 38); // 畫雪雲中圓
    rectMode(CENTER); // 矩形置中模式
    rect(0, -6 + bob, 36, 18); // 填平雪雲底部
    fill(255); // 設定雪花為純白色
    stroke(255); // 設定雪花線條為純白色
    strokeWeight(2); // 雪花線條粗細
    for (let i = -20; i <= 20; i += 20) { // 畫三朵落下的雪花
      let snowY = (frameCount * 1.2 + (i + 30) * 5) % 35; // 計算雪花緩慢落下的循環位置
      let snowX = i + sin(frameCount * 0.05 + i) * 4; // 讓雪花落下時會左右輕微搖擺
      circle(snowX, 8 + snowY, 7); // 畫出圓形小雪球
    } // 雪花迴圈結束

  } else if (type === '打雷') { // 如果是打雷，畫深色烏雲與閃爍的黃色閃電
    if (frameCount % 30 < 18) { // 讓閃電每 30 影格顯示 18 影格，產生一閃一閃的動畫效果
      fill(255, 230, 0); // 設定閃電為亮黃色
      beginShape(); // 開始繪製不規則多邊形（閃電形狀）
      vertex(2, -2); // 閃電上方起點
      vertex(-12, 18); // 往左下折
      vertex(-2, 18); // 往右平折
      vertex(-8, 38); // 往左下尖端延伸
      vertex(14, 12); // 往右上折回
      vertex(3, 12); // 往左內縮
      endShape(CLOSE); // 封閉多邊形完成閃電繪製
    } // 閃電閃爍判斷結束
    fill(90, 100, 120); // 設定雷雨雲為深暗灰色
    let shake = random(-1, 1); // 產生微小的隨機震動效果
    circle(-18 + shake, -10, 32); // 畫雷雲左圓
    circle(18 + shake, -10, 32); // 畫雷雲右圓
    circle(0 + shake, -20, 40); // 畫雷雲中圓
    rectMode(CENTER); // 矩形置中
    rect(0 + shake, -4, 36, 20); // 填平雷雲底部

  } else if (type === '彩虹') { // 如果是彩虹，畫出七彩彎曲拱門與晃動的小雲朵
    noFill(); // 彩虹圓弧內部不填色
    strokeWeight(5); // 設定每一道彩虹的線條粗細
    let colors = [ // 定義彩虹的紅、橙、黃、綠、藍、紫六種顏色陣列
      color(255, 70, 70), // 紅色
      color(255, 150, 50), // 橙色
      color(255, 225, 50), // 黃色
      color(80, 210, 90), // 綠色
      color(70, 160, 255), // 藍色
      color(170, 100, 255) // 紫色
    ]; // 顏色陣列結束
    let pulse = sin(frameCount * 0.06) * 3; // 讓彩虹有輕微呼吸放大的動態感
    for (let i = 0; i < colors.length; i++) { // 用迴圈由外而內畫出 6 道彩虹圓弧
      stroke(colors[i]); // 設定目前這道圓弧的顏色
      let d = 76 - i * 9 + pulse; // 計算這道圓弧的直徑
      arc(0, 18, d, d, PI, TWO_PI); // 畫出上半圓弧（從 PI 到 TWO_PI）
    } // 彩虹迴圈結束
    noStroke(); // 雲朵無外框
    fill(255); // 設定彩虹腳下的雲朵為純白色
    circle(-26, 18, 22); // 左邊的雲朵左圓
    circle(-16, 20, 18); // 左邊的雲朵右圓
    circle(26, 18, 22); // 右邊的雲朵右圓
    circle(16, 20, 18); // 右邊的雲朵左圓
  } // 天氣類型判斷結束
  pop(); // 恢復先前的繪圖狀態
} // drawAnimatedWeather 函式結束

// ==================== 滑鼠按下事件（支援觸控） ====================
function mousePressed() { // 當滑鼠按下（或手指觸控螢幕）時執行
  // 1. 先檢查是否點擊了底部的「交卷 / 再玩一次」按鈕
  if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) { // 如果點擊位置在按鈕範圍內
    if (!isSubmitted) { // 如果目前還沒交卷
      checkScore(); // 呼叫計算成績的函式
    } else { // 如果已經交卷了（按鈕顯示為「再玩一次」）
      initQuiz(); // 呼叫初始化函式重新開始測驗
    } // 交卷狀態判斷結束
    return false; // 結束函式並防止瀏覽器預設行為
  } // 按鈕點擊檢查結束

  // 2. 如果已經交卷了，就不允許再拖曳選項
  if (isSubmitted) return false; // 已交卷則直接結束函式

  // 3. 檢查是否點擊到了某個可拖曳的文字選項（由後往前檢查，優先抓取最上層的）
  for (let i = dragItems.length - 1; i >= 0; i--) { // 用迴圈檢查每一個拖曳選項
    let item = dragItems[i]; // 取得第 i 個選項
    if (mouseX > item.x - item.w / 2 && mouseX < item.x + item.w / 2 && // 判斷滑鼠 X 是否在選項寬度範圍內
        mouseY > item.y - item.h / 2 && mouseY < item.y + item.h / 2) { // 判斷滑鼠 Y 是否在選項高度範圍內
      draggingItem = item; // 將這個選項設定為「正在拖曳中」的物件
      offsetX = item.x - mouseX; // 記錄選項中心與滑鼠的 X 距離差，讓拖曳時不會突兀跳動
      offsetY = item.y - mouseY; // 記錄選項中心與滑鼠的 Y 距離差

      if (item.placedZone !== null) { // 如果這個選項原本已經放在某個圖片下方的框框裡
        item.placedZone.currentItem = null; // 把該框框的紀錄清空（代表被拿出來了）
        item.placedZone = null; // 把選項自己的放置區紀錄也清空
      } // 清除放置紀錄結束
      break; // 找到一個選項後就跳出迴圈，避免同時抓起兩個
    } // 點擊範圍判斷結束
  } // 選項檢查迴圈結束
  return false; // 防止手機觸控滑動時整個網頁跟著捲動
} // mousePressed 函式結束

// ==================== 滑鼠拖曳事件 ====================
function mouseDragged() { // 當滑鼠按住並移動時持續執行
  if (draggingItem !== null) { // 如果目前手上有抓著一個選項
    draggingItem.x = mouseX + offsetX; // 更新選項的 X 座標跟著滑鼠移動
    draggingItem.y = mouseY + offsetY; // 更新選項的 Y 座標跟著滑鼠移動
  } // 拖曳更新結束
  return false; // 防止觸控螢幕捲動網頁
} // mouseDragged 函式結束

// ==================== 滑鼠放開事件 ====================
function mouseReleased() { // 當滑鼠按鍵放開（或手指離開螢幕）時執行
  if (draggingItem !== null) { // 如果剛剛正在拖曳某個選項
    let placed = false; // 用來記錄這次放開是否有成功放進某個框框裡

    for (let i = 0; i < dropZones.length; i++) { // 檢查上方的 6 個圖片放置區
      let z = dropZones[i]; // 取得第 i 個放置區
      // 擴大一點點感應範圍（上下左右各加 10 像素），讓幼童更容易放進去
      if (draggingItem.x > z.boxX - 10 && draggingItem.x < z.boxX + z.boxW + 10 && // 檢查選項中心 X 是否進入放置框
          draggingItem.y > z.boxY - 10 && draggingItem.y < z.boxY + z.boxH + 10) { // 檢查選項中心 Y 是否進入放置框

        if (z.currentItem !== null) { // 如果這個框框裡面原本已經有別的選項了
          let oldItem = z.currentItem; // 取得原本在裡面的舊選項
          oldItem.x = oldItem.homeX; // 把舊選項彈回下方等待區的原位 X
          oldItem.y = oldItem.homeY; // 把舊選項彈回下方等待區的原位 Y
          oldItem.placedZone = null; // 清除舊選項的放置區紀錄
        } // 替換舊選項處理結束

        z.currentItem = draggingItem; // 將新拖進來的選項登記到這個放置框中
        draggingItem.placedZone = z; // 讓選項自己也記住目前在哪個放置框裡
        draggingItem.x = z.boxX + z.boxW / 2; // 自動將選項吸附對齊到放置框的正中央 X
        draggingItem.y = z.boxY + z.boxH / 2; // 自動將選項吸附對齊到放置框的正中央 Y
        placed = true; // 標記為已成功放置
        break; // 已經放進框框了，跳出檢查迴圈
      } // 放置框範圍檢查結束
    } // 放置區迴圈結束

    if (!placed) { // 如果放開滑鼠時，沒有對準任何一個上方的放置框
      draggingItem.x = draggingItem.homeX; // 將選項自動彈回下方等待區的原位 X
      draggingItem.y = draggingItem.homeY; // 將選項自動彈回下方等待區的原位 Y
      draggingItem.placedZone = null; // 確保放置紀錄為空
    } // 未成功放置處理結束

    draggingItem = null; // 清空「正在拖曳中」的變數，完成這次拖曳動作
  } // 拖曳結束處理完畢
  return false; // 防止預設行為
} // mouseReleased 函式結束

// ==================== 計算成績與觸發彩帶函式 ====================
function checkScore() { // 當按下「交卷看成績」時執行的計分函式
  isSubmitted = true; // 將狀態改為「已交卷」
  let correctCount = 0; // 用來累計答對的題數，初始為 0

  for (let i = 0; i < dropZones.length; i++) { // 逐一檢查 6 個放置區的答案
    let z = dropZones[i]; // 取得第 i 個放置區
    if (z.currentItem !== null && z.currentItem.text === z.type) { // 如果裡面有放選項，且文字等於該圖片的天氣類型
      correctCount++; // 答對題數加 1
    } // 答對判斷結束
  } // 檢查迴圈結束

  score = round((correctCount / 6) * 100); // 計算得分百分比並四捨五入為整數（例如答對 4 題為 67%）

  if (score >= 60) { // 如果成績高於或等於 60%（6 題中答對 4 題以上）
    createConfetti(); // 呼叫建立彩帶粒子的函式，準備放彩帶慶祝！
  } // 及格彩帶判斷結束
} // checkScore 函式結束

// ==================== 建立彩帶粒子函式 ====================
function createConfetti() { // 產生滿天彩帶物件的函式
  confetti = []; // 先清空彩帶陣列
  let confettiColors = [ // 定義鮮豔的彩帶顏色陣列
    color(255, 80, 100), // 桃紅色
    color(255, 210, 50), // 亮黃色
    color(80, 220, 120), // 翠綠色
    color(60, 180, 255), // 天藍色
    color(190, 100, 255), // 粉紫色
    color(255, 140, 50) // 亮橘色
  ]; // 顏色定義結束

  for (let i = 0; i < 150; i++) { // 用迴圈一次產生 150 片彩帶
    confetti.push({ // 將新的彩帶物件加入陣列中
      x: random(width), // 隨機分布在畫面的任意 X 座標
      y: random(-height, 0), // 初始 Y 座標設在畫面頂端之外，讓它們由上往下掉入畫面
      w: random(8, 16), // 隨機設定彩帶片的寬度
      h: random(6, 12), // 隨機設定彩帶片的高度
      vx: random(-2, 2), // 隨機設定水平飄移的速度
      vy: random(3, 7), // 隨機設定垂直落下的速度
      col: random(confettiColors), // 從顏色陣列中隨機挑選一種鮮豔顏色
      angle: random(TWO_PI), // 隨機設定初始旋轉角度
      spin: random(-0.15, 0.15) // 隨機設定翻轉旋轉的速度
    }); // 彩帶物件設定結束
  } // 產生彩帶迴圈結束
} // createConfetti 函式結束

// ==================== 更新與繪製彩帶特效函式 ====================
function updateAndDrawConfetti() { // 在每個影格移動並畫出彩帶的函式
  for (let i = 0; i < confetti.length; i++) { // 用迴圈處理每一片彩帶
    let c = confetti[i]; // 取得第 i 片彩帶物件
    c.x += c.vx + sin(frameCount * 0.05 + i) * 0.8; // 更新 X 座標，加上正弦波讓彩帶有左右搖曳飄落的效果
    c.y += c.vy; // 更新 Y 座標，讓彩帶持續往下掉
    c.angle += c.spin; // 更新彩帶的旋轉角度

    if (c.y > height + 20) { // 如果彩帶已經掉出畫面底部之外
      c.y = random(-50, -10); // 將它重新移回畫面頂端上方，形成源源不絕的彩帶雨
      c.x = random(width); // 重新給予隨機的水平 X 座標
    } // 邊界循環判斷結束

    push(); // 儲存繪圖狀態
    translate(c.x, c.y); // 將原點移動到這片彩帶的位置
    rotate(c.angle); // 旋轉這片彩帶
    fill(c.col); // 設定這片彩帶的專屬顏色
    noStroke(); // 彩帶不需要邊框
    rectMode(CENTER); // 以中心點繪製矩形
    rect(0, 0, c.w, c.h, 2); // 畫出小矩形代表彩帶片
    pop(); // 恢復繪圖狀態
  } // 彩帶迴圈結束
} // updateAndDrawConfetti 函式結束