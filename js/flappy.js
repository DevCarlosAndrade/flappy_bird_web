(() => {
'use strict';

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */
const LARGURA = 360, ALTURA_CHAO = 92;            // largura lógica fixa; a altura se adapta ao aparelho
const LARGURA_CANO = 56, LARGURA_CAPA = 68, ALTURA_CAPA = 24, RAIO_ELIPSE = 5; // cano, capa e elipse 3D da boca
const POS_X_PASSARO = 104, RAIO_PASSARO = 11;     // posição horizontal e raio de colisão do pássaro
const PASSO_FISICO = 1 / 120;                     // física em passo fixo (igual em 60/90/120 Hz)

const NIVEIS = {
  facil:   { nome:'Fácil',   tema:'amanhecer',  vao:180, velocidade:112, velocidadeMax:112, aceleracao:0,   gravidade:1250, pulo:-378, espacamento:215, probMovel:0,   amplitude:0,  frequencia:0,   probMorcego:0,   probEspinho:0,   intervaloFogo:0 },
  // NORMAL = versão clássica: sem inimigos, canos fixos, velocidade constante
  normal:  { nome:'Normal',  tema:'dia',        vao:150, velocidade:135, velocidadeMax:135, aceleracao:0,   gravidade:1400, pulo:-400, espacamento:200, probMovel:0,   amplitude:0,  frequencia:0,   probMorcego:0,   probEspinho:0,   intervaloFogo:0 },
  dificil: { nome:'Difícil', tema:'entardecer', vao:144, velocidade:150, velocidadeMax:185, aceleracao:1.2, gravidade:1450, pulo:-405, espacamento:210, probMovel:.5,  amplitude:38, frequencia:1.5, probMorcego:.6,  probEspinho:0,   intervaloFogo:0 },
  insano:  { nome:'Insano',  tema:'noite',      vao:134, velocidade:165, velocidadeMax:215, aceleracao:1.5, gravidade:1500, pulo:-410, espacamento:220, probMovel:.75, amplitude:52, frequencia:2.0, probMorcego:.35, probEspinho:.45, intervaloFogo:3.4 }
};

const TEMAS = {
  amanhecer:{chave:'amanhecer',ceu:['#ff9fb2','#ffc9a3','#fff0c9'],estrelas:false,
    sol:{x:260,fracaoY:.74,raio:34,cor1:'#fff6c8',cor2:'#ffd27a',brilho:'rgba(255,220,160,.6)'},
    montanhasLonge:['#b7d9a8','#8cc79a'],montanhasPerto:['#7cc68a','#56ad75'],cidade:'#d7a8c9',arbusto:'#5fb36f',
    probJanelaAcesa:1,corJanela:'rgba(255,255,255,.28)',corJanelaApagada:'',nuvem:'rgba(255,255,255,.8)',
    bordaChao:'#a5e05a',bordaChaoEscura:'#8cc83f',terra:'#ecdca3',terra2:'#e0cf90',cano:['#3f8f2a','#78d44a','#c4ff9a','#1d4a14']},
  dia:{chave:'dia',ceu:['#4ec0ca','#8ad8de','#c8f0ec'],estrelas:false,sol:null,
    montanhasLonge:['#9bd8a8','#7cc88c'],montanhasPerto:['#6cc070','#4aa65a'],cidade:'#9fd8d0',arbusto:'#4aa650',
    probJanelaAcesa:1,corJanela:'rgba(255,255,255,.3)',corJanelaApagada:'',nuvem:'rgba(255,255,255,.9)',
    bordaChao:'#9be04f',bordaChaoEscura:'#85c93c',terra:'#ded895',terra2:'#d2cb86',cano:['#4a8a1d','#73bf2e','#b4f06a','#25440f']},
  entardecer:{chave:'entardecer',ceu:['#2b1f5c','#9b3f7a','#ff7e5f','#ffc27a'],estrelas:false,
    sol:{x:240,fracaoY:.8,raio:48,cor1:'#fff1b8',cor2:'#ff9a3c',brilho:'rgba(255,140,80,.6)'},
    montanhasLonge:['#6a3070','#4b2260'],montanhasPerto:['#47204f','#2f153c'],cidade:'#2d1740',arbusto:'#2a1536',
    probJanelaAcesa:.25,corJanela:'#ffcf6b',corJanelaApagada:'rgba(255,255,255,.04)',nuvem:'rgba(255,150,120,.5)',
    bordaChao:'#c9b043',bordaChaoEscura:'#b19a33',terra:'#8b5a3c',terra2:'#7b4c31',cano:['#7a2f10','#d9702a','#ffbe6b','#3a1408']},
  noite:{chave:'noite',ceu:['#04050d','#14123a','#3b1a55'],estrelas:true,
    sol:{x:268,fracaoY:.2,raio:26,cor1:'#ffffff',cor2:'#ffd0d0',brilho:'rgba(255,120,150,.35)'},
    montanhasLonge:['#241446','#160b30'],montanhasPerto:['#170b2c','#0e061c'],cidade:'#0c0718',arbusto:'#0a0614',
    probJanelaAcesa:.3,corJanela:'#ffd966',corJanelaApagada:'rgba(255,255,255,.04)',nuvem:'rgba(110,70,160,.28)',
    bordaChao:'#5a4a9a',bordaChaoEscura:'#4a3b86',terra:'#2a1a40',terra2:'#21142f',cano:['#2a0f55','#6b30b8','#c08bff','#12062a']}
};
const CONTORNO = '#3a2d2f';

/* ---------- Tela "Sobre": frases do dev ---------- */
const FRASES_DO_DEV = [
  'Ai! Não cutuca o dev! 😠',
  'Dica profissional: o cano NÃO é seu amigo.',
  'Esse pássaro tem 3 neurônios. Você tem mais. Teoricamente.',
  'Se você bateu no cano, foi lag. Sempre foi lag.',
  'Funciona na minha máquina! 🤷',
  'Fun fact: o modo Insano foi testado por ninguém. Boa sorte!',
  'A IA ajudou, mas a culpa dos bugs é 100% minha.',
  'Respira fundo e tenta de novo. Eu confio em você (um pouquinho). 💪'
];

/* =========================================================
   UTILIDADES
   ========================================================= */
const porId = id => document.getElementById(id);
const limitar = (valor,min,max) => valor<min?min:valor>max?max:valor;
const aleatorio = (min,max) => min + Math.random()*(max-min);
const criarGeradorAleatorio = semente => () => (semente = semente*16807 % 2147483647) / 2147483647;
const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const armazenamento = {
  ler(chave,padrao){try{const v=localStorage.getItem(chave);return v===null?padrao:v}catch(e){return padrao}},
  gravar(chave,valor){try{localStorage.setItem(chave,valor)}catch(e){}}
};

const telaCanvas = porId('canvasJogo'), contexto = telaCanvas.getContext('2d',{alpha:false});
const palco = porId('palco'), giro = porId('giro'), interfaceJogo = porId('interface');
const elPlacar = porId('placar'), elEtiqueta = porId('etiqueta'), elContagem = porId('contagem');
const telas = [...document.querySelectorAll('.tela')];

/* =========================================================
   ÁUDIO (WebAudio, sem arquivos externos)
   ========================================================= */
let audioCtx = null, mudo = armazenamento.ler('f3d_mudo','0')==='1';
let musicaMuda = armazenamento.ler('f3d_musica_mudo','0')==='1';
function tocarSom(freqInicial,freqFinal,duracao,tipo='square',volume=.12,atraso=0){
  if(mudo) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    const inicio = audioCtx.currentTime+atraso, oscilador = audioCtx.createOscillator(), ganho = audioCtx.createGain();
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(freqInicial,inicio);
    oscilador.frequency.exponentialRampToValueAtTime(Math.max(20,freqFinal),inicio+duracao);
    ganho.gain.setValueAtTime(volume,inicio);
    ganho.gain.exponentialRampToValueAtTime(.001,inicio+duracao);
    oscilador.connect(ganho); ganho.connect(audioCtx.destination);
    oscilador.start(inicio); oscilador.stop(inicio+duracao+.02);
  }catch(e){}
}
const efeitosSonoros = {
  baterAsas:()=>tocarSom(420,700,.1,'triangle',.18),
  ponto:()=>{tocarSom(880,880,.08,'square',.07);tocarSom(1320,1320,.12,'square',.07,.08)},
  colisao:()=>tocarSom(220,40,.35,'sawtooth',.2),
  bolaDeFogo:()=>tocarSom(300,90,.4,'sawtooth',.08),
  clique:()=>tocarSom(600,800,.06,'square',.07),
  acenar:()=>{tocarSom(500,900,.08,'triangle',.14);tocarSom(700,1200,.1,'triangle',.14,.09);tocarSom(900,1500,.12,'triangle',.14,.19)}
};

/* ---------- Música de fundo (uma faixa por nível, em volume baixo para não cobrir os efeitos) ---------- */
const VOLUME_MUSICA = .25;
const musica = new Audio(); musica.loop = true; musica.volume = VOLUME_MUSICA; musica.preload = 'auto';
let faixaMusica = '';       // faixa da partida atual ('' = parada)
function tocarMusica(){     // inicia a faixa do nível; se ela já estiver tocando, continua de onde está
  if(musicaMuda) return;
  const faixa = 'music/flappy_'+chaveNivel+'.mp3';
  if(faixa!==faixaMusica){faixaMusica=faixa;musica.src=faixa;}
  if(musica.paused) musica.play().catch(()=>{});
}
function pararMusica(){
  musica.pause(); faixaMusica=''; musica.removeAttribute('src'); musica.load();
}

/* =========================================================
   ESTADO DO JOGO
   ========================================================= */
let altura=0, yChao=0, escalaSprites=2, fatorX=1, fatorY=1, chaveConstruida='';
let estado = 'menu';        // menu | pronto | jogando | morto | pausado
let chaveNivel='normal', nivel=NIVEIS.normal, tema=TEMAS.dia;
let pontos=0, velocidade=135, rolagem=0, relogio=0, tempoJogo=0, tempoCongelado=0, tempoMorte=0, tremor=0, clarao=0, tempoProxFogo=0;
let novoRecorde=false, fimExibido=false, ocupado=false, inclinacaoX=0, inclinacaoY=0, ultimaContagem=0;
const recordes = {}; Object.keys(NIVEIS).forEach(k=>recordes[k]=+armazenamento.ler('f3d_recorde_'+k,0)||0);
const passaro = {x:LARGURA/2, y:0, yBase:0, velY:0, rotacao:0, esmagamento:1, cicloAsa:0};
const canos=[], inimigos=[], avisos=[], particulas=[];
const sprites = {};         // sprites pré-renderizados
let cacheFundo = {};

/* =========================================================
   SPRITES PRÉ-RENDERIZADOS (otimização: nada de gradiente por frame)
   ========================================================= */
function criarSprite(largura,alt,desenhar){
  const c = document.createElement('canvas');
  c.width = Math.ceil(largura*escalaSprites); c.height = Math.ceil(alt*escalaSprites);
  const g = c.getContext('2d'); g.scale(escalaSprites,escalaSprites); desenhar(g);
  c.larguraLogica = largura; c.alturaLogica = alt; return c;
}

function spriteDoPassaro(posicaoAsa){ return criarSprite(48,36,g=>{
  g.translate(24,18); g.strokeStyle='#533846'; g.lineWidth=1.8;
  const corpo = g.createRadialGradient(-5,-7,2,0,0,18);
  corpo.addColorStop(0,'#fffbb0'); corpo.addColorStop(.45,'#f8d62b'); corpo.addColorStop(1,'#d9961a');
  g.fillStyle=corpo; g.beginPath(); g.ellipse(0,0,16,13,0,0,7); g.fill(); g.stroke();
  g.fillStyle='rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(2,6,10,4.5,0,0,7); g.fill();
  g.save(); g.translate(-4,3); g.rotate([.65,0,-.6][posicaoAsa]);
  const asa = g.createLinearGradient(0,-5,0,6); asa.addColorStop(0,'#fff'); asa.addColorStop(1,'#d9d9c2');
  g.fillStyle=asa; g.lineWidth=1.5; g.beginPath(); g.ellipse(-6,0,9,5.2,0,0,7); g.fill(); g.stroke(); g.restore();
  g.lineWidth=1.3; g.fillStyle='#fff'; g.beginPath(); g.arc(8,-5,5.3,0,7); g.fill(); g.stroke();
  g.fillStyle='#111'; g.beginPath(); g.arc(10,-5,2.3,0,7); g.fill();
  g.lineWidth=1.4; g.fillStyle='#f55b1e'; g.beginPath(); g.ellipse(15,2.5,8,3.6,0,0,7); g.fill(); g.stroke();
  g.fillStyle='#e03a1a'; g.beginPath(); g.ellipse(13.5,7.5,6,3,0,0,7); g.fill(); g.stroke();
});}

function spriteDoMorcego(quadro){ return criarSprite(56,44,g=>{
  g.translate(28,24); g.fillStyle='#2a1838'; g.strokeStyle='#0d0614'; g.lineWidth=1.5;
  const alturaAsa = quadro===0 ? -14 : 10;
  for(const lado of [-1,1]){
    g.beginPath(); g.moveTo(lado*5,-2);
    g.quadraticCurveTo(lado*14,alturaAsa-8,lado*25,alturaAsa);
    g.quadraticCurveTo(lado*21,alturaAsa+8,lado*18,alturaAsa+6);
    g.quadraticCurveTo(lado*14,alturaAsa+13,lado*10,alturaAsa+8);
    g.quadraticCurveTo(lado*8,alturaAsa+11,lado*5,9);
    g.closePath(); g.fill(); g.stroke();
  }
  const corpo = g.createRadialGradient(-2,-2,1,0,2,11); corpo.addColorStop(0,'#5a3a78'); corpo.addColorStop(1,'#1d0f2a');
  g.fillStyle=corpo; g.beginPath(); g.ellipse(0,2,8,10,0,0,7); g.fill(); g.stroke();
  g.fillStyle='#2a1838'; g.beginPath(); g.moveTo(-7,-6);g.lineTo(-5,-15);g.lineTo(-1,-8);g.closePath();g.fill();g.stroke();
  g.beginPath(); g.moveTo(7,-6);g.lineTo(5,-15);g.lineTo(1,-8);g.closePath();g.fill();g.stroke();
  g.fillStyle='#ff3b3b'; g.shadowColor='#ff3b3b'; g.shadowBlur=4;
  g.beginPath(); g.arc(-3.2,-2,2,0,7); g.fill(); g.beginPath(); g.arc(3.2,-2,2,0,7); g.fill(); g.shadowBlur=0;
  g.fillStyle='#fff'; g.beginPath(); g.moveTo(-3,6);g.lineTo(-1.8,10);g.lineTo(-.6,6);g.fill(); g.beginPath(); g.moveTo(.6,6);g.lineTo(1.8,10);g.lineTo(3,6);g.fill();
});}

function spriteDoEspinho(){ return criarSprite(44,44,g=>{
  g.translate(22,22); g.strokeStyle='#14161b'; g.lineWidth=1.3;
  for(let i=0;i<8;i++){ g.save(); g.rotate(i*Math.PI/4);
    g.fillStyle='#c9ced6'; g.beginPath(); g.moveTo(8,-4.5); g.lineTo(19,0); g.lineTo(8,4.5); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  const esfera = g.createRadialGradient(-3,-3,1,0,0,12); esfera.addColorStop(0,'#aab0bc'); esfera.addColorStop(1,'#262a33');
  g.fillStyle=esfera; g.beginPath(); g.arc(0,0,11,0,7); g.fill(); g.stroke();
  g.fillStyle='#ff4d4d'; g.shadowColor='#ff4d4d'; g.shadowBlur=6; g.beginPath(); g.arc(0,0,3,0,7); g.fill();
});}

function spriteDaBolaDeFogo(){ return criarSprite(72,36,g=>{
  const cauda = g.createLinearGradient(20,0,70,0); cauda.addColorStop(0,'rgba(255,140,20,.95)'); cauda.addColorStop(1,'rgba(255,60,0,0)');
  g.fillStyle=cauda; g.beginPath(); g.moveTo(20,6); g.quadraticCurveTo(46,10,70,18); g.quadraticCurveTo(46,26,20,30); g.closePath(); g.fill();
  const brilho = g.createRadialGradient(20,18,2,20,18,18); brilho.addColorStop(0,'rgba(255,200,80,.6)'); brilho.addColorStop(1,'rgba(255,80,0,0)');
  g.fillStyle=brilho; g.beginPath(); g.arc(20,18,18,0,7); g.fill();
  const cabeca = g.createRadialGradient(18,18,1,20,18,11); cabeca.addColorStop(0,'#fff'); cabeca.addColorStop(.4,'#ffe066'); cabeca.addColorStop(1,'#ff6a00');
  g.fillStyle=cabeca; g.beginPath(); g.arc(20,18,11,0,7); g.fill();
});}

function construirSpritesDosCanos(){
  const [escuro,medio,claro,buraco] = tema.cano;
  const gradienteCilindrico = (g,largura)=>{
    const grad = g.createLinearGradient(0,0,largura,0);
    grad.addColorStop(0,escuro); grad.addColorStop(.1,medio); grad.addColorStop(.3,claro); grad.addColorStop(.55,medio); grad.addColorStop(1,escuro);
    return grad;
  };
  sprites.corpoCano = criarSprite(LARGURA_CANO,4,g=>{
    g.fillStyle=gradienteCilindrico(g,LARGURA_CANO); g.fillRect(0,0,LARGURA_CANO,4);
    g.fillStyle=CONTORNO; g.fillRect(0,0,1.6,4); g.fillRect(LARGURA_CANO-1.6,0,1.6,4);
  });
  sprites.capaCano = criarSprite(LARGURA_CAPA,ALTURA_CAPA+RAIO_ELIPSE,g=>{
    g.fillStyle=gradienteCilindrico(g,LARGURA_CAPA); g.fillRect(0,RAIO_ELIPSE,LARGURA_CAPA,ALTURA_CAPA);
    g.strokeStyle=CONTORNO; g.lineWidth=1.6; g.strokeRect(.8,RAIO_ELIPSE,LARGURA_CAPA-1.6,ALTURA_CAPA);
    g.fillStyle=claro; g.beginPath(); g.ellipse(LARGURA_CAPA/2,RAIO_ELIPSE,LARGURA_CAPA/2-.8,RAIO_ELIPSE,0,0,7); g.fill(); g.stroke();
    g.fillStyle=buraco; g.beginPath(); g.ellipse(LARGURA_CAPA/2,RAIO_ELIPSE,LARGURA_CAPA/2-6,RAIO_ELIPSE-1.8,0,0,7); g.fill();
  });
}

function construirSprites(){
  sprites.passaro = [0,1,2].map(spriteDoPassaro);
  sprites.morcego = [0,1].map(spriteDoMorcego);
  sprites.espinho = spriteDoEspinho();
  sprites.bolaDeFogo = spriteDaBolaDeFogo();
  sprites.sombraChao = criarSprite(LARGURA,ALTURA_CHAO,g=>{
    const grad = g.createLinearGradient(0,0,0,ALTURA_CHAO);
    grad.addColorStop(0,'rgba(0,0,0,0)'); grad.addColorStop(16/ALTURA_CHAO,'rgba(0,0,0,.3)');
    grad.addColorStop(30/ALTURA_CHAO,'rgba(0,0,0,.05)'); grad.addColorStop(1,'rgba(0,0,0,.3)');
    g.fillStyle=grad; g.fillRect(0,0,LARGURA,ALTURA_CHAO);
  });
  cacheFundo = {}; construirSpritesDosCanos();
}

/* ---------- Cenários em camadas (parallax) ---------- */
function camadaMontanhas(cor1,cor2,base,amplitude,k1,k2,k3,fase){
  const alturaCamada = base+amplitude+8;
  return criarSprite(LARGURA,alturaCamada,g=>{
    const grad = g.createLinearGradient(0,0,0,alturaCamada); grad.addColorStop(0,cor1); grad.addColorStop(1,cor2);
    g.fillStyle=grad; g.beginPath(); g.moveTo(0,alturaCamada);
    for(let x=0;x<=LARGURA;x+=4){
      const t = x/LARGURA*Math.PI*2;
      g.lineTo(x,alturaCamada-(base+amplitude*(Math.sin(t*k1+fase)*.6+Math.sin(t*k2+fase*2)*.3+Math.sin(t*k3+fase*3)*.1)));
    }
    g.lineTo(LARGURA,alturaCamada); g.closePath(); g.fill();
  });
}
function camadaCidade(){
  const alturaCamada = 124;
  return criarSprite(LARGURA,alturaCamada,g=>{
    const aleat = criarGeradorAleatorio(777); let x = 0; const predios = [];
    while(x<LARGURA){
      let largura = 26+Math.floor(aleat()*26);
      if(LARGURA-x-largura<26) largura = LARGURA-x;
      predios.push({x,largura,altura:44+Math.floor(aleat()*68)}); x+=largura;
    }
    for(const predio of predios){
      const topo = alturaCamada-predio.altura;
      g.fillStyle=tema.cidade; g.fillRect(predio.x,topo,predio.largura,predio.altura);
      g.fillStyle='rgba(255,255,255,.1)'; g.fillRect(predio.x,topo,3,predio.altura);
      g.fillStyle='rgba(0,0,0,.12)'; g.fillRect(predio.x+predio.largura-3,topo,3,predio.altura);
      for(let wy=topo+8;wy<alturaCamada-18;wy+=11) for(let wx=predio.x+6;wx<predio.x+predio.largura-6;wx+=9){
        g.fillStyle = aleat()<tema.probJanelaAcesa ? tema.corJanela : tema.corJanelaApagada;
        g.fillRect(wx,wy,4,5);
      }
    }
    g.fillStyle=tema.arbusto; for(let bx=0;bx<LARGURA;bx+=15){g.beginPath();g.arc(bx+7,alturaCamada-3,10,0,7);g.fill();}
  });
}
function camadaNuvens(quantidade,escala,semente){
  return criarSprite(LARGURA,170,g=>{
    const aleat = criarGeradorAleatorio(semente);
    for(let i=0;i<quantidade;i++){
      const cx = (i+aleat()*.8)/quantidade*LARGURA, cy = 24+aleat()*110, tamanho = escala*(.8+aleat()*.6);
      for(const deslocamento of [-LARGURA,0,LARGURA]){
        const x = cx+deslocamento;
        g.fillStyle='rgba(0,0,0,.06)'; desenharNuvem(g,x,cy+4,tamanho);
        g.fillStyle=tema.nuvem; desenharNuvem(g,x,cy,tamanho);
      }
    }
  });
}
function desenharNuvem(g,x,y,t){
  g.beginPath(); g.arc(x,y,17*t,0,7); g.arc(x+19*t,y+5*t,13*t,0,7); g.arc(x-19*t,y+6*t,12*t,0,7); g.arc(x+6*t,y-8*t,13*t,0,7);
  g.rect(x-26*t,y+4*t,52*t,10*t); g.fill();
}
function construirFundo(){
  const aleat = criarGeradorAleatorio(12345);
  const ceu = criarSprite(LARGURA,altura,g=>{
    const grad = g.createLinearGradient(0,0,0,yChao);
    tema.ceu.forEach((cor,i)=>grad.addColorStop(i/(tema.ceu.length-1),cor));
    g.fillStyle=grad; g.fillRect(0,0,LARGURA,altura);
    if(tema.estrelas){
      g.fillStyle='#fff';
      for(let i=0;i<90;i++){g.globalAlpha=.25+aleat()*.75;const t=aleat()*1.6+.4;g.fillRect(aleat()*LARGURA,aleat()*yChao*.75,t,t);}
      g.globalAlpha=1;
    }
    if(tema.sol){
      const sol = tema.sol, sy = yChao*sol.fracaoY;
      const aura = g.createRadialGradient(sol.x,sy,sol.raio*.3,sol.x,sy,sol.raio*3);
      aura.addColorStop(0,sol.brilho); aura.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=aura; g.fillRect(0,0,LARGURA,yChao);
      const disco = g.createRadialGradient(sol.x-sol.raio*.3,sy-sol.raio*.3,1,sol.x,sy,sol.raio);
      disco.addColorStop(0,sol.cor1); disco.addColorStop(1,sol.cor2);
      g.fillStyle=disco; g.beginPath(); g.arc(sol.x,sy,sol.raio,0,7); g.fill();
      if(tema.estrelas){ // crateras da lua
        g.fillStyle='rgba(120,60,90,.18)';
        [[-8,-6,6],[7,4,4],[-2,10,3]].forEach(c=>{g.beginPath();g.arc(sol.x+c[0],sy+c[1],c[2],0,7);g.fill();});
      }
    }
  });
  return {
    ceu,
    nuvensLonge: camadaNuvens(4,.75,11),
    nuvensPerto: camadaNuvens(3,1.15,29),
    montanhasLonge: camadaMontanhas(tema.montanhasLonge[0],tema.montanhasLonge[1],90,40,1,2,5,1),
    montanhasPerto: camadaMontanhas(tema.montanhasPerto[0],tema.montanhasPerto[1],58,28,2,3,7,2),
    cidade: camadaCidade()
  };
}
const obterFundo = () => cacheFundo[tema.chave] || (cacheFundo[tema.chave]=construirFundo());

/* =========================================================
   LAYOUT RESPONSIVO
   ========================================================= */
function ajustarLayout(){
  const larguraJanela = innerWidth, alturaJanela = innerHeight;
  const alturaDesejada = Math.round(limitar(LARGURA*alturaJanela/larguraJanela,560,780)/4)*4;
  if(!altura || estado==='menu' || estado==='pronto') altura = alturaDesejada;   // nunca muda a altura no meio da partida
  yChao = altura-ALTURA_CHAO;
  const proporcao = Math.min(larguraJanela/LARGURA,alturaJanela/altura), larguraPalco = LARGURA*proporcao, alturaPalco = altura*proporcao;
  palco.style.width = larguraPalco+'px'; palco.style.height = alturaPalco+'px'; palco.style.fontSize = (proporcao*10)+'px';
  palco.style.borderRadius = (Math.abs(larguraPalco-larguraJanela)<3&&Math.abs(alturaPalco-alturaJanela)<3)?'0':'1.2em';
  const dpr = Math.min(window.devicePixelRatio||1,2.5);
  const pixelsL = Math.round(larguraPalco*dpr), pixelsA = Math.round(alturaPalco*dpr);
  if(telaCanvas.width!==pixelsL||telaCanvas.height!==pixelsA){telaCanvas.width=pixelsL;telaCanvas.height=pixelsA;}
  fatorX = pixelsL/LARGURA; fatorY = pixelsA/altura;
  const novaEscala = limitar(Math.ceil(proporcao*dpr),1,3), chave = altura+'|'+novaEscala;
  if(chave!==chaveConstruida){escalaSprites=novaEscala;chaveConstruida=chave;construirSprites();}
  if(estado==='menu'||estado==='pronto'){passaro.yBase = altura*(estado==='menu'?.46:.42);}
}

/* =========================================================
   TELAS / FLUXO
   ========================================================= */
function mostrarTela(id){telas.forEach(t=>t.classList.toggle('ativa',t.id===id));}
function definirNivel(chave){
  chaveNivel = chave; nivel = NIVEIS[chave]; tema = TEMAS[nivel.tema]; construirSpritesDosCanos();
  elEtiqueta.textContent = nivel.nome;
}
function limparMundo(){canos.length=inimigos.length=avisos.length=particulas.length=0;}
function reiniciarJogo(){
  ajustarLayout(); limparMundo();
  pontos=0; velocidade=nivel.velocidade; tempoJogo=0; tempoCongelado=0; tempoMorte=0; fimExibido=false; novoRecorde=false;
  tempoProxFogo = nivel.intervaloFogo ? nivel.intervaloFogo : 0;
  elPlacar.textContent='0'; elContagem.classList.remove('visivel');
  estado='pronto'; passaro.yBase=altura*.42; passaro.y=passaro.yBase; passaro.velY=0; passaro.rotacao=0; passaro.esmagamento=1;
  mostrarTela('telaPronto'); interfaceJogo.classList.add('ligada');
}
function irParaMenu(paraNiveis){
  estado='menu'; pararMusica(); limparMundo(); ajustarLayout(); interfaceJogo.classList.remove('ligada'); elContagem.classList.remove('visivel');
  passaro.velY=0; passaro.rotacao=0; mostrarTela(paraNiveis?'telaNiveis':'telaMenu'); atualizarRecordes();
}
/* Transição 3D: o palco gira de lado e troca o conteúdo enquanto está "de perfil" */
function transicao(aoMeio){
  if(ocupado) return; ocupado=true;
  giro.classList.remove('girar','abertura','impacto'); void giro.offsetWidth; giro.classList.add('girar');
  setTimeout(aoMeio,430);
  setTimeout(()=>{giro.classList.remove('girar');ocupado=false;},880);
}
function atualizarRecordes(){
  document.querySelectorAll('[data-recorde]').forEach(e=>e.textContent=recordes[e.dataset.recorde]);
}
function medalhaPara(p){return p>=40?'platina':p>=30?'ouro':p>=20?'prata':p>=10?'bronze':'';}
function mostrarFimDeJogo(){
  fimExibido=true; interfaceJogo.classList.remove('ligada');
  porId('fimPontos').textContent=pontos; porId('fimRecorde').textContent=recordes[chaveNivel];
  porId('fimNovo').style.display = novoRecorde?'inline-block':'none';
  porId('fimNivel').textContent = 'Nível: '+nivel.nome;
  const medalha = medalhaPara(pontos), elMedalha = porId('medalha');
  elMedalha.className = 'medalha '+(medalha||'nenhuma'); elMedalha.textContent = medalha?'★':'';
  atualizarRecordes(); mostrarTela('telaFim');
}
function pausar(){
  if(estado!=='jogando'||tempoCongelado>0) return;
  estado='pausado'; musica.pause(); mostrarTela('telaPausa');
}
function retomar(){
  if(estado!=='pausado') return;
  estado='jogando'; tocarMusica(); tempoCongelado=1.5; ultimaContagem=0; mostrarTela(null);
}

/* =========================================================
   TELA SOBRE (desenvolvedor)
   ========================================================= */
const cartaoDev = porId('cartaoDev'), molduraDev = porId('molduraDev'), elFalaDev = porId('falaDev'), telaSobre = porId('telaSobre');
const textoOriginalDev = elFalaDev.innerHTML, fotoDev = porId('fotoDev');
const FOTO_DEV = 'img/catatau.png', FOTO_DEV_BRAVO = 'img/catatau_angry.png';
new Image().src = FOTO_DEV_BRAVO; // pré-carrega para a troca ser instantânea
let indiceFrase = 0;

function animarFala(){
  elFalaDev.classList.remove('troca'); void elFalaDev.offsetWidth; elFalaDev.classList.add('troca');
}
function abrirSobre(){
  indiceFrase = 0; elFalaDev.innerHTML = textoOriginalDev; elFalaDev.classList.remove('troca');
  fotoDev.src = FOTO_DEV;
  soltarCartao(); mostrarTela('telaSobre');
}
function cutucarDev(e){
  e.stopPropagation();
  molduraDev.classList.remove('acena'); void molduraDev.offsetWidth;
  if(!reduzirMovimento) molduraDev.classList.add('acena');
  efeitosSonoros.acenar();
  fotoDev.src = FOTO_DEV_BRAVO;
  elFalaDev.textContent = FRASES_DO_DEV[indiceFrase];
  indiceFrase = (indiceFrase+1) % FRASES_DO_DEV.length;
  animarFala();
}
function inclinarCartao(e){ // o cartão acompanha o dedo/mouse em 3D
  if(reduzirMovimento) return;
  const r = telaSobre.getBoundingClientRect();
  const nx = ((e.clientX-r.left)/r.width-.5)*2, ny = ((e.clientY-r.top)/r.height-.5)*2;
  cartaoDev.classList.remove('solto');
  cartaoDev.style.setProperty('--ry',(nx*14).toFixed(1)+'deg');
  cartaoDev.style.setProperty('--rx',(-ny*10).toFixed(1)+'deg');
}
function soltarCartao(){
  cartaoDev.classList.add('solto');
  cartaoDev.style.setProperty('--rx','0deg'); cartaoDev.style.setProperty('--ry','0deg');
}

/* =========================================================
   JOGO
   ========================================================= */
function entradaDoJogador(){
  if(estado==='pronto'){estado='jogando';mostrarTela(null);criarCano(380,true);tocarMusica();baterAsas();}
  else if(estado==='jogando'&&tempoCongelado<=0) baterAsas();
}
function baterAsas(){
  passaro.velY = nivel.pulo; passaro.esmagamento = .84; efeitosSonoros.baterAsas();
  soltarParticulas(passaro.x-12,passaro.y+6,5,'rgba(255,255,255,.85)',70,.45,2.6,260);
}
function soltarParticulas(x,y,quantidade,cor,velocidadeInicial,vida,tamanho,gravidade){
  for(let i=0;i<quantidade&&particulas.length<160;i++)
    particulas.push({
      x,y,
      velX:(Math.random()-.7)*velocidadeInicial,
      velY:(Math.random()-.2)*velocidadeInicial*.6,
      vida,vidaMax:vida,
      tamanho:tamanho*(.6+Math.random()*.8),
      cor,gravidade:gravidade||0
    });
}

function criarCano(x,primeiro){
  const movel = !primeiro && Math.random()<nivel.probMovel, amplitude = movel?nivel.amplitude:0;
  const limiteSuperior = 48+nivel.vao/2+amplitude, limiteInferior = yChao-48-nivel.vao/2-amplitude;
  const anterior = canos[canos.length-1];
  let centroBase;
  if(!anterior) centroBase = (limiteSuperior+limiteInferior)/2+aleatorio(-30,30);
  else centroBase = limitar(anterior.centroBase+aleatorio(-nivel.vao*.9,nivel.vao*.9),limiteSuperior,limiteInferior);
  const cano = {x,centroBase,vao:nivel.vao,amplitude,frequencia:nivel.frequencia||0,fase:Math.random()*6.28,passou:false};
  if(anterior){ // obstáculos extras entre o cano anterior e este
    const meioX = x-nivel.espacamento/2;
    const meioY = limitar((anterior.centroBase+centroBase)/2+aleatorio(-40,40),70,yChao-70);
    const sorteio = Math.random();
    if(sorteio<nivel.probMorcego)
      inimigos.push({tipo:'morcego',x:meioX,yBase:meioY,tempo:0,fase:aleatorio(0,6),amplitude:aleatorio(35,60),frequencia:aleatorio(2,3.2)});
    else if(sorteio<nivel.probMorcego+nivel.probEspinho)
      inimigos.push({tipo:'espinho',x:meioX,y:meioY,angulo:aleatorio(0,6),velAngular:(Math.random()<.5?-1:1)*aleatorio(2.2,3),raio:40});
  }
  canos.push(cano);
}
const yDoCano = cano => cano.amplitude ? cano.centroBase+Math.sin(tempoJogo*cano.frequencia+cano.fase)*cano.amplitude : cano.centroBase;
const yDoMorcego = morcego => morcego.yBase+Math.sin(morcego.tempo*morcego.frequencia+morcego.fase)*morcego.amplitude;

function colideCirculoRetangulo(cx,cy,raio,rx,ry,largura,alt){
  const proxX = limitar(cx,rx,rx+largura), proxY = limitar(cy,ry,ry+alt), dx = cx-proxX, dy = cy-proxY;
  return dx*dx+dy*dy<raio*raio;
}
const colideComCirculo = (x,y,raio)=>{
  const dx = passaro.x-x, dy = passaro.y-y, soma = RAIO_PASSARO+raio;
  return dx*dx+dy*dy<soma*soma;
};

function marcarPonto(){
  pontos++; elPlacar.textContent=pontos;
  elPlacar.classList.remove('pulso'); void elPlacar.offsetWidth; elPlacar.classList.add('pulso');
  efeitosSonoros.ponto(); soltarParticulas(passaro.x,passaro.y,8,'#ffe066',160,.6,3,300);
  velocidade = Math.min(nivel.velocidadeMax,nivel.velocidade+pontos*nivel.aceleracao);
}

function morrer(inimigo){
  if(estado!=='jogando') return;
  estado='morto'; tempoMorte=0; efeitosSonoros.colisao(); tremor=reduzirMovimento?3:14; clarao=.8;
  if(navigator.vibrate) try{navigator.vibrate(60)}catch(e){}
  soltarParticulas(passaro.x,passaro.y,18,'#f8d62b',260,.8,3.5,600);
  if(inimigo) passaro.velY=-160; else passaro.velY=Math.max(passaro.velY,-60);
  if(pontos>recordes[chaveNivel]){recordes[chaveNivel]=pontos;novoRecorde=true;armazenamento.gravar('f3d_recorde_'+chaveNivel,pontos);}
  giro.classList.remove('impacto','girar','abertura'); void giro.offsetWidth; if(!reduzirMovimento) giro.classList.add('impacto');
  setTimeout(()=>giro.classList.remove('impacto'),500);
}

function atualizar(dt){
  relogio+=dt;
  passaro.x += ((estado==='menu'?LARGURA/2:POS_X_PASSARO)-passaro.x)*Math.min(1,dt*5);
  passaro.esmagamento += (1-passaro.esmagamento)*Math.min(1,dt*10);
  tremor = Math.max(0,tremor-dt*30); clarao = Math.max(0,clarao-dt*2.5);
  for(let i=particulas.length-1;i>=0;i--){
    const p = particulas[i]; p.vida-=dt;
    if(p.vida<=0){particulas[i]=particulas[particulas.length-1];particulas.pop();continue;}
    p.velY+=p.gravidade*dt; p.x+=p.velX*dt; p.y+=p.velY*dt;
  }

  if(estado==='menu'||estado==='pronto'){
    rolagem += nivel.velocidade*.55*dt;
    const alvoY = altura*(estado==='menu'?.46:.42); passaro.yBase += (alvoY-passaro.yBase)*Math.min(1,dt*4);
    passaro.y = passaro.yBase+Math.sin(relogio*5)*6; passaro.velY=0; passaro.rotacao=Math.sin(relogio*5)*.12; passaro.cicloAsa+=dt*8; return;
  }
  if(estado==='pausado') return;

  if(estado==='morto'){
    tempoMorte+=dt;
    if(passaro.y<yChao-RAIO_PASSARO){
      passaro.velY+=nivel.gravidade*dt; passaro.y+=passaro.velY*dt; passaro.rotacao+=(1.5-passaro.rotacao)*Math.min(1,dt*8);
      if(passaro.y>=yChao-RAIO_PASSARO){passaro.y=yChao-RAIO_PASSARO;passaro.velY=0;tempoMorte=Math.min(tempoMorte,.2);tremor=Math.max(tremor,4);}
    }
    if(!fimExibido&&tempoMorte>.75) mostrarFimDeJogo();
    return;
  }

  /* ---- JOGANDO ---- */
  if(tempoCongelado>0){ // contagem regressiva após retomar
    tempoCongelado-=dt; const numero = Math.ceil(tempoCongelado/.5);
    if(tempoCongelado<=0) elContagem.classList.remove('visivel');
    else if(numero!==ultimaContagem){
      ultimaContagem=numero; elContagem.textContent=numero;
      elContagem.classList.remove('visivel'); void elContagem.offsetWidth; elContagem.classList.add('visivel');
    }
    return;
  }
  tempoJogo+=dt; rolagem+=velocidade*dt; passaro.cicloAsa+=dt*18;
  passaro.velY+=nivel.gravidade*dt; passaro.y+=passaro.velY*dt;
  if(passaro.y<RAIO_PASSARO){passaro.y=RAIO_PASSARO;if(passaro.velY<0)passaro.velY=0;}
  const rotacaoAlvo = passaro.velY<0?-.45:Math.min(1.4,passaro.velY/420);
  passaro.rotacao += (rotacaoAlvo-passaro.rotacao)*Math.min(1,dt*(passaro.velY<0?18:7));
  if(passaro.y+RAIO_PASSARO>=yChao){passaro.y=yChao-RAIO_PASSARO;morrer();return;}

  // canos
  const ultimoCano = canos[canos.length-1], xNovoCano = LARGURA+70+nivel.espacamento/2;
  if(ultimoCano&&ultimoCano.x<=xNovoCano-nivel.espacamento) criarCano(xNovoCano,false);
  for(let i=canos.length-1;i>=0;i--){
    const cano = canos[i]; cano.x-=velocidade*dt;
    if(cano.x<-LARGURA_CANO-30){canos.splice(i,1);continue;}
    if(!cano.passou&&cano.x+LARGURA_CANO/2<passaro.x){cano.passou=true;marcarPonto();}
    if(Math.abs(cano.x+LARGURA_CANO/2-passaro.x)<LARGURA_CANO/2+RAIO_PASSARO+10){
      const centroVao = yDoCano(cano), bordaSuperior = centroVao-cano.vao/2, bordaInferior = centroVao+cano.vao/2;
      if(colideCirculoRetangulo(passaro.x,passaro.y,RAIO_PASSARO,cano.x,-60,LARGURA_CANO,bordaSuperior+60)||
         colideCirculoRetangulo(passaro.x,passaro.y,RAIO_PASSARO,cano.x,bordaInferior,LARGURA_CANO,yChao-bordaInferior)||
         colideCirculoRetangulo(passaro.x,passaro.y,RAIO_PASSARO,cano.x-6,bordaSuperior-ALTURA_CAPA,LARGURA_CAPA,ALTURA_CAPA)||
         colideCirculoRetangulo(passaro.x,passaro.y,RAIO_PASSARO,cano.x-6,bordaInferior,LARGURA_CAPA,ALTURA_CAPA)){morrer();return;}
    }
  }
  // inimigos
  for(let i=inimigos.length-1;i>=0;i--){
    const inimigo = inimigos[i];
    if(inimigo.tipo==='morcego'){
      inimigo.x-=velocidade*dt; inimigo.tempo+=dt;
      if(colideComCirculo(inimigo.x,yDoMorcego(inimigo),12)){morrer(inimigo);return;}
    } else if(inimigo.tipo==='espinho'){
      inimigo.x-=velocidade*dt; inimigo.angulo+=inimigo.velAngular*dt;
      const dx = Math.cos(inimigo.angulo)*inimigo.raio, dy = Math.sin(inimigo.angulo)*inimigo.raio;
      if(colideComCirculo(inimigo.x+dx,inimigo.y+dy,12)||colideComCirculo(inimigo.x-dx,inimigo.y-dy,12)){morrer(inimigo);return;}
    } else { // bola de fogo
      inimigo.x+=inimigo.velX*dt;
      if(colideComCirculo(inimigo.x,inimigo.y,9)){morrer(inimigo);return;}
    }
    if(inimigo.x<-90) inimigos.splice(i,1);
  }
  // bolas de fogo (nível Insano)
  if(nivel.intervaloFogo&&pontos>=2){
    tempoProxFogo-=dt;
    if(tempoProxFogo<=0){
      avisos.push({y:limitar(passaro.y+aleatorio(-80,80),50,yChao-50),tempo:.9});
      tempoProxFogo = nivel.intervaloFogo*aleatorio(.75,1.25);
    }
  }
  for(let i=avisos.length-1;i>=0;i--){
    const aviso = avisos[i]; aviso.tempo-=dt;
    if(aviso.tempo<=0){inimigos.push({tipo:'fogo',x:LARGURA+40,y:aviso.y,velX:-400});efeitosSonoros.bolaDeFogo();avisos.splice(i,1);}
  }
}

/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */
function desenharCamada(imagem,fatorParallax,y){
  const x = -Math.floor((rolagem*fatorParallax)%LARGURA);
  contexto.drawImage(imagem,x,y,LARGURA,imagem.alturaLogica);
  contexto.drawImage(imagem,x+LARGURA,y,LARGURA,imagem.alturaLogica);
}
function desenharChao(){
  const topo = yChao, alturaBorda = 16;
  contexto.fillStyle=tema.terra; contexto.fillRect(-20,topo,LARGURA+40,altura-topo+20);
  // faixas em perspectiva convergindo para o ponto de fuga
  const horizonte = topo-300, yInicio = topo+alturaBorda, fatorPerspectiva = (altura-horizonte)/(yInicio-horizonte);
  const larguraFaixa = 34, deslocamento = rolagem%(larguraFaixa*2);
  contexto.fillStyle=tema.terra2; contexto.beginPath();
  for(let x=-larguraFaixa*4-deslocamento;x<LARGURA+larguraFaixa*4;x+=larguraFaixa*2){
    contexto.moveTo(x,yInicio); contexto.lineTo(x+larguraFaixa,yInicio);
    contexto.lineTo(LARGURA/2+(x+larguraFaixa-LARGURA/2)*fatorPerspectiva,altura+2);
    contexto.lineTo(LARGURA/2+(x-LARGURA/2)*fatorPerspectiva,altura+2); contexto.closePath();
  }
  contexto.fill();
  contexto.fillStyle=tema.bordaChao; contexto.fillRect(-20,topo,LARGURA+40,alturaBorda);
  contexto.fillStyle=tema.bordaChaoEscura; contexto.beginPath();
  const deslocBorda = rolagem%32;
  for(let x=-40-deslocBorda;x<LARGURA+40;x+=32){
    contexto.moveTo(x,topo+2); contexto.lineTo(x+14,topo+2); contexto.lineTo(x+6,topo+alturaBorda-2); contexto.lineTo(x-8,topo+alturaBorda-2); contexto.closePath();
  }
  contexto.fill();
  contexto.fillStyle='rgba(255,255,255,.5)'; contexto.fillRect(-20,topo,LARGURA+40,2);
  contexto.fillStyle='rgba(0,0,0,.25)'; contexto.fillRect(-20,topo+alturaBorda-2,LARGURA+40,2);
  contexto.fillStyle=CONTORNO; contexto.fillRect(-20,topo-1.5,LARGURA+40,1.5);
  contexto.drawImage(sprites.sombraChao,0,topo,LARGURA,ALTURA_CHAO);
}
function desenharCano(cano){
  const centroVao = yDoCano(cano), bordaSuperior = centroVao-cano.vao/2, bordaInferior = centroVao+cano.vao/2;
  contexto.fillStyle='rgba(0,0,0,.14)';
  contexto.fillRect(cano.x+10,-4,LARGURA_CANO,bordaSuperior+4); contexto.fillRect(cano.x+10,bordaInferior,LARGURA_CANO,yChao-bordaInferior);
  contexto.drawImage(sprites.corpoCano,cano.x,-4,LARGURA_CANO,bordaSuperior-ALTURA_CAPA+6);
  contexto.drawImage(sprites.corpoCano,cano.x,bordaInferior+ALTURA_CAPA-2,LARGURA_CANO,yChao-bordaInferior-ALTURA_CAPA+6);
  contexto.drawImage(sprites.capaCano,cano.x-6,bordaInferior-RAIO_ELIPSE,LARGURA_CAPA,ALTURA_CAPA+RAIO_ELIPSE);
  contexto.save(); contexto.translate(cano.x-6,bordaSuperior+RAIO_ELIPSE); contexto.scale(1,-1);
  contexto.drawImage(sprites.capaCano,0,0,LARGURA_CAPA,ALTURA_CAPA+RAIO_ELIPSE); contexto.restore();
  if(cano.amplitude){ // luz pulsante indica cano móvel
    contexto.fillStyle=`rgba(255,230,120,${.6+.4*Math.sin(relogio*8)})`;
    contexto.beginPath();
    contexto.arc(cano.x+LARGURA_CANO/2,bordaInferior+ALTURA_CAPA/2+2,3,0,7);
    contexto.arc(cano.x+LARGURA_CANO/2,bordaSuperior-ALTURA_CAPA/2-2,3,0,7);
    contexto.fill();
  }
}
function desenharInimigo(inimigo){
  if(inimigo.tipo==='morcego'){
    const y = yDoMorcego(inimigo), quadro = Math.floor(relogio*10+inimigo.fase)%2;
    contexto.drawImage(sprites.morcego[quadro],inimigo.x-28,y-24,56,44);
  } else if(inimigo.tipo==='espinho'){
    const dx = Math.cos(inimigo.angulo)*inimigo.raio, dy = Math.sin(inimigo.angulo)*inimigo.raio;
    contexto.strokeStyle='#8c919c'; contexto.lineWidth=3; contexto.beginPath();
    contexto.moveTo(inimigo.x-dx,inimigo.y-dy); contexto.lineTo(inimigo.x+dx,inimigo.y+dy); contexto.stroke();
    contexto.fillStyle='#3a3f4a'; contexto.beginPath(); contexto.arc(inimigo.x,inimigo.y,5,0,7); contexto.fill();
    for(const lado of [1,-1]){
      contexto.save(); contexto.translate(inimigo.x+dx*lado,inimigo.y+dy*lado); contexto.rotate(inimigo.angulo*2);
      contexto.drawImage(sprites.espinho,-22,-22,44,44); contexto.restore();
    }
  } else {
    const escala = 1+Math.sin(relogio*40)*.06;
    contexto.save(); contexto.translate(inimigo.x,inimigo.y); contexto.scale(escala,escala);
    contexto.drawImage(sprites.bolaDeFogo,-20,-18,72,36); contexto.restore();
  }
}
function desenharPassaro(){
  const quadroAsa = [0,1,2,1][Math.floor(passaro.cicloAsa)%4];
  contexto.save(); contexto.translate(passaro.x,passaro.y); contexto.rotate(passaro.rotacao);
  contexto.scale(2-passaro.esmagamento,passaro.esmagamento);
  contexto.drawImage(sprites.passaro[quadroAsa],-24,-18,48,36); contexto.restore();
}

function renderizar(){
  contexto.setTransform(fatorX,0,0,fatorY,0,0);
  if(tremor>.2) contexto.translate((Math.random()-.5)*tremor,(Math.random()-.5)*tremor);
  const fundo = obterFundo(), deslocVertical = (altura/2-passaro.y)*.02;
  contexto.drawImage(fundo.ceu,-12,-12,LARGURA+24,altura+24);
  desenharCamada(fundo.nuvensLonge,.04,14+deslocVertical*.3);
  desenharCamada(fundo.nuvensPerto,.1,50+deslocVertical*.5);
  desenharCamada(fundo.montanhasLonge,.18,yChao-fundo.montanhasLonge.alturaLogica+18+deslocVertical*.5);
  desenharCamada(fundo.montanhasPerto,.32,yChao-fundo.montanhasPerto.alturaLogica+16+deslocVertical*.8);
  desenharCamada(fundo.cidade,.5,yChao-fundo.cidade.alturaLogica+14+deslocVertical*1.1);

  for(const cano of canos) desenharCano(cano);
  for(const inimigo of inimigos) if(inimigo.tipo!=='fogo') desenharInimigo(inimigo);
  desenharChao();
  // oclusão ambiente na base dos canos e sombra do pássaro (profundidade 3D)
  contexto.fillStyle='rgba(0,0,0,.22)';
  for(const cano of canos){contexto.beginPath();contexto.ellipse(cano.x+LARGURA_CANO/2+4,yChao+6,LARGURA_CANO*.62,5,0,0,7);contexto.fill();}
  if(passaro.y<yChao-RAIO_PASSARO){
    const escalaSombra = limitar(1-(yChao-passaro.y)/yChao*.75,.25,1);
    contexto.fillStyle=`rgba(0,0,0,${.3*escalaSombra})`;
    contexto.beginPath(); contexto.ellipse(passaro.x,yChao+8,15*escalaSombra,3.6*escalaSombra,0,0,7); contexto.fill();
  }
  for(const p of particulas){
    contexto.globalAlpha=Math.max(0,p.vida/p.vidaMax); contexto.fillStyle=p.cor;
    contexto.beginPath(); contexto.arc(p.x,p.y,p.tamanho,0,7); contexto.fill();
  }
  contexto.globalAlpha=1;
  desenharPassaro();
  for(const inimigo of inimigos) if(inimigo.tipo==='fogo') desenharInimigo(inimigo);
  for(const aviso of avisos){
    contexto.globalAlpha=.55+.45*Math.sin(relogio*30);
    contexto.fillStyle='#ff3b30'; contexto.strokeStyle='#fff'; contexto.lineWidth=2;
    contexto.beginPath(); contexto.moveTo(LARGURA-8,aviso.y-16); contexto.lineTo(LARGURA-34,aviso.y); contexto.lineTo(LARGURA-8,aviso.y+16);
    contexto.closePath(); contexto.fill(); contexto.stroke();
    contexto.fillStyle='#fff'; contexto.font='900 16px sans-serif'; contexto.textAlign='center'; contexto.textBaseline='middle';
    contexto.fillText('!',LARGURA-17,aviso.y+1);
    contexto.globalAlpha=1;
  }
  if(clarao>0){contexto.fillStyle=`rgba(255,255,255,${clarao})`;contexto.fillRect(-20,-20,LARGURA+40,altura+40);}

  // inclinação 3D suave do palco (câmera)
  if(!reduzirMovimento){
    const alvoX = (estado==='jogando'||estado==='morto')?limitar(-passaro.velY/600,-1,1)*2.2:0;
    inclinacaoX += (alvoX-inclinacaoX)*.08; inclinacaoY = Math.sin(relogio*.6)*1.3*(estado==='jogando'?1:.6);
    palco.style.transform=`perspective(1100px) rotateX(${inclinacaoX.toFixed(2)}deg) rotateY(${inclinacaoY.toFixed(2)}deg)`;
  }
}

/* Laço principal com passo fixo */
let ultimoTempo=0, acumulador=0;
function lacoPrincipal(agora){
  requestAnimationFrame(lacoPrincipal);
  if(!ultimoTempo) ultimoTempo=agora;
  let dt = (agora-ultimoTempo)/1000; ultimoTempo=agora; if(dt>.1) dt=.1;
  acumulador+=dt; let passos=0;
  while(acumulador>=PASSO_FISICO&&passos<8){atualizar(PASSO_FISICO);acumulador-=PASSO_FISICO;passos++;}
  if(passos===8) acumulador=0;
  renderizar();
}



/* =========================================================
   EVENTOS
   ========================================================= */
palco.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')) return;
  e.preventDefault(); entradaDoJogador();
},{passive:false});
addEventListener('keydown',e=>{
  if(e.repeat) return;
  if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();entradaDoJogador();}
  else if(e.code==='KeyP'||e.code==='Escape'){estado==='pausado'?retomar():pausar();}
});
document.addEventListener('click',e=>{const botao=e.target.closest('button');if(botao){efeitosSonoros.clique();botao.blur();}});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){pausar();musica.pause();}
  else if(faixaMusica&&estado!=='pausado') tocarMusica();
});
addEventListener('resize',ajustarLayout);
addEventListener('orientationchange',()=>setTimeout(ajustarLayout,200));
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());

porId('btnJogar').onclick = ()=>mostrarTela('telaNiveis');
porId('btnSobre').onclick = abrirSobre;
porId('btnVoltarSobre').onclick = ()=>mostrarTela('telaMenu');
porId('btnVoltar').onclick = ()=>mostrarTela('telaMenu');
document.querySelectorAll('.cartao').forEach(cartao=>cartao.onclick=()=>{
  const chave = cartao.dataset.nivel; transicao(()=>{definirNivel(chave);reiniciarJogo();});
});
porId('btnPausar').onclick = pausar;
porId('btnContinuar').onclick = retomar;
porId('btnPausaMenu').onclick = ()=>transicao(()=>irParaMenu(false));
porId('btnNovamente').onclick = reiniciarJogo;
porId('btnNiveis').onclick = ()=>transicao(()=>irParaMenu(true));
porId('btnMenu').onclick = ()=>transicao(()=>irParaMenu(false));
function atualizarRotuloSom(){porId('btnSom').textContent = mudo?'🔇 Som: desligado':'🔊 Som: ligado';}
porId('btnSom').onclick = ()=>{mudo=!mudo;armazenamento.gravar('f3d_mudo',mudo?'1':'0');atualizarRotuloSom();};
function atualizarRotuloMusica(){porId('btnMusica').textContent = musicaMuda?'🎵 Música: desligada':'🎵 Música: ligada';}
porId('btnMusica').onclick = ()=>{
  musicaMuda=!musicaMuda; armazenamento.gravar('f3d_musica_mudo',musicaMuda?'1':'0'); atualizarRotuloMusica();
  if(musicaMuda) pararMusica();
};

// Tela Sobre: cutucar o dev, inclinação 3D do cartão e animação da moldura
molduraDev.addEventListener('pointerdown',cutucarDev);
molduraDev.addEventListener('animationend',e=>{if(e.animationName==='acenar') molduraDev.classList.remove('acena');});
telaSobre.addEventListener('pointermove',inclinarCartao);
telaSobre.addEventListener('pointerleave',soltarCartao);
telaSobre.addEventListener('pointerup',soltarCartao);

/* =========================================================
   INÍCIO
   ========================================================= */
definirNivel('normal'); atualizarRotuloSom(); atualizarRotuloMusica(); ajustarLayout(); atualizarRecordes();
passaro.yBase = altura*.46; passaro.y = passaro.yBase;
setTimeout(()=>giro.classList.remove('abertura'),1100);
requestAnimationFrame(lacoPrincipal);
})();
