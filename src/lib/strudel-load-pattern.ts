/**
 * Strudel load-sound playlist: one pattern is chosen at random and played once
 * when the home preloader finishes and the user has clicked (first gesture).
 * Add new entries to PLAYLIST to extend the set of sounds.
 */

export const STRUDEL_LOAD_DURATION_MS = 12000;

export interface StrudelPlaylistEntry {
  id: string;
  name?: string;
  code: string;
}

/** Playlist of Strudel patterns. Add more entries here to expand the pool. */
export const STRUDEL_LOAD_PLAYLIST: StrudelPlaylistEntry[] = [
  {
    id: 'pattern-1',
    name: 'bd/hh/sd/cp|cb/supersaw',
    code: `
setcpm(136/4)
stack(
  sound("bd*4".fast(1)).sometimesBy(0.6,x=>x.crush("4|2")),
  sound("hh8").swingBy(1/6,8).degradeBy(1/20),
  sound("--- sd?*2".fast(2)).decay("0.1|0.3").sometimesBy(0.25,x=>x.dist("8:0.2")),
  sound("cp|cb".fast("<4 8 4 2>")).sometimesBy(0.22,x=>x.dist("8:0.2")).sometimesBy(0.3,x=>x.lpf("600|1200".slow(2)).lpq("<5 20 10>")),
  note("c3 c3 c2 c2".fast("<2 8>")).sometimesBy(0.7,x=>x.vowel("<a i a i a i>".fast(7))).lpf(perlin.range(300,900).slow(3)).lpq("0|20").sound("supersaw").vib(4).n(1).gain(0.6)
)
`.trim(),
  },
  {
    id: 'pattern-2',
    name: 'sbd/hh/supersaw/wt_swordfish/perc03',
    code: `
setcps(135/60/4)
stack(
  sound("sbd sbd sbd").seg(8).dec(.5),
  n(2).sound("hh").seg(16).gain(sine.range(.3,1.0).slow(2)).degradeBy(.1).sometimesBy(.15,x=>x.ply(2)).pan(rand),
  n(irand(2).sometimes(x=>x.add(3))).scale("G1:Phrygian").sound("supersaw").seg(16).detune(.15).dec(.5).gain(.6).pan(.7).orbit(1),
  note("c2*8").s("wt_swordfish").seg(16).n((run(8).range(1,8)).add(irand(230)).add(irand(10))).fm(1).fmh(4).fmwave("square").dec(.55).lpf(perlin.range(100,2400).slow(4)).lpq(perlin.range(0,19).seg(5).slow("<5 3>/2")).ftype(2).phaser(rand.range(1,8).seg(8).slow(4)).gain(.3).pan(.3).orbit(2),
  sound("perc03").n(irand(6).sub(1).fast(4)).seg(4).gain(.7).speed(.9).degradeBy(.6).lpf(1600).delay(.5).room(.5).jux(rev).orbit(3)
)
`.trim(),
  },
];

/** Minimal pattern using only built-in synth (no samples). Use as last-resort fallback. */
export const STRUDEL_MINIMAL_PATTERN = `
setcps(1)
note("c3 e3 g3 c4").s("sawtooth").gain(0.25)
`.trim();

/**
 * Picks a random pattern from the playlist. Use this when starting the load sound.
 */
export function getRandomLoadPattern(): string {
  const list = STRUDEL_LOAD_PLAYLIST;
  if (list.length === 0) return '';
  const index = Math.floor(Math.random() * list.length);
  return list[index]!.code;
}
