// Swept car bounds against a handful of static building boxes. No physics engine.
const CAR_HALF = {x:25, y:14, z:25};
const AXES = ['x','y','z'];

function sweep(start, delta, box) {
  let enter = -Infinity, exit = Infinity, axis = null, sign = 0;
  for (const key of AXES) {
    const low = box.min[key] - CAR_HALF[key];
    const high = box.max[key] + CAR_HALF[key];
    if (Math.abs(delta[key]) < 1e-9) {
      if (start[key] < low || start[key] > high) return null;
      continue;
    }
    let a = (low-start[key])/delta[key], b = (high-start[key])/delta[key];
    if (a>b) [a,b]=[b,a];
    if (a>enter) { enter=a;axis=key;sign=delta[key]>0?-1:1; }
    exit=Math.min(exit,b);
    if (enter>exit) return null;
  }
  if (exit<0 || enter<0 || enter>1 || !axis) return null;
  return {time:enter,axis,sign};
}

export function advanceFlight(flight, dt, buildings) {
  const p=flight.position;
  flight.vy-=350*dt;
  let remaining=dt;
  // Up to three contacts handles corners without stepping through a wall.
  for (let i=0;i<3 && remaining>1e-6;i++) {
    const start={x:p.x,y:p.y+14,z:p.z};
    const delta={x:flight.vx*remaining,y:flight.vy*remaining,z:flight.vz*remaining};
    let contact=null;
    for (const building of buildings) {
      const hit=sweep(start,delta,building);
      if (hit && (!contact || hit.time<contact.time)) contact=hit;
    }
    const fraction=contact?contact.time:1;
    for (const key of AXES) p[key]+=delta[key]*fraction;
    if (!contact) return;
    p[contact.axis]+=contact.sign*.02;
    const velocityKey='v'+contact.axis;
    flight[velocityKey]*=-.35;
    for (const key of AXES) if (key!==contact.axis) flight['v'+key]*=.8;
    remaining*=1-fraction;
  }
}
