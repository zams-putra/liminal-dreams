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
const catGLTF = await loader.loadAsync('models/cat/scene.gltf');
const baseCat = catGLTF.scene; 



const textureLoader = new THREE.TextureLoader();
const textureTanah = await textureLoader.loadAsync( 'texture/tanah.png' );
textureTanah.wrapS = THREE.RepeatWrapping;
textureTanah.wrapT = THREE.RepeatWrapping;
textureTanah.repeat.set(10, 10); 
textureTanah.minFilter = THREE.LinearFilter;
textureTanah.magFilter = THREE.LinearFilter;

// const loadingScreen = document.getElementById('loading-screen');
// loadingScreen.style.opacity = '0';
// setTimeout(() => {
//     loadingScreen.remove();
// }, 1500);
const loadingScreen = document.getElementById('loading-screen');
const loadingStatus = document.getElementById('loading-status');
const startBtn = document.getElementById('start-btn');
const bgMusic = document.getElementById('bg-music');
loadingStatus.innerText = "Ready.";
startBtn.style.display = "block";
startBtn.addEventListener('click', () => {
    bgMusic.volume = 1;
    bgMusic.play().catch(error => console.log("Audio play blocked:", error));
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.remove();
    }, 1500);
});


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
//   new THREE.MeshStandardMaterial({ color: 0x303030 })
  new THREE.MeshStandardMaterial({ map: textureTanah })
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


// mode garis2 ngedesign tanah
// const grid = new THREE.GridHelper(50, 50, 0x555566, 0x404048);
// scene.add(grid);

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


const catBox = new THREE.Box3().setFromObject(baseCat);
const catSize = catBox.getSize(new THREE.Vector3());

const targetCatHeight = 0.3;
const catScale = targetCatHeight / catSize.y;

baseCat.scale.setScalar(catScale * 5);

const scaledMinY = catBox.min.y * catScale;

baseCat.position.set(1, -scaledMinY, 0);
scene.add(baseCat);



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




const moveInput = new THREE.Vector3()

const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const maxRadius = 45; 

let joystickActive = false;
let joystickPointerId = null;

let startX = 0;
let startZ = 0;

window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    if (e.clientX > window.innerWidth / 2) return;

    joystickActive = true;
    joystickPointerId = e.pointerId;
    joystickBase.style.left = (e.clientX - 45) + 'px';
    joystickBase.style.top = (e.clientY - 45) + 'px';
    joystickBase.style.opacity = '1';
    startX = e.clientX;
    startZ = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!joystickActive || e.pointerId !== joystickPointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startZ; 

    const distance = Math.sqrt(dx * dx + dy * dy);
    const clampedDistance = Math.min(distance, maxRadius);

    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDistance;
    const knobY = Math.sin(angle) * clampedDistance;

    joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;   
    moveInput.x = knobX / maxRadius;
    moveInput.z = knobY / maxRadius;
});

window.addEventListener('pointerup', (e) => {
  if (e.pointerId !== joystickPointerId) return;
  joystickActive = false;
  joystickKnob.style.transform = 'translate(-50%, -50%)';
  moveInput.set(0, 0, 0);
  joystickBase.style.opacity = '0';
});




// raycaster
baseCat.userData.interactable = { type: 'cat', name: 'Sidi' };
const interactables = [baseCat];


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const maxInteractDistance = 3.5; 

function findInteractableRoot(object) {
    let current = object;
    while (current) {
        if (current.userData?.interactable) return current;
        current = current.parent;
    }
    return null;
}

const chatboxContainer = document.getElementById('chatbox-container');
const chatboxName = document.getElementById('chatbox-name');
const chatboxText = document.getElementById('chatbox-text');
const chatboxImg = document.getElementById('chatbox-img');

function openChatbox(name, text, imageSrc) {
    chatboxName.innerText = name;
    chatboxText.innerText = text;
    if (imageSrc) chatboxImg.src = imageSrc;
    chatboxContainer.style.display = 'flex';
}


chatboxContainer.addEventListener('click', () => {
    chatboxContainer.style.display = 'none';
});


function handleInteraction(info) {
    switch (info.type) {
        case 'cat':
            openChatbox(
                info.name, 
                'Saya akan lawan!', 
                'texture/cat1.jpg' 
            );
            break;
    }
}

function tryInteract(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactables, true);
    if (hits.length === 0) return;

    const root = findInteractableRoot(hits[0].object);
    if (!root) return;

    const distance = player.position.distanceTo(root.position);
    if (distance > maxInteractDistance) {
        showMessage('Terlalu jauh...');
        return;
    }

    handleInteraction(root.userData.interactable);
}

renderer.domElement.addEventListener('click', (e) => {
    tryInteract(e.clientX, e.clientY);
});

const interactMessage = document.getElementById('interact-message');
let messageTimeout;

function showMessage(text) {
    clearTimeout(messageTimeout);
    interactMessage.innerText = text;
    interactMessage.style.opacity = '1';
    messageTimeout = setTimeout(() => {
        interactMessage.style.opacity = '0';
    }, 2000);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const speed = 5;

    if (!joystickActive) {
        moveInput.x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
        moveInput.z = (keys.bottom ? 1 : 0) - (keys.top ? 1 : 0)
        if (moveInput.lengthSq() > 0) moveInput.normalize();
    }


    const moveDirection = moveInput.clone().multiplyScalar(speed * delta)
    


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