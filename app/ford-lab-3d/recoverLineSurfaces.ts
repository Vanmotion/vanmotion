import * as THREE from "three";

/**
 * Some OBJ distributions contain the visible vehicle shell as connected `l`
 * edges rather than `f` polygons. OBJLoader displays those as LineSegments;
 * hiding them makes the body disappear. Reconstruct only closed triangular
 * cycles from the supplied source coordinates. No geometry is fabricated when
 * the graph cannot establish closed faces.
 *
 * This is a local diagnostic restoration, not a replacement for a proper
 * watertight mesh from a modelling application.
 */
export type SurfaceRecovery = {
  recoveredTriangles: number;
  reconstructedGroups: number;
  edgeGroups: number;
  unresolvedGroups: number;
};

type Edge = [number, number];
type V3 = [number, number, number];

function trianglesFromSegments(line: THREE.LineSegments): {geometry: THREE.BufferGeometry; count: number} | null {
  const p = line.geometry.getAttribute("position");
  if (!p || p.itemSize < 3) return null;
  const index = line.geometry.getIndex();
  const length = index?.count ?? p.count;
  if (length < 36) return null;

  const bounds = new THREE.Box3().setFromBufferAttribute(p as THREE.BufferAttribute);
  const size = bounds.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 0.001);
  // Relative quantization handles duplicate OBJ positions rounded by Float32.
  const precision = 100000 / span;
  const keyToId = new Map<string, number>();
  const points: V3[] = [];
  const adjacency: Array<Set<number>> = [];
  const edges: Edge[] = [];
  const distinct = new Set<string>();

  function vertex(bufferIndex: number): number {
    const x = p.getX(bufferIndex), y = p.getY(bufferIndex), z = p.getZ(bufferIndex);
    const key = `${Math.round(x * precision)},${Math.round(y * precision)},${Math.round(z * precision)}`;
    const existing = keyToId.get(key);
    if (existing !== undefined) return existing;
    const id = points.length;
    keyToId.set(key, id);
    points.push([x, y, z]);
    adjacency.push(new Set<number>());
    return id;
  }

  for (let i=0; i+1<length; i+=2) {
    const a = vertex(index ? index.getX(i) : i);
    const b = vertex(index ? index.getX(i+1) : i+1);
    if (a === b) continue;
    const low = Math.min(a,b), high = Math.max(a,b);
    const key = `${low}:${high}`;
    if (distinct.has(key)) continue;
    distinct.add(key);
    edges.push([low,high]);
    adjacency[low].add(high);
    adjacency[high].add(low);
  }
  if (edges.length < 24) return null;

  // Outward-facing orientation based on geometric centre. The resulting
  // material is DoubleSide so that irregular edge winding remains visible.
  const center: V3 = [
    (bounds.min.x + bounds.max.x)/2,
    (bounds.min.y + bounds.max.y)/2,
    (bounds.min.z + bounds.max.z)/2,
  ];
  const indices: number[] = [];
  const minArea = span * span * 1e-12;
  const maxEdges = 750000;
  if (edges.length > maxEdges) return null;

  for (const [a,b] of edges) {
    const neighborA = adjacency[a], neighborB = adjacency[b];
    if (neighborA.size > 75 || neighborB.size > 75) continue;
    const smaller = neighborA.size < neighborB.size ? neighborA : neighborB;
    const larger  = smaller === neighborA ? neighborB : neighborA;
    for (const c of smaller) {
      if (c <= b || !larger.has(c)) continue;
      const va = points[a], vb = points[b], vc = points[c];
      const abx=vb[0]-va[0], aby=vb[1]-va[1], abz=vb[2]-va[2];
      const acx=vc[0]-va[0], acy=vc[1]-va[1], acz=vc[2]-va[2];
      const nx=aby*acz-abz*acy, ny=abz*acx-abx*acz, nz=abx*acy-aby*acx;
      const area2=nx*nx+ny*ny+nz*nz;
      if(area2 < minArea)continue;
      const tx=(va[0]+vb[0]+vc[0])/3-center[0];
      const ty=(va[1]+vb[1]+vc[1])/3-center[1];
      const tz=(va[2]+vb[2]+vc[2])/3-center[2];
      const outward=nx*tx+ny*ty+nz*tz;
      if(outward >= 0)indices.push(a,b,c);
      else indices.push(a,c,b);
    }
  }
  if(indices.length < 90)return null;

  const coords = new Float32Array(points.length * 3);
  for(let i=0;i<points.length;i++){
    coords[i*3]=points[i][0]; coords[i*3+1]=points[i][1]; coords[i*3+2]=points[i][2];
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.BufferAttribute(coords,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return {geometry,count:indices.length/3};
}

export function recoverLineSurfaces(model: THREE.Group): SurfaceRecovery {
  const stats: SurfaceRecovery = {recoveredTriangles:0,reconstructedGroups:0,edgeGroups:0,unresolvedGroups:0};
  const objects: THREE.LineSegments[]=[];
  model.traverse(item=>{
    if(item instanceof THREE.LineSegments)objects.push(item);
  });
  for(const line of objects){
    stats.edgeGroups++;
    const result=trianglesFromSegments(line);
    if(result){
      const mat=new THREE.MeshPhysicalMaterial({
        color:0x172b4d,metalness:.22,roughness:.46,
        clearcoat:.38,clearcoatRoughness:.25,side:THREE.DoubleSide,
      });
      const surface=new THREE.Mesh(result.geometry,mat);
      surface.name=`RecoveredShell_${stats.reconstructedGroups}`;
      surface.position.copy(line.position);
      surface.quaternion.copy(line.quaternion);
      surface.scale.copy(line.scale);
      surface.castShadow=true;
      surface.receiveShadow=true;
      line.parent?.add(surface);
      line.visible=false;
      stats.recoveredTriangles+=result.count;
      stats.reconstructedGroups++;
    }else{
      // Preserve an unobtrusive trace of any unfaced sub-mesh rather than
      // deleting body detail as the previous patch did.
      const faint=new THREE.LineBasicMaterial({color:0x58739a,transparent:true,opacity:.31,depthWrite:false});
      line.material=faint;
      line.visible=true;
      stats.unresolvedGroups++;
    }
  }
  return stats;
}
