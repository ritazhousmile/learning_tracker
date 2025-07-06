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
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Goal } from '../../types';
import { goalService } from '../../services/api';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';

const GoalsList: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await goalService.getGoals();
      // Map backend properties to frontend expectations
      const mappedGoals = response.data.map(goal => ({
        ...goal,
        progress: goal.progress_percentage,
        target_date: goal.deadline,
      }));
      setGoals(mappedGoals);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(undefined);
    setShowForm(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGoal(undefined);
  };

  const handleFormSuccess = () => {
    loadGoals();
  };

  const handleDeleteGoal = (goalId: number) => {
    setDeletingGoalId(goalId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingGoalId) {
      try {
        await goalService.deleteGoal(deletingGoalId);
        setGoals(goals.filter(goal => goal.id !== deletingGoalId));
        setDeleteDialogOpen(false);
        setDeletingGoalId(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete goal');
        setDeleteDialogOpen(false);
        setDeletingGoalId(null);
      }
    }
  };

  const handleToggleComplete = async (goalId: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const newProgress = goal.progress === 100 ? 0 : 100;
        const updatedGoal = { 
          progress_percentage: newProgress,
          progress: newProgress
        };
        await goalService.updateGoal(goalId, updatedGoal);
        loadGoals();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update goal');
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = !filterPriority || goal.priority === filterPriority;
    
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'completed' && goal.progress === 100) ||
                         (filterStatus === 'in_progress' && goal.progress > 0 && goal.progress < 100) ||
                         (filterStatus === 'not_started' && goal.progress === 0);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedGoals = filteredGoals.sort((a, b) => {
    // Sort by priority (high first), then by target date, then by creation date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    if (a.target_date && b.target_date) {
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    }
    
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
          Learning Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateGoal}
        >
          New Goal
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
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          sx={{ flex: 1, minWidth: 200 }}
        />
        
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
      </Box>

      {/* Goals List */}
      {sortedGoals.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {goals.length === 0 
              ? 'Create your first learning goal to get started!' 
              : 'Try adjusting your search or filters'}
          </Typography>
          {goals.length === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateGoal}
            >
              Create Your First Goal
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {sortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateGoal}
      >
        <AddIcon />
      </Fab>

      {/* Goal Form Dialog */}
      <GoalForm
        open={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        goal={editingGoal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this goal? This action cannot be undone.
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

export default GoalsList; 