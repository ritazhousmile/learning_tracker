import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PlayArrow as PlayArrowIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, Goal } from '../../types';
import { taskService, goalService } from '../../services/api';
import TaskForm from './TaskForm';
import { format } from 'date-fns';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  const fetchTaskData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const taskResponse = await taskService.getTask(parseInt(id));
      const taskData = taskResponse.data;
      setTask(taskData);
      
      // Fetch associated goal
      if (taskData.goal_id) {
        const goalResponse = await goalService.getGoal(taskData.goal_id);
        setGoal(goalResponse.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch task data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (updatedTask: any) => {
    try {
      await taskService.updateTask(parseInt(id!), updatedTask);
      await fetchTaskData(); // Refresh task data
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    try {
      await taskService.deleteTask(task.id);
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    
    try {
      await taskService.updateTask(task.id, { status: newStatus });
      await fetchTaskData(); // Refresh to update status
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task status');
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

  const getStatusActions = (status: TaskStatus) => {
    const actions = [];
    
    if (status === TaskStatus.NOT_STARTED) {
      actions.push(
        <Button
          key="start"
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
          sx={{ mr: 1 }}
        >
          Start Task
        </Button>
      );
    }
    
    if (status === TaskStatus.IN_PROGRESS) {
      actions.push(
        <Button
          key="complete"
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
          sx={{ mr: 1 }}
        >
          Mark Complete
        </Button>
      );
    }
    
    if (status === TaskStatus.COMPLETED) {
      actions.push(
        <Button
          key="reopen"
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
          sx={{ mr: 1 }}
        >
          Reopen Task
        </Button>
      );
    }
    
    return actions;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading task details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/tasks')} startIcon={<ArrowBackIcon />}>
          Back to Tasks
        </Button>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Task not found
        </Alert>
        <Button onClick={() => navigate('/tasks')} startIcon={<ArrowBackIcon />}>
          Back to Tasks
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Task Details
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

      {/* Task Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusIcon(task.status)}
          <Typography variant="h5" component="h2" sx={{ ml: 2, flexGrow: 1 }}>
            {task.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Chip
            label={task.status.replace('_', ' ')}
            color={getStatusColor(task.status)}
            size="medium"
          />
          {task.priority && (
            <Chip
              icon={<FlagIcon />}
              label={task.priority}
              color={getPriorityColor(task.priority)}
              variant="outlined"
            />
          )}
          {task.due_date && (
            <Chip
              icon={<CalendarIcon />}
              label={format(new Date(task.due_date), 'MMM dd, yyyy')}
              color={isOverdue(task.due_date) && task.status !== TaskStatus.COMPLETED ? 'error' : 'default'}
              variant="outlined"
            />
          )}
          {task.estimated_hours && (
            <Chip
              icon={<AccessTimeIcon />}
              label={`${task.estimated_hours} hours`}
              variant="outlined"
            />
          )}
        </Box>

        {task.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {task.description}
            </Typography>
          </Box>
        )}

        {/* Status Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {getStatusActions(task.status)}
          </Box>
        </Box>
      </Paper>

      {/* Associated Goal */}
      {goal && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Associated Goal
          </Typography>
          <Card 
            variant="outlined" 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              }
            }}
            onClick={() => navigate(`/goals/${goal.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h3">
                  {goal.title}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<CategoryIcon />}
                  label={goal.category}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                {goal.priority && (
                  <Chip
                    icon={<FlagIcon />}
                    label={goal.priority}
                    color={getPriorityColor(goal.priority)}
                    size="small"
                    variant="outlined"
                  />
                )}
                {goal.deadline && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={format(new Date(goal.deadline), 'MMM dd, yyyy')}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              {goal.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {goal.description.length > 150 
                    ? `${goal.description.substring(0, 150)}...` 
                    : goal.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Progress: {goal.progress}%
                </Typography>
                <Button size="small" variant="outlined">
                  View Goal
                </Button>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={goal.progress}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Paper>
      )}

      {/* Task Timeline/History */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Task Timeline
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText
              primary="Task Created"
              secondary={format(new Date(task.created_at), 'MMM dd, yyyy - HH:mm')}
            />
          </ListItem>
          
          {task.status === TaskStatus.COMPLETED && task.completed_at && (
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Task Completed"
                secondary={format(new Date(task.completed_at), 'MMM dd, yyyy - HH:mm')}
              />
            </ListItem>
          )}
          
          {task.updated_at && task.updated_at !== task.created_at && (
            <ListItem>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText
                primary="Last Updated"
                secondary={format(new Date(task.updated_at), 'MMM dd, yyyy - HH:mm')}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Task Statistics */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Task Information
        </Typography>
        
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
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" color="primary">
                {task.status.replace('_', ' ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Status
              </Typography>
            </CardContent>
          </Card>
          
          {task.estimated_hours && (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" color="info.main">
                  {task.estimated_hours}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated Time
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {task.priority && (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <FlagIcon sx={{ fontSize: 40, color: getPriorityColor(task.priority) + '.main', mb: 1 }} />
                <Typography variant="h6" color={getPriorityColor(task.priority) + '.main'}>
                  {task.priority}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Priority Level
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {task.due_date && (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <CalendarIcon sx={{ 
                  fontSize: 40, 
                  color: isOverdue(task.due_date) && task.status !== TaskStatus.COMPLETED ? 'error.main' : 'success.main',
                  mb: 1 
                }} />
                <Typography variant="h6" color={isOverdue(task.due_date) && task.status !== TaskStatus.COMPLETED ? 'error.main' : 'success.main'}>
                  {isOverdue(task.due_date) && task.status !== TaskStatus.COMPLETED ? 'Overdue' : 'On Time'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Due Status
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>

      {/* Edit Task Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TaskForm
            initialData={task}
            onSubmit={handleEditTask}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail; 