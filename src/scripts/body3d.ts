/**
 * Esplorazione anatomica: il modello praemedica-corpo.glb (BodyParts3D, CC BY 4.0) con la resa
 * radiografica di src/lib/radiografia.js. Si ruota trascinando; i punti sono pulsanti HTML veri
 * (tastiera e lettori di schermo) posati al centro dell'organo collegato a ogni specializzazione.
 * Three.js e il modello si caricano solo quando la sezione si avvicina; senza WebGL resta l'elenco.
 */
const stage = document.querySelector<HTMLElement>('[data-body]');
if (stage) setup(stage);

function setup(stage: HTMLElement) {
  const spots = [...stage.querySelectorAll<HTMLButtonElement>('[data-spot]')];
  const panes = [...document.querySelectorAll<HTMLElement>('[data-spot-pane]')];
  const links = [...document.querySelectorAll<HTMLElement>('[data-spot-link]')];
  const meshes: string[] = JSON.parse(stage.dataset.spots || '[]');
  let active = Number(stage.dataset.bodyFirst || 0);
  let scene: { select(i: number): void } | null = null;

  const select = (i: number) => {
    active = i;
    spots.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    panes.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle('is-on', k === i); });
    links.forEach((a) => a.classList.toggle('is-on', Number(a.dataset.spotLink) === i));
    scene?.select(i);
  };
  spots.forEach((b, k) => b.addEventListener('click', () => select(k)));
  links.forEach((a) => {
    const k = Number(a.dataset.spotLink);
    a.addEventListener('pointerenter', () => select(k));
    a.addEventListener('focus', () => select(k));
  });

  if (!hasWebGL()) return;
  document.documentElement.classList.add('webgl');
  const io = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    const [THREE, { GLTFLoader }, { creaRadiografia }] = await Promise.all([
      import('three'), import('three/addons/loaders/GLTFLoader.js'), import('../lib/radiografia.js'),
    ]);
    const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/models/praemedica-corpo.glb`);
    scene = build(THREE, gltf.scene, creaRadiografia, stage, spots, meshes, () => active, select);
    stage.classList.add('is-ready');
  }, { rootMargin: '500px' });
  io.observe(stage);
}

function hasWebGL() {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}

function build(
  THREE: typeof import('three'), model: import('three').Object3D, creaRadiografia: (root: import('three').Object3D) => any,
  stage: HTMLElement, spots: HTMLButtonElement[], meshes: string[], getActive: () => number, onPick: (i: number) => void,
) {
  const reduced = document.documentElement.classList.contains('reduced');
  const canvas = stage.querySelector('canvas')!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, innerWidth < 760 ? 1.65 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 30);

  /* il modello ruota attorno al proprio asse verticale */
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const body = new THREE.Group();
  body.add(model);
  scene.add(body);
  const atlas = creaRadiografia(model);

  /* centro di ogni organo collegato, nelle coordinate del gruppo */
  body.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(body.matrixWorld).invert();
  const points = meshes.map((name) => {
    const m = atlas.byName.get(name);
    if (!m) return new THREE.Vector3(0, 0, 0);
    return new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).applyMatrix4(inv);
  });

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitH = (size.y * 1.08) / (2 * Math.tan(fov / 2));
    const fitW = (Math.max(size.x, size.z) * 1.15) / (2 * Math.tan(fov / 2) * camera.aspect);
    camera.position.set(0, 0, Math.max(fitH, fitW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  /* rotazione: trascinamento, rotazione lenta a riposo, giro verso l'organo scelto */
  let rot = 0, target = 0, idleUntil = 0, drag: { x: number; r: number; moved: boolean } | null = null;
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  stage.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('[data-spot]')) return;
    drag = { x: e.clientX, r: target, moved: false };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) > 4) drag.moved = true;
    target = drag.r + (e.clientX - drag.x) * 0.01;
    idleUntil = performance.now() + 5000;
  });
  stage.addEventListener('pointerup', (e) => {
    /* un tocco senza trascinamento sceglie l'organo sotto il dito */
    if (drag && !drag.moved) {
      const r = canvas.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hit = atlas.pick(ray);
      const k = hit ? meshes.indexOf(hit.name) : -1;
      if (k >= 0) onPick(k);
    }
    drag = null;
  });
  stage.addEventListener('pointercancel', () => { drag = null; });

  const select = (i: number) => {
    atlas.select(meshes[i]);
    const p = points[i];
    if (Math.hypot(p.x, p.z) > size.x * 0.03) {
      let want = -Math.atan2(p.x, p.z);
      want += Math.round((target - want) / (Math.PI * 2)) * Math.PI * 2;
      target = want;
    }
    idleUntil = performance.now() + 7000;
  };

  /* proiezione dei punti; quelli dietro al corpo si attenuano */
  const v = new THREE.Vector3();
  const place = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    points.forEach((p, i) => {
      const nz = -p.x * Math.sin(rot) + p.z * Math.cos(rot);
      v.copy(p).applyMatrix4(body.matrixWorld).project(camera);
      spots[i].style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
      spots[i].classList.toggle('is-back', nz < -size.z * 0.12 && i !== getActive());
    });
  };

  let visible = true, t0 = performance.now();
  new IntersectionObserver((e) => {
    const was = visible;
    visible = e[0].isIntersecting;
    if (visible && !was) { t0 = performance.now(); loop(); }
  }).observe(stage);
  function loop() {
    if (!visible) return;
    const now = performance.now(), dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    if (!reduced && !drag && now > idleUntil) target += dt * 0.2;
    rot += (target - rot) * Math.min(1, dt * 5);
    body.rotation.y = rot;
    body.updateMatrixWorld();
    renderer.render(scene, camera);
    place();
    requestAnimationFrame(loop);
  }
  select(getActive());
  rot = target;
  loop();
  return { select };
}
