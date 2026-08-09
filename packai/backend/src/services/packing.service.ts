import {
  ContainerInput,
  PackageInput,
  Placement,
  PackedContainer,
  OptimizationSummary,
  OptimizationResult,
} from '../types/packing';
import { GeometryService, BoxDimensions } from './geometry.service';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const PALETTE = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export class PackingService {
  /**
   * Main packing optimization function.
   */
  static optimize(
    container: ContainerInput,
    packages: PackageInput[]
  ): { summary: OptimizationSummary; containers: PackedContainer[] } {
    // 1. Input Validation
    if (container.length <= 0 || container.width <= 0 || container.height <= 0) {
      throw new Error('Container dimensions must be greater than zero.');
    }

    if (!packages || packages.length === 0) {
      throw new Error('At least one package type must be provided.');
    }

    const containerVol = GeometryService.calculateVolume(
      container.length,
      container.width,
      container.height
    );

    // Expand packages into individual items, assigning colors
    interface ExpandedItem {
      packageTypeId: string;
      packageName: string;
      length: number;
      width: number;
      height: number;
      volume: number;
      color: string;
    }

    const expandedItems: ExpandedItem[] = [];

    packages.forEach((pkg, idx) => {
      if (pkg.length <= 0 || pkg.width <= 0 || pkg.height <= 0) {
        throw new Error(`Package "${pkg.name}" has invalid dimensions (must be > 0).`);
      }
      if (pkg.quantity <= 0) {
        throw new Error(`Package "${pkg.name}" quantity must be greater than zero.`);
      }

      // Check if item fits in empty container in AT LEAST ONE rotation
      const rotations = GeometryService.getRotations(pkg.length, pkg.width, pkg.height);
      const canFitAnyRotation = rotations.some((rot) =>
        GeometryService.fitsInContainer(0, 0, 0, rot, container)
      );

      if (!canFitAnyRotation) {
        throw new Error(
          `❌ Package "${pkg.name}" (${pkg.length}×${pkg.width}×${pkg.height}) cannot fit inside container (${container.length}×${container.width}×${container.height}) in any orientation.`
        );
      }

      const color = pkg.color || PALETTE[idx % PALETTE.length];
      const itemVol = GeometryService.calculateVolume(pkg.length, pkg.width, pkg.height);

      for (let i = 0; i < pkg.quantity; i++) {
        expandedItems.push({
          packageTypeId: pkg.id || `pkg-${idx}`,
          packageName: pkg.name,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          volume: itemVol,
          color,
        });
      }
    });

    // Sort items by volume descending (largest packages packed first)
    expandedItems.sort((a, b) => b.volume - a.volume);

    const totalPackages = expandedItems.length;
    let packedPackagesCount = 0;

    const packedContainers: PackedContainer[] = [];

    // Bin Packing Loop
    let currentItemIdx = 0;

    while (currentItemIdx < expandedItems.length) {
      const containerId = packedContainers.length + 1;
      const placements: Placement[] = [];

      // Candidate insertion points for current container
      const candidatePoints: Point3D[] = [{ x: 0, y: 0, z: 0 }];

      const addCandidatePoint = (pt: Point3D) => {
        // Only add if inside container bounds and not duplicate
        if (
          pt.x < container.length &&
          pt.y < container.width &&
          pt.z < container.height
        ) {
          if (!candidatePoints.some((cp) => cp.x === pt.x && cp.y === pt.y && cp.z === pt.z)) {
            candidatePoints.push(pt);
            // Keep points sorted by z, then y, then x (bottom-up, back-to-front, left-to-right)
            candidatePoints.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
          }
        }
      };

      // Try placing items in the current container
      let index = currentItemIdx;
      const unplacedInThisContainer: ExpandedItem[] = [];

      for (; index < expandedItems.length; index++) {
        const item = expandedItems[index];
        const rotations = GeometryService.getRotations(item.length, item.width, item.height);

        let placed = false;

        // Try candidate points
        for (let pIdx = 0; pIdx < candidatePoints.length; pIdx++) {
          const pt = candidatePoints[pIdx];

          // Try each rotation
          for (const rot of rotations) {
            if (!GeometryService.fitsInContainer(pt.x, pt.y, pt.z, rot, container)) {
              continue;
            }

            const candidatePlacement: Placement = {
              packageTypeId: item.packageTypeId,
              packageName: item.packageName,
              x: pt.x,
              y: pt.y,
              z: pt.z,
              length: rot.length,
              width: rot.width,
              height: rot.height,
              rotation: [rot.length, rot.width, rot.height],
              color: item.color,
            };

            // Check collision with already placed boxes
            const hasCollision = placements.some((p) =>
              GeometryService.check3DOverlap(candidatePlacement, p)
            );

            if (!hasCollision) {
              // Successfully placed!
              placements.push(candidatePlacement);
              placed = true;
              packedPackagesCount++;

              // Remove used candidate point
              candidatePoints.splice(pIdx, 1);

              // Add new candidate points generated by this placement
              addCandidatePoint({ x: pt.x + rot.length, y: pt.y, z: pt.z });
              addCandidatePoint({ x: pt.x, y: pt.y + rot.width, z: pt.z });
              addCandidatePoint({ x: pt.x, y: pt.y, z: pt.z + rot.height });

              break;
            }
          }

          if (placed) break;
        }

        if (!placed) {
          unplacedInThisContainer.push(item);
        }
      }

      // Compute volume metrics for this container
      const usedVolume = placements.reduce(
        (sum, p) => sum + GeometryService.calculateVolume(p.length, p.width, p.height),
        0
      );
      const emptyVolume = Math.max(0, containerVol - usedVolume);
      const utilization = Number(((usedVolume / containerVol) * 100).toFixed(1));

      packedContainers.push({
        id: containerId,
        name: `${container.name || 'Container'} ${containerId}`,
        length: container.length,
        width: container.width,
        height: container.height,
        placements,
        usedVolume,
        emptyVolume,
        utilization,
      });

      // Update remaining unplaced items for next container iteration
      if (unplacedInThisContainer.length === 0) {
        break; // All items placed!
      } else {
        // Move unplaced items to start of next container round
        expandedItems.splice(0, expandedItems.length, ...unplacedInThisContainer);
        currentItemIdx = 0;
      }
    }

    const totalContainers = packedContainers.length;
    const avgUtil = Number(
      (
        packedContainers.reduce((sum, c) => sum + c.utilization, 0) / totalContainers
      ).toFixed(1)
    );
    const emptySpacePct = Number((100 - avgUtil).toFixed(1));

    const summary: OptimizationSummary = {
      containersRequired: totalContainers,
      averageUtilization: avgUtil,
      emptySpacePercentage: emptySpacePct,
      totalPackages,
      packedPackages: packedPackagesCount,
    };

    return { summary, containers: packedContainers };
  }
}
