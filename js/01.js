import * as THREE from 'three';
import { Object3D } from 'three';
import Stats from 'three/addons/libs/stats.module.js';

let sin = math.sin, cos = math.cos, pi = math.pi

let container, stats, clock;

let camera, scene, renderer;

let grid
let sprModelA, sphereA
let sprModelB, sphereB
let mass_springA, mass_springB

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
        let maxVert = math.round(l/pitch)
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

init();
animate();
// render();
stats.update();

function init() {

    container = document.getElementById( 'container' );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 4000 );
    // camera = new THREE.PerspectiveCamera( 45, 16.0/9.0, 1, 4000 );    
    camera.position.z = 10;

    grid = new THREE.GridHelper(8,10)
    grid.rotateX(math.pi/2)
    // scene.add(grid)
    

    sprModelA = new VSpring(4,0.1,0.15, "top", 0xffffff)
    const geometryA = new THREE.SphereGeometry( 0.25, 32, 16 );
    const materialA = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    sphereA = new THREE.Mesh( geometryA, materialA );
    mass_springA = new Object3D()
    mass_springA.add(sprModelA.spring, sphereA)
    mass_springA.translateY(4)
    mass_springA.translateX(-1)
    scene.add(mass_springA);

    sprModelB = new VSpring(4,0.1,0.15, "top", 0x00ff00)
    const geometryB = new THREE.SphereGeometry( 0.25, 32, 16 );
    const materialB = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    sphereB = new THREE.Mesh( geometryB, materialB );
    mass_springB = new Object3D()
    mass_springB.add(sprModelB.spring, sphereB)
    mass_springB.translateY(4)
    mass_springB.translateX(0)
    scene.add(mass_springB);

    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.innerWidth/window.innerHeight);
    // renderer.setSize( 1280, 720 );
    // renderer.setSize( 854, 480 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild( renderer.domElement );    
    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
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
    const rA = sphereA.geometry.parameters.radius
    sprModelA.spring.scale.y = (lA + sin((2*pi/1)*time))/lA
    sphereA.position.y = -(lA + rA + sin((2*pi/1)*time))

    const lB = sprModelB.l
    const rB = sphereB.geometry.parameters.radius    
    sprModelB.spring.scale.y = (lB + sin((2*pi/4)*time))/lB
    sphereB.position.y = -(lB + rB + sin((2*pi/4)*time))

    renderer.render( scene, camera );

}
