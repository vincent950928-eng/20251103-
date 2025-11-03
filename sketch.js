let questions = [];
let selectedQuestions = [];
let currentQuestion = 0;
let score = 0;
let gameState = 'start';
let table;
let canvasWidth, canvasHeight;

// 在全局變數區域添加新變數
let showAnswer = false;
let answerTimer = 0;
let selectedAnswer = '';

function preload() {
  table = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  // 計算畫布大小
  canvasWidth = windowWidth * 0.8;
  canvasHeight = windowHeight * 0.9;
  
  // 創建畫布並置中
  let canvas = createCanvas(canvasWidth, canvasHeight);
  let x = (windowWidth - canvasWidth) / 2;
  let y = (windowHeight - canvasHeight) / 2;
  canvas.position(x, y);
  
  textAlign(CENTER, CENTER);
  
  // 載入所有題目
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    questions.push({
      question: row.get('問題'),
      options: [row.get('選項A'), row.get('選項B'), row.get('選項C'), row.get('選項D')],
      correct: row.get('正確答案')
    });
  }
  
  // 隨機選擇三題
  let shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  selectedQuestions = shuffled.slice(0, 3);
}

// 新增視窗調整大小處理函數
function windowResized() {
  // 重新計算畫布大小
  canvasWidth = windowWidth * 0.8;
  canvasHeight = windowHeight * 0.9;
  
  resizeCanvas(canvasWidth, canvasHeight);
  // 重新置中畫布
  let x = (windowWidth - canvasWidth) / 2;
  let y = (windowHeight - canvasHeight) / 2;
  let canvas = select('canvas');
  canvas.position(x, y);
}

function draw() {
  background(230);
  
  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'quiz') {
    drawQuizScreen();
  } else if (gameState === 'end') {
    drawEndScreen();
  }
}

function drawQuizScreen() {
  let q = selectedQuestions[currentQuestion];
  
  // 顯示問題
  let questionSize = min(canvasWidth * 0.03, canvasHeight * 0.04);
  textSize(questionSize);
  fill(0);
  text(q.question, width/2, height * 0.2);
  
  if (!showAnswer) {
    // 顯示選項
    let optionSize = min(canvasWidth * 0.025, canvasHeight * 0.033);
    textSize(optionSize);
    for (let i = 0; i < 4; i++) {
      let y = height * (0.4 + i * 0.13);
      if (mouseY > y - height * 0.05 && mouseY < y + height * 0.05 && 
          mouseX > width/2 - width * 0.2 && mouseX < width/2 + width * 0.2) {
        fill(200);
      } else {
        fill(255);
      }
      rect(width/2 - width * 0.2, y - height * 0.05, 
           width * 0.4, height * 0.1, 10);
      fill(0);
      text(q.options[i], width/2, y);
    }
  } else {
    // 顯示答案資訊
    let optionSize = min(canvasWidth * 0.025, canvasHeight * 0.033);
    textSize(optionSize);
    fill(0);
    
    let answerText = `正確答案：${q.correct}. ${q.options[q.correct.charCodeAt(0) - 65]}`;
    text(answerText, width/2, height * 0.4);
    
    if (selectedAnswer === q.correct) {
      fill(0, 150, 0);
      text("答對了！", width/2, height * 0.5);
    } else {
      fill(150, 0, 0);
      text("答錯了！", width/2, height * 0.5);
    }
    
    text("請點擊任意處繼續...", width/2, height * 0.6);
    
    // 更新計時器
    if (millis() - answerTimer > 800) {
      if (mouseIsPressed) {
        showAnswer = false;
        currentQuestion++;
        if (currentQuestion >= selectedQuestions.length) {
          gameState = 'end';
        }
      }
    }
  }
}

function drawStartScreen() {
  let titleSize = min(canvasWidth * 0.04, canvasHeight * 0.05);
  textSize(titleSize);
  fill(0);
  text('點擊開始測驗', width/2, height/2);
}

function drawEndScreen() {
  let titleSize = min(canvasWidth * 0.04, canvasHeight * 0.05);
  textSize(titleSize);
  fill(0);
  text('測驗結束！', width/2, height/3);
  
  let feedback = '';
  if (score === 3) {
    feedback = '太棒了！滿分！';
  } else if (score === 2) {
    feedback = '很好！還可以更好！';
  } else if (score === 1) {
    feedback = '繼續加油！';
  } else {
    feedback = '別灰心，再試一次！';
  }
  
  let scoreSize = min(canvasWidth * 0.03, canvasHeight * 0.04);
  textSize(scoreSize);
  text(`得分：${score}/3`, width/2, height/2);
  text(feedback, width/2, height/2 + height * 0.1);
  
  // 重新開始按鈕
  if (mouseY > height * 0.7 - height * 0.05 && 
      mouseY < height * 0.7 + height * 0.05 && 
      mouseX > width/2 - width * 0.15 && 
      mouseX < width/2 + width * 0.15) {
    fill(200);
  } else {
    fill(255);
  }
  rect(width/2 - width * 0.15, height * 0.7 - height * 0.05, 
       width * 0.3, height * 0.1, 10);
  fill(0);
  text('重新開始', width/2, height * 0.7);
}

function mousePressed() {
  if (gameState === 'start') {
    gameState = 'quiz';
  } else if (gameState === 'quiz' && !showAnswer) {
    let q = selectedQuestions[currentQuestion];
    for (let i = 0; i < 4; i++) {
      let y = height * (0.4 + i * 0.13);
      if (mouseY > y - height * 0.05 && 
          mouseY < y + height * 0.05 && 
          mouseX > width/2 - width * 0.2 && 
          mouseX < width/2 + width * 0.2) {
        selectedAnswer = String.fromCharCode(65 + i);
        if (selectedAnswer === q.correct) {
          score++;
        }
        showAnswer = true;
        answerTimer = millis();
        break;
      }
    }
  } else if (gameState === 'end') {
    if (mouseY > height * 0.7 - height * 0.05 && 
        mouseY < height * 0.7 + height * 0.05 && 
        mouseX > width/2 - width * 0.15 && 
        mouseX < width/2 + width * 0.15) {
      currentQuestion = 0;
      score = 0;
      gameState = 'start';
      let shuffled = [...questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      selectedQuestions = shuffled.slice(0, 3);
    }
  }
}
