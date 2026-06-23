import * as THREE from 'three';
import { camera, renderer } from '../core/sceneSetup.js';
import { player } from '../entities/player.js';
import { state } from '../core/state.js';
import { focusOnObject } from '../core/cameraDirector.js';

export const interactables = [];
export const maxInteractDistance = 3.5;

export function registerInteractable(object) {
    interactables.push(object);
}

const raycaster = new THREE.Raycaster();
const pointerVec = new THREE.Vector2();

function findInteractableRoot(object) {
    let current = object;
    while (current) {
        if (current.userData?.interactable) return current;
        current = current.parent;
    }
    return null;
}

const interactMessage = document.getElementById('interact-message');
const interactButton = document.getElementById('interact-button');
let messageTimeout;

function showMessage(text) {
    clearTimeout(messageTimeout);
    interactMessage.innerText = text;
    interactMessage.style.opacity = '1';
    messageTimeout = setTimeout(() => {
        interactMessage.style.opacity = '0';
    }, 2000);
}

function showPersistentMessage(text) {
    clearTimeout(messageTimeout);
    interactMessage.innerText = text;
    interactMessage.style.opacity = '1';
}

function hidePersistentMessage() {
    interactMessage.style.opacity = '0';
}

export function updateInteractTarget() {
    let nearest = null;
    let nearestDist = Infinity;

    for (const obj of interactables) {
        const dist = player.position.distanceTo(obj.position);
        if (dist < maxInteractDistance && dist < nearestDist) {
            nearest = obj;
            nearestDist = dist;
        }
    }

    if (nearest !== state.currentInteractTarget) {
        state.currentInteractTarget = nearest;
        if (nearest) {
            showPersistentMessage('Tekan E');
            interactButton.style.display = 'flex';
        } else {
            hidePersistentMessage();
            interactButton.style.display = 'none';
        }
    }
}

function triggerInteraction(target) {
    if (!target) return;
    focusOnObject(target, target.userData.interactable.cameraOffset); 
    target.userData.interactable.onInteract?.();
}

renderer.domElement.addEventListener('click', (e) => {
    pointerVec.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerVec.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointerVec, camera);
    const hits = raycaster.intersectObjects(interactables, true);
    if (hits.length === 0) return;

    const root = findInteractableRoot(hits[0].object);
    if (!root) return;

    const distance = player.position.distanceTo(root.position);
    if (distance > maxInteractDistance) {
        showMessage('Terlalu jauh...');
        return;
    }

    triggerInteraction(root);
});

addEventListener('keydown', (e) => {
    if (e.code === 'KeyE' && !state.terminalOpen && state.currentInteractTarget) {
        triggerInteraction(state.currentInteractTarget);
    }
});

interactButton.addEventListener('click', () => {
    triggerInteraction(state.currentInteractTarget);
});