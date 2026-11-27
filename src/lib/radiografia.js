// Materiali per la vista radiografica di Praemedica. Il GLB possiede anche materiali PBR autonomi.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vEye;
void main() {
  vec4 eye = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vEye = -eye.xyz;
  gl_Position = projectionMatrix * eye;
}`;
const fragmentShader = `
uniform vec3 base;
uniform vec3 edge;
uniform vec4 optical;
uniform float strength;
varying vec3 vNormal;
varying vec3 vEye;
void main() {
  vec3 n = normalize(vNormal);
  float incidence = abs(dot(n, normalize(vEye)));
  float rim = pow(1.0 - clamp(incidence, 0.0, 1.0), optical.z);
  float light = dot(n, normalize(vec3(-0.48, 0.67, 0.58))) * 0.5 + 0.5;
  float shaped = pow(light, 2.2);
  vec3 rgb = mix(base * (0.55 + 0.65 * shaped), edge, min(1.0, rim * 1.15 + shaped * optical.w));
  float alpha = clamp(strength * (optical.x * (0.60 + 0.40 * light) + optical.y * rim), 0.0, 1.0);
  gl_FragColor = vec4(rgb, alpha);
  #include <colorspace_fragment>
}`;

// Per ogni tessuto: colore in profondità, colore al bordo, copertura, bordo, esponente, luce direzionale.
const palette = {
  pelle:   [0x00508a, 0x16cfff, .11, .97, 2.3, .15],
  ossa:    [0x0a3d71, 0x32b3eb, .50, .54, 1.85, .23],
  organi:  [0x07538b, 0x4dd7ff, .40, .66, 1.9, .23],
  polmoni: [0x0676b8, 0x4bdfff, .41, .76, 1.85, .29],
  encefalo:[0x103e68, 0x3c8db7, .065, .145, 2.1, .18],
  vasi:    [0x0c739a, 0x83eaff, .43, .52, 1.7, .28],
  attivo:  [0x127b9d, 0xbbfaff, .74, .42, 1.3, .43]
};
function opticalMaterial(style, depthTest = false) {
  const [base, edge, fill, rim, power, key] = palette[style];
  return new THREE.ShaderMaterial({
    vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest,
    uniforms: {
      base: { value: new THREE.Color(base) }, edge: { value: new THREE.Color(edge) },
      optical: { value: new THREE.Vector4(fill, rim, power, key) }, strength: { value: 1 }
    }
  });
}

/**
 * Aggiunge la resa radiografica a una scena GLTFLoader. Le mesh sorgente conservano nome,
 * geometria e metadati per bounding box, selezione e integrazione con pagine specialistiche.
 * Le ossa usano un unico batch visivo. Il raycast continua a distinguere ciascun osso.
 */
export function creaRadiografia(root) {
  const structures = [];
  const byName = new Map();
  const materials = new Map();
  const originalMaterials = new Map();
  const bones = [];
  const temporaries = [];
  const enabled = { pelle: true, ossa: true, organi: true };
  let strength = 1, selected = null, isolated = false;
  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  root.traverse(mesh => {
    if (!mesh.isMesh || !mesh.userData.layer) return;
    const { layer, style } = mesh.userData;
    structures.push(mesh);
    byName.set(mesh.name, mesh);
    if (layer === 'ossa') {
      bones.push(mesh);
      mesh.visible = false;
      return;
    }
    const material = opticalMaterial(style || layer);
    originalMaterials.set(mesh, { material: mesh.material, renderOrder: mesh.renderOrder });
    materials.set(mesh, material);
    mesh.material = material;
    mesh.renderOrder = layer === 'pelle' ? 30 : 10;
  });

  const flat = bones.map(mesh => {
    const transform = new THREE.Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld);
    return mesh.geometry.clone().applyMatrix4(transform);
  });
  const merged = mergeGeometries(flat);
  flat.forEach(g => g.dispose());
  const depth = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true });
  const boneMaterial = opticalMaterial('ossa', true);
  const depthMesh = new THREE.Mesh(merged, depth);
  const boneMesh = new THREE.Mesh(merged, boneMaterial);
  depthMesh.renderOrder = -10;
  boneMesh.renderOrder = 0;
  root.add(depthMesh, boneMesh);
  const highlight = opticalMaterial('attivo');
  const overlay = new THREE.Mesh(new THREE.BufferGeometry(), highlight);
  temporaries.push(overlay.geometry);
  overlay.matrixAutoUpdate = false;
  overlay.renderOrder = 25;
  overlay.visible = false;
  root.add(overlay);

  function refresh() {
    const showBones = enabled.ossa && !isolated;
    depthMesh.visible = boneMesh.visible = showBones;
    boneMaterial.uniforms.strength.value = selected ? .40 : 1;
    for (const [mesh, material] of materials) {
      const layer = mesh.userData.layer;
      mesh.visible = enabled[layer] && !isolated && mesh !== selected && (layer !== 'pelle' || strength > 0);
      const fade = selected ? (layer === 'pelle' ? .44 : .31) : 1;
      material.uniforms.strength.value = fade * (layer === 'pelle' ? strength : 1);
    }
    overlay.visible = Boolean(selected && enabled[selected.userData.layer]);
    if (overlay.visible) {
      overlay.geometry = selected.geometry;
      selected.updateWorldMatrix(true, false);
      overlay.matrix.copy(root.matrixWorld).invert().multiply(selected.matrixWorld);
      overlay.matrixWorldNeedsUpdate = true;
    }
  }
  refresh();
  return {
    structures, byName,
    select(target) {
      selected = byName.get(typeof target === 'string' ? target : target?.name) || null;
      if (selected) enabled[selected.userData.layer] = true;
      isolated = false;
      refresh();
    },
    setLayer(layer, value) {
      if (!(layer in enabled)) return;
      enabled[layer] = Boolean(value);
      if (selected?.userData.layer === layer && !value) { selected = null; isolated = false; }
      refresh();
    },
    setSkin(value) { strength = THREE.MathUtils.clamp(value, 0, 1.5); refresh(); },
    isolate(value) { isolated = Boolean(value && selected); refresh(); },
    pick(raycaster) {
      if (isolated) return selected && raycaster.intersectObject(selected, false).length ? selected : null;
      for (const layer of ['organi', 'ossa', 'pelle']) {
        if (!enabled[layer] || (layer === 'pelle' && strength === 0)) continue;
        const hits = raycaster.intersectObjects(structures.filter(m => m.userData.layer === layer), false);
        if (hits.length) return hits[0].object;
      }
      return null;
    },
    dispose() {
      root.remove(depthMesh, boneMesh, overlay);
      for (const [m, mat] of materials) {
        const initial = originalMaterials.get(m);
        m.material = initial.material; m.renderOrder = initial.renderOrder; m.visible = true; mat.dispose();
      }
      for (const m of bones) m.visible = true;
      for (const resource of [merged, depth, boneMaterial, highlight, ...temporaries]) resource.dispose();
    }
  };
}
