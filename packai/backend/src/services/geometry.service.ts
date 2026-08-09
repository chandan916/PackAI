import { Placement, ContainerInput } from '../types/packing';

export interface BoxDimensions {
  length: number;
  width: number;
  height: number;
}

export class GeometryService {
  /**
   * Generates all unique 3D axis-aligned rotations for given dimensions.
   */
  static getRotations(length: number, width: number, height: number): BoxDimensions[] {
    const permutations: BoxDimensions[] = [
      { length: length, width: width, height: height },
      { length: length, width: height, height: width },
      { length: width, width: length, height: height },
      { length: width, width: height, height: length },
      { length: height, width: length, height: width },
      { length: height, width: width, height: length },
    ];

    // Deduplicate rotations
    const unique: BoxDimensions[] = [];
    const set = new Set<string>();

    for (const p of permutations) {
      const key = `${p.length}-${p.width}-${p.height}`;
      if (!set.has(key)) {
        set.add(key);
        unique.push(p);
      }
    }

    return unique;
  }

  /**
   * Checks 3D axis-aligned bounding box (AABB) collision between two placements.
   */
  static check3DOverlap(a: Placement, b: Placement): boolean {
    return (
      a.x < b.x + b.length &&
      a.x + a.length > b.x &&
      a.y < b.y + b.width &&
      a.y + a.width > b.y &&
      a.z < b.z + b.height &&
      a.z + a.height > b.z
    );
  }

  /**
   * Checks if candidate placement stays strictly within container bounds.
   */
  static fitsInContainer(
    x: number,
    y: number,
    z: number,
    dim: BoxDimensions,
    container: ContainerInput
  ): boolean {
    return (
      x + dim.length <= container.length &&
      y + dim.width <= container.width &&
      z + dim.height <= container.height
    );
  }

  /**
   * Calculates volume of 3D box.
   */
  static calculateVolume(length: number, width: number, height: number): number {
    return length * width * height;
  }
}
