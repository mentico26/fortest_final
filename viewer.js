let model;
const canvas = document.getElementById('live2dCanvas');
const app = new PIXI.Application({
  view: canvas,
  width: 800,
  height: 600,
  transparent: true,
});

const MODEL_PATH = 'assets/model/Pink Cat/Pink Cat.model3.json';

// モデルの読み込み
PIXI.live2d.Live2DModel.from(MODEL_PATH).then(l2dModel => {
  model = l2dModel;
  model.scale.set(0.4);
  model.position.set(400, 500);

  // Idleモーション再生
  model.motion('Idle', 0);

  app.stage.addChild(model);

  // 機能初期化
  startAutoBlink();
  startBreathing();
  addMouseTracking();
  loadExpressions(['smile', 'angry', 'sad']);  // exp/ にある表情名
});

// 自動まばたき
function startAutoBlink() {
  function blink() {
    if (!model) return;
    model.internalModel.coreModel.setParameterValueById('ParamEyeLOpen', 0);
    model.internalModel.coreModel.setParameterValueById('ParamEyeROpen', 0);

    setTimeout(() => {
      model.internalModel.coreModel.setParameterValueById('ParamEyeLOpen', 1);
      model.internalModel.coreModel.setParameterValueById('ParamEyeROpen', 1);
    }, 150);

    setTimeout(blink, 2000 + Math.random() * 2000);
  }
  blink();
}

// 呼吸アニメーション（ゆったり周期変化）
function startBreathing() {
  let t = 0;
  app.ticker.add(() => {
    if (!model) return;
    const breath = Math.sin(t) * 0.5 + 0.5;
    model.internalModel.coreModel.setParameterValueById('ParamBreath', breath);
    t += 0.05;
  });
}

// マウス追従
function addMouseTracking() {
  document.addEventListener('mousemove', (event) => {
    if (!model) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.width;
    const y = (event.clientY - rect.top) / canvas.height;

    const xRate = (x - 0.5) * 2;
    const yRate = (y - 0.5) * -2;

    model.internalModel.coreModel.setParameterValueById('ParamAngleX', xRate * 30);
    model.internalModel.coreModel.setParameterValueById('ParamAngleY', yRate * 30);
    model.internalModel.coreModel.setParameterValueById('ParamEyeBallX', xRate);
    model.internalModel.coreModel.setParameterValueById('ParamEyeBallY', yRate);
  });
}

// 表情読み込みと切り替えボタン作成
function loadExpressions(names) {
  names.forEach(name => {
    const btn = document.createElement('button');
    btn.innerText = name;
    btn.style.margin = '5px';
    btn.style.padding = '6px 12px';
    btn.onclick = () => {
      fetch(`assets/model/Pink Cat/exp/${name}.exp3.json`)
        .then(res => res.json())
        .then(expData => {
          const expMotion = model.internalModel.motionManager.expressionManager.createExpressionMotion(expData);
          model.internalModel.motionManager.expressionManager.setExpression(expMotion);
        });
    };
    document.body.appendChild(btn);
  });
}
