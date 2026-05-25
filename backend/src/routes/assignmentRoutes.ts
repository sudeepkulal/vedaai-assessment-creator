import { Router } from 'express';
import { 
  getAssignments, 
  getAssignmentById, 
  createAssignment, 
  deleteAssignment 
} from '../controllers/assignmentController';

const router = Router();

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.delete('/:id', deleteAssignment);

export default router;
