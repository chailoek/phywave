import GUI from 'lil_gui';
import katex from 'katex';
const sin = math.sin, cos = math.cos, pi = math.pi
const round = math.round, exp = math.exp, sqrt = math.sqrt
const pow = math.pow
const canv = document.getElementById("myCanvas");


class Tranfromable {
    canv;
  constructor(canv) {
    this.canv = canv;
    this.width = canv.width;
    this.height = canv.height;
    this.pixPmet = 1000;
    this.vertics =  [];
    let ctx = canv.getContext("2d");
    // ctx.globalCompositeOperation = "destination-over";
  }
  chOrigin (x,y) {
    let translationMatrix = [[1, 0, 0],
                             [0, 1, 0],
                             [x, y, 1]];
    this.vertics = math.multiply(this.vertics, translationMatrix)
  }
  scale (x,y) {
    let scaleMtrix = [[x, 0, 0],
                      [0, y, 0],
                      [0, 0, 1]];
    this.vertics = math.multiply(this.vertics, scaleMtrix)
  }
  rotate (ang) {
    let rotationMatrix = [
      [cos(ang), sin(ang), 0],
      [-sin(ang), cos(ang),  0],
      [0,        0,         1]];
    this.vertics = math.multiply(this.vertics, rotationMatrix)
  }
  trans2Canvas (vertics) {
    let translationMatrix = [[1, 0, 0],
                             [0, 1, 0],
                             [this.x, this.y, 1]];
    let scaleMtrix = [[this.pixPmet, 0, 0],
                      [0, -this.pixPmet, 0],
                      [0, 0, 1]];

    let translationMatrix2 = [[1, 0, 0],
                             [0, 1, 0],
                             [this.width/2, this.height/2, 1]];
    let vertics2 = math.multiply(vertics, translationMatrix);
    vertics2 = math.multiply(vertics2, scaleMtrix)
    vertics2 = math.multiply(vertics2, translationMatrix2)
    return vertics2
  }
}

class Spring extends Tranfromable {
  vertics = []; x; y; _length; angle

  constructor(l, nCoil, size, x, y, angle, canv) {
    super(canv);
    this.minLength = 1e-2; // cm
    this._length = l;
    this.x = x;
    this.y = y;
    let pitch = l/(nCoil*2);
    this.angle = angle;
    let j = -1;
    for (let i = 0; i <= (nCoil*2); i++) {
      j *= -1; let y = size*j ; let x = i*pitch
      this.vertics.push([x,y,1]);
    }
    this.chOrigin(-l/2,0)
    this.rotate(this.angle)
  }
  get length () {
    return this._length;
  }
  set length (l) {
      if (l >= this.minLength) {
        let scale = l/this._length;
        this._length = l;
        this.rotate(-this.angle)
        this.scale(scale,1)
        this.rotate(this.angle)
      }
  }
  render() {
    let vertics2 = this.trans2Canvas(this.vertics);
    let ctx = this.canv.getContext("2d");
    ctx.beginPath();
    for (let i = 0; i < vertics2.length - 1; i++) {
      let x1 = vertics2[i][0];
      let x2 = vertics2[i + 1][0];
      let y1 = vertics2[i][1];
      let y2 = vertics2[i + 1][1];
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke(); // Render the path

  }
}

class Mass extends Tranfromable {
  vertics = []; mass; x; y;
  constructor(mass, x, y, canv) {
    super(canv)
    this.mass = mass;
    this.x = x;
    this.y = y;
    this.vertics.push([0,0,1])
  }
  render() {
    let vertics2 = this.trans2Canvas(this.vertics);
    let x = vertics2[0][0]
    let y = vertics2[0][1]
    let ctx = this.canv.getContext("2d");
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 8, 0, 0, 2 *pi);
    ctx.fill();
  }

}

class Text extends Tranfromable {
  x; y; text;
  constructor (text, x,y, canv) {
    super(canv)
    this.x = x;
    this.y = y;
    this.vertics.push([0,0,1]);
    this.text = text;
  }
  render() {
    let vertics2 = this.trans2Canvas(this.vertics);
    let x = vertics2[0][0];
    let y = vertics2[0][1];
    let ctx = this.canv.getContext("2d");
    ctx.font = "18px Arial";
    ctx.fillText(this.text, x, y);
  }
}
class MassSpringV {
  l; k; m; x; y; spring; mass; label; offset;
  constructor(name, l, k, m, x, y, offset) {
    this.l = l; this.k = k; this.m = m;
    this.x = x; this.y = y; this.offset = offset;
    this.spring  = new Spring(l, 20, 0.5e-2, x,0, pi/2, canv)
    this.spring.chOrigin(0, -l/2)
    this.spring.y = l + offset;
    this.mass = new Mass(1, x, offset , canv);
    this.label = new Text(name, x - 0.5e-2, l + offset + 1e-2, canv)
    this.render()
  }
  update(y) {
    this.mass.y = this.offset + y
    this.spring.length  = this.l - y;
    // this.spring.y = (this.l  + y)/2;
  }
  render() {
    this.label.render();
    this.spring.render();
    this.mass.render();
  }
}
function ktx2Str(katexString) {
  return katex.renderToString(katexString,{ throwOnError: false})
}


;(() => {
  let precision = 3;

  const elemToggle = document.getElementById("spcToggle");
  const timeLable = document.getElementById("time");
  const infoA = document.getElementById("infoA");
  const infoB = document.getElementById("infoB");
  function updateInfo (infoDiv, oscType, omega0, gammaDiv2, omega) {
    let aOrb = "A"
    let Q = 0.0
    if(infoDiv.id == "infoB") {
      aOrb = "B"
    }
    if (oscType == "UnDamped" || oscType == "UnderDamped") {
      if (oscType == "UnDamped") {
        infoDiv.innerHTML = ktx2Str(`
        ${aOrb} : ${oscType} \\\\
        \\omega_0 = ${omega0} , \\frac{\\gamma}{2} = ${gammaDiv2} \\\\
        \\omega = ${omega} , Q = \\infty
      `)
        
      } else {
        let Q = round((pow(omega,2) + pow(omega0,2))/(4*gammaDiv2), precision)
        infoDiv.innerHTML = ktx2Str(`
          ${aOrb} : ${oscType} \\\\
          \\omega_0 = ${omega0} , \\frac{\\gamma}{2} = ${gammaDiv2}  \\\\
          \\omega = ${omega} , Q = ${Q}
        `)
      }
    } else {
      infoDiv.innerHTML = ktx2Str(`
        ${aOrb} : ${oscType} \\\\
        \\omega_0 = ${omega0} , \\frac{\\gamma}{2} = ${gammaDiv2}  \\\\
        \\omega = ${omega}
      `)
    }
  }
  function getAmpAndOmega(omega0, gammaDiv2, y0, v0) {
    let omega, A1, A2, oscType;    
    if (gammaDiv2 == 0) {
      omega = omega0;
      A1 = y0; A2 = v0/omega0;
      oscType = "UnDamped"
    } else  if (omega0 > gammaDiv2 && gammaDiv2 != 0) {
      omega = sqrt(pow(omega0,2) - pow(gammaDiv2,2))
      A1 = y0;
      A2 = (v0 + (gammaDiv2)*y0)/omega;
      oscType = "UnderDamped";
    } else if (omega0 == gammaDiv2) {
      omega = 0;
      A1 = y0;
      A2 = v0 + gammaDiv2*y0;
      oscType = "CriticalDamped";
    } else if (omega0 < gammaDiv2 && gammaDiv2 != 0) {
      omega = sqrt(pow(gammaDiv2,2) - pow(omega0,2));
      A2 = (v0 + (gammaDiv2 + omega)*y0)/(2*omega);
      A1 = y0 - A2;
      oscType = "OverDamped";
    }
    
    return [round(A1,precision), 
            round(A2,precision), 
            round(omega,precision), 
            oscType]
  }
  
  function spcToggle(){    
    let spcStr = elemToggle.innerText;
    switch (spcStr) {
      case "Start":
        pause = false;
        elemToggle.innerText = "Pause";
        break;

      case "Pause":
        pause = true;
        elemToggle.innerText = "Continue";
        break;

      case "Continue":
        pause = false;
        elemToggle.innerText = "Pause";
        break;

      default:
        break;
    }
  };
  function reset(){    
    pause = true;
    yA = paraA.y0*1e-2;
    yB = paraB.y0*1e-2;
    t = 0;
    elemToggle.innerText = "Start";
    timeLable.innerText = "t = " + round(t, precision).toFixed(precision) + " s";
  };

  const paraAB = {
    k: 9.0,
    m: 1.0
  };
  const paraA = {
    y0: 10,
    v0: 0,
    b:  .1
  };
  const paraB = {
    y0: 10,
    v0: 0,
    b:  .2
  };
  let t = 0.0;
  let preTime = 0.0;
  let pause = true;

  let l= 20e-2, offset = 10e-2;
  
  let yA = paraA.y0*1e-2;
  let yB = paraB.y0*1e-2;
  let omega0 = round(sqrt(paraAB.k/paraAB.m),precision);  

  let gammaADiv2 = round((paraA.b/paraAB.m)/2, precision);  
  let gammaBDiv2 = round((paraB.b/paraAB.m)/2, precision); 
  let [AA1, AA2, omegaA, oscTypeA] = getAmpAndOmega(omega0, gammaADiv2, paraA.y0*1e-2, paraA.v0);
  let [BA1, BA2, omegaB, oscTypeB] = getAmpAndOmega(omega0, gammaBDiv2, paraB.y0*1e-2, paraB.v0);
  timeLable.innerText = "t = " + round(t, precision).toFixed(precision) + " s";
  updateInfo(infoA, oscTypeA, omega0, gammaADiv2, omegaA);
  updateInfo(infoB, oscTypeB, omega0, gammaBDiv2, omegaB);
  console.log(oscTypeA, oscTypeB);

  let mass_springV1 = new MassSpringV("A",l,1,1,-4e-2,0,offset);
  let mass_springV2 = new MassSpringV("B",l,1,1,4e-2,0,offset);
  const gui = new GUI({
    container: document.getElementById( 'gui' ),
    touchStyles: false });
  
  gui.add(paraAB, 'k').name(ktx2Str("k \\quad N/m"));
  gui.add(paraAB, 'm').name(ktx2Str("m \\quad kg"));

  let ctrlA = gui.addFolder("A");
  ctrlA.add(paraA, 'y0').name(ktx2Str("y_0 \\quad cm"));
  ctrlA.add(paraA, 'v0').name(ktx2Str("v_0 \\quad m/s"));
  ctrlA.add(paraA, 'b').name(ktx2Str("b \\quad Ns/m"));
  let ctrlB = gui.addFolder("B");
  ctrlB.add(paraB, 'y0').name(ktx2Str("y_0 \\quad cm"))
  ctrlB.add(paraB, 'v0').name(ktx2Str("v_0 \\quad m/s"))
  ctrlB.add(paraB, 'b').name(ktx2Str("b \\quad Ns/m"))
  document.getElementById("spcToggle").onclick = spcToggle;
  document.getElementById("reset").onclick = reset;
  gui.onChange( (e) => { 
    pause = true;    
    elemToggle.innerText = "Start"
    
    omega0 = round(sqrt(paraAB.k/paraAB.m),precision);  
    gammaADiv2 = round((paraA.b/paraAB.m)/2, precision);  
    gammaBDiv2 = round((paraB.b/paraAB.m)/2, precision);
    
    yA = paraA.y0*1e-2;
    yB = paraB.y0*1e-2;
    [AA1, AA2, omegaA, oscTypeA] = getAmpAndOmega(omega0, gammaADiv2, paraA.y0*1e-2, paraA.v0);
    [BA1, BA2, omegaB, oscTypeB] = getAmpAndOmega(omega0, gammaBDiv2, paraB.y0*1e-2, paraB.v0);    
    updateInfo(infoA, oscTypeA, omega0, gammaADiv2, omegaA);
    updateInfo(infoB, oscTypeB, omega0, gammaBDiv2, omegaB);

    t = 0;
    timeLable.innerText = "t = " + round(t, precision).toFixed(precision) + " s";
  })
  main();

  function main() {
    requestAnimationFrame(main);
    let deltaTime = performance.now() - preTime;
    let ctx = canv.getContext("2d");
    ctx.clearRect(0, 0, 400, 1000);

    if (!pause) {
      switch (oscTypeA) {
        case "UnDamped":
          yA = AA1*cos(omegaA*t) + AA2*sin(omegaA*t);
          break;
        case "UnderDamped":
          yA = exp(-(gammaADiv2)*t)*(AA1*cos(omegaA*t) + AA2*sin(omegaA*t));
          break;
        case "CriticalDamped":
          yA = exp(-(gammaADiv2)*t)*(AA1 + AA2*t);
          break;
        default:
          yA = AA1*exp(-(gammaADiv2 + omegaA)*t) + AA2*exp(-(gammaADiv2 - omegaA)*t)
          break;
      }
      switch (oscTypeB) {
        case "UnDamped":
          yB = BA1*cos(omegaB*t) + BA2*sin(omegaB*t);
          break;
        case "UnderDamped":
          yB = exp(-(gammaBDiv2)*t)*(BA1*cos(omegaB*t) + BA2*sin(omegaB*t));
          break;
        case "CriticalDamped":
          yB = exp(-(gammaBDiv2)*t)*(BA1 + BA2*t);
          break;
        default:
          yB = BA1*exp(-(gammaBDiv2 + omegaB)*t) + BA2*exp(-(gammaBDiv2 - omegaB)*t)
          break;
      }
      
      timeLable.innerText = "t = " + round(t, precision).toFixed(precision) + " s";
      t += deltaTime*1e-3;
    }
    mass_springV1.update(yA)
    mass_springV2.update(yB)
    mass_springV1.render()
    mass_springV2.render()

    preTime = performance.now();
    }
})();