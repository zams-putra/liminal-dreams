import * as THREE from 'three';
import { camera } from './sceneSetup.js';
import { state } from './state.js';

let mode = 'follow'; 
const transitionDuration = 0.9; 
let elapsed = 0;

const startPos = new THREE.Vector3();
const startLookAt = new THREE.Vector3();
const endPos = new THREE.Vector3();
const endLookAt = new THREE.Vector3();
const currentLookAt = new THREE.Vector3();

// atur camera focus pas interaksi disini cuy, xyz
const defaultOffset = new THREE.Vector3(1, 2, 2);

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function focusOnObject(object, customOffset) {
    if (mode === 'toFocus' || mode === 'focused') return; 

    startPos.copy(camera.position);
    startLookAt.copy(currentLookAt);

    const offset = customOffset || defaultOffset;
    const objPos = object.position;
    endPos.set(objPos.x + offset.x, objPos.y + offset.y, objPos.z + offset.z);
    endLookAt.set(objPos.x, objPos.y + 0.3, objPos.z);

    elapsed = 0;
    mode = 'toFocus';
    state.cameraFocused = true;
}

export function returnToFollow() {
    if (mode === 'follow' || mode === 'toFollow') return;

    startPos.copy(camera.position);
    startLookAt.copy(currentLookAt);
    elapsed = 0;
    mode = 'toFollow';
}

export function updateCamera(delta, naturalFollowPos, naturalLookAt) {
    if (mode === 'follow') {
        camera.position.copy(naturalFollowPos);
        currentLookAt.copy(naturalLookAt);
        camera.lookAt(currentLookAt);
        return;
    }

    elapsed += delta;
    const t = Math.min(elapsed / transitionDuration, 1);
    const eased = easeInOutQuad(t);

    if (mode === 'toFocus') {
        camera.position.lerpVectors(startPos, endPos, eased);
        currentLookAt.lerpVectors(startLookAt, endLookAt, eased);
        camera.lookAt(currentLookAt);
        if (t >= 1) mode = 'focused';

    } else if (mode === 'focused') {
        camera.position.copy(endPos);
        camera.lookAt(currentLookAt);

    } else if (mode === 'toFollow') {
      
        camera.position.lerpVectors(startPos, naturalFollowPos, eased);
        currentLookAt.lerpVectors(startLookAt, naturalLookAt, eased);
        camera.lookAt(currentLookAt);
        if (t >= 1) {
            mode = 'follow';
            state.cameraFocused = false;
        }
    }
}