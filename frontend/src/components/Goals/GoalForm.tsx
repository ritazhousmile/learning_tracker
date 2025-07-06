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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Goal } from '../../types';
import { goalService } from '../../services/api';

// Legacy interface for backward compatibility
interface LegacyGoalFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal?: Goal;
}

// New interface for detail pages
interface NewGoalFormProps {
  initialData?: Goal;
  onSubmit: (goalData: any) => void;
  onCancel: () => void;
}

type GoalFormProps = LegacyGoalFormProps | NewGoalFormProps;

const GoalForm: React.FC<GoalFormProps> = (props) => {
  // Check if it's the legacy interface
  const isLegacyInterface = 'open' in props;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: null as Date | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLegacyInterface) {
      const { goal } = props as LegacyGoalFormProps;
      if (goal) {
        setFormData({
          title: goal.title,
          description: goal.description || '',
          category: goal.category || '',
          priority: goal.priority || 'medium',
          deadline: goal.deadline ? new Date(goal.deadline) : null,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'medium',
          deadline: null,
        });
      }
      setError('');
    } else {
      const { initialData } = props as NewGoalFormProps;
      if (initialData) {
        setFormData({
          title: initialData.title,
          description: initialData.description || '',
          category: initialData.category || '',
          priority: initialData.priority || 'medium',
          deadline: initialData.deadline ? new Date(initialData.deadline) : null,
        });
      }
      setError('');
    }
  }, [isLegacyInterface ? (props as LegacyGoalFormProps).goal : (props as NewGoalFormProps).initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        deadline: formData.deadline ? formData.deadline.toISOString() : undefined,
      };

      if (isLegacyInterface) {
        const { goal, onSuccess, onClose } = props as LegacyGoalFormProps;
        
        if (goal) {
          await goalService.updateGoal(goal.id, payload);
        } else {
          await goalService.createGoal(payload);
        }

        onSuccess();
        onClose();
      } else {
        const { onSubmit } = props as NewGoalFormProps;
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
      (props as LegacyGoalFormProps).onClose();
    } else {
      (props as NewGoalFormProps).onCancel();
    }
  };

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Goal Title"
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
      
      <TextField
        label="Category"
        value={formData.category}
        onChange={(e) => handleInputChange('category', e.target.value)}
        placeholder="e.g., Programming, Language, Science"
        fullWidth
      />
      
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
        label="Target Date"
        value={formData.deadline}
        onChange={(date) => handleInputChange('deadline', date)}
        enableAccessibleFieldDOMStructure={false}
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
      
      <Typography variant="caption" color="text.secondary">
        Set a target date to track your progress and get reminders
      </Typography>
    </Box>
  );

  // For legacy interface, wrap in Dialog
  if (isLegacyInterface) {
    const { open, goal } = props as LegacyGoalFormProps;
    
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
          <DialogTitle>
            {goal ? 'Edit Goal' : 'Create New Goal'}
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
                {loading ? 'Saving...' : (goal ? 'Update Goal' : 'Create Goal')}
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
            {loading ? 'Saving...' : ((props as NewGoalFormProps).initialData ? 'Update Goal' : 'Create Goal')}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default GoalForm; 