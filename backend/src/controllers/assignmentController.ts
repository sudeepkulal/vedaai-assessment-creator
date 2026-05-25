import { Request, Response } from 'express';
import { AssignmentService } from '../services/assignmentService';

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, filter } = req.query;
    const list = await AssignmentService.getAllAssignments(
      search as string,
      filter as string
    );
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await AssignmentService.getAssignmentById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json(assignment);
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await AssignmentService.createAssignment(req.body);
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await AssignmentService.deleteAssignment(id);
    if (!deleted) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: error.message });
  }
};
