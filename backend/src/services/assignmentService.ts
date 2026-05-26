import Assignment, { IAssignment } from '../models/Assignment';
import { addAssignmentJob } from '../queues/assignmentQueue';

export class AssignmentService {
  static async getAllAssignments(search?: string, filter?: string): Promise<IAssignment[]> {
    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (filter && filter !== 'All') {
      query.status = filter.toLowerCase();
    }

    // Sort by newest created first
    return Assignment.find(query).sort({ createdAt: -1 });
  }

  static async getAssignmentById(id: string): Promise<IAssignment | null> {
    return Assignment.findById(id);
  }

  static async createAssignment(data: any): Promise<IAssignment> {
    const { title, topic, gradeLevel, difficulty, dueDate, configs, instructions } = data;

    // Create record in generating status
    const assignment = new Assignment({
      title,
      topic,
      gradeLevel,
      difficulty,
      dueDate,
      assignedOn: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      status: 'generating',
      instructions,
      questions: [],
    });

    await assignment.save();

    // Push task onto BullMQ background queue
    await addAssignmentJob(assignment._id.toString(), {
      title,
      topic,
      gradeLevel,
      difficulty,
      configs,
      instructions,
    });

    return assignment;
  }

  static async deleteAssignment(id: string): Promise<IAssignment | null> {
    return Assignment.findByIdAndDelete(id);
  }
}
