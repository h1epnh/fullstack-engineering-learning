// backend/src/controllers/staff.controller.ts
import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { handleError } from '../utils/error.utils';

export class StaffController {
  private staffService: StaffService;

  constructor() {
    this.staffService = new StaffService();
  }

  getAllStaffs = async (req: Request, res: Response) => {
    try {
      const staffMembers = await this.staffService.getAllStaff();
      res.json(staffMembers);
    } catch (error) {
      handleError(res, error);
    }
  };

  getStaffById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const staffMember = await this.staffService.getStaffById(id);
      res.json(staffMember);
    } catch (error) {
      handleError(res, error);
    }
  };

  createStaff = async (req: Request, res: Response) => {
    try {
      const staffData = req.body;
      const staff = await this.staffService.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      handleError(res, error);
    }
  };

  updateStaff = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const staffData = req.body;
      const staff = await this.staffService.updateStaff(id, staffData);
      res.json(staff);
    } catch (error) {
      handleError(res, error);
    }
  };

  deleteStaff = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.staffService.deleteStaff(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  };
}
