import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Task, Goal } from '../../types';
import { taskService, goalService } from '../../services/api';

// Legacy interface for backward compatibility
interface LegacyTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task;
}

// New interface for detail pages
interface NewTaskFormProps {
  initialData?: Task;
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
  hideGoalSelection?: boolean;
}

type TaskFormProps = LegacyTaskFormProps | NewTaskFormProps;

const TaskForm: React.FC<TaskFormProps> = (props) => {
  // Check if it's the legacy interface
  const isLegacyInterface = 'open' in props;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_id: null as number | null,
    due_date: null as Date | null,
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_hours: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (isLegacyInterface) {
      if (props.open) {
        loadGoals();
      }
    } else {
      if (!props.hideGoalSelection) {
        loadGoals();
      }
    }
  }, [isLegacyInterface ? (props as LegacyTaskFormProps).open : true]);

  useEffect(() => {
    if (isLegacyInterface) {
      const { task } = props as LegacyTaskFormProps;
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          goal_id: task.goal_id,
          due_date: task.due_date ? new Date(task.due_date) : null,
          priority: task.priority || 'medium',
          estimated_hours: task.estimated_hours?.toString() || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          goal_id: null,
          due_date: null,
          priority: 'medium',
          estimated_hours: '',
        });
      }
      setError('');
    } else {
      const { initialData } = props as NewTaskFormProps;
      if (initialData) {
        setFormData({
          title: initialData.title,
          description: initialData.description || '',
          goal_id: initialData.goal_id,
          due_date: initialData.due_date ? new Date(initialData.due_date) : null,
          priority: initialData.priority || 'medium',
          estimated_hours: initialData.estimated_hours?.toString() || '',
        });
      }
      setError('');
    }
  }, [isLegacyInterface ? (props as LegacyTaskFormProps).task : (props as NewTaskFormProps).initialData]);

  const loadGoals = async () => {
    try {
      const response = await goalService.getGoals();
      setGoals(response.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLegacyInterface) {
        const { task, onSuccess, onClose } = props as LegacyTaskFormProps;
        
        if (task) {
          // For updates, goal_id can be null
          const payload = {
            title: formData.title,
            description: formData.description,
            goal_id: formData.goal_id,
            due_date: formData.due_date ? formData.due_date.toISOString() : undefined,
            priority: formData.priority,
            estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
          };
          await taskService.updateTask(task.id, payload);
        } else {
          // For creation, ensure goal_id is not null
          if (!formData.goal_id) {
            setError('Please select a goal for this task');
            setLoading(false);
            return;
          }
          
          const payload = {
            title: formData.title,
            description: formData.description,
            goal_id: formData.goal_id, // TypeScript now knows this is not null
            due_date: formData.due_date ? formData.due_date.toISOString() : undefined,
            priority: formData.priority,
            estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
          };
          await taskService.createTask(payload);
        }

        onSuccess();
        onClose();
      } else {
        const { onSubmit, hideGoalSelection } = props as NewTaskFormProps;
        
        // For new interface, allow creation without goal_id when hideGoalSelection is true
        if (!hideGoalSelection && !formData.goal_id) {
          setError('Please select a goal for this task');
          setLoading(false);
          return;
        }
        
        const payload = {
          title: formData.title,
          description: formData.description,
          goal_id: formData.goal_id,
          due_date: formData.due_date ? formData.due_date.toISOString() : undefined,
          priority: formData.priority,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
        };
        
        await onSubmit(payload);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    if (isLegacyInterface) {
      (props as LegacyTaskFormProps).onClose();
    } else {
      (props as NewTaskFormProps).onCancel();
    }
  };

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Task Title"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        required
        fullWidth
      />
      
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        multiline
        rows={3}
        fullWidth
      />
      
      {/* Only show goal selection if not hidden */}
      {!(!isLegacyInterface && (props as NewTaskFormProps).hideGoalSelection) && (
        <Autocomplete
          options={goals}
          getOptionLabel={(option) => option.title}
          value={goals.find(g => g.id === formData.goal_id) || null}
          onChange={(_, value) => handleInputChange('goal_id', value?.id || null)}
          renderInput={(params) => (
            <TextField {...params} label="Associated Goal" fullWidth />
          )}
        />
      )}
      
      <FormControl fullWidth>
        <InputLabel>Priority</InputLabel>
        <Select
          value={formData.priority}
          label="Priority"
          onChange={(e) => handleInputChange('priority', e.target.value)}
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>
      
      <DatePicker
        label="Due Date"
        value={formData.due_date}
        onChange={(date) => handleInputChange('due_date', date)}
        enableAccessibleFieldDOMStructure={false}
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
      
      <TextField
        label="Estimated Hours"
        type="number"
        value={formData.estimated_hours}
        onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
        inputProps={{ min: 0, step: 0.5 }}
        fullWidth
      />
      
      <Typography variant="caption" color="text.secondary">
        Set a due date and estimated hours to better track your progress
      </Typography>
    </Box>
  );

  // For legacy interface, wrap in Dialog
  if (isLegacyInterface) {
    const { open, task } = props as LegacyTaskFormProps;
    
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {formContent}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !formData.title}
              >
                {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </LocalizationProvider>
    );
  }

  // For new interface, return form content directly
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {formContent}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.title}
          >
            {loading ? 'Saving...' : ((props as NewTaskFormProps).initialData ? 'Update Task' : 'Create Task')}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default TaskForm; 