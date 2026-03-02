/**
 * badge-3d-viewer.js â€” SkillForge 3D Badge Viewer
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * CORRECT PIPELINE:
 *   1. Loads badge_base.glb  (Blender-exported PBR shield model)
 *   2. Loads hdri/studio.hdr (Poly Haven studio HDRI for true IBL reflections)
 *   3. ACESFilmic tone mapping  +  SRGBColorSpace output
 *   4. Re-tints rim/body materials per tier at runtime
 *   5. Canvas-texture emblem on Emblem_Plane mesh
 *   6. Locked badges â†’ full grayscale material override
 *   7. OrbitControls with autoRotate + damping
 *
 * Exposes: window.Badge3DViewer = { open(badgeObj), close() }
 *
 * GLB: run create_badge_blender.py in Blender â†’ models/badge_base.glb
 * HDRI: already downloaded â†’ hdri/studio.hdr
 */

import * as THREE        from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader }    from 'three/addons/loaders/RGBELoader.js';

// â”€â”€ Asset paths â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GLB_URL  = 'models/badge_base.glb';
const HDRI_URL = 'hdri/studio.hdr';

// â”€â”€ Tier colour configs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TIER = {
  bronze:   { rim: 0xd4843a, body: 0x8b2200, emissive: 0x1a0800, glowColor: 0xff6820 },
  silver:   { rim: 0xe8e8f0, body: 0x1a1a2a, emissive: 0x04040a, glowColor: 0xaaccff },
  gold:     { rim: 0xffe060, body: 0x4a0000, emissive: 0x180c00, glowColor: 0xffd700 },
  platinum: { rim: 0xb8d8ff, body: 0x0a0f1e, emissive: 0x030610, glowColor: 0x88aaff },
  diamond:  { rim: 0x80f0ff, body: 0x001833, emissive: 0x001020, glowColor: 0x40e8ff },
};

// â”€â”€ Module-level state (one scene at a time) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let _renderer  = null;
let _scene     = null;
let _camera    = null;
let _controls  = null;
let _raf       = null;
let _resizeObs = null;
let _glbCache  = null;  // cached parsed GLTF scene
let _envCache  = null;  // cached PMREM texture

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// RENDERER â€” created once, reused across opens (canvas may change element
// but the renderer is re-bound in buildScene)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getOrCreateRenderer(canvas) {
  if (_renderer) return _renderer;
  _renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  _renderer.outputColorSpace    = THREE.SRGBColorSpace;
  _renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  _renderer.toneMappingExposure = 1.25;
  _renderer.shadowMap.enabled   = true;
  _renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
  return _renderer;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HDRI â€” loads studio.hdr, falls back to RoomEnvironment if file missing
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadEnvMap(renderer) {
  if (_envCache) return Promise.resolve(_envCache);

  return new Promise((resolve) => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    new RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .load(
        HDRI_URL,
        (tex) => {
          _envCache = pmrem.fromEquirectangular(tex).texture;
          tex.dispose();
          pmrem.dispose();
          console.log('[Badge3D] âœ“ HDRI loaded from', HDRI_URL);
          resolve(_envCache);
        },
        undefined,
        () => {
          // HDRI file not present â€” use RoomEnvironment procedural IBL
          console.warn('[Badge3D] HDRI not found â†’ RoomEnvironment fallback. Run create_badge_blender.py or place studio.hdr in hdri/');
          import('three/addons/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
            const pmrem2 = new THREE.PMREMGenerator(renderer);
            _envCache = pmrem2.fromScene(new RoomEnvironment()).texture;
            pmrem2.dispose();
            resolve(_envCache);
          });
        }
      );
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GLB â€” loads badge_base.glb, falls back to procedural if missing
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadGLB() {
  if (_glbCache) return Promise.resolve(_glbCache.clone());

  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      GLB_URL,
      (gltf) => {
        _glbCache = gltf.scene;
        console.log('[Badge3D] âœ“ GLB loaded from', GLB_URL);
        resolve(_glbCache.clone());
      },
      undefined,
      (err) => {
        console.warn('[Badge3D] GLB not found â†’ procedural geometry fallback. Run create_badge_blender.py to generate badge_base.glb.');
        reject(err);
      }
    );
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// APPLY TIER â€” re-colours loaded GLB materials per tier + locked state
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function applyTierToGLB(group, tier, locked, emblemTex) {
  const cfg = TIER[tier] || TIER.bronze;

  group.traverse((node) => {
    if (!node.isMesh) return;
    node.material   = node.material.clone();
    node.castShadow = node.receiveShadow = true;
    const m = node.material;
    m.needsUpdate = true;

    if (locked) {
      m.color.set(0x252525);
      m.metalness         = 0.18;
      m.roughness         = 0.84;
      m.emissive          = new THREE.Color(0);
      m.emissiveIntensity = 0;
      m.envMapIntensity   = 0.10;
      return;
    }

    if (node.name === 'Shield_Rim') {
      m.color.set(cfg.rim);
      m.metalness         = 1.0;
      m.roughness         = 0.16;
      m.emissive          = new THREE.Color(cfg.emissive);
      m.emissiveIntensity = 0.7;
      m.envMapIntensity   = 2.4;
    } else if (node.name === 'Shield_Body') {
      m.color.set(cfg.body);
      m.metalness         = 0.10;
      m.roughness         = 0.28;
      m.envMapIntensity   = 0.9;
      if (m.isMeshPhysicalMaterial) {
        m.clearcoat          = 0.6;
        m.clearcoatRoughness = 0.12;
      }
    } else if (node.name === 'Glow_Ring') {
      m.color.set(cfg.glowColor);
      m.emissive          = new THREE.Color(cfg.glowColor);
      m.emissiveIntensity = 3.5;
    } else if (node.name === 'Emblem_Plane' && emblemTex) {
      m.map           = emblemTex;
      m.transparent   = true;
      m.alphaTest     = 0.05;
      m.metalness     = 0.35;
      m.roughness     = 0.25;
      m.envMapIntensity = 1.0;
    }
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SHIELD CONFIG -- silver rim for bronze/silver tiers, gold rim for gold+
const SHIELD = {
  silver: { rim:0xc8c8d8, rimRough:0.14, rimMetal:1.0, rimEmissive:0x050508, glow:0x8899ff },
  gold:   { rim:0xd4a020, rimRough:0.10, rimMetal:1.0, rimEmissive:0x180800, glow:0xffc800 },
};
function shieldCfg(tier) {
  return (tier === 'bronze' || tier === 'silver') ? SHIELD.silver : SHIELD.gold;
}

// Material helpers
function matRed(env)    { return new THREE.MeshStandardMaterial({ color:0x3a0808, metalness:0.05, roughness:0.30, envMapIntensity:env??0.8 }); }
function matGold(env)   { return new THREE.MeshStandardMaterial({ color:0xd4a020, metalness:1.0,  roughness:0.10, envMapIntensity:env??2.2 }); }
function matSilver(env) { return new THREE.MeshStandardMaterial({ color:0xc8c8d8, metalness:1.0,  roughness:0.14, envMapIntensity:env??2.2 }); }
function matDark(env)   { return new THREE.MeshStandardMaterial({ color:0x111111, metalness:0.50, roughness:0.40, envMapIntensity:env??0.5 }); }

// Cylinder stretched between two Vector3 points
function cylBetween(a, b, mat, r) {
  r = r || 0.025;
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const geo = new THREE.CylinderGeometry(r, r, len, 8);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
  return mesh;
}

// -- EMBLEM BUILDERS --

function emb_initiate(locked) {
  const g = new THREE.Group();
  const mat = locked ? matDark() : matGold();
  const rMat = locked ? matDark() : matRed();
  for (let i = 0; i < 5; i++) {
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(0.055 + i*0.01, 0), mat);
    const ang = (i / 5) * Math.PI * 2;
    oct.position.set(Math.cos(ang)*0.13, Math.sin(ang)*0.13, 0.05*i);
    g.add(oct);
  }
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), rMat);
  core.position.z = 0.10; g.add(core);
  return g;
}

function emb_pattern_explorer(locked) {
  const g = new THREE.Group();
  const mat = locked ? matDark() : matGold();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const cx = Math.cos(ang)*0.22, cy = Math.sin(ang)*0.22;
    const pAng = ang + Math.PI/2;
    const pt = new THREE.Shape();
    pt.moveTo(cx, cy);
    pt.lineTo(Math.cos(ang)*0.08 + Math.cos(pAng)*0.06, Math.sin(ang)*0.08 + Math.sin(pAng)*0.06);
    pt.lineTo(0, 0);
    pt.lineTo(Math.cos(ang)*0.08 - Math.cos(pAng)*0.06, Math.sin(ang)*0.08 - Math.sin(pAng)*0.06);
    pt.closePath();
    const spikeGeo = new THREE.ExtrudeGeometry(pt, {depth:0.04, bevelEnabled:false});
    g.add(new THREE.Mesh(spikeGeo, mat));
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.06,16), mat);
  hub.rotation.x = Math.PI/2; hub.position.z = 0.14; g.add(hub);
  return g;
}

function emb_structured_thinker(locked) {
  const g = new THREE.Group();
  const gem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), locked ? matDark() : matRed());
  gem.position.z = 0.12; g.add(gem);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.022, 8, 40), locked ? matDark() : matGold());
  ring.rotation.x = Math.PI/2; ring.position.z = 0.12; g.add(ring);
  return g;
}

function emb_debug_apprentice(locked) {
  const g = new THREE.Group();
  const bMat = matDark();
  const eyeMat = locked ? matDark() : new THREE.MeshStandardMaterial({color:0xff2200, emissive:new THREE.Color(0xff2200), emissiveIntensity:2.5});
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12,16,10), bMat);
  body.scale.set(1,0.7,0.6); body.position.z = 0.14; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07,12,10), bMat);
  head.position.set(0,0.16,0.14); g.add(head);
  [[ 0.06,0.17],[-0.06,0.17]].forEach(([x,y]) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018,8,8), eyeMat);
    eye.position.set(x,y,0.20); g.add(eye);
  });
  for (let i = 0; i < 4; i++) {
    const s = i < 2 ? 1 : -1, yb = 0.04 - (i%2)*0.08;
    const a = new THREE.Vector3(s*0.13, yb, 0.14);
    const b = new THREE.Vector3(s*0.28, yb+0.06, 0.14);
    const c = new THREE.Vector3(s*0.34, yb-0.04, 0.14);
    g.add(cylBetween(a,b,bMat,0.018)); g.add(cylBetween(b,c,bMat,0.018));
  }
  return g;
}

function emb_consistent_builder(locked) {
  const g = new THREE.Group();
  const mat = locked ? matDark() : matGold();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.28,8), mat);
  handle.rotation.z = Math.PI/4; handle.position.set(-0.04,0.02,0.14); g.add(handle);
  const head1 = new THREE.Mesh(new THREE.TorusGeometry(0.055,0.022,8,16,Math.PI), mat);
  head1.rotation.z = Math.PI/4; head1.position.set(-0.12,0.12,0.14); g.add(head1);
  const hHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.26,8), mat);
  hHandle.rotation.z = -Math.PI/4; hHandle.position.set(0.04,0.02,0.14); g.add(hHandle);
  const hamHead = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.05,0.05), mat);
  hamHead.rotation.z = -Math.PI/4; hamHead.position.set(0.13,0.13,0.14); g.add(hamHead);
  return g;
}

function emb_strategic_planner(locked) {
  const g = new THREE.Group();
  const mat = locked ? matDark() : matSilver();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.06,0.06), mat);
  base.position.set(0,-0.10,0.14); g.add(base);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.14,0.06), mat);
  neck.position.set(-0.02,-0.02,0.14); g.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.07,0.06), mat);
  head.position.set(0.03,0.08,0.14); g.add(head);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.04,0.05), mat);
  nose.position.set(0.10,0.04,0.14); g.add(nose);
  return g;
}

function emb_rapid_debugger(locked) {
  const g = new THREE.Group();
  const bMat = matDark();
  const eyeMat = locked ? matDark() : new THREE.MeshStandardMaterial({color:0xff2200, emissive:new THREE.Color(0xff2200), emissiveIntensity:2.5});
  const wingMat = locked ? matDark() : new THREE.MeshStandardMaterial({color:0x3a0808, metalness:0.1, roughness:0.4, transparent:true, opacity:0.85});
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13,16,12), bMat);
  body.scale.set(1.1,0.75,0.55); body.position.z = 0.14; g.add(body);
  [[-0.05,0.10],[0.05,0.10]].forEach(([x,y]) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.02,8,8), eyeMat);
    e.position.set(x,y,0.20); g.add(e);
  });
  [-1,1].forEach(side => {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6), wingMat);
    w.scale.set(0.5,1.1,0.18); w.position.set(side*0.22,0.04,0.14); g.add(w);
  });
  for (let i = 0; i < 3; i++) {
    [-1,1].forEach(side => {
      const y0 = 0.04 - i*0.07;
      g.add(cylBetween(new THREE.Vector3(side*0.12,y0,0.14), new THREE.Vector3(side*0.26,y0-0.06,0.14), bMat, 0.014));
    });
  }
  return g;
}

function emb_optimization_seeker(locked) {
  const g = new THREE.Group();
  const mat = locked ? matDark() : matGold();
  const arMat = locked ? matDark() : new THREE.MeshStandardMaterial({color:0xff6600, emissive:new THREE.Color(0xff6600), emissiveIntensity:1.5});
  [0.08,0.15,0.12,0.19].forEach((h,i) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.055,h,0.04), mat);
    bar.position.set(-0.12+i*0.08, -0.15+h/2, 0.14); g.add(bar);
  });
  g.add(cylBetween(new THREE.Vector3(-0.10,-0.05,0.18), new THREE.Vector3(0.12,0.13,0.18), arMat, 0.022));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04,0.08,6), arMat);
  tip.position.set(0.14,0.16,0.18); tip.rotation.z = -Math.PI/4; g.add(tip);
  return g;
}

function emb_edge_case_hunter(locked) {
  const g = new THREE.Group();
  const scMat = locked ? matDark() : new THREE.MeshStandardMaterial({color:0xf0eeee, roughness:0.3});
  const irMat = locked ? matDark() : new THREE.MeshStandardMaterial({color:0x3060ff, roughness:0.2});
  const puMat = matDark();
  const lidMat = locked ? matDark() : matRed();
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17,24,16), scMat);
  eye.scale.set(1.3,0.80,0.55); eye.position.z = 0.12; g.add(eye);
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.09,20,16), irMat);
  iris.position.set(0,0,0.23); g.add(iris);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045,16,16), puMat);
  pupil.position.set(0,0,0.27); g.add(pupil);
  [0, Math.PI].forEach(rz => {
    const lid = new THREE.Mesh(new THREE.TorusGeometry(0.185,0.025,8,40,Math.PI), lidMat);
    lid.scale.set(1.3,0.80,1); lid.rotation.z = rz; lid.position.z = 0.12; g.add(lid);
  });
  return g;
}

function emb_adaptive_solver(locked) {
  const g = new THREE.Group();
  const mats = locked
    ? [matDark(),matDark(),matDark(),matDark()]
    : [matRed(), matGold(), matSilver(), matDark()];
  for (let i = 0; i < 4; i++) {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.04), mats[i]);
    cube.rotation.z = i*Math.PI/8 + Math.PI/8;
    cube.position.set(Math.sin(i*0.6)*0.04, Math.cos(i*0.6)*0.04, 0.06+i*0.06);
    g.add(cube);
  }
  return g;
}

function emb_algorithmic_engineer(locked) {
  const g = new THREE.Group();
  const nMat = locked ? matDark() : matGold();
  const tMat = locked ? matDark() : matSilver();
  const pos = [
    new THREE.Vector3(-0.18, 0.10,0.18), new THREE.Vector3( 0.00, 0.18,0.18),
    new THREE.Vector3( 0.18, 0.10,0.18), new THREE.Vector3( 0.18,-0.10,0.18),
    new THREE.Vector3( 0.00,-0.18,0.18), new THREE.Vector3(-0.18,-0.10,0.18),
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4],[2,5]];
  pos.forEach(p => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.034,10,10), nMat); n.position.copy(p); g.add(n); });
  edges.forEach(([a,b]) => g.add(cylBetween(pos[a],pos[b],tMat,0.012)));
  return g;
}

function emb_systems_thinker(locked) {
  const g = new THREE.Group();
  const nMat = locked ? matDark() : matRed();
  const oMat = locked ? matDark() : matGold();
  const eMat = locked ? matDark() : matSilver();
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.07,16,16), nMat);
  nuc.position.z = 0.14; g.add(nuc);
  [[0,0],[Math.PI/3,Math.PI/4],[Math.PI/3,-Math.PI/4]].forEach(([rx,ry]) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.19,0.016,8,50), oMat);
    t.rotation.x = rx+Math.PI/2; t.rotation.y = ry; t.position.z = 0.14; g.add(t);
    const el = new THREE.Mesh(new THREE.SphereGeometry(0.026,8,8), eMat);
    el.position.set(Math.cos(ry)*0.19, Math.sin(rx)*0.19, 0.14+Math.sin(ry)*0.19); g.add(el);
  });
  return g;
}

function emb_cognitive_stable(locked) {
  const g = new THREE.Group();
  const cMat = locked ? matDark() : matSilver();
  const rMat = locked ? matDark() : matGold();
  const bMat = locked ? matDark() : matRed();
  [-0.14,-0.05,0.05,0.14].forEach(x => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.025,0.22,8), cMat);
    col.position.set(x,-0.04,0.16); g.add(col);
  });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.04,0.06), rMat);
  roof.position.set(0,0.09,0.16); g.add(roof);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0,0.18,0.08,3), rMat);
  ped.position.set(0,0.14,0.16); g.add(ped);
  const brain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07,1), bMat);
  brain.position.set(0,-0.04,0.28); g.add(brain);
  return g;
}

function buildLaurelWreath(radius, leafMat) {
  const g = new THREE.Group();
  const r = radius || 0.28;
  const lm = leafMat || matGold();
  for (let i = 0; i < 18; i++) {
    const ang = (i/18)*Math.PI*2;
    const s = new THREE.Shape();
    s.moveTo(0,0); s.quadraticCurveTo(0.032,0.025,0,0.068); s.quadraticCurveTo(-0.032,0.025,0,0);
    const leaf = new THREE.Mesh(new THREE.ShapeGeometry(s), lm);
    leaf.position.set(Math.cos(ang)*r, Math.sin(ang)*r, 0.18);
    leaf.rotation.z = ang+Math.PI/2; g.add(leaf);
  }
  const stem = new THREE.Mesh(new THREE.TorusGeometry(r,0.012,6,50), lm);
  stem.position.z = 0.17; g.add(stem);
  return g;
}

function emb_architect(locked) {
  const g = new THREE.Group();
  const mat = locked ? matDark() : matGold();
  [-0.13,-0.04,0.04,0.13].forEach(x => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.025,0.20,8), mat);
    col.position.set(x,-0.02,0.16); g.add(col);
  });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.34,0.04,0.05), mat);
  roof.position.set(0,0.10,0.16); g.add(roof);
  const tri = new THREE.Mesh(new THREE.CylinderGeometry(0,0.16,0.07,3), mat);
  tri.position.set(0,0.15,0.16); g.add(tri);
  if (!locked) g.add(buildLaurelWreath(0.27, matGold()));
  return g;
}

function emb_grandmaster(locked) {
  const g = new THREE.Group();
  const sMat = locked ? matDark() : matSilver();
  const cMat = locked ? matDark() : matGold();
  for (let i = 0; i < 10; i++) {
    const t = i/9, ang = t*Math.PI*3;
    const x = Math.cos(ang)*0.12, y = -0.20+t*0.40, z = 0.14+Math.sin(ang)*0.04;
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.03,8,8), i%2===0?sMat:cMat);
    s.position.set(x,y,z); g.add(s);
    if (i < 9) {
      const na = (i+1)/9*Math.PI*3;
      const b = new THREE.Vector3(Math.cos(na)*0.12, -0.20+(i+1)/9*0.40, 0.14+Math.sin(na)*0.04);
      g.add(cylBetween(new THREE.Vector3(x,y,z), b, sMat, 0.012));
    }
  }
  if (!locked) g.add(buildLaurelWreath(0.27, matGold()));
  return g;
}

// Dispatch table: badge id -> emblem builder
const EMBLEM_MAP = {
  'initiate':            emb_initiate,
  'pattern-explorer':    emb_pattern_explorer,
  'structured-thinker':  emb_structured_thinker,
  'debug-apprentice':    emb_debug_apprentice,
  'consistent-builder':  emb_consistent_builder,
  'strategic-planner':   emb_strategic_planner,
  'rapid-debugger':      emb_rapid_debugger,
  'optimization-seeker': emb_optimization_seeker,
  'edge-case-hunter':    emb_edge_case_hunter,
  'adaptive-solver':     emb_adaptive_solver,
  'algorithmic-engineer':emb_algorithmic_engineer,
  'systems-thinker':     emb_systems_thinker,
  'cognitive-stable':    emb_cognitive_stable,
  'architect':           emb_architect,
  'grandmaster':         emb_grandmaster,
};

function buildProceduralBadge(badge, tier, locked) {
  const sc  = shieldCfg(tier);
  const group = new THREE.Group();
  const hs  = 0.80;

  // Shield outline shape
  const shape = new THREE.Shape();
  shape.moveTo( 0,     0.54);
  shape.lineTo( 0.42,  0.38);
  shape.lineTo( 0.42,  0.00);
  shape.quadraticCurveTo( 0.42, -0.42,  0.00, -0.56);
  shape.quadraticCurveTo(-0.42, -0.42, -0.42,  0.00);
  shape.lineTo(-0.42,  0.38);
  shape.closePath();

  // Inner hole
  const hole = new THREE.Path();
  hole.moveTo( 0,         0.54*hs);
  hole.lineTo( 0.42*hs,   0.38*hs);
  hole.lineTo( 0.42*hs,   0);
  hole.quadraticCurveTo( 0.42*hs, -0.42*hs,  0, -0.56*hs);
  hole.quadraticCurveTo(-0.42*hs, -0.42*hs, -0.42*hs, 0);
  hole.lineTo(-0.42*hs,   0.38*hs);
  hole.closePath();
  shape.holes.push(hole);

  // Metallic rim (silver for bronze/silver, gold for gold+)
  const rimMat = new THREE.MeshStandardMaterial({
    color:            locked ? 0x2a2a2a : sc.rim,
    metalness:        locked ? 0.18 : sc.rimMetal,
    roughness:        locked ? 0.82 : sc.rimRough,
    emissive:         new THREE.Color(locked ? 0 : sc.rimEmissive),
    emissiveIntensity: locked ? 0 : 0.6,
    envMapIntensity:   locked ? 0.10 : 2.6,
  });
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {
    depth:0.30, bevelEnabled:true, bevelSize:0.065, bevelThickness:0.065, bevelSegments:6, steps:1,
  }), rimMat);
  rim.castShadow = rim.receiveShadow = true;
  group.add(rim);

  // Dark red enamel body panel
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo( 0,         0.54*hs);
  bodyShape.lineTo( 0.42*hs,   0.38*hs);
  bodyShape.lineTo( 0.42*hs,   0);
  bodyShape.quadraticCurveTo( 0.42*hs, -0.42*hs,  0, -0.56*hs);
  bodyShape.quadraticCurveTo(-0.42*hs, -0.42*hs, -0.42*hs, 0);
  bodyShape.lineTo(-0.42*hs,   0.38*hs);
  bodyShape.closePath();
  const bodyMat = new THREE.MeshStandardMaterial({
    color:          locked ? 0x141414 : 0x3a0808,
    metalness:      0.05,
    roughness:      0.30,
    envMapIntensity: locked ? 0.1 : 0.8,
  });
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(bodyShape, {
    depth:0.08, bevelEnabled:false, steps:1,
  }), bodyMat);
  body.position.z = 0.14;
  body.castShadow = true;
  group.add(body);

  // Glow ring
  const glowGeo = new THREE.TorusGeometry(0.52, 0.018, 12, 90);
  glowGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 1.22, 1.0));
  const glowRing = new THREE.Mesh(glowGeo, new THREE.MeshStandardMaterial({
    color:            locked ? 0x111111 : sc.glow,
    emissive:         new THREE.Color(locked ? 0 : sc.glow),
    emissiveIntensity: locked ? 0 : 3.5,
    metalness:0, roughness:0.4,
  }));
  glowRing.position.z = 0.20;
  group.add(glowRing);

  // Emblem from dispatch table
  const badgeId = (badge && badge.id) ? badge.id.toLowerCase() : '';
  const emblFn  = EMBLEM_MAP[badgeId];
  if (emblFn) {
    const embl = emblFn(locked);
    embl.position.z = 0.22;
    group.add(embl);
  }

  // Centre the group
  const box = new THREE.Box3().setFromObject(group);
  group.position.sub(box.getCenter(new THREE.Vector3()));
  return group;
}

async function buildScene(canvas, badge) {
  const tier   = (badge.tier || 'bronze').toLowerCase();
  const locked = !badge.unlocked;
  const cfg    = TIER[tier] || TIER.bronze;

  // Size
  const W = canvas.clientWidth  || canvas.parentElement?.clientWidth  || 600;
  const H = canvas.clientHeight || canvas.parentElement?.clientHeight || 500;

  // Renderer
  const renderer = getOrCreateRenderer(canvas);
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // Scene
  const scene = new THREE.Scene();
  scene.background = null;  // transparent â€” CSS handles the panel colour
  _scene = scene;

  // Camera
  const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 50);
  camera.position.set(0, 0, 3.2);
  _camera = camera;

  // Environment map (HDRI â†’ fallback RoomEnvironment)
  const envMap = await loadEnvMap(renderer);
  scene.environment = envMap;

  // Lights (supplement IBL for dramatic depth)
  scene.add(new THREE.AmbientLight(0xffffff, locked ? 0.4 : 0.75));

  const key = new THREE.DirectionalLight(locked ? 0x888888 : 0xfff0d0, 2.8);
  key.position.set(2.5, 4, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const fill = new THREE.DirectionalLight(locked ? 0x1a1a1a : 0x2060ff, 0.9);
  fill.position.set(-3, 1.5, -1.5);
  scene.add(fill);

  if (!locked) {
    const rimLight = new THREE.DirectionalLight(0xff3000, 0.8);
    rimLight.position.set(0, -3, -2);
    scene.add(rimLight);

    const glowPt = new THREE.PointLight(cfg.glowColor, 1.8, 5);
    glowPt.position.set(0, 0, 1.6);
    scene.add(glowPt);
  }

  // Shadow catcher
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 6),
    new THREE.ShadowMaterial({ opacity: locked ? 0.18 : 0.40 })
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -1.4;
  catcher.receiveShadow = true;
  scene.add(catcher);

  // 3D Badge model â€” try GLB first, fall back to procedural
  let badgeGroup;
  try {
    badgeGroup = await loadGLB();
    // SVG emblem â†’ canvas texture
    const svgEl = document.querySelector(
      `.dna-badge-item[data-badge="${encodeURIComponent(badge.name)}"] svg`
    );
    let emblemTex = null;
    if (svgEl) {
      const canvas2 = document.createElement('canvas');
      canvas2.width = canvas2.height = 256;
      const img = new Image();
      const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      emblemTex  = new THREE.CanvasTexture(canvas2);
      emblemTex.colorSpace = THREE.SRGBColorSpace;
      img.onload = () => {
        canvas2.getContext('2d').drawImage(img, 0, 0, 256, 256);
        emblemTex.needsUpdate = true;
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
    applyTierToGLB(badgeGroup, tier, locked, emblemTex);
  } catch {
    badgeGroup = buildProceduralBadge(badge, tier, locked);
  }

  // Normalise scale
  const bbox    = new THREE.Box3().setFromObject(badgeGroup);
  const bsize   = bbox.getSize(new THREE.Vector3());
  const maxDim  = Math.max(bsize.x, bsize.y, bsize.z);
  const scale   = 1.8 / maxDim;
  badgeGroup.scale.setScalar(scale);
  badgeGroup.position.sub(bbox.getCenter(new THREE.Vector3()).multiplyScalar(scale));
  scene.add(badgeGroup);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.06;
  controls.autoRotate     = true;
  controls.autoRotateSpeed = badge.unlocked ? 1.6 : 0.8;
  controls.enablePan      = false;
  controls.minDistance    = 1.5;
  controls.maxDistance    = 6.5;
  _controls = controls;

  // Resize observer
  _resizeObs = new ResizeObserver(() => {
    if (!_renderer || !canvas.parentElement) return;
    const pw = canvas.parentElement.clientWidth;
    const ph = canvas.parentElement.clientHeight;
    if (!pw || !ph) return;
    renderer.setSize(pw, ph, false);
    camera.aspect = pw / ph;
    camera.updateProjectionMatrix();
  });
  _resizeObs.observe(canvas.parentElement);

  // Render loop
  (function tick() {
    _raf = requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  })();
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DESTROY
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function destroyScene() {
  if (_raf)      { cancelAnimationFrame(_raf); _raf = null; }
  if (_resizeObs){ _resizeObs.disconnect(); _resizeObs = null; }
  if (_controls) { _controls.dispose(); _controls = null; }
  if (_scene) {
    _scene.traverse((obj) => {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material?.dispose();
    });
    _scene = null;
  }
  // NOTE: renderer, HDRI, and GLB are intentionally cached for fast re-open
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PUBLIC API
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openBadge3D(badge) {
  const modal    = document.getElementById('badge3d-modal');
  const canvas   = document.getElementById('badge3d-canvas');
  const titleEl  = document.getElementById('badge3d-title');
  const tierEl   = document.getElementById('badge3d-tier');
  const descEl   = document.getElementById('badge3d-desc');
  const statusEl = document.getElementById('badge3d-status');
  if (!modal || !canvas) return;

  titleEl.textContent      = badge.name || 'Badge';
  tierEl.textContent       = (badge.tier || 'bronze').toUpperCase();
  tierEl.dataset.tier      = (badge.tier || 'bronze').toLowerCase();
  descEl.textContent       = badge.unlocked
    ? (badge.description || 'A prestigious achievement.')
    : 'Complete more sessions to unlock this badge.';
  statusEl.textContent     = badge.unlocked ? 'âœ¦ UNLOCKED' : 'âŠ˜ LOCKED';
  statusEl.dataset.locked  = badge.unlocked ? 'false' : 'true';

  modal.classList.remove('hidden', 'badge3d-closing');
  void modal.offsetWidth;
  modal.classList.add('badge3d-open');

  destroyScene();
  setTimeout(() => buildScene(canvas, badge), 80);
}

function closeBadge3D() {
  const modal = document.getElementById('badge3d-modal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.remove('badge3d-open');
  modal.classList.add('badge3d-closing');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('badge3d-closing');
    destroyScene();
  }, 420);
}

window.Badge3DViewer = { open: openBadge3D, close: closeBadge3D };

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBadge3D();
});
