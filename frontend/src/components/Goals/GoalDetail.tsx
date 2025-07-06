import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { Goal, Task, TaskStatus } from '../../types';
import { goalService, taskService } from '../../services/api';
import GoalForm from './GoalForm';
import TaskForm from '../Tasks/TaskForm';
import { format } from 'date-fns';

const GoalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchGoalData();
  }, [id]);

  const fetchGoalData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [goalResponse, tasksResponse] = await Promise.all([
        goalService.getGoal(parseInt(id)),
        taskService.getTasks()
      ]);
      
      setGoal(goalResponse.data);
      // Filter tasks for this goal
      const goalTasks = tasksResponse.data.filter(task => task.goal_id === parseInt(id));
      setTasks(goalTasks);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch goal data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = async (updatedGoal: Goal) => {
    try {
      await goalService.updateGoal(updatedGoal.id, updatedGoal);
      setGoal(updatedGoal);
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update goal');
    }
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;
    
    try {
      await goalService.deleteGoal(goal.id);
      navigate('/goals');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete goal');
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      await fetchGoalData(); // Refresh to update progress
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task status');
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await taskService.createTask({ ...taskData, goal_id: parseInt(id!) });
      await fetchGoalData(); // Refresh to show new task
      setTaskFormOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleEditTask = async (taskData: any) => {
    if (!editingTask) return;
    
    try {
      await taskService.updateTask(editingTask.id, taskData);
      await fetchGoalData(); // Refresh to show updated task
      setEditingTask(null);
      setTaskFormOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      await fetchGoalData(); // Refresh to remove deleted task
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'success';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircleIcon color="success" />;
      case TaskStatus.IN_PROGRESS:
        return <PlayArrowIcon color="warning" />;
      case TaskStatus.NOT_STARTED:
        return <RadioButtonUncheckedIcon color="action" />;
      default:
        return <RadioButtonUncheckedIcon color="action" />;
    }
  };

  const getStatusColor = (status: TaskStatus): 'success' | 'warning' | 'default' => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'success';
      case TaskStatus.IN_PROGRESS: return 'warning';
      case TaskStatus.NOT_STARTED: return 'default';
      default: return 'default';
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading goal details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/goals')} startIcon={<ArrowBackIcon />}>
          Back to Goals
        </Button>
      </Box>
    );
  }

  if (!goal) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Goal not found
        </Alert>
        <Button onClick={() => navigate('/goals')} startIcon={<ArrowBackIcon />}>
          Back to Goals
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/goals')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Goal Details
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
          sx={{ mr: 2 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Goal Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {goal.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip
            icon={<CategoryIcon />}
            label={goal.category}
            color="primary"
            variant="outlined"
          />
          {goal.priority && (
            <Chip
              icon={<FlagIcon />}
              label={goal.priority}
              color={getPriorityColor(goal.priority)}
              variant="outlined"
            />
          )}
          {goal.deadline && (
            <Chip
              icon={<CalendarIcon />}
              label={format(new Date(goal.deadline), 'MMM dd, yyyy')}
              color={isOverdue(goal.deadline) ? 'error' : 'default'}
              variant="outlined"
            />
          )}
        </Box>

        {goal.description && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {goal.description}
          </Typography>
        )}

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Progress: {goal.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={goal.progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Statistics */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          }, 
          gap: 2 
        }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {tasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== TaskStatus.COMPLETED).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Tasks Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h3">
            Tasks ({tasks.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setTaskFormOpen(true)}
          >
            Add Task
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first task to start working towards this goal
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTaskFormOpen(true)}
            >
              Create Task
            </Button>
          </Box>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {getStatusIcon(task.status)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {task.title}
                        </Typography>
                        <Chip
                          label={task.status.replace('_', ' ')}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                        {task.priority && (
                          <Chip
                            label={task.priority}
                            color={getPriorityColor(task.priority)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {task.description && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {task.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          {task.due_date && (
                            <Typography variant="caption" color="text.secondary">
                              Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </Typography>
                          )}
                          {task.estimated_hours && (
                            <Typography variant="caption" color="text.secondary">
                              Est: {task.estimated_hours}h
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Status transition buttons */}
                      {task.status === TaskStatus.NOT_STARTED && (
                        <Tooltip title="Start Task">
                          <IconButton
                            size="small"
                            onClick={() => handleTaskStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {task.status === TaskStatus.IN_PROGRESS && (
                        <Tooltip title="Mark Complete">
                          <IconButton
                            size="small"
                            onClick={() => handleTaskStatusChange(task.id, TaskStatus.COMPLETED)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit Task">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingTask(task);
                            setTaskFormOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Task">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < tasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Edit Goal Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Goal</DialogTitle>
        <DialogContent>
          <GoalForm
            initialData={goal}
            onSubmit={handleEditGoal}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Goal Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this goal? This action cannot be undone.
            All associated tasks will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteGoal} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Form Dialog */}
      <Dialog
        open={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <TaskForm
            initialData={editingTask || undefined}
            onSubmit={editingTask ? handleEditTask : handleCreateTask}
            onCancel={() => {
              setTaskFormOpen(false);
              setEditingTask(null);
            }}
            hideGoalSelection={true}
          />
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setTaskFormOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default GoalDetail; 