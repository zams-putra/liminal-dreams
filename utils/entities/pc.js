import * as THREE from 'three';
import { scene } from '../core/sceneSetup.js';
import { basePc } from '../core/loader.js';
import { registerInteractable } from '../ui/interactionSystem.js';
import { openPc } from '../ui/pc.js';

const pcBox = new THREE.Box3().setFromObject(basePc);
const pcSize = pcBox.getSize(new THREE.Vector3());

const targetPcHeight = 0.3;
const pcScale = targetPcHeight / pcSize.y;
basePc.scale.setScalar(pcScale * 5);

const scaledMinYPc = pcBox.min.y * pcScale;
basePc.position.set(5, -scaledMinYPc, 0);
basePc.rotation.y = -(Math.PI / 2);
scene.add(basePc);

basePc.userData.interactable = { type: 'pc', onInteract: openPc };
registerInteractable(basePc);