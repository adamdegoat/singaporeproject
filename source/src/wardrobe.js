// ONE PERSON. The player is a single character, and walking, skating and
// riding are three MODELS of them built in two different files. Until
// 2026-08-05 each model invented its own colours:
//
//   walking  terracotta shirt, navy jeans, near-black shoes, black hair
//   skating  TEAL shirt, grey shorts, WHITE shoes, bald scalp under a cap
//   riding   terracotta shirt, navy jeans, near-black shoes, helmet
//
// so stepping off the board changed your shirt colour, your shoe colour and
// your hair, and the owner read it exactly right: "skating and walking
// different colour clothes like different person". Every figure now takes
// its materials from here and there is nowhere else to put a colour.
//
// The skater's palette won because it is the one on screen: skate is the
// default vehicle, every golden frame is shot over the board, and the teal
// sits better against sand and jungle than the terracotta did.
//
// HEADGEAR is the one thing allowed to differ, because in life it does: the
// cap is worn walking and skating, and swaps for a helmet on the scooter.
// The HAIR is built underneath either one, so the head reads as the same
// head with something different on it.

export const WARDROBE = {
  shirt: 0x2f6f7d,   // teal tee
  legs: 0x3b4250,    // navy shorts / jeans, same cloth either way
  skin: 0x8a6a52,
  hair: 0x241c16,
  // A FACE IS TWO DARK MARKS. Both figures had a bare skin sphere for a head,
  // which reads as a mannequin the moment the camera gets close — and the
  // avatar sheet gets close every time. Near-black rather than black: an eye in
  // shade under a cap brim goes to pure black on its own.
  eye: 0x1b1613,
  shoe: 0xf0ece1,    // off-white trainers
  cap: 0xe0dccf,     // cream cap, worn on foot and on the board
  helmet: 0xe6e2d8,  // scooter only
  visor: 0x2a3138,
};

// The materials, built once per figure. Lambert for cloth and skin (the world
// is fill-rate bound on a phone and these are on screen every frame);
// Standard only where a highlight is the point, which is headgear.
export function wardrobeMats(THREE) {
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
  return {
    shirt: lam(WARDROBE.shirt),
    legs: lam(WARDROBE.legs),
    skin: lam(WARDROBE.skin),
    hair: lam(WARDROBE.hair),
    eye: lam(WARDROBE.eye),
    shoe: lam(WARDROBE.shoe),
    cap: new THREE.MeshStandardMaterial({ color: WARDROBE.cap, roughness: 0.6 }),
    helmet: new THREE.MeshStandardMaterial({ color: WARDROBE.helmet, roughness: 0.3, metalness: 0.1 }),
    visor: new THREE.MeshStandardMaterial({ color: WARDROBE.visor, roughness: 0.1, metalness: 0.3 }),
  };
}
