import * as THREE from 'three';
import { Object3D } from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';

import GUI from './lib/lil-gui-0.17.js'
import katex from 'katex'; 

let sin = math.sin, cos = math.cos, pi = math.pi, pow = math.pow
let sqrt = math.sqrt, atan2 = math.atan2, round = math.round
let container, stats, clock;
let camera, scene, renderer, labelRenderer;

let grid
let sprModelA, massA
let sprModelB, massB
let mass_springA, mass_springB
let divYAB
let yMax = 3.75
const paramsA = {
    y0: 1,
    v0: 0,
    k: 5.0,
    m: 1.0,
}
const paramsB = {
    y0: 1,
    v0: 0,
    k: 5.0,
    m: 1.0,
}
let omegaA = round(sqrt(paramsA.k/paramsA.m),3)
let omegaB = round(sqrt(paramsB.k/paramsB.m),3)
let ampA , ampB
let phiA, phiB 

class HSpring {
    constructor(l, pitch, scaleY, ctrlPos, color) {
        this.l = l // cm
        let maxVert = math.round(l/pitch)
        let springVert = []
        var springPos = new Float32Array(maxVert * 3);
        switch (ctrlPos) {
            case "center":
            {
                for (let i = 0; i < maxVert; i++) {
                    let x, y
                    x = (-l/2) + i*pitch; y = scaleY*math.pow(-1, i)
                    springVert.push(new THREE.Vector3(x, y , 0),)
                }
                for (var i = 0; i < maxVert; i++) {

                    springPos[i * 3] = springVert[i].x;
                    springPos[i * 3 + 1] = springVert[i].y;
                    springPos[i * 3 + 2] = springVert[i].z;
                }
                const springGeo = new THREE.BufferGeometry();
                springGeo.setAttribute('position', new THREE.BufferAttribute(springPos, 3));
                var material = new THREE.LineBasicMaterial({
                    color: color
                });
                this.spring = new THREE.Line(springGeo, material);
                this.spring.scale.y = scaleY
            }
            case "left":
            {
                for (let i = 0; i < maxVert; i++) {
                    let x, y
                    x = i*pitch; y = scaleY*math.pow(-1, i)
                    springVert.push(new THREE.Vector3(x, y , 0),)
                }
                for (var i = 0; i < maxVert; i++) {

                    springPos[i * 3] = springVert[i].x;
                    springPos[i * 3 + 1] = springVert[i].y;
                    springPos[i * 3 + 2] = springVert[i].z;
                }
                const springGeo = new THREE.BufferGeometry();
                springGeo.setAttribute('position', new THREE.BufferAttribute(springPos, 3));
                var material = new THREE.LineBasicMaterial({
                    color: color
                });
                this.spring = new THREE.Line(springGeo, material);
                this.spring.scale.y = scaleY
            }
            case "right":
            {
                for (let i = 0; i < maxVert; i++) {
                    let x, y
                    x = -l + i*pitch; y = scaleY*math.pow(-1, i)
                    springVert.push(new THREE.Vector3(x, y , 0),)
                }
                for (var i = 0; i < maxVert; i++) {

                    springPos[i * 3] = springVert[i].x;
                    springPos[i * 3 + 1] = springVert[i].y;
                    springPos[i * 3 + 2] = springVert[i].z;
                }
                const springGeo = new THREE.BufferGeometry();
                springGeo.setAttribute('position', new THREE.BufferAttribute(springPos, 3));
                var material = new THREE.LineBasicMaterial({
                    color: color
                });
                this.spring = new THREE.Line(springGeo, material);
            }
            default:
                break;
        }



    }
}
class VSpring {
    constructor(l, pitch, scaleX, ctrlPos, color) {
        this.l = l // cm
        let maxVert = round(l/pitch) + 1
        let springVert = []
        var springPos = new Float32Array(maxVert * 3);
        switch (ctrlPos) {
            case "center":
            {
                for (let i = 0; i < maxVert; i++) {
                    let x, y
                    x = scaleX*math.pow(-1, i); y = (-l/2) + i*pitch
                    springVert.push(new THREE.Vector3(x, y , 0),)
                }
                for (var i = 0; i < maxVert; i++) {

                    springPos[i * 3] = springVert[i].x;
                    springPos[i * 3 + 1] = springVert[i].y;
                    springPos[i * 3 + 2] = springVert[i].z;
                }
                const springGeo = new THREE.BufferGeometry();
                springGeo.setAttribute('position', new THREE.BufferAttribute(springPos, 3));
                var material = new THREE.LineBasicMaterial({
                    color: color
                });
                this.spring = new THREE.Line(springGeo, material);
                this.spring.scale.y = scaleX
            }
            case "top":
            {
                for (let i = 0; i < maxVert; i++) {
                    let x, y
                    x = scaleX*math.pow(-1, i); y = -l + i*pitch
                    springVert.push(new THREE.Vector3(x, y , 0),)
                }
                for (var i = 0; i < maxVert; i++) {

                    springPos[i * 3] = springVert[i].x;
                    springPos[i * 3 + 1] = springVert[i].y;
                    springPos[i * 3 + 2] = springVert[i].z;
                }
                const springGeo = new THREE.BufferGeometry();
                springGeo.setAttribute('position', new THREE.BufferAttribute(springPos, 3));
                var material = new THREE.LineBasicMaterial({
                    color: color
                });
                this.spring = new THREE.Line(springGeo, material);
            }
            case "buttom":
            {
                for (let i = 0; i < maxVert; i++) {
                    let x, y
                    x = scaleX*math.pow(-1, i); y = i*pitch
                    springVert.push(new THREE.Vector3(x, y , 0),)
                }
                for (var i = 0; i < maxVert; i++) {

                    springPos[i * 3] = springVert[i].x;
                    springPos[i * 3 + 1] = springVert[i].y;
                    springPos[i * 3 + 2] = springVert[i].z;
                }
                const springGeo = new THREE.BufferGeometry();
                springGeo.setAttribute('position', new THREE.BufferAttribute(springPos, 3));
                var material = new THREE.LineBasicMaterial({
                    color: color
                });
                this.spring = new THREE.Line(springGeo, material);
            }
            default:
                break;
        }



    }
}
function setInitilaValue(y0, v0, omega) {
    let m = [[1, 0], [0, omega]]
    let A12 = math.lusolve(m, [y0, v0]) 
    let A1 = round(A12[0][0], 3), A2 = round(A12[1][0], 3)
    let phi = atan2(A1,A2)
    let amp 
    if (A1 == 0 && A2 == 0) return [0, 0]
    if (A1 == 0) {amp = A2/cos(phi); return [amp, phi];}
    if (A2 == 0) {amp = A1/sin(phi); return [amp, phi];}
    amp = A1/sin(phi)         
    return [amp, phi];
}

[ampA, phiA] = setInitilaValue(paramsA.y0, paramsA.v0, omegaA);
[ampB, phiB] = setInitilaValue(paramsB.y0, paramsB.v0, omegaB);

init();
animate();
// render();
// stats.update();
let label1 = scene.getObjectByName( "label1", true );
let label2 = scene.getObjectByName( "label2", true );
let label3 = scene.getObjectByName( "label3", true );
let yMaxLine_ = scene.getObjectByName( "yMaxLine", true );

function init() {
    const gui = new GUI()

    const folderA = gui.addFolder( 'A' );
    const folderB = gui.addFolder( 'B' );
    gui.add({disableLabel: function () {
        label1.visible = label1.visible ? false : true        
        label2.visible = label2.visible ? false : true        
        label3.visible = label3.visible ? false : true        
        yMaxLine_.visible = yMaxLine_.visible ? false : true        
    }}, 'disableLabel').name("Toggle Infomation")
    let paramsALabel = {}
    paramsALabel.y0 = katex.renderToString("y_{0} \\quad (m)", { throwOnError: false}); 
    paramsALabel.v0 = katex.renderToString("v_{0} \\quad (m/s)", { throwOnError: false}); 
    paramsALabel.k = katex.renderToString("k \\quad (N/m)", { throwOnError: false}); 
    paramsALabel.m = katex.renderToString("m \\quad (kg)", { throwOnError: false}); 

    folderA.add( paramsA, 'y0' ).name(paramsALabel.y0);        
    folderA.add( paramsA, 'v0' ).name(paramsALabel.v0); 	
    folderA.add( paramsA, 'k' ).name(paramsALabel.k); 	
    folderA.add( paramsA, 'm' ).name(paramsALabel.m);    
    
    
    let paramsBLabel = {}
    paramsBLabel.y0 = katex.renderToString("y_{0} \\quad (m)", { throwOnError: false}); 
    paramsBLabel.v0 = katex.renderToString("v_{0} \\quad (m/s)", { throwOnError: false}); 
    paramsBLabel.k = katex.renderToString("k \\quad (N/m)", { throwOnError: false}); 
    paramsBLabel.m = katex.renderToString("m \\quad (kg)", { throwOnError: false}); 
    folderB.add( paramsB, 'y0' ).name(paramsBLabel.y0); 	
    folderB.add( paramsB, 'v0' ).name(paramsBLabel.v0); 	
    folderB.add( paramsB, 'k' ).name(paramsBLabel.k);  	
    folderB.add( paramsB, 'm' ).name(paramsBLabel.m); 

    gui.onChange( (e) => {
        [ampA, phiA] = setInitilaValue(paramsA.y0, paramsA.v0, omegaA);
        [ampB, phiB] = setInitilaValue(paramsB.y0, paramsB.v0, omegaB);
        omegaA = round(sqrt(paramsA.k/paramsA.m),3);
        omegaB = round(sqrt(paramsB.k/paramsB.m),3);
        if (ampA > yMax) alert("amplitude A > 3.75 m (y maximum)")
        if (ampB > yMax) alert("amplitude B > 3.75 m (y maximum)")
    })

    container = document.getElementById( 'container' );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 4000 );
    camera.position.z = 10;
    camera.position.y = -3;
    
    // grid = new THREE.GridHelper(11,10)
    // grid.rotateX(math.pi/2)
    // scene.add(grid)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.innerWidth/window.innerHeight);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild( renderer.domElement );    
    // stats = new Stats();
    // container.appendChild( stats.dom );

    labelRenderer = new CSS2DRenderer({ antialias: true });
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    container.appendChild( labelRenderer.domElement ); 
    
    let lineVerts = new Float32Array( [
        -2.0, 0.0,  0.0,
        1.0, 0.0,  0.0
    ] );
    const geo = new THREE.BufferGeometry()
    geo.setAttribute( 'position', new THREE.BufferAttribute( lineVerts, 3) );
    
    var material = new THREE.LineBasicMaterial({
        color: 0xf63954,  
    });
    var material2 = new THREE.LineBasicMaterial({
        color: 0x0000ff,  
    });
    const diveqliLine = document.createElement( 'div' );
    // katex.render("\\tt 0 \\> m", diveqliLine,{ throwOnError: false});
    diveqliLine.textContent = '0 m';
    diveqliLine.className = 'label';
    diveqliLine.style.marginTop = '-1em';
    const labelEqliLine = new CSS2DObject( diveqliLine );
    labelEqliLine.name = "label1"

    const divyMaxLine = document.createElement( 'div' );
    // katex.render(`\\tt ${yMax} \\> m`, divyMaxLine,{ throwOnError: false});
    divyMaxLine.textContent = "3.75 m"
    divyMaxLine.className = 'label';
    divyMaxLine.style.marginTop = '-1em';
    const labelyMaxLine = new CSS2DObject( divyMaxLine );
    labelyMaxLine.name = "label2"

    const eqliLine = new THREE.Line(geo,material)
    const fixedLine = new THREE.Line(geo,material)
    const yMaxLine = new THREE.Line(geo,material2)
    yMaxLine.name = "yMaxLine"

    eqliLine.add(labelEqliLine)
    yMaxLine.add(labelyMaxLine)    
    labelEqliLine.position.set(-3,0.0,0)
    labelyMaxLine.position.set(-3,-0.25,0)

    fixedLine.translateY(4)
    yMaxLine.translateY(3.75)
    scene.add(eqliLine, fixedLine, yMaxLine)
    
    divYAB = document.createElement( 'div' );    
    divYAB.className = 'label';
    divYAB.style.marginTop = '-1em';
    const labelYAB = new CSS2DObject( divYAB );
    labelYAB.name = "label3"
    labelYAB.position.set(0,-4,0)
    scene.add(labelYAB)
    const circleGeo = new THREE.CircleGeometry( 0.25, 32);
    const mat = new THREE.MeshBasicMaterial( { color: 0x000000 } );

    sprModelA = new VSpring(4,0.2,0.15, "top", 0x000000)
    
    massA = new THREE.Mesh( circleGeo, mat);
    mass_springA = new Object3D()
    
    const divA = document.createElement( 'div' );
    divA.textContent = 'A'
    divA.className = 'label';
    divA.style.marginTop = '-1em';
    const labelA = new CSS2DObject( divA );   

    mass_springA.add(sprModelA.spring, massA)
    mass_springA.translateY(4)
    mass_springA.translateX(-1)    
    labelA.position.set(0,0,0)
    mass_springA.add(labelA)    
    scene.add(mass_springA);


    sprModelB = new VSpring(4,0.2,0.15, "top", 0x000000)
    massB = new THREE.Mesh( circleGeo, mat );
    mass_springB = new Object3D()
    const divB = document.createElement( 'div' );
    divB.textContent = 'B'
    divB.className = 'label';
    divB.style.marginTop = '-1em';
    const labelB = new CSS2DObject( divB );   

    mass_springB.add(sprModelB.spring, massB)
    mass_springB.translateY(4)
    mass_springB.translateX(0)
    mass_springB.add(labelB)
    scene.add(mass_springB);
   
    

    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    render();
    // stats.update();

}

function animate() {

    requestAnimationFrame( animate );    
    render();
    // stats.update();
    
}

function render() {    
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
   
    const lA = sprModelA.l
    const rA = massA.geometry.parameters.radius
    let yA = ampA*sin(omegaA*time + phiA)
    sprModelA.spring.scale.y = (lA + yA)/lA
    massA.position.y = -(lA +  yA)

    const lB = sprModelB.l
    const rB = massB.geometry.parameters.radius    
    let yB = ampB*sin(omegaB*time + phiB)
    sprModelB.spring.scale.y = (lB + yB)/lB
    massB.position.y = -(lB +  yB)
    let ampAR = round(ampA,2)
    let ampBR = round(ampB,2)
    let phiAR = round(phiA,2)
    let phiBR = round(phiB,2)
    let omegaAR = round(omegaA,2)
    let omegaBR = round(omegaB,2)
    let fA = round(omegaA/(2*pi),3)
    let fB = round(omegaB/(2*pi),3)
    let periodA = round((2*pi)/omegaA,3)
    let periodB = round((2*pi)/omegaB,3)
    let t = round(time,3)
    let deltaPhi = round((phiA - phiB),2)
    let deltaPhiD = round((phiA - phiB)*180/pi,2)
    let UA = 0.5*paramsA.k*pow(paramsA.y0,2), TA = 0.5*paramsA.m*pow(paramsA.v0,2)
    let UB = 0.5*paramsB.k*pow(paramsB.y0,2), TB = 0.5*paramsB.m*pow(paramsB.v0,2)
    let EA = round(UA + TA,2) 
    let EB = round(UB + TB,2)

    katex.render(`
        y = Asin(\\omega t + \\phi) \\quad \\omega = 2 \\pi f = 2 \\pi / T\\\\
        y_{A} = ${ampAR}sin(${omegaAR}t + ${phiAR}) \\quad m\\\\
        y_{B} = ${ampBR}sin(${omegaBR}t + ${phiBR}) \\quad m \\\\
        f_{A} = ${fA} \\quad f_{B} = ${fB} \\quad Hz \\\\
        T_{A} = ${periodA} \\quad T_{B} = ${periodB} \\quad Sec \\\\
        \\phi_{A} - \\phi_{B} = ${deltaPhi} \\> rad \\quad (${deltaPhiD} \\degree) \\\\
        E_{A} = ${EA} \\quad E_{B} = ${EB} \\> J
    `, divYAB,{ throwOnError: false});

    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
}
