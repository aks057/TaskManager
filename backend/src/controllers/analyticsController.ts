import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthenticatedRequest } from '../types';

export class AnalyticsController {
  static async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AnalyticsService.getOverview(req.user!.userId);

      ResponseHandler.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  static async getUserPerformance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const performance = await AnalyticsService.getUserPerformance(
        req.user!.userId
      );

      ResponseHandler.success(res, performance);
    } catch (error) {
      next(error);
    }
  }

  static async getTaskTrends(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month') || 'week';
      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined;
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined;

      const trends = await AnalyticsService.getTaskTrends(
        req.user!.userId,
        period,
        startDate,
        endDate
      );

      ResponseHandler.success(res, trends);
    } catch (error) {
      next(error);
    }
  }

  static async exportTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const format = (req.query.format as 'csv' | 'json') || 'json';
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
      };

      const data = await AnalyticsService.exportTasks(
        req.user!.userId,
        format,
        filters
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="tasks-export-${Date.now()}.csv"`
        );
        res.send(data);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="tasks-export-${Date.now()}.json"`
        );
        res.json({
          success: true,
          data,
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
