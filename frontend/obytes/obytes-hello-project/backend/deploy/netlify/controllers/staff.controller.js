"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const staff_service_1 = require("../services/staff.service");
const error_utils_1 = require("../utils/error.utils");
class StaffController {
    constructor() {
        this.getAllStaffs = async (req, res) => {
            try {
                const staffMembers = await this.staffService.getAllStaff();
                res.json(staffMembers);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.getStaffById = async (req, res) => {
            try {
                const { id } = req.params;
                const staffMember = await this.staffService.getStaffById(id);
                res.json(staffMember);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.createStaff = async (req, res) => {
            try {
                const staffData = req.body;
                const staff = await this.staffService.createStaff(staffData);
                res.status(201).json(staff);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.updateStaff = async (req, res) => {
            try {
                const { id } = req.params;
                const staffData = req.body;
                const staff = await this.staffService.updateStaff(id, staffData);
                res.json(staff);
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.deleteStaff = async (req, res) => {
            try {
                const { id } = req.params;
                await this.staffService.deleteStaff(id);
                res.status(204).send();
            }
            catch (error) {
                (0, error_utils_1.handleError)(res, error);
            }
        };
        this.staffService = new staff_service_1.StaffService();
    }
}
exports.StaffController = StaffController;
