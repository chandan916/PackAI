export interface ContainerInput {
  name?: string;
  length: number;
  width: number;
  height: number;
}

export interface PackageInput {
  id?: string;
  name: string;
  length: number;
  width: number;
  height: number;
  quantity: number;
  color?: string;
}

export interface Placement {
  packageTypeId: string;
  packageName: string;
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
  rotation: [number, number, number]; // [length, width, height]
  color?: string;
}

export interface PackedContainer {
  id: number;
  name: string;
  length: number;
  width: number;
  height: number;
  placements: Placement[];
  usedVolume: number;
  emptyVolume: number;
  utilization: number; // percentage e.g. 91.7
}

export interface OptimizationSummary {
  containersRequired: number;
  averageUtilization: number;
  emptySpacePercentage: number;
  totalPackages: number;
  packedPackages: number;
}

export interface OptimizationResult {
  summary: OptimizationSummary;
  containers: PackedContainer[];
  aiInsight: string;
}
