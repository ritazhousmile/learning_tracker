import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Flag as FlagIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Goal } from '../../types';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onToggleComplete: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onToggleComplete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 40) return 'warning';
    return 'error';
  };

  const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && goal.progress < 100;

  const handleCardClick = () => {
    navigate(`/goals/${goal.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking action buttons
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
            {goal.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {goal.priority && (
              <Chip
                icon={<FlagIcon />}
                label={goal.priority}
                size="small"
                color={getPriorityColor(goal.priority)}
              />
            )}
            {goal.progress === 100 && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Completed"
                size="small"
                color="success"
              />
            )}
            {isOverdue && (
              <Chip
                icon={<ScheduleIcon />}
                label="Overdue"
                size="small"
                color="error"
              />
            )}
          </Box>
        </Box>

        {goal.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {goal.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {goal.category && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CategoryIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {goal.category}
              </Typography>
            </Box>
          )}
          {goal.target_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Due: {formatDate(goal.target_date)}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {goal.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={goal.progress}
            color={getProgressColor(goal.progress)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          Created: {formatDate(goal.created_at)}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }} onClick={handleActionClick}>
        <Box>
          <Button
            size="small"
            onClick={() => onEdit(goal)}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(goal.id)}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/goals/${goal.id}`)}
            startIcon={<VisibilityIcon />}
          >
            View Details
          </Button>
          {goal.progress < 100 && (
            <Tooltip title="Mark as complete">
              <IconButton
                color="success"
                onClick={() => onToggleComplete(goal.id)}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default GoalCard; 