import * as THREE from 'three';
import { scene } from '../core/sceneSetup.js';
import { baseCat } from '../core/loader.js';
import { registerInteractable } from '../ui/interactionSystem.js';
import { openChatbox } from '../ui/chatbox.js';

const catBox = new THREE.Box3().setFromObject(baseCat);
const catSize = catBox.getSize(new THREE.Vector3());

const targetCatHeight = 0.3;
const catScale = targetCatHeight / catSize.y;
baseCat.scale.setScalar(catScale * 5);

const scaledMinYCat = catBox.min.y * catScale;
baseCat.position.set(1, -scaledMinYCat, 0);
scene.add(baseCat);

const originalCatRotationY = baseCat.rotation.y;
let targetCatRotationY = originalCatRotationY;

function onInteract() {
    targetCatRotationY = originalCatRotationY + (Math.PI / 2);
    openChatbox('Sidi', 'Saya akan lawan!', 'texture/cat1.jpg', () => {
        targetCatRotationY = originalCatRotationY;
    });
}

baseCat.userData.interactable = { type: 'cat', onInteract };
registerInteractable(baseCat);

export function updateCat() {
    baseCat.rotation.y = THREE.MathUtils.lerp(baseCat.rotation.y, targetCatRotationY, 0.1);
}