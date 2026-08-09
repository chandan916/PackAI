import { Request, Response } from 'express';
import { PackingService } from '../services/packing.service';
import { AIService } from '../services/ai.service';
import { prisma } from '../lib/prisma';

export class OptimizeController {
  /**
   * POST /api/optimize
   */
  static async optimize(req: Request, res: Response) {
    try {
      const { container, packages } = req.body;

      if (!container || typeof container !== 'object') {
        return res.status(400).json({
          error: 'INVALID_INPUT',
          message: 'Container object with length, width, and height is required.',
        });
      }

      if (!packages || !Array.isArray(packages) || packages.length === 0) {
        return res.status(400).json({
          error: 'INVALID_INPUT',
          message: 'At least one package type must be specified.',
        });
      }

      // Execute 3D Packing Heuristic
      const { summary, containers } = PackingService.optimize(container, packages);

      // Generate AI Insight
      const aiInsight = await AIService.generateInsight(container, packages, summary, containers);

      const responsePayload = {
        summary,
        containers,
        aiInsight,
      };

      // Persist to database using Prisma
      try {
        await prisma.optimizationRun.create({
          data: {
            containerCount: summary.containersRequired,
            averageUtilization: summary.averageUtilization,
            emptySpacePercentage: summary.emptySpacePercentage,
            inputData: JSON.stringify({ container, packages }),
            resultData: JSON.stringify(responsePayload),
          },
        });
      } catch (dbErr) {
        console.warn('Database save failed (continuing response):', dbErr);
      }

      return res.status(200).json(responsePayload);
    } catch (error: any) {
      console.error('Optimization Controller Error:', error.message);
      return res.status(400).json({
        error: 'OPTIMIZATION_FAILED',
        message: error.message || 'Failed to process packing optimization.',
      });
    }
  }

  /**
   * GET /api/optimizations
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const history = await prisma.optimizationRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const formatted = history.map((run) => ({
        ...run,
        inputData: typeof run.inputData === 'string' ? JSON.parse(run.inputData) : run.inputData,
        resultData: typeof run.resultData === 'string' ? JSON.parse(run.resultData) : run.resultData,
      }));

      return res.status(200).json(formatted);
    } catch (error: any) {
      console.error('Get History Error:', error.message);
      return res.status(200).json([]);
    }
  }

  /**
   * GET /api/optimizations/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const run = await prisma.optimizationRun.findUnique({
        where: { id },
      });

      if (!run) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: `Optimization run with id "${id}" not found.`,
        });
      }

      const formatted = {
        ...run,
        inputData: typeof run.inputData === 'string' ? JSON.parse(run.inputData) : run.inputData,
        resultData: typeof run.resultData === 'string' ? JSON.parse(run.resultData) : run.resultData,
      };

      return res.status(200).json(formatted);
    } catch (error: any) {
      return res.status(500).json({
        error: 'DATABASE_ERROR',
        message: 'Failed to retrieve optimization run details.',
      });
    }
  }

  /**
   * GET /api/presets
   */
  static async getPresets(req: Request, res: Response) {
    try {
      const containers = await prisma.container.findMany();
      const packages = await prisma.packageType.findMany();

      if (containers.length > 0 && packages.length > 0) {
        return res.status(200).json({ containers, packages });
      }
    } catch (error: any) {
      console.warn('Prisma presets fetch failed, using built-in defaults:', error.message);
    }

    // Default presets
    return res.status(200).json({
      containers: [
        { id: '1', name: 'Standard Container', length: 120, width: 100, height: 100 },
        { id: '2', name: 'Large Container', length: 200, width: 150, height: 120 },
        { id: '3', name: 'Small Container', length: 80, width: 60, height: 60 },
      ],
      packages: [
        { id: '1', name: 'Small Box', length: 20, width: 20, height: 20 },
        { id: '2', name: 'Medium Box', length: 30, width: 20, height: 15 },
        { id: '3', name: 'Large Box', length: 40, width: 30, height: 20 },
        { id: '4', name: 'Electronics Box', length: 35, width: 25, height: 15 },
        { id: '5', name: 'Bottle Box', length: 25, width: 20, height: 30 },
      ],
    });
  }
}
