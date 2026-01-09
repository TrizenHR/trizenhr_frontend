import mongoose, { Document, Schema } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
}

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  workingHours?: number; // in hours
  notes?: string;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  photoUrl?: string; // Photo URL from MinIO storage
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
    },
    workingHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approved for regular check-ins
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    photoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique attendance per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save hook to calculate working hours
AttendanceSchema.pre('save', async function () {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut.getTime() - this.checkIn.getTime();
    this.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
});

const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
