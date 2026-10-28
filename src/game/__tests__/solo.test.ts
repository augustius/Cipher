import { nextPersonalBest } from '../solo';

describe('nextPersonalBest', () => {
  it('records the first solved run', () => {
    expect(nextPersonalBest(null, { attempts: 7, ms: 90000 })).toEqual({ attempts: 7, ms: 90000 });
  });

  it('prefers fewer attempts', () => {
    const best = { attempts: 7, ms: 1000 };

    expect(nextPersonalBest(best, { attempts: 6, ms: 99000 })).toEqual({ attempts: 6, ms: 99000 });
  });

  it('breaks equal attempts by faster time', () => {
    const best = { attempts: 7, ms: 50000 };

    expect(nextPersonalBest(best, { attempts: 7, ms: 40000 })).toEqual({ attempts: 7, ms: 40000 });
    expect(nextPersonalBest(best, { attempts: 7, ms: 60000 })).toBe(best);
  });
});
