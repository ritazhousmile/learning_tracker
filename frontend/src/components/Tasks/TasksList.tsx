import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Task, Goal } from '../../types';
import { taskService, goalService } from '../../services/api';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterGoal, setFilterGoal] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
    loadGoals();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await goalService.getGoals();
      setGoals(response.data);
    } catch (err: any) {
      console.error('Failed to load goals:', err);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleFormSuccess = () => {
    loadTasks();
  };

  const handleDeleteTask = (taskId: number) => {
    setDeletingTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingTaskId) {
      try {
        await taskService.deleteTask(deletingTaskId);
        setTasks(tasks.filter(task => task.id !== deletingTaskId));
        setDeleteDialogOpen(false);
        setDeletingTaskId(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete task');
        setDeleteDialogOpen(false);
        setDeletingTaskId(null);
      }
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus as any });
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task status');
    }
  };

  const getGoalTitle = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || 'Unknown Goal';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || task.status === filterStatus;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesGoal = !filterGoal || task.goal_id.toString() === filterGoal;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesGoal;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by status (in_progress first, then not_started, then completed)
    const statusOrder = { in_progress: 3, not_started: 2, completed: 1 };
    const aStatus = statusOrder[a.status] || 0;
    const bStatus = statusOrder[b.status] || 0;
    
    if (aStatus !== bStatus) {
      return bStatus - aStatus;
    }
    
    // Then by priority (high first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Then by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    
    // Finally by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTask}
        >
          New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="not_started">Not Started</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filterPriority}
            label="Priority"
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Goal</InputLabel>
          <Select
            value={filterGoal}
            label="Goal"
            onChange={(e) => setFilterGoal(e.target.value)}
          >
            <MenuItem value="">All Goals</MenuItem>
            {goals.map((goal) => (
              <MenuItem key={goal.id} value={goal.id.toString()}>
                {goal.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {tasks.length === 0 
              ? 'Create your first task to get started!' 
              : 'Try adjusting your search or filters'}
          </Typography>
          {tasks.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
            >
              Create Your First Task
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onUpdateStatus={handleUpdateStatus}
              goalTitle={getGoalTitle(task.goal_id)}
            />
          ))}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateTask}
      >
        <AddIcon />
      </Fab>

      {/* Task Form Dialog */}
      <TaskForm
        open={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        task={editingTask}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TasksList; 