import * as THREE from 'three';
import { Object3D } from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';

import GUI from './lib/lil-gui-0.17.js'
import katex from 'katex'; 

let sin = math.sin, cos = math.cos, pi = math.pi
let sqrt = math.sqrt, atan = math.atan, round = math.round
let container, stats, clock;
let camera, scene, renderer, labelRenderer;

let grid
let sprModelA, massA
let sprModelB, massB
let mass_springA, mass_springB
const paramsA = {
    y0: 0,
    v0: 0,
    k: 5.0,
    m: 1.0,
}
const paramsB = {
    y0: 0,
    v0: 0,
    k: 5.0,
    m: 1.0,
}
let omegaA = sqrt(paramsA.k/paramsA.m)
let omegaB = sqrt(paramsB.k/paramsB.m)
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
    let AB = math.lusolve(m, [y0, v0]) 
    let A = round(AB[0][0], 3), B = round(AB[1][0], 3)
    let phi = atan(B/A)
    let amp 
    if (A == 0 && B == 0) return [0, 0]
    if (A == 0) {amp = B/sin(phi); return [amp, phi];}
    if (B == 0) {amp = A/cos(phi); return [amp, phi];}
    amp = A/cos(phi)         
    return [amp, phi];
}

[ampA, phiA] = setInitilaValue(paramsA.y0, paramsA.v0, omegaA);
[ampB, phiB] = setInitilaValue(paramsB.y0, paramsB.v0, omegaB);

init();
animate();
// render();
stats.update();
function init() {
    const gui = new GUI()

    const folderA = gui.addFolder( 'A' );
    const folderB = gui.addFolder( 'B' );
   
    let paramsALabel = {}
    paramsALabel.y0 = katex.renderToString("y_{0} \\quad (m)", { throwOnError: false}); 
    paramsALabel.v0 = katex.renderToString("v_{0} \\quad (m/s)", { throwOnError: false}); 
    paramsALabel.k = katex.renderToString("k \\quad (N/m)", { throwOnError: false}); 
    paramsALabel.m = katex.renderToString("m \\quad (kg)", { throwOnError: false}); 

    folderA.add( paramsA, 'y0' )
        .name(paramsALabel.y0)
        .onChange( function( y0 ) {
            [ampA, phiA] = setInitilaValue(paramsA.y0, paramsA.v0, omegaA);            
        } )
    folderA.add( paramsA, 'v0' )
        .name(paramsALabel.v0)
        .onChange( function( v0 ) {
            [ampA, phiA] = setInitilaValue(paramsA.y0, paramsA.v0, omegaA);
        } ); 	
    folderA.add( paramsA, 'k' )
        .name(paramsALabel.k)
        .onChange( function( v0 ) {
            omegaA = sqrt(paramsA.k/paramsA.m);
        } ); 	
    folderA.add( paramsA, 'm' )
        .name(paramsALabel.m)
        .onChange( function( v0 ) {
            omegaA = sqrt(paramsA.k/paramsA.m);
        } );  	
    
    
    
    let paramsBLabel = {}
    paramsBLabel.y0 = katex.renderToString("y_{0} \\quad (m)", { throwOnError: false}); 
    paramsBLabel.v0 = katex.renderToString("v_{0} \\quad (m/s)", { throwOnError: false}); 
    paramsBLabel.k = katex.renderToString("k \\quad (N/m)", { throwOnError: false}); 
    paramsBLabel.m = katex.renderToString("m \\quad (kg)", { throwOnError: false}); 
    folderB.add( paramsB, 'y0' )
        .name(paramsBLabel.y0)
        .onChange( function( y0 ) {
            [ampB, phiB] = setInitilaValue(paramsB.y0, paramsB.v0, omegaB);            
        } ); 	
    folderB.add( paramsB, 'v0' )
        .name(paramsBLabel.v0)
        .onChange( function( y0 ) {
            [ampB, phiB] = setInitilaValue(paramsB.y0, paramsB.v0, omegaB);            
        } ); 	
    folderB.add( paramsB, 'k' )
        .name(paramsBLabel.k)
        .onChange( function( v0 ) {
            omegaB = sqrt(paramsB.k/paramsB.m);
        } );  	
    folderB.add( paramsB, 'm' )
        .name(paramsBLabel.m)
        .onChange( function( v0 ) {
            omegaB = sqrt(paramsB.k/paramsB.m);
        } ); 

    
    container = document.getElementById( 'container' );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 4000 );
    camera.position.z = 10;
    
    // grid = new THREE.GridHelper(11,10)
    // grid.rotateX(math.pi/2)
    // scene.add(grid)
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.innerWidth/window.innerHeight);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild( renderer.domElement );    
    stats = new Stats();
    container.appendChild( stats.dom );

    labelRenderer = new CSS2DRenderer();
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
    const eqliLine = new THREE.Line(geo,material)
    const fixedLine = new THREE.Line(geo,material)
    fixedLine.translateY(4)
    scene.add(eqliLine, fixedLine)

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
    stats.update();

}

function animate() {

    requestAnimationFrame( animate );
    render();
    stats.update();

}

function render() {    
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
   
    const lA = sprModelA.l
    const rA = massA.geometry.parameters.radius
    let yA = ampA*cos(omegaA*time + phiA)
    sprModelA.spring.scale.y = (lA + yA)/lA
    massA.position.y = -(lA +  yA)

    const lB = sprModelB.l
    const rB = massB.geometry.parameters.radius    
    let yB = ampB*cos(omegaB*time + phiB)
    sprModelB.spring.scale.y = (lB + yB)/lB
    massB.position.y = -(lB +  yB)

    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
}
