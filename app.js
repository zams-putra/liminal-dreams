import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const treeGLTF = await loader.loadAsync('models/tree/scene.gltf');
const baseTree = treeGLTF.scene; 
const lampGLTF = await loader.loadAsync('models/lamp/scene.gltf');
const baseLamp = lampGLTF.scene; 

const loadingScreen = document.getElementById('loading-screen');
loadingScreen.style.opacity = '0';
setTimeout(() => {
    loadingScreen.remove();
}, 1500);

const scene = new THREE.Scene();
// scene.fog = new THREE.Fog(0x8a93a0, 1, 28);
// scene.fog = new THREE.Fog(0x8a93a0, 1, 100);
scene.fog = new THREE.Fog(0x05060c, 1, 30);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x303030 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const hemiLight = new THREE.HemisphereLight(0x8a93a0 , 0x4a4a3a, 0.9);
// const hemiLight = new THREE.HemisphereLight(0x1a2440, 0x05050a, 0.3);
scene.add(hemiLight);


// const light = new THREE.DirectionalLight(0xaab4c0 , 0.15);
const light = new THREE.DirectionalLight(0x8fa8c8, 0.2);
light.position.set(5, 10, 5);
scene.add(light);



const grid = new THREE.GridHelper(50, 50, 0x555566, 0x404048);
scene.add(grid);

const obstacles = []; 

for (let i = 0; i < 8; i++) {
//   const box = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 2, 1),
//     new THREE.MeshStandardMaterial({ color: 0x555570 })
//   );
    const tree = baseTree.clone(); 
    tree.position.set((Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30);
    tree.scale.set(0.07, 0.07, 0.07)
    scene.add(tree);
    obstacles.push(tree); 
    
}



const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x555570})
)
player.position.set(0, 0.5, 0)
scene.add(player)

const orbs = [];
for (let i = 0; i < 6; i++) {
    // const orb = new THREE.Mesh(
    //     new THREE.SphereGeometry(0.2, 16, 16),
    //     new THREE.MeshStandardMaterial({
    //     emissive: 0xffddaa,
    //     emissiveIntensity: 2,
    //     color: 0xffddaa,
    //     })
    // );
    // orb.position.set((Math.random() - 0.5) * 30, 1.5, (Math.random() - 0.5) * 30);
    // scene.add(orb);
    // orbs.push(orb);

    const randomX = (Math.random() - 0.5) * 30;
    const randomZ = (Math.random() - 0.5) * 30;
    const lamp = baseLamp.clone(); 
    lamp.position.set(randomX, 0, randomZ);
    lamp.scale.set(0.07, 0.07, 0.07);
    scene.add(lamp);
    obstacles.push(lamp); 
    const lightColor = 0xffaa55; 
    const pointLight = new THREE.PointLight(lightColor, 2, 12); 
    const bulbHeight = 3.1; 
    pointLight.position.set(randomX, bulbHeight, randomZ);
    scene.add(pointLight);
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({
            emissive: lightColor,
            emissiveIntensity: 4,
            color: lightColor,
        })
    );
    bulb.position.copy(pointLight.position); 
    scene.add(bulb);
}

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8,
  0.4, 
  0.85
);
composer.addPass(bloomPass);

renderer.setClearColor(scene.fog.color);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 0.9; 

const cameraOffset = new THREE.Vector3(5, 7, 5)

const keys = {
    top: false,
    bottom: false,
    left: false,
    right: false,
}


addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyW':
            keys.top = true
            break
        case 'KeyA':
            keys.left = true
            break
        case 'KeyS':
            keys.bottom = true
            break
        case 'KeyD':
            keys.right = true
            break
    }
})

addEventListener('keyup', (e) => {
        switch(e.code) {
        case 'KeyW':
            keys.top = false
            break
        case 'KeyA':
            keys.left = false
            break
        case 'KeyS':
            keys.bottom = false
            break
        case 'KeyD':
            keys.right = false
            break
    }
})


const playerRadius = 0.6;
const obstacleRadius = 0.7;

function isCollidingWithObstacles(position) {
  for (const obstacle of obstacles) {
    const dx = position.x - obstacle.position.x;
    const dz = position.z - obstacle.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < playerRadius + obstacleRadius) return true;
  }
  return false;
}

const clock = new THREE.Clock();


const moveDirection = new THREE.Vector3()

const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const maxRadius = 45; 

let joystickActive = false;
let joystickPointerId = null;

joystickBase.addEventListener('pointerdown', (e) => {
  joystickActive = true;
  joystickPointerId = e.pointerId;
  joystickBase.setPointerCapture(e.pointerId); 

  joystickBase.style.opacity = '1';
});

window.addEventListener('pointermove', (e) => {
    if (!joystickActive || e.pointerId !== joystickPointerId) return;

    const rect = joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX
    const dz = e.clientY - centerY



    const clampedX = THREE.MathUtils.clamp(dx, -maxRadius, maxRadius)
    const clampedZ = THREE.MathUtils.clamp(dz, -maxRadius, maxRadius)
    
    joystickKnob.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedZ}px))`


    moveDirection.x = clampedX / maxRadius
    moveDirection.z = clampedZ / maxRadius
});

window.addEventListener('pointerup', (e) => {
  if (e.pointerId !== joystickPointerId) return;
  joystickActive = false;
  joystickKnob.style.transform = 'translate(-50%, -50%)';
  moveDirection.set(0, 0, 0);
  joystickBase.style.opacity = '0';
});

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const speed = 5;

    if (!joystickActive) {
        moveDirection.x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
        moveDirection.z = (keys.bottom ? 1 : 0) - (keys.top ? 1 : 0)
        if (moveDirection.lengthSq() > 0) moveDirection.normalize();
    }


    moveDirection.normalize()
    moveDirection.multiplyScalar(speed * delta)
    


    const candidatePosition = player.position.clone().add(moveDirection)


    const boundLimit = 24
    candidatePosition.x = THREE.MathUtils.clamp(candidatePosition.x, -boundLimit, boundLimit)
    candidatePosition.z = THREE.MathUtils.clamp(candidatePosition.z, -boundLimit, boundLimit)




    if(!isCollidingWithObstacles(candidatePosition)) {
        player.position.copy(candidatePosition)
    }


    camera.position.copy(player.position).add(cameraOffset)
    camera.lookAt(player.position)


    
    composer.render();
}
animate();


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});