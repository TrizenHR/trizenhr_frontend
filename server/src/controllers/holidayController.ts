import { Request, Response } from 'express';
import { holidayService } from '../services/holidayService';
import { HolidayType } from '../models/Holiday';

export class HolidayController {
  /**
   * Create new holiday
   */
  async createHoliday(req: Request, res: Response): Promise<void> {
    try {
      const { name, date, type, description, isRecurring } = req.body;
      const createdBy = req.user!.userId;

      if (!name || !date) {
        res.status(400).json({
          success: false,
          error: 'Name and date are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const holiday = await holidayService.createHoliday(
        name,
        new Date(date),
        type as HolidayType || HolidayType.COMPANY,
        createdBy,
        description,
        isRecurring || false
      );

      res.status(201).json({
        success: true,
        message: 'Holiday created successfully',
        data: holiday,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create holiday',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all holidays
   */
  async getAllHolidays(req: Request, res: Response): Promise<void> {
    try {
      const { year, type, startDate, endDate } = req.query;

      const filters: any = {};
      if (year) filters.year = parseInt(year as string);
      if (type) filters.type = type as HolidayType;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const holidays = await holidayService.getAllHolidays(filters);

      res.status(200).json({
        success: true,
        data: holidays,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get holidays',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get holiday by ID
   */
  async getHolidayById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const holiday = await holidayService.getHolidayById(id);

      if (!holiday) {
        res.status(404).json({
          success: false,
          error: 'Holiday not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: holiday,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get holiday',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update holiday
   */
  async updateHoliday(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, date, type, description, isRecurring } = req.body;

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (date !== undefined) updates.date = new Date(date);
      if (type !== undefined) updates.type = type;
      if (description !== undefined) updates.description = description;
      if (isRecurring !== undefined) updates.isRecurring = isRecurring;

      const holiday = await holidayService.updateHoliday(id, updates);

      if (!holiday) {
        res.status(404).json({
          success: false,
          error: 'Holiday not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Holiday updated successfully',
        data: holiday,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update holiday',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete holiday
   */
  async deleteHoliday(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await holidayService.deleteHoliday(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Holiday not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Holiday deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete holiday',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Check if date is a holiday
   */
  async checkHoliday(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;

      const holiday = await holidayService.isHoliday(new Date(date));

      res.status(200).json({
        success: true,
        data: {
          isHoliday: !!holiday,
          holiday: holiday || null,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check holiday',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get upcoming holidays
   */
  async getUpcomingHolidays(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;

      const holidays = await holidayService.getUpcomingHolidays(
        limit ? parseInt(limit as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: holidays,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get upcoming holidays',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const holidayController = new HolidayController();
