import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const staffController = new StaffController();

router.get('/', staffController.getAllStaffs);
router.get('/:id', staffController.getStaffById);
router.post('/', authMiddleware, staffController.createStaff);
router.put('/:id', authMiddleware, staffController.updateStaff);
router.delete('/:id', authMiddleware, staffController.deleteStaff);

export default router;
