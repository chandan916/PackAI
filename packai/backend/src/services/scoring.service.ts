import { PackedContainer } from '../types/packing';

export class ScoringService {
  /**
   * Calculates optimization penalty score for a set of packed containers.
   * Lower score represents a better packing arrangement.
   */
  static calculateScore(containers: PackedContainer[], containerVolume: number): number {
    const containerCount = containers.length;
    const largePenalty = containerVolume * 10;
    const totalUnusedVolume = containers.reduce((sum, c) => sum + c.emptyVolume, 0);

    return containerCount * largePenalty + totalUnusedVolume;
  }
}
