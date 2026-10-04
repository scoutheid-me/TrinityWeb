import {it,expect} from 'vitest';
import {cavernHeight} from '../src/world/cavern';
it('climbs continuously from underground to the town landing',()=>{expect(cavernHeight(0)).toBe(-3);expect(cavernHeight(128)).toBe(-3);expect(cavernHeight(135)).toBe(-1.5);expect(cavernHeight(142)).toBe(0);expect(cavernHeight(170)).toBe(0);});
it('keeps each tread level across the diagonal corridor width',()=>{expect(cavernHeight(135+1.2,-18.75-1.6)).toBeCloseTo(cavernHeight(135,-18.75));});
