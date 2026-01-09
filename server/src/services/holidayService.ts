import Holiday, { IHoliday, HolidayType } from '../models/Holiday';
import { startOfDay, endOfDay } from 'date-fns';

export class HolidayService {
  /**
   * Create a new holiday
   */
  async createHoliday(
    name: string,
    date: Date,
    type: HolidayType,
    createdBy: string,
    description?: string,
    isRecurring: boolean = false
  ): Promise<IHoliday> {
    const holiday = await Holiday.create({
      name,
      date: startOfDay(date),
      type,
      description,
      isRecurring,
      createdBy,
    });

    return holiday;
  }

  /**
   * Get all holidays with optional filters
   */
  async getAllHolidays(filters?: {
    year?: number;
    type?: HolidayType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<IHoliday[]> {
    const query: any = {};

    if (filters?.year) {
      const startDate = new Date(filters.year, 0, 1);
      const endDate = new Date(filters.year, 11, 31);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = startOfDay(filters.startDate);
      if (filters.endDate) query.date.$lte = endOfDay(filters.endDate);
    }

    const holidays = await Holiday.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 })
      .lean();

    return holidays;
  }

  /**
   * Get holiday by ID
   */
  async getHolidayById(id: string): Promise<IHoliday | null> {
    const holiday = await Holiday.findById(id)
      .populate('createdBy', 'firstName lastName')
      .lean();
    return holiday;
  }

  /**
   * Update holiday
   */
  async updateHoliday(
    id: string,
    updates: {
      name?: string;
      date?: Date;
      type?: HolidayType;
      description?: string;
      isRecurring?: boolean;
    }
  ): Promise<IHoliday | null> {
    const updateData: any = { ...updates };
    
    if (updates.date) {
      updateData.date = startOfDay(updates.date);
    }

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    return holiday;
  }

  /**
   * Delete holiday
   */
  async deleteHoliday(id: string): Promise<boolean> {
    const result = await Holiday.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Get holidays by date range (for calendar)
   */
  async getHolidaysByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IHoliday[]> {
    const holidays = await Holiday.find({
      date: {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate),
      },
    })
      .sort({ date: 1 })
      .lean();

    return holidays;
  }

  /**
   * Check if a specific date is a holiday
   */
  async isHoliday(date: Date): Promise<IHoliday | null> {
    const holiday = await Holiday.findOne({
      date: startOfDay(date),
    }).lean();

    return holiday;
  }

  /**
   * Get upcoming holidays
   */
  async getUpcomingHolidays(limit: number = 5): Promise<IHoliday[]> {
    const today = startOfDay(new Date());
    
    const holidays = await Holiday.find({
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .limit(limit)
      .lean();

    return holidays;
  }
}

export const holidayService = new HolidayService();
